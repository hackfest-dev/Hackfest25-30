from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, create_engine
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./drone_simulation.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base()

class Priority(enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"

class DroneStatus(enum.Enum):
    available = "available"
    busy = "busy"
    charging = "charging"
    maintenance = "maintenance"

class DeliveryStatus(enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"

class SimulationStatus(enum.Enum):
    created = "created"
    running = "running"
    completed = "completed"
    failed = "failed"

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(String, primary_key=True)
    num_drones = Column(Integer)
    num_deliveries = Column(Integer)
    created_at = Column(DateTime)

    drones = relationship("Drone", back_populates="simulation")
    deliveries = relationship("Delivery", back_populates="simulation")

class Drone(Base):
    __tablename__ = "drones"
    
    id = Column(String, primary_key=True)
    simulation_id = Column(String, ForeignKey("simulations.id"))
    status = Column(String)
    battery = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float)

    simulation = relationship("Simulation", back_populates="drones")

class Delivery(Base):
    __tablename__ = "deliveries"
    
    id = Column(String, primary_key=True)
    simulation_id = Column(String, ForeignKey("simulations.id"))
    pickup_lat = Column(Float)
    pickup_lon = Column(Float)
    drop_lat = Column(Float)
    drop_lon = Column(Float)
    status = Column(String)

    simulation = relationship("Simulation", back_populates="deliveries") 