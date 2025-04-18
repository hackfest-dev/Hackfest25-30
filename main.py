from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime
from services.database_service import DatabaseService, get_db
from services.simulation_service import SimulationService
from sqlalchemy.orm import Session
from models.drone_simulation import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Drone Delivery Simulation API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db_service = DatabaseService()

# Basic models for the simulation
class Drone(BaseModel):
    name: str
    status: str
    battery_level: float
    current_location: dict
    max_capacity: float
    current_load: float

    class Config:
        from_attributes = True

class Delivery(BaseModel):
    drone_id: str
    pickup_location: dict
    delivery_location: dict
    status: str
    weight: float

    class Config:
        from_attributes = True

class SimulationParameters(BaseModel):
    dataset_name: str
    battery_consumption_rate: float
    max_speed: float
    weather_conditions: Optional[Dict[str, Any]] = None

class SimulationResult(BaseModel):
    path_data: Dict[str, Any]
    energy_consumption: float
    time_taken: float
    success_rate: float

# Basic routes
@app.get("/")
async def root():
    return {"message": "Welcome to Drone Delivery Simulation API"}

# Simulation endpoints
@app.post("/simulations")
async def create_simulation(
    parameters: SimulationParameters,
    db: Session = Depends(get_db)
):
    try:
        simulation_service = SimulationService(db)
        result = await simulation_service.create_simulation(
            parameters.dataset_name,
            parameters.dict()
        )
        return {"message": "Simulation created successfully", "simulation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/simulations")
async def get_simulations(db: Session = Depends(get_db)):
    try:
        simulation_service = SimulationService(db)
        simulations = await simulation_service.get_all_simulations()
        return {"simulations": simulations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/simulations/{simulation_id}")
async def get_simulation(simulation_id: str, db: Session = Depends(get_db)):
    try:
        simulation_service = SimulationService(db)
        simulation = await simulation_service.get_simulation(simulation_id)
        return {"simulation": simulation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/simulations/{simulation_id}/status")
async def update_simulation_status(
    simulation_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    try:
        simulation_service = SimulationService(db)
        result = await simulation_service.update_simulation_status(simulation_id, status)
        return {"message": "Simulation status updated successfully", "simulation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulations/{simulation_id}/results")
async def add_simulation_result(
    simulation_id: str,
    result: SimulationResult,
    db: Session = Depends(get_db)
):
    try:
        simulation_service = SimulationService(db)
        result_data = await simulation_service.add_simulation_result(
            simulation_id,
            result.dict()
        )
        return {"message": "Simulation result added successfully", "result": result_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/simulations/{simulation_id}/results")
async def get_simulation_results(simulation_id: str, db: Session = Depends(get_db)):
    try:
        simulation_service = SimulationService(db)
        results = await simulation_service.get_simulation_results(simulation_id)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Original drone and delivery endpoints
@app.get("/drones")
async def get_drones(db: Session = Depends(get_db)):
    try:
        drones = await db_service.get_drones()
        return {"drones": drones}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/drones")
async def create_drone(drone: Drone, db: Session = Depends(get_db)):
    try:
        created_drone = await db_service.create_drone(drone.dict())
        return {"message": "Drone created successfully", "drone": created_drone}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/deliveries")
async def get_deliveries(db: Session = Depends(get_db)):
    try:
        deliveries = await db_service.get_deliveries()
        return {"deliveries": deliveries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deliveries")
async def create_delivery(delivery: Delivery, db: Session = Depends(get_db)):
    try:
        created_delivery = await db_service.create_delivery(delivery.dict())
        return {"message": "Delivery created successfully", "delivery": created_delivery}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/drones/{drone_id}/status")
async def update_drone_status(drone_id: str, status: str, db: Session = Depends(get_db)):
    try:
        updated_drone = await db_service.update_drone_status(drone_id, status)
        return {"message": "Drone status updated successfully", "drone": updated_drone}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/deliveries/{delivery_id}/status")
async def update_delivery_status(delivery_id: str, status: str, db: Session = Depends(get_db)):
    try:
        updated_delivery = await db_service.update_delivery_status(delivery_id, status)
        return {"message": "Delivery status updated successfully", "delivery": updated_delivery}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 