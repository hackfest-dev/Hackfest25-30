from sqlalchemy.orm import Session
from models.drone_simulation import Simulation, Drone, Delivery, SimulationStatus, DroneStatus, DeliveryStatus
from typing import List, Dict, Any
from datetime import datetime

class SimulationService:
    def __init__(self, db: Session):
        self.db = db

    async def create_simulation(self, name: str, description: str = None) -> Dict[str, Any]:
        """Create a new simulation"""
        simulation = Simulation(
            name=name,
            description=description,
            status=SimulationStatus.created
        )
        self.db.add(simulation)
        self.db.commit()
        self.db.refresh(simulation)
        return {
            "id": simulation.id,
            "name": simulation.name,
            "description": simulation.description,
            "status": simulation.status.value,
            "created_at": simulation.created_at
        }

    async def get_simulation(self, simulation_id: int) -> Dict[str, Any]:
        """Get a simulation by ID"""
        simulation = self.db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if not simulation:
            raise ValueError(f"Simulation with ID {simulation_id} not found")
        
        return {
            "id": simulation.id,
            "name": simulation.name,
            "description": simulation.description,
            "status": simulation.status.value,
            "created_at": simulation.created_at,
            "updated_at": simulation.updated_at
        }

    async def add_drone(self, simulation_id: int, name: str, max_speed: float, 
                       max_payload: float, battery_capacity: float) -> Dict[str, Any]:
        """Add a drone to a simulation"""
        simulation = self.db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if not simulation:
            raise ValueError(f"Simulation with ID {simulation_id} not found")

        drone = Drone(
            simulation_id=simulation_id,
            name=name,
            max_speed=max_speed,
            max_payload=max_payload,
            battery_capacity=battery_capacity,
            status=DroneStatus.available
        )
        self.db.add(drone)
        self.db.commit()
        self.db.refresh(drone)
        
        return {
            "id": drone.id,
            "name": drone.name,
            "max_speed": drone.max_speed,
            "max_payload": drone.max_payload,
            "battery_capacity": drone.battery_capacity,
            "status": drone.status.value
        }

    async def add_delivery(self, simulation_id: int, pickup_lat: float, pickup_lon: float,
                          dropoff_lat: float, dropoff_lon: float, weight: float,
                          priority: str = "normal") -> Dict[str, Any]:
        """Add a delivery to a simulation"""
        simulation = self.db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if not simulation:
            raise ValueError(f"Simulation with ID {simulation_id} not found")

        delivery = Delivery(
            simulation_id=simulation_id,
            pickup_latitude=pickup_lat,
            pickup_longitude=pickup_lon,
            dropoff_latitude=dropoff_lat,
            dropoff_longitude=dropoff_lon,
            weight=weight,
            priority=priority,
            status=DeliveryStatus.pending
        )
        self.db.add(delivery)
        self.db.commit()
        self.db.refresh(delivery)
        
        return {
            "id": delivery.id,
            "pickup": {"lat": delivery.pickup_latitude, "lon": delivery.pickup_longitude},
            "dropoff": {"lat": delivery.dropoff_latitude, "lon": delivery.dropoff_longitude},
            "weight": delivery.weight,
            "priority": delivery.priority.value,
            "status": delivery.status.value
        }

    async def get_drones(self, simulation_id: int) -> List[Dict[str, Any]]:
        """Get all drones for a simulation"""
        drones = self.db.query(Drone).filter(Drone.simulation_id == simulation_id).all()
        return [
            {
                "id": drone.id,
                "name": drone.name,
                "max_speed": drone.max_speed,
                "max_payload": drone.max_payload,
                "battery_capacity": drone.battery_capacity,
                "status": drone.status.value
            }
            for drone in drones
        ]

    async def get_deliveries(self, simulation_id: int) -> List[Dict[str, Any]]:
        """Get all deliveries for a simulation"""
        deliveries = self.db.query(Delivery).filter(Delivery.simulation_id == simulation_id).all()
        return [
            {
                "id": delivery.id,
                "pickup": {"lat": delivery.pickup_latitude, "lon": delivery.pickup_longitude},
                "dropoff": {"lat": delivery.dropoff_latitude, "lon": delivery.dropoff_longitude},
                "weight": delivery.weight,
                "priority": delivery.priority.value,
                "status": delivery.status.value
            }
            for delivery in deliveries
        ] 