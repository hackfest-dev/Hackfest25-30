from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import numpy as np
import math

@dataclass
class Position4D:
    lat: float
    lon: float
    altitude: float
    timestamp: datetime

@dataclass
class DroneRoute:
    drone_id: str
    waypoints: List[Position4D]
    start_time: datetime
    end_time: datetime
    
class CollisionAvoidanceService:
    def __init__(self):
        self.active_routes: Dict[str, DroneRoute] = {}
        self.horizontal_safe_distance = 0.01  # 10 meters
        self.vertical_safe_distance = 5.0  # 5 meters
        self.time_window = 10  # 10 seconds
        self.altitude_levels = [40, 60, 80, 100, 120, 140]  # More altitude levels
        self.assigned_altitudes = {}  # Track assigned altitudes
        
    def get_next_altitude(self, drone_id: str) -> float:
        """Get the next available altitude for a drone"""
        # If drone already has an altitude, keep it
        if drone_id in self.assigned_altitudes:
            return self.assigned_altitudes[drone_id]
            
        # Find the first unused altitude level
        for altitude in self.altitude_levels:
            if altitude not in self.assigned_altitudes.values():
                self.assigned_altitudes[drone_id] = altitude
                return altitude
                
        # If all levels are used, increment by 20 meters from the highest
        max_altitude = max(self.altitude_levels)
        new_altitude = max_altitude + 20
        self.assigned_altitudes[drone_id] = new_altitude
        return new_altitude
        
    def release_altitude(self, drone_id: str):
        """Release the altitude when drone is done"""
        if drone_id in self.assigned_altitudes:
            del self.assigned_altitudes[drone_id]
            
    def check_collision(self, drone1_pos: dict, drone2_pos: dict, time_diff: float) -> bool:
        """Check if two drones are in danger of collision"""
        if time_diff > self.time_window:
            return False
            
        # Calculate horizontal distance
        horizontal_dist = self._calculate_distance(
            drone1_pos["lat"], drone1_pos["lon"],
            drone2_pos["lat"], drone2_pos["lon"]
        )
        
        # Calculate vertical distance
        vertical_dist = abs(drone1_pos["altitude"] - drone2_pos["altitude"])
        
        return (horizontal_dist < self.horizontal_safe_distance and 
                vertical_dist < self.vertical_safe_distance)
                
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate horizontal distance between two points"""
        # Simple Euclidean distance for small areas
        return ((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) ** 0.5
    
    def interpolate_position(self, start: Position4D, end: Position4D, time: datetime) -> Position4D:
        """Interpolate position between two waypoints at a given time"""
        if time <= start.timestamp:
            return start
        if time >= end.timestamp:
            return end
            
        # Calculate time fraction
        total_time = (end.timestamp - start.timestamp).total_seconds()
        current_time = (time - start.timestamp).total_seconds()
        fraction = current_time / total_time
        
        # Interpolate all components
        lat = start.lat + (end.lat - start.lat) * fraction
        lon = start.lon + (end.lon - start.lon) * fraction
        altitude = start.altitude + (end.altitude - start.altitude) * fraction
        
        return Position4D(lat=lat, lon=lon, altitude=altitude, timestamp=time)
    
    def find_collision_points(self, route1: DroneRoute, route2: DroneRoute) -> List[Tuple[Position4D, Position4D]]:
        """Find all potential collision points between two routes"""
        collision_points = []
        
        # Check each waypoint pair
        for i in range(len(route1.waypoints) - 1):
            for j in range(len(route2.waypoints) - 1):
                start1, end1 = route1.waypoints[i], route1.waypoints[i + 1]
                start2, end2 = route2.waypoints[j], route2.waypoints[j + 1]
                
                # Find overlapping time window
                start_time = max(start1.timestamp, start2.timestamp)
                end_time = min(end1.timestamp, end2.timestamp)
                
                if start_time < end_time:
                    # Check positions at regular intervals
                    current_time = start_time
                    while current_time <= end_time:
                        pos1 = self.interpolate_position(start1, end1, current_time)
                        pos2 = self.interpolate_position(start2, end2, current_time)
                        
                        if self.check_collision(pos1, pos2, (current_time - start_time).total_seconds()):
                            collision_points.append((pos1, pos2))
                            
                        current_time += timedelta(seconds=5)  # Check every 5 seconds
                        
        return collision_points
    
    def suggest_alternative_altitude(self, current_altitude: float, used_altitudes: List[float]) -> float:
        """Suggest an alternative altitude level that's not in use"""
        available_levels = [alt for alt in self.altitude_levels 
                          if abs(alt - current_altitude) > self.vertical_safe_distance and 
                          all(abs(alt - used) > self.vertical_safe_distance for used in used_altitudes)]
        
        if not available_levels:
            # If no safe altitude found, suggest highest altitude + safe distance
            return max(used_altitudes) + self.vertical_safe_distance
            
        # Return the closest available altitude
        return min(available_levels, key=lambda x: abs(x - current_altitude))
    
    def register_route(self, drone_id: str, route: DroneRoute) -> Tuple[bool, Optional[DroneRoute]]:
        """Register a new route and check for collisions. Returns (success, modified_route)"""
        # Check for collisions with all active routes
        collision_found = False
        modified_route = route
        
        for active_route in self.active_routes.values():
            collision_points = self.find_collision_points(modified_route, active_route)
            
            if collision_points:
                collision_found = True
                # Get all altitudes in use at collision points
                used_altitudes = [p.altitude for points in collision_points for p in points]
                
                # Suggest new altitude for entire route segment
                new_altitude = self.suggest_alternative_altitude(
                    modified_route.waypoints[0].altitude,
                    used_altitudes
                )
                
                # Modify route altitude
                modified_route = DroneRoute(
                    drone_id=drone_id,
                    waypoints=[Position4D(
                        lat=wp.lat,
                        lon=wp.lon,
                        altitude=new_altitude,
                        timestamp=wp.timestamp
                    ) for wp in modified_route.waypoints],
                    start_time=modified_route.start_time,
                    end_time=modified_route.end_time
                )
        
        if not collision_found:
            # Route is safe, register it
            self.active_routes[drone_id] = modified_route
            return True, modified_route
            
        # Check if modified route is now safe
        for active_route in self.active_routes.values():
            if self.find_collision_points(modified_route, active_route):
                return False, None
                
        # Modified route is safe, register it
        self.active_routes[drone_id] = modified_route
        return True, modified_route
    
    def deregister_route(self, drone_id: str):
        """Remove a completed route from active routes"""
        if drone_id in self.active_routes:
            del self.active_routes[drone_id] 