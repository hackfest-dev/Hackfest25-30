from sqlalchemy import create_engine, Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid
from config import DATABASE_URL

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
    def __init__(self):
        Base.metadata.create_all(bind=engine)
        self.SessionLocal = SessionLocal

    async def create_drone(self, drone_data: dict) -> dict:
        db = self.SessionLocal()
        try:
            drone = Drone(**drone_data)
            db.add(drone)
            db.commit()
            db.refresh(drone)
            return drone.__dict__
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to create drone: {str(e)}")
        finally:
            db.close()

    async def get_drones(self) -> list:
        db = self.SessionLocal()
        try:
            drones = db.query(Drone).all()
            return [drone.__dict__ for drone in drones]
        except Exception as e:
            raise Exception(f"Failed to get drones: {str(e)}")
        finally:
            db.close()

    async def create_delivery(self, delivery_data: dict) -> dict:
        db = self.SessionLocal()
        try:
            delivery = Delivery(**delivery_data)
            db.add(delivery)
            db.commit()
            db.refresh(delivery)
            return delivery.__dict__
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to create delivery: {str(e)}")
        finally:
            db.close()

    async def get_deliveries(self) -> list:
        db = self.SessionLocal()
        try:
            deliveries = db.query(Delivery).all()
            return [delivery.__dict__ for delivery in deliveries]
        except Exception as e:
            raise Exception(f"Failed to get deliveries: {str(e)}")
        finally:
            db.close()

    async def log_simulation_event(self, event_data: dict) -> dict:
        db = self.SessionLocal()
        try:
            log = SimulationLog(**event_data)
            db.add(log)
            db.commit()
            db.refresh(log)
            return log.__dict__
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to log simulation event: {str(e)}")
        finally:
            db.close()

    async def update_drone_status(self, drone_id: str, status: str) -> dict:
        db = self.SessionLocal()
        try:
            drone = db.query(Drone).filter(Drone.id == drone_id).first()
            if not drone:
                raise Exception("Drone not found")
            drone.status = status
            db.commit()
            db.refresh(drone)
            return drone.__dict__
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update drone status: {str(e)}")
        finally:
            db.close()

    async def update_delivery_status(self, delivery_id: str, status: str) -> dict:
        db = self.SessionLocal()
        try:
            delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
            if not delivery:
                raise Exception("Delivery not found")
            delivery.status = status
            if status == "completed":
                delivery.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(delivery)
            return delivery.__dict__
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update delivery status: {str(e)}")
        finally:
            db.close() 