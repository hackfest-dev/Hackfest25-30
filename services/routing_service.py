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
from drone_optimizer import DroneOptimizer, Route, RoutePoint, RouteSegment
from services.collision_avoidance import CollisionAvoidanceService, Position4D, DroneRoute

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
        self.optimizer = DroneOptimizer()
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

    def _generate_random_point(self) -> Point:
        """Generate a random point within a reasonable delivery radius (max 20km) of the base location"""
        # Convert radius from km to degrees (approximately)
        # 1 degree is roughly 111 km at the equator
        max_radius_km = 20.0  # Maximum 20km radius for deliveries
        degree_radius = max_radius_km / 111.0
        
        # Generate random angle and radius
        angle = random.uniform(0, 2 * math.pi)
        radius = random.uniform(0, degree_radius)
        
        # Convert polar coordinates to lat/lon offset
        lat_offset = radius * math.cos(angle)
        lon_offset = radius * math.sin(angle)
        
        # Add offsets to base location
        lat = self.base_location.lat + lat_offset
        lon = self.base_location.lon + lon_offset
        
        return Point(lat=lat, lon=lon, altitude=0.0)

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

    async def calculate_route(self, start: dict, end: dict, drone_id: str) -> dict:
        """Calculate a route between two points with collision avoidance"""
        try:
            # Get assigned altitude for this drone
            altitude = self.collision_avoidance.get_next_altitude(drone_id)
            
            # Calculate direct route
            segments = []
            current_pos = start.copy()
            current_pos["altitude"] = altitude
            
            # Add takeoff segment
            segments.append({
                "start": current_pos,
                "end": {**current_pos, "altitude": altitude},
                "distance": 0,
                "time": 2,
                "energy_consumption": 0.5
            })
            
            # Add main flight segment
            segments.append({
                "start": current_pos,
                "end": {**end, "altitude": altitude},
                "distance": self._calculate_distance(current_pos, end),
                "time": self._calculate_time(current_pos, end),
                "energy_consumption": self._calculate_energy(current_pos, end)
            })
            
            # Add landing segment
            segments.append({
                "start": {**end, "altitude": altitude},
                "end": {**end, "altitude": 0.0},
                "distance": 0,
                "time": 2,
                "energy_consumption": 0.5
            })
            
            return {
                "segments": segments,
                "total_distance": sum(s["distance"] for s in segments),
                "total_time": sum(s["time"] for s in segments),
                "total_energy": sum(s["energy_consumption"] for s in segments)
            }
            
        except Exception as e:
            print(f"Error calculating route: {str(e)}")
            raise
            
    def _calculate_distance(self, start: dict, end: dict) -> float:
        """Calculate distance between two points"""
        return ((end["lat"] - start["lat"]) ** 2 + 
                (end["lon"] - start["lon"]) ** 2) ** 0.5
                
    def _calculate_time(self, start: dict, end: dict) -> float:
        """Calculate time to travel between points"""
        distance = self._calculate_distance(start, end)
        return distance * 60  # Assuming 1 km/min speed
        
    def _calculate_energy(self, start: dict, end: dict) -> float:
        """Calculate energy consumption for the route"""
        distance = self._calculate_distance(start, end)
        return distance * 0.1  # Assuming 0.1% battery per km

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