use pyo3::prelude::*;
use smartcore::ensemble::random_forest_regressor::RandomForestRegressor;
use smartcore::linalg::basic::matrix::DenseMatrix;
use serde::{Deserialize, Serialize};
use rayon::prelude::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[pyclass]
pub struct RoutePoint {
    #[pyo3(get, set)]
    lat: f64,
    #[pyo3(get, set)]
    lon: f64,
    #[pyo3(get, set)]
    altitude: f64,
}

#[pymethods]
impl RoutePoint {
    #[new]
    fn new(lat: f64, lon: f64, altitude: f64) -> Self {
        RoutePoint { lat, lon, altitude }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[pyclass]
pub struct RouteSegment {
    #[pyo3(get, set)]
    start: RoutePoint,
    #[pyo3(get, set)]
    end: RoutePoint,
    #[pyo3(get, set)]
    distance: f64,
    #[pyo3(get, set)]
    time: f64,
    #[pyo3(get, set)]
    energy: f64,
}

#[pymethods]
impl RouteSegment {
    #[new]
    fn new(start: RoutePoint, end: RoutePoint, distance: f64, time: f64, energy: f64) -> Self {
        RouteSegment { start, end, distance, time, energy }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[pyclass]
pub struct Route {
    #[pyo3(get, set)]
    segments: Vec<RouteSegment>,
    #[pyo3(get, set)]
    total_distance: f64,
    #[pyo3(get, set)]
    total_time: f64,
    #[pyo3(get, set)]
    total_energy: f64,
}

#[pymethods]
impl Route {
    #[new]
    fn new(segments: Vec<RouteSegment>, total_distance: f64, total_time: f64, total_energy: f64) -> Self {
        Route { segments, total_distance, total_time, total_energy }
    }
}

#[pyclass]
pub struct DroneOptimizer {
    model: Option<RandomForestRegressor<f64, f64, DenseMatrix<f64>, Vec<f64>>>,
    trained: bool,
}

#[pymethods]
impl DroneOptimizer {
    #[new]
    fn new() -> Self {
        DroneOptimizer {
            model: None,
            trained: false,
        }
    }

    fn train(&mut self, training_data: Vec<Route>) -> PyResult<()> {
        // Prepare features and targets
        let n_samples = training_data.len();
        let mut features = Vec::with_capacity(n_samples * 6);
        let mut targets = Vec::with_capacity(n_samples);

        // Extract features and targets from training data
        for route in training_data.iter() {
            // Features: total distance, average altitude, number of segments,
            //          start altitude, end altitude, total energy
            features.push(route.total_distance);
            features.push(route.segments.iter().map(|s| s.start.altitude).sum::<f64>() / route.segments.len() as f64);
            features.push(route.segments.len() as f64);
            features.push(route.segments[0].start.altitude);
            features.push(route.segments.last().unwrap().end.altitude);
            features.push(route.total_energy);

            // Target: optimization score (lower is better)
            targets.push(route.total_time);
        }

        // Convert to DenseMatrix
        let x = DenseMatrix::new(n_samples, 6, features, false);
        let y = targets;

        // Train the model
        self.model = Some(RandomForestRegressor::fit(
            &x,
            &y,
            Default::default()
        ).map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Training failed: {}", e)))?);
        
        self.trained = true;

        Ok(())
    }

    fn optimize_route(&self, route: Route) -> PyResult<Route> {
        if !self.trained || self.model.is_none() {
            return Err(pyo3::exceptions::PyRuntimeError::new_err("Model not trained"));
        }

        // Prepare features for prediction
        let features = vec![
            route.total_distance,
            route.segments.iter().map(|s| s.start.altitude).sum::<f64>() / route.segments.len() as f64,
            route.segments.len() as f64,
            route.segments[0].start.altitude,
            route.segments.last().unwrap().end.altitude,
            route.total_energy,
        ];

        // Convert to DenseMatrix
        let x = DenseMatrix::new(1, 6, features, false);

        // Get prediction
        let prediction = self.model.as_ref().unwrap().predict(&x)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Prediction failed: {}", e)))?;
        
        // Optimize route based on prediction
        let optimized_route = self.optimize_route_segments(route, prediction[0]);

        Ok(optimized_route)
    }

    fn optimize_routes(&self, routes: Vec<Route>) -> PyResult<Vec<Route>> {
        if !self.trained || self.model.is_none() {
            return Err(pyo3::exceptions::PyRuntimeError::new_err("Model not trained"));
        }

        // Parallel optimization of routes
        let optimized_routes: Vec<Route> = routes.par_iter()
            .map(|route| {
                let features = vec![
                    route.total_distance,
                    route.segments.iter().map(|s| s.start.altitude).sum::<f64>() / route.segments.len() as f64,
                    route.segments.len() as f64,
                    route.segments[0].start.altitude,
                    route.segments.last().unwrap().end.altitude,
                    route.total_energy,
                ];
                
                let x = DenseMatrix::new(1, 6, features, false);
                let prediction = self.model.as_ref().unwrap().predict(&x).unwrap();
                self.optimize_route_segments(route.clone(), prediction[0])
            })
            .collect();

        Ok(optimized_routes)
    }
}

impl DroneOptimizer {
    fn optimize_route_segments(&self, mut route: Route, target_time: f64) -> Route {
        // Adjust altitudes to meet target time
        let time_diff = target_time - route.total_time;
        let altitude_adjustment = time_diff * 10.0; // Adjust factor

        // Optimize each segment
        for segment in &mut route.segments {
            // Adjust altitude based on time difference
            let new_altitude = segment.start.altitude + altitude_adjustment;
            segment.start.altitude = new_altitude.max(0.0).min(1000.0); // Clamp to reasonable range
            
            // Recalculate segment metrics
            let distance = calculate_distance(
                segment.start.lat, segment.start.lon, segment.start.altitude,
                segment.end.lat, segment.end.lon, segment.end.altitude
            );
            
            segment.distance = distance;
            segment.time = calculate_time(distance, new_altitude);
            segment.energy = calculate_energy(distance, new_altitude);
        }

        // Update total metrics
        route.total_distance = route.segments.iter().map(|s| s.distance).sum();
        route.total_time = route.segments.iter().map(|s| s.time).sum();
        route.total_energy = route.segments.iter().map(|s| s.energy).sum();

        route
    }
}

fn calculate_distance(lat1: f64, lon1: f64, alt1: f64, lat2: f64, lon2: f64, alt2: f64) -> f64 {
    // Haversine formula for horizontal distance
    let r = 6371.0; // Earth's radius in km
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let a = (dlat/2.0).sin().powi(2) + 
            lat1.to_radians().cos() * lat2.to_radians().cos() * 
            (dlon/2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().asin();
    let horizontal_distance = r * c;

    // Add vertical distance
    let vertical_distance = (alt2 - alt1).abs() / 1000.0; // Convert to km

    // Total distance is the hypotenuse
    (horizontal_distance.powi(2) + vertical_distance.powi(2)).sqrt()
}

fn calculate_time(distance: f64, altitude: f64) -> f64 {
    // Base speed at sea level (km/h)
    let base_speed = 50.0;
    // Speed increases with altitude
    let speed = base_speed * (1.0 + altitude / 1000.0);
    distance / speed
}

fn calculate_energy(distance: f64, altitude: f64) -> f64 {
    // Base energy consumption (kWh/km)
    let base_energy = 0.1;
    // Energy consumption increases with altitude
    let energy_per_km = base_energy * (1.0 + altitude / 2000.0);
    distance * energy_per_km
}

#[pymodule]
fn drone_optimizer(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<DroneOptimizer>()?;
    m.add_class::<Route>()?;
    m.add_class::<RoutePoint>()?;
    m.add_class::<RouteSegment>()?;
    Ok(())
} 