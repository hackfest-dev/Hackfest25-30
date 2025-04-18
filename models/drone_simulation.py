from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
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

class DroneSimulationData(Base):
    __tablename__ = "drone_simulation_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_name = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    location_data = Column(JSON, nullable=False)  # Stores coordinates and other location data
    sensor_data = Column(JSON, nullable=False)    # Stores sensor readings
    battery_data = Column(JSON, nullable=False)   # Stores battery status and consumption
    weather_data = Column(JSON, nullable=True)    # Stores weather conditions
    simulation_parameters = Column(JSON, nullable=False)  # Stores simulation settings
    status = Column(String, nullable=False)       # Status of the simulation
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class DroneSimulationResult(Base):
    __tablename__ = "drone_simulation_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    simulation_id = Column(String, ForeignKey('drone_simulation_data.id'), nullable=False)
    path_data = Column(JSON, nullable=False)      # Stores the calculated path
    energy_consumption = Column(Float, nullable=False)
    time_taken = Column(Float, nullable=False)    # Time taken for the simulation
    success_rate = Column(Float, nullable=False)  # Success rate of the simulation
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    simulation = relationship("DroneSimulationData", backref="results") 