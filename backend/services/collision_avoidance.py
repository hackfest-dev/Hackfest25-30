from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import numpy as np
import math
from scipy.spatial import KDTree

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
    velocity: float  # Current velocity in m/s
    heading: float   # Current heading in degrees
    
class CollisionAvoidanceService:
    def __init__(self):
        self.active_routes: Dict[str, DroneRoute] = {}
        self.horizontal_safe_distance = 0.01  # 10 meters
        self.vertical_safe_distance = 5.0  # 5 meters
        self.time_window = 10  # 10 seconds
        self.altitude_levels = [40, 60, 80, 100, 120, 140]  # More altitude levels
        self.assigned_altitudes = {}  # Track assigned altitudes
        self.collision_warning_threshold = 0.015  # 15 meters
        self.emergency_avoidance_threshold = 0.008  # 8 meters
        self.max_velocity = 30.0  # Maximum velocity in m/s
        self.min_velocity = 5.0   # Minimum velocity in m/s
        
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
            
    def check_collision(self, drone1_pos: dict, drone2_pos: dict, time_diff: float) -> Tuple[bool, float]:
        """Check if two drones are in danger of collision and return collision risk score"""
        if time_diff > self.time_window:
            return False, 0.0
            
        # Calculate horizontal distance
        horizontal_dist = self._calculate_distance(
            drone1_pos["lat"], drone1_pos["lon"],
            drone2_pos["lat"], drone2_pos["lon"]
        )
        
        # Calculate vertical distance
        vertical_dist = abs(drone1_pos["altitude"] - drone2_pos["altitude"])
        
        # Calculate collision risk score (0 to 1)
        horizontal_risk = max(0, 1 - horizontal_dist / self.horizontal_safe_distance)
        vertical_risk = max(0, 1 - vertical_dist / self.vertical_safe_distance)
        collision_risk = max(horizontal_risk, vertical_risk)
        
        is_collision = (horizontal_dist < self.horizontal_safe_distance and 
                       vertical_dist < self.vertical_safe_distance)
        
        return is_collision, collision_risk
                
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate horizontal distance between two points using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi/2) * math.sin(delta_phi/2) +
             math.cos(phi1) * math.cos(phi2) *
             math.sin(delta_lambda/2) * math.sin(delta_lambda/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
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
    
    def find_collision_points(self, route1: DroneRoute, route2: DroneRoute) -> List[Tuple[Position4D, Position4D, float]]:
        """Find all potential collision points between two routes with risk scores"""
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
                        
                        is_collision, risk_score = self.check_collision(
                            {"lat": pos1.lat, "lon": pos1.lon, "altitude": pos1.altitude},
                            {"lat": pos2.lat, "lon": pos2.lon, "altitude": pos2.altitude},
                            (current_time - start_time).total_seconds()
                        )
                        
                        if is_collision or risk_score > 0.3:  # Include high-risk points
                            collision_points.append((pos1, pos2, risk_score))
                            
                        current_time += timedelta(seconds=1)  # Check every second
                        
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
    
    def adjust_velocity(self, drone_id: str, risk_score: float) -> float:
        """Adjust drone velocity based on collision risk"""
        if risk_score > 0.8:  # High risk
            return self.min_velocity
        elif risk_score > 0.5:  # Medium risk
            return self.max_velocity * 0.5
        else:  # Low risk
            return self.max_velocity
    
    async def register_route(self, drone_id: str, route: DroneRoute) -> Tuple[bool, Optional[DroneRoute]]:
        """Register a new route and check for collisions. Returns (success, modified_route)"""
        try:
            # Check for collisions with all active routes
            collision_found = False
            modified_route = route
            max_risk_score = 0.0
            
            for active_route in self.active_routes.values():
                collision_points = self.find_collision_points(modified_route, active_route)
                
                if collision_points:
                    collision_found = True
                    # Get all altitudes in use at collision points
                    used_altitudes = [point[0].altitude for point in collision_points]
                    max_risk_score = max(max_risk_score, max(point[2] for point in collision_points))
                    
                    # Suggest new altitude for entire route segment
                    new_altitude = self.suggest_alternative_altitude(
                        modified_route.waypoints[0].altitude,
                        used_altitudes
                    )
                    
                    # Modify route altitude and adjust velocity based on risk
                    new_velocity = self.adjust_velocity(drone_id, max_risk_score)
                    
                    # Create new waypoints with adjusted altitude
                    new_waypoints = [
                        Position4D(
                            lat=wp.lat,
                            lon=wp.lon,
                            altitude=new_altitude,
                            timestamp=wp.timestamp
                        )
                        for wp in modified_route.waypoints
                    ]
                    
                    # Update modified route
                    modified_route = DroneRoute(
                        drone_id=drone_id,
                        waypoints=new_waypoints,
                        start_time=route.start_time,
                        end_time=route.end_time,
                        velocity=new_velocity,
                        heading=route.heading
                    )
            
            # Register the route (either original or modified)
            self.active_routes[drone_id] = modified_route
            
            # Return success if no collisions or if we successfully modified the route
            return True, modified_route
            
        except Exception as e:
            print(f"Error registering route for drone {drone_id}: {str(e)}")
            return False, None

    def deregister_route(self, drone_id: str):
        """Remove a route from active routes"""
        if drone_id in self.active_routes:
            del self.active_routes[drone_id]
            self.release_altitude(drone_id) 