from sqlalchemy.orm import declarative_base, Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.models.drone_simulation import Simulation, Drone, Delivery
from typing import List, Dict, Any

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Drone(Base):
    __tablename__ = "drones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    battery_level = Column(Float, nullable=False)
    current_location = Column(JSON, nullable=False)
    max_capacity = Column(Float, nullable=False)
    current_load = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    deliveries = relationship("Delivery", back_populates="drone")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    drone_id = Column(String, ForeignKey("drones.id"))
    pickup_location = Column(JSON, nullable=False)
    delivery_location = Column(JSON, nullable=False)
    status = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    
    drone = relationship("Drone", back_populates="deliveries")

class SimulationLog(Base):
    __tablename__ = "simulation_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String, nullable=False)
    event_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class DatabaseService:
    def __init__(self, database_url: str = "sqlite:///./drone_simulation.db"):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def create_simulation(self, num_drones: int, num_deliveries: int) -> Dict[str, Any]:
        db = self.SessionLocal()
        try:
            simulation = Simulation(
                id=str(uuid.uuid4()),
                num_drones=num_drones,
                num_deliveries=num_deliveries,
                created_at=datetime.utcnow()
            )
            db.add(simulation)
            db.commit()
            db.refresh(simulation)
            return {
                "id": simulation.id,
                "num_drones": simulation.num_drones,
                "num_deliveries": simulation.num_deliveries,
                "created_at": simulation.created_at
            }
        finally:
            db.close()

    def get_simulation(self, simulation_id: str) -> Dict[str, Any]:
        db = self.SessionLocal()
        try:
            simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
            if not simulation:
                raise ValueError(f"Simulation {simulation_id} not found")
            return {
                "id": simulation.id,
                "num_drones": simulation.num_drones,
                "num_deliveries": simulation.num_deliveries,
                "created_at": simulation.created_at
            }
        finally:
            db.close()

    def create_drone(self, simulation_id: str, status: str = "available", battery: float = 100.0,
                    latitude: float = 0.0, longitude: float = 0.0, altitude: float = 0.0) -> Dict[str, Any]:
        db = self.SessionLocal()
        try:
            drone = Drone(
                id=str(uuid.uuid4()),
                simulation_id=simulation_id,
                status=status,
                battery=battery,
                latitude=latitude,
                longitude=longitude,
                altitude=altitude
            )
            db.add(drone)
            db.commit()
            db.refresh(drone)
            return {
                "id": drone.id,
                "simulation_id": drone.simulation_id,
                "status": drone.status,
                "battery": drone.battery,
                "latitude": drone.latitude,
                "longitude": drone.longitude,
                "altitude": drone.altitude
            }
        finally:
            db.close()

    def get_drones(self, simulation_id: str) -> List[Dict[str, Any]]:
        db = self.SessionLocal()
        try:
            drones = db.query(Drone).filter(Drone.simulation_id == simulation_id).all()
            return [{
                "id": drone.id,
                "simulation_id": drone.simulation_id,
                "status": drone.status,
                "battery": drone.battery,
                "latitude": drone.latitude,
                "longitude": drone.longitude,
                "altitude": drone.altitude
            } for drone in drones]
        finally:
            db.close()

    def create_delivery(self, simulation_id: str, pickup_lat: float, pickup_lon: float,
                       drop_lat: float, drop_lon: float, status: str = "pending") -> Dict[str, Any]:
        db = self.SessionLocal()
        try:
            delivery = Delivery(
                id=str(uuid.uuid4()),
                simulation_id=simulation_id,
                pickup_lat=pickup_lat,
                pickup_lon=pickup_lon,
                drop_lat=drop_lat,
                drop_lon=drop_lon,
                status=status
            )
            db.add(delivery)
            db.commit()
            db.refresh(delivery)
            return {
                "id": delivery.id,
                "simulation_id": delivery.simulation_id,
                "pickup_lat": delivery.pickup_lat,
                "pickup_lon": delivery.pickup_lon,
                "drop_lat": delivery.drop_lat,
                "drop_lon": delivery.drop_lon,
                "status": delivery.status
            }
        finally:
            db.close()

    def get_deliveries(self, simulation_id: str) -> List[Dict[str, Any]]:
        db = self.SessionLocal()
        try:
            deliveries = db.query(Delivery).filter(Delivery.simulation_id == simulation_id).all()
            return [{
                "id": delivery.id,
                "simulation_id": delivery.simulation_id,
                "pickup_lat": delivery.pickup_lat,
                "pickup_lon": delivery.pickup_lon,
                "drop_lat": delivery.drop_lat,
                "drop_lon": delivery.drop_lon,
                "status": delivery.status
            } for delivery in deliveries]
        finally:
            db.close()

    def update_drone_status(self, drone_id: str, status: str) -> Dict[str, Any]:
        db = self.SessionLocal()
        try:
            drone = db.query(Drone).filter(Drone.id == drone_id).first()
            if not drone:
                raise ValueError(f"Drone {drone_id} not found")
            drone.status = status
            db.commit()
            db.refresh(drone)
            return {
                "id": drone.id,
                "status": drone.status
            }
        finally:
            db.close()

    def update_delivery_status(self, delivery_id: str, status: str) -> Dict[str, Any]:
        db = self.SessionLocal()
        try:
            delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
            if not delivery:
                raise ValueError(f"Delivery {delivery_id} not found")
            delivery.status = status
            db.commit()
            db.refresh(delivery)
            return {
                "id": delivery.id,
                "status": delivery.status
            }
        finally:
            db.close()

    async def log_simulation_event(self, event_data: dict) -> dict:
        try:
            log = SimulationLog(**event_data)
            self.db.add(log)
            self.db.commit()
            self.db.refresh(log)
            return log.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to log simulation event: {str(e)}")

    async def get_drones(self) -> list:
        try:
            drones = self.db.query(Drone).all()
            return [drone.__dict__ for drone in drones]
        except Exception as e:
            raise Exception(f"Failed to get drones: {str(e)}")

    async def create_delivery(self, delivery_data: dict) -> dict:
        try:
            delivery = Delivery(**delivery_data)
            self.db.add(delivery)
            self.db.commit()
            self.db.refresh(delivery)
            return delivery.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create delivery: {str(e)}")

    async def get_deliveries(self) -> list:
        try:
            deliveries = self.db.query(Delivery).all()
            return [delivery.__dict__ for delivery in deliveries]
        except Exception as e:
            raise Exception(f"Failed to get deliveries: {str(e)}")

    async def log_simulation_event(self, event_data: dict) -> dict:
        try:
            log = SimulationLog(**event_data)
            self.db.add(log)
            self.db.commit()
            self.db.refresh(log)
            return log.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to log simulation event: {str(e)}")

    async def update_drone_status(self, drone_id: str, status: str) -> dict:
        try:
            drone = self.db.query(Drone).filter(Drone.id == drone_id).first()
            if not drone:
                raise Exception("Drone not found")
            drone.status = status
            self.db.commit()
            self.db.refresh(drone)
            return drone.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update drone status: {str(e)}")

    async def update_delivery_status(self, delivery_id: str, status: str) -> dict:
        try:
            delivery = self.db.query(Delivery).filter(Delivery.id == delivery_id).first()
            if not delivery:
                raise Exception("Delivery not found")
            delivery.status = status
            if status == "completed":
                delivery.completed_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(delivery)
            return delivery.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update delivery status: {str(e)}") 