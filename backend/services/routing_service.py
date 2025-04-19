from typing import Dict, List, Tuple, Any, Optional
import numpy as np
from dataclasses import dataclass
from datetime import datetime, UTC, timedelta
import random
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import time
import asyncio
import math
from backend.services.collision_avoidance import CollisionAvoidanceService, Position4D, DroneRoute

@dataclass
class Point:
    lat: float
    lon: float
    altitude: float = 0.0

@dataclass
class PythonRouteSegment:
    start: Point
    end: Point
    distance: float
    time: float
    energy_consumption: float

class RoutingService:
    def __init__(self):
        self.collision_avoidance = CollisionAvoidanceService()
        self.base_location = Point(lat=28.6139, lon=77.209, altitude=0.0)
        self.BASE_LOCATIONS = [self.base_location]  # Initialize with the default base location
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # Constants for route calculations
        self.CRUISING_ALTITUDE = 100.0  # meters
        self.ASCENT_RATE = 5.0  # meters/second
        self.DESCENT_RATE = 4.0  # meters/second
        self.AVERAGE_SPEED = 80.0  # km/h
        self.ENERGY_CONSUMPTION = 0.05  # kWh/km
        
        # Energy factors for vertical movement
        self.vertical_energy_factors = {
            'ascent': 2.0,  # More energy required for ascent
            'descent': 0.3   # Less energy required for descent
        }
        
        # Altitude management
        self.current_altitudes = {}  # Track current altitudes for each drone
        self.altitude_increment = 20.0  # meters between altitude levels
        self.route_cache: Dict[str, DroneRoute] = {}

    def _generate_random_point(self) -> Point:
        """Generate a random point within the service area"""
        # Define service area boundaries (example for Delhi NCR)
        min_lat, max_lat = 28.4, 28.8  # Approximate Delhi NCR latitude bounds
        min_lon, max_lon = 76.8, 77.4  # Approximate Delhi NCR longitude bounds
        
        # Generate random coordinates within bounds
        lat = random.uniform(min_lat, max_lat)
        lon = random.uniform(min_lon, max_lon)
        altitude = random.uniform(100, 200)  # Random altitude between 100-200 meters
        
        return Point(lat=lat, lon=lon, altitude=altitude)

    def calculate_distance(self, point1: Point, point2: Point) -> float:
        """Calculate Haversine distance between two points in kilometers"""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1 = math.radians(point1.lat), math.radians(point1.lon)
        lat2, lon2 = math.radians(point2.lat), math.radians(point2.lon)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c

    def calculate_vertical_distance(self, start_alt: float, end_alt: float) -> float:
        """Calculate vertical distance between two altitudes in kilometers"""
        return abs(end_alt - start_alt) / 1000.0  # Convert meters to kilometers

    def calculate_vertical_time(self, vertical_distance: float, is_ascent: bool) -> float:
        """Calculate time for vertical movement in hours"""
        rate = self.ASCENT_RATE if is_ascent else self.DESCENT_RATE
        return (vertical_distance * 1000) / (rate * 3600)  # Convert to hours

    def calculate_vertical_energy(self, vertical_distance: float) -> float:
        """Calculate energy consumption for vertical movement"""
        return vertical_distance * self.ENERGY_CONSUMPTION * 2  # Double the energy for vertical movement

    def get_next_altitude(self, drone_id: str) -> float:
        """Get the next available altitude for a drone"""
        if drone_id not in self.current_altitudes:
            # Start at base altitude
            self.current_altitudes[drone_id] = self.CRUISING_ALTITUDE
            return self.CRUISING_ALTITUDE
            
        # Find the next available altitude
        current_alt = self.current_altitudes[drone_id]
        used_altitudes = set(self.current_altitudes.values())
        
        # Try to find an unused altitude
        for alt in self.collision_avoidance.ALTITUDE_LEVELS:
            if alt not in used_altitudes:
                self.current_altitudes[drone_id] = alt
                return alt
                
        # If all altitudes are used, increment by a safe amount
        new_alt = current_alt + self.altitude_increment
        self.current_altitudes[drone_id] = new_alt
        return new_alt

    async def calculate_route(self, start: Dict[str, float], end: Dict[str, float], 
                            drone_id: str, start_time: Optional[datetime] = None) -> Optional[Dict]:
        """Calculate a route between two points with collision avoidance"""
        try:
            print(f"Calculating route for drone {drone_id}")
            print(f"Start: {start}, End: {end}")
            
            # Validate input parameters
            if not start or not end or not drone_id:
                print("Missing required parameters")
                return None
                
            # If no start_time provided, use current time
            if start_time is None:
                start_time = datetime.now(UTC)
                print(f"Using current time: {start_time}")
                
            # Get initial altitude for the drone
            initial_altitude = self.collision_avoidance.get_next_altitude(drone_id)
            if initial_altitude is None:
                print("Failed to get initial altitude")
                return None
            print(f"Initial altitude: {initial_altitude}")
                
            # Create waypoints with initial altitude
            waypoints = self._create_waypoints(start, end, initial_altitude, start_time)
            if not waypoints:
                print("Failed to create waypoints")
                return None
            print(f"Created {len(waypoints)} waypoints")
                
            # Create initial route
            route = DroneRoute(
                drone_id=drone_id,
                waypoints=waypoints,
                start_time=start_time,
                end_time=start_time + timedelta(seconds=self._calculate_route_time(waypoints)),
                velocity=self.collision_avoidance.max_velocity,
                heading=self._calculate_initial_heading(start, end)
            )
            print("Created initial route")
            
            # Register route with collision avoidance
            print("Registering route with collision avoidance")
            success, modified_route = await self.collision_avoidance.register_route(drone_id, route)
            print(f"Registration result: success={success}, modified_route={modified_route is not None}")
            
            if success and modified_route is not None:
                print("Caching route and converting to dictionary")
                self.route_cache[drone_id] = modified_route
                route_dict = self._route_to_dict(modified_route)
                print(f"Route dictionary: {route_dict}")
                return route_dict
                
            print("Route registration failed")
            return None
            
        except Exception as e:
            print(f"Error calculating route: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return None
        
    def _create_waypoints(self, start: Dict[str, float], end: Dict[str, float],
                         altitude: float, start_time: datetime) -> List[Position4D]:
        """Create waypoints for a route"""
        # Calculate number of waypoints based on distance
        distance = self._calculate_distance(start, end)
        num_waypoints = max(2, int(distance / 100))  # At least 2 waypoints, one every 100m
        
        waypoints = []
        for i in range(num_waypoints):
            # Interpolate position
            fraction = i / (num_waypoints - 1)
            lat = start["lat"] + (end["lat"] - start["lat"]) * fraction
            lon = start["lon"] + (end["lon"] - start["lon"]) * fraction
            
            # Calculate time for this waypoint
            time = start_time + timedelta(seconds=i * distance / (num_waypoints - 1) / 
                                        self.collision_avoidance.max_velocity)
            
            waypoints.append(Position4D(
                lat=lat,
                lon=lon,
                altitude=altitude,
                timestamp=time
            ))
            
        return waypoints
        
    def _calculate_distance(self, point1: Dict[str, float], point2: Dict[str, float]) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        lat1, lon1 = math.radians(point1["lat"]), math.radians(point1["lon"])
        lat2, lon2 = math.radians(point2["lat"]), math.radians(point2["lon"])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) +
             math.cos(lat1) * math.cos(lat2) *
             math.sin(dlon/2) * math.sin(dlon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
        
    def _calculate_route_time(self, waypoints: List[Position4D]) -> float:
        """Calculate total time for a route"""
        total_distance = 0
        for i in range(len(waypoints) - 1):
            total_distance += self._calculate_distance(
                {"lat": waypoints[i].lat, "lon": waypoints[i].lon},
                {"lat": waypoints[i+1].lat, "lon": waypoints[i+1].lon}
            )
        return total_distance / self.collision_avoidance.max_velocity
        
    def _calculate_initial_heading(self, start: Dict[str, float], end: Dict[str, float]) -> float:
        """Calculate initial heading between two points"""
        lat1, lon1 = math.radians(start["lat"]), math.radians(start["lon"])
        lat2, lon2 = math.radians(end["lat"]), math.radians(end["lon"])
        
        dlon = lon2 - lon1
        
        y = math.sin(dlon) * math.cos(lat2)
        x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
        
        heading = math.degrees(math.atan2(y, x))
        return (heading + 360) % 360  # Normalize to 0-360 degrees
        
    def update_route(self, drone_id: str, current_position: Dict[str, float], 
                    current_time: datetime) -> Optional[DroneRoute]:
        """Update route based on current position and time"""
        if drone_id not in self.route_cache:
            return None
            
        current_route = self.route_cache[drone_id]
        
        # Check if we need to recalculate route due to deviation
        if self._is_off_route(current_position, current_route, current_time):
            # Calculate new route from current position to destination
            last_waypoint = current_route.waypoints[-1]
            new_route = self.calculate_route(
                current_position,
                {"lat": last_waypoint.lat, "lon": last_waypoint.lon},
                drone_id,
                current_time
            )
            
            if new_route:
                self.route_cache[drone_id] = new_route
                return new_route
                
        return current_route
        
    def _is_off_route(self, position: Dict[str, float], route: DroneRoute, 
                     current_time: datetime) -> bool:
        """Check if drone has deviated significantly from its route"""
        # Find closest waypoint to current time
        closest_waypoint = min(route.waypoints, 
                             key=lambda wp: abs((wp.timestamp - current_time).total_seconds()))
        
        # Calculate distance to expected position
        distance = self._calculate_distance(
            position,
            {"lat": closest_waypoint.lat, "lon": closest_waypoint.lon}
        )
        
        # Consider off route if more than 50m from expected position
        return distance > 50
        
    def complete_route(self, drone_id: str):
        """Mark a route as completed and clean up resources"""
        if drone_id in self.route_cache:
            del self.route_cache[drone_id]
            self.collision_avoidance.deregister_route(drone_id)
            self.collision_avoidance.release_altitude(drone_id)

    def _load_training_data(self):
        # Create some sample training data
        training_routes = []
        for _ in range(100):
            # Generate random routes for training
            pickup = self._generate_random_point()
            drop = self._generate_random_point()
            
            # Create route segments
            segments = [
                self._create_segment(self.base_location, pickup),
                self._create_segment(pickup, drop),
                self._create_segment(drop, self.base_location)
            ]
            
            # Create Rust Route object
            route = Route(
                segments=[
                    RouteSegment(
                        start=RoutePoint(
                            lat=seg.start.lat,
                            lon=seg.start.lon,
                            altitude=seg.start.altitude
                        ),
                        end=RoutePoint(
                            lat=seg.end.lat,
                            lon=seg.end.lon,
                            altitude=seg.end.altitude
                        ),
                        distance=seg.distance,
                        time=seg.time,
                        energy=seg.energy_consumption
                    )
                    for seg in segments
                ],
                total_distance=sum(s.distance for s in segments),
                total_time=sum(s.time for s in segments),
                total_energy=sum(s.energy_consumption for s in segments)
            )
            training_routes.append(route)
        
        # Train the optimizer
        self.optimizer.train(training_routes)

    def _create_segment(self, start: Point, end: Point) -> PythonRouteSegment:
        distance = self.calculate_distance(start, end)
        time = self.calculate_time(distance, start.altitude, end.altitude)
        energy = self.calculate_energy(distance, start.altitude, end.altitude)
        
        return PythonRouteSegment(
            start=start,
            end=end,
            distance=distance,
            time=time,
            energy_consumption=energy
        )

    def calculate_time(self, distance: float, start_altitude: float, end_altitude: float) -> float:
        """Calculate time for a route segment in hours"""
        # Base speed at sea level (km/h)
        base_speed = self.AVERAGE_SPEED
        # Average altitude for the segment
        avg_altitude = (start_altitude + end_altitude) / 2
        # Speed increases with altitude (up to a point)
        speed = base_speed * (1.0 + min(avg_altitude / 2000.0, 0.2))  # Max 20% speed increase
        return distance / speed

    def calculate_energy(self, distance: float, start_altitude: float, end_altitude: float) -> float:
        """Calculate energy consumption for a route segment in kWh"""
        # Base energy consumption (kWh/km)
        base_energy = self.ENERGY_CONSUMPTION
        # Average altitude for the segment
        avg_altitude = (start_altitude + end_altitude) / 2
        # Energy consumption increases with altitude
        energy_per_km = base_energy * (1.0 + min(avg_altitude / 2000.0, 0.3))  # Max 30% energy increase
        return distance * energy_per_km

    @lru_cache(maxsize=10000)
    def calculate_vertical_metrics(self, start_alt: float, end_alt: float) -> Tuple[float, float, float]:
        """Calculate vertical movement metrics (distance, time, energy)."""
        try:
            # Vertical distance in meters
            vertical_distance_meters = abs(end_alt - start_alt)
            # Convert to kilometers for consistency with horizontal distances
            vertical_distance_km = vertical_distance_meters / 1000.0
            
            is_ascent = end_alt > start_alt
            rate = self.ASCENT_RATE if is_ascent else self.DESCENT_RATE
            
            # Time in hours
            time = vertical_distance_meters / (rate * 3600.0)
            
            # Energy calculation using the vertical distance in km
            energy_factor = self.vertical_energy_factors['ascent' if is_ascent else 'descent']
            energy = vertical_distance_km * self.ENERGY_CONSUMPTION * energy_factor
            
            return vertical_distance_km, time, energy
        except Exception as e:
            raise ValueError(f"Error calculating vertical metrics: {str(e)}")

    async def calculate_route_segment(self, start: Point, end: Point, include_altitude: bool = True) -> PythonRouteSegment:
        """Calculate metrics for a single route segment."""
        try:
            loop = asyncio.get_event_loop()
            horizontal_distance = await loop.run_in_executor(
                self.executor,
                self.calculate_distance,
                start, end
            )
            
            horizontal_time = horizontal_distance / self.AVERAGE_SPEED
            horizontal_energy = horizontal_distance * self.ENERGY_CONSUMPTION
            
            if include_altitude:
                vertical_distance, vertical_time, vertical_energy = await loop.run_in_executor(
                    self.executor,
                    self.calculate_vertical_metrics,
                    start.altitude, end.altitude
                )
                # Use horizontal distance as the primary distance
                total_distance = horizontal_distance
                total_time = horizontal_time + vertical_time
                total_energy = horizontal_energy + vertical_energy
            else:
                total_distance = horizontal_distance
                total_time = horizontal_time
                total_energy = horizontal_energy

            return PythonRouteSegment(
                start=start,
                end=end,
                distance=total_distance,
                time=total_time,
                energy_consumption=total_energy
            )
        except Exception as e:
            raise ValueError(f"Error calculating route segment: {str(e)}")

    def get_nearest_base(self, point: Point) -> Point:
        """Find the nearest base location to a given point."""
        try:
            distances = [self.calculate_distance(point, base) for base in self.BASE_LOCATIONS]
            nearest_index = distances.index(min(distances))
            return self.BASE_LOCATIONS[nearest_index]
        except Exception as e:
            raise ValueError(f"Error finding nearest base: {str(e)}")

    def optimize_route(self, route: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize the route by considering various factors."""
        # Convert dictionary to Route object
        segments = []
        for segment in route["segments"]:
            start = RoutePoint(
                lat=segment["start"]["lat"],
                lon=segment["start"]["lon"],
                altitude=segment["start"]["altitude"]
            )
            end = RoutePoint(
                lat=segment["end"]["lat"],
                lon=segment["end"]["lon"],
                altitude=segment["end"]["altitude"]
            )
            segments.append(PythonRouteSegment(
                start=start,
                end=end,
                distance=segment["distance"],
                time=segment["time"],
                energy_consumption=segment["energy_consumption"]
            ))

        route_obj = Route(
            segments=segments,
            total_distance=route["total_distance"],
            total_time=route["total_time"],
            total_energy=route["total_energy"]
        )

        # Optimize the route
        optimized_route = self.optimizer.optimize_route(route_obj)

        # Convert back to dictionary format
        return {
            "segments": [
                {
                    "start": {
                        "lat": segment.start.lat,
                        "lon": segment.start.lon,
                        "altitude": segment.start.altitude
                    },
                    "end": {
                        "lat": segment.end.lat,
                        "lon": segment.end.lon,
                        "altitude": segment.end.altitude
                    },
                    "distance": segment.distance,
                    "time": segment.time,
                    "energy_consumption": segment.energy_consumption
                }
                for segment in optimized_route.segments
            ],
            "total_distance": optimized_route.total_distance,
            "total_time": optimized_route.total_time,
            "total_energy": optimized_route.total_energy
        }

    def _route_to_dict(self, route: DroneRoute) -> Dict:
        """Convert a DroneRoute object to a dictionary"""
        try:
            if route is None:
                print("Cannot convert None route to dictionary")
                return None
                
            print(f"Converting route for drone {route.drone_id} to dictionary")
            
            # Calculate total time in seconds
            total_time = (route.end_time - route.start_time).total_seconds()
            print(f"Total time: {total_time} seconds")
            
            waypoints_list = [
                {
                    "lat": wp.lat,
                    "lon": wp.lon,
                    "altitude": wp.altitude,
                    "timestamp": wp.timestamp.isoformat()
                }
                for wp in route.waypoints
            ]
            print(f"Converted {len(waypoints_list)} waypoints")
            
            route_dict = {
                "drone_id": route.drone_id,
                "waypoints": waypoints_list,
                "start_time": route.start_time.isoformat(),
                "end_time": route.end_time.isoformat(),
                "velocity": route.velocity,
                "heading": route.heading,
                "total_time": total_time
            }
            print("Successfully created route dictionary")
            return route_dict
            
        except Exception as e:
            print(f"Error converting route to dictionary: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return None

    def is_point_in_service_area(self, point: Point) -> bool:
        """Check if a point is within the service area"""
        # Define service area boundaries (example for Delhi NCR)
        min_lat, max_lat = 28.4, 28.8  # Approximate Delhi NCR latitude bounds
        min_lon, max_lon = 76.8, 77.4  # Approximate Delhi NCR longitude bounds
        
        return (min_lat <= point.lat <= max_lat and 
                min_lon <= point.lon <= max_lon) 