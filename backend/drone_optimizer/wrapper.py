from typing import List, Dict, Any
import json
from drone_optimizer import DroneOptimizer

class RouteOptimizer:
    def __init__(self):
        self.optimizer = DroneOptimizer()

    def train(self, training_data: List[Dict[str, Any]]) -> None:
        """Train the optimizer with historical route data.
        
        Args:
            training_data: List of route dictionaries containing:
                - segments: List of route segments
                - total_distance: Total route distance
                - total_time: Total route time
                - total_energy: Total energy consumption
        """
        # Convert Python dictionaries to Rust Route objects
        routes = []
        for route_data in training_data:
            route = {
                "segments": [
                    {
                        "start": {
                            "lat": seg["start"]["lat"],
                            "lon": seg["start"]["lon"],
                            "altitude": seg["start"]["altitude"]
                        },
                        "end": {
                            "lat": seg["end"]["lat"],
                            "lon": seg["end"]["lon"],
                            "altitude": seg["end"]["altitude"]
                        },
                        "distance": seg["distance"],
                        "time": seg["time"],
                        "energy": seg["energy"]
                    }
                    for seg in route_data["segments"]
                ],
                "total_distance": route_data["total_distance"],
                "total_time": route_data["total_time"],
                "total_energy": route_data["total_energy"]
            }
            routes.append(route)
        
        self.optimizer.train(routes)

    def optimize_route(self, route: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize a single route.
        
        Args:
            route: Route dictionary to optimize
            
        Returns:
            Optimized route dictionary
        """
        # Convert Python dictionary to Rust Route object
        rust_route = {
            "segments": [
                {
                    "start": {
                        "lat": seg["start"]["lat"],
                        "lon": seg["start"]["lon"],
                        "altitude": seg["start"]["altitude"]
                    },
                    "end": {
                        "lat": seg["end"]["lat"],
                        "lon": seg["end"]["lon"],
                        "altitude": seg["end"]["altitude"]
                    },
                    "distance": seg["distance"],
                    "time": seg["time"],
                    "energy": seg["energy"]
                }
                for seg in route["segments"]
            ],
            "total_distance": route["total_distance"],
            "total_time": route["total_time"],
            "total_energy": route["total_energy"]
        }
        
        # Get optimized route
        optimized_route = self.optimizer.optimize_route(rust_route)
        
        # Convert back to Python dictionary
        return {
            "segments": [
                {
                    "start": {
                        "lat": seg.start.lat,
                        "lon": seg.start.lon,
                        "altitude": seg.start.altitude
                    },
                    "end": {
                        "lat": seg.end.lat,
                        "lon": seg.end.lon,
                        "altitude": seg.end.altitude
                    },
                    "distance": seg.distance,
                    "time": seg.time,
                    "energy": seg.energy
                }
                for seg in optimized_route.segments
            ],
            "total_distance": optimized_route.total_distance,
            "total_time": optimized_route.total_time,
            "total_energy": optimized_route.total_energy
        }

    def optimize_routes(self, routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Optimize multiple routes in parallel.
        
        Args:
            routes: List of route dictionaries to optimize
            
        Returns:
            List of optimized route dictionaries
        """
        # Convert Python dictionaries to Rust Route objects
        rust_routes = []
        for route in routes:
            rust_route = {
                "segments": [
                    {
                        "start": {
                            "lat": seg["start"]["lat"],
                            "lon": seg["start"]["lon"],
                            "altitude": seg["start"]["altitude"]
                        },
                        "end": {
                            "lat": seg["end"]["lat"],
                            "lon": seg["end"]["lon"],
                            "altitude": seg["end"]["altitude"]
                        },
                        "distance": seg["distance"],
                        "time": seg["time"],
                        "energy": seg["energy"]
                    }
                    for seg in route["segments"]
                ],
                "total_distance": route["total_distance"],
                "total_time": route["total_time"],
                "total_energy": route["total_energy"]
            }
            rust_routes.append(rust_route)
        
        # Get optimized routes
        optimized_routes = self.optimizer.optimize_routes(rust_routes)
        
        # Convert back to Python dictionaries
        return [
            {
                "segments": [
                    {
                        "start": {
                            "lat": seg.start.lat,
                            "lon": seg.start.lon,
                            "altitude": seg.start.altitude
                        },
                        "end": {
                            "lat": seg.end.lat,
                            "lon": seg.end.lon,
                            "altitude": seg.end.altitude
                        },
                        "distance": seg.distance,
                        "time": seg.time,
                        "energy": seg.energy
                    }
                    for seg in route.segments
                ],
                "total_distance": route.total_distance,
                "total_time": route.total_time,
                "total_energy": route.total_energy
            }
            for route in optimized_routes
        ] 