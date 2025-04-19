from typing import Dict, List, Any, Optional
import uuid
from datetime import datetime, timedelta
import random
from backend.models.drone_simulation import Drone, Delivery, Simulation
from backend.services.database_service import DatabaseService
from backend.services.dataset_service import DatasetService

class DroneSimulation:
    def __init__(self):
        self.db_service = DatabaseService()
        self.dataset_service = DatasetService()

    def create_simulation(self, num_drones: int, num_deliveries: int) -> Dict[str, Any]:
        """Create a new simulation with the specified number of drones and deliveries."""
        try:
            simulation_id = str(uuid.uuid4())
            simulation = Simulation(
                id=simulation_id,
                num_drones=num_drones,
                num_deliveries=num_deliveries,
                created_at=datetime.now()
            )
            
            # Get delivery points to determine the operational area
            delivery_points = self.dataset_service.get_delivery_points()
            if not delivery_points:
                raise ValueError("No delivery points available")
            
            # Calculate the center and spread of the operational area
            lats = [point['latitude'] for point in delivery_points]
            lons = [point['longitude'] for point in delivery_points]
            center_lat = sum(lats) / len(lats)
            center_lon = sum(lons) / len(lons)
            spread_lat = (max(lats) - min(lats)) / 4  # Use 1/4 of the total spread
            spread_lon = (max(lons) - min(lons)) / 4
            
            # Create drones spread around the operational area
            drones = []
            for i in range(num_drones):
                # Generate random position within the spread area
                drone_lat = center_lat + (random.random() - 0.5) * spread_lat
                drone_lon = center_lon + (random.random() - 0.5) * spread_lon
                
                drone = Drone(
                    id=f"DRONE-{i+1}",
                    simulation_id=simulation_id,
                    status="Available",
                    battery=100,
                    latitude=drone_lat,
                    longitude=drone_lon,
                    altitude=0.0
                )
                drones.append(drone)
            
            # Create deliveries from the dataset
            deliveries = []
            selected_points = random.sample(delivery_points, min(num_deliveries, len(delivery_points)))
            for i, point in enumerate(selected_points):
                delivery = Delivery(
                    id=f"DELIVERY-{i+1}",
                    simulation_id=simulation_id,
                    pickup_lat=point['latitude'],
                    pickup_lon=point['longitude'],
                    # Generate dropoff point nearby
                    drop_lat=point['latitude'] + (random.random() - 0.5) * 0.02,
                    drop_lon=point['longitude'] + (random.random() - 0.5) * 0.02,
                    status="Pending"
                )
                deliveries.append(delivery)
            
            # Save to database
            self.db_service.save_simulation(simulation)
            self.db_service.save_drones(drones)
            self.db_service.save_deliveries(deliveries)
            
            return {
                "id": simulation_id,
                "num_drones": num_drones,
                "num_deliveries": num_deliveries,
                "created_at": simulation.created_at.isoformat()
            }
        except Exception as e:
            raise ValueError(f"Error creating simulation: {str(e)}")

    def get_simulation(self, simulation_id: str) -> Dict[str, Any]:
        """Get simulation details by ID."""
        try:
            simulation = self.db_service.get_simulation(simulation_id)
            if not simulation:
                raise ValueError("Simulation not found")
            
            return {
                "id": simulation.id,
                "num_drones": simulation.num_drones,
                "num_deliveries": simulation.num_deliveries,
                "created_at": simulation.created_at.isoformat()
            }
        except Exception as e:
            raise ValueError(f"Error getting simulation: {str(e)}")

    def get_drones(self, simulation_id: str) -> List[Dict[str, Any]]:
        """Get all drones for a simulation."""
        try:
            drones = self.db_service.get_drones(simulation_id)
            return [{
                "id": drone.id,
                "status": drone.status,
                "battery": drone.battery,
                "latitude": drone.latitude,
                "longitude": drone.longitude,
                "altitude": drone.altitude
            } for drone in drones]
        except Exception as e:
            raise ValueError(f"Error getting drones: {str(e)}")

    def get_deliveries(self, simulation_id: str) -> List[Dict[str, Any]]:
        """Get all deliveries for a simulation."""
        try:
            deliveries = self.db_service.get_deliveries(simulation_id)
            return [{
                "id": delivery.id,
                "pickup_lat": delivery.pickup_lat,
                "pickup_lon": delivery.pickup_lon,
                "drop_lat": delivery.drop_lat,
                "drop_lon": delivery.drop_lon,
                "status": delivery.status
            } for delivery in deliveries]
        except Exception as e:
            raise ValueError(f"Error getting deliveries: {str(e)}")

    def update_drone_status(self, drone_id: str, status: str) -> Dict[str, Any]:
        """Update a drone's status."""
        try:
            drone = self.db_service.update_drone_status(drone_id, status)
            return {
                "id": drone.id,
                "status": drone.status,
                "battery": drone.battery,
                "latitude": drone.latitude,
                "longitude": drone.longitude,
                "altitude": drone.altitude
            }
        except Exception as e:
            raise ValueError(f"Error updating drone status: {str(e)}")

    def update_delivery_status(self, delivery_id: str, status: str) -> Dict[str, Any]:
        """Update a delivery's status."""
        try:
            delivery = self.db_service.update_delivery_status(delivery_id, status)
            return {
                "id": delivery.id,
                "pickup_lat": delivery.pickup_lat,
                "pickup_lon": delivery.pickup_lon,
                "drop_lat": delivery.drop_lat,
                "drop_lon": delivery.drop_lon,
                "status": delivery.status
            }
        except Exception as e:
            raise ValueError(f"Error updating delivery status: {str(e)}")