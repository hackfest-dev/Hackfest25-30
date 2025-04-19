from fastapi import FastAPI, HTTPException, Depends, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.database_service import DatabaseService, get_db
from backend.services.simulation_service import SimulationService
from sqlalchemy.orm import Session
from backend.models.drone_simulation import Base, engine
from backend.services.routing_service import RoutingService
from backend.services.dataset_service import DatasetService
from backend.services.drone_simulation import DroneSimulation
from backend.services.fleet_manager import FleetManager
import asyncio
from backend.websocket_endpoints import handle_drone_updates, handle_fleet_status, handle_delivery_updates, manager

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

# Create static directory if it doesn't exist
if not os.path.exists("static"):
    os.makedirs("static")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize services
db_service = DatabaseService()
routing_service = RoutingService()
dataset_service = DatasetService()
drone_simulation = DroneSimulation()
fleet_manager = FleetManager(num_drones=5, num_deliveries=10)
fleet_manager.set_time_scale(10.0)  # Make simulation run 10x faster

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize fleet manager (but don't start it)
        fleet_manager._initialize_drones(fleet_manager.num_drones)
    except Exception as e:
        print(f"Error during startup: {str(e)}")
        raise

# Basic models for the simulation
class Drone(BaseModel):
    name: str
    status: str
    battery_level: float
    current_location: dict
    max_capacity: float
    current_load: float

    model_config = ConfigDict(from_attributes=True)

class Delivery(BaseModel):
    drone_id: str
    pickup_location: dict
    delivery_location: dict
    status: str
    weight: float

    model_config = ConfigDict(from_attributes=True)

class SimulationParameters(BaseModel):
    dataset_name: str
    battery_consumption_rate: float
    max_speed: float

class SimulationResult(BaseModel):
    path_data: Dict[str, Any]
    energy_consumption: float
    time_taken: float
    success_rate: float

class RouteRequest(BaseModel):
    pickup: Dict[str, float]
    drop: Dict[str, float]
    drone_id: str

class DeliveryPointResponse(BaseModel):
    id: str
    latitude: float
    longitude: float
    demand: float
    priority: int
    time_window_start: float
    time_window_end: float

# Root route for the map interface
@app.get("/", response_class=HTMLResponse)
async def get_map(request: Request):
    """Serve the drone routing visualization page"""
    # Get delivery points to display on the map
    delivery_points = dataset_service.get_delivery_points()
    return templates.TemplateResponse(
        "drone_routing.html", 
        {
            "request": request,
            "delivery_points": delivery_points
        }
    )

# Drone management interface
@app.get("/drones", response_class=HTMLResponse)
async def get_drones_management(request: Request):
    """Serve the drone management interface"""
    # Get delivery points to display on the map
    delivery_points = dataset_service.get_delivery_points()
    return templates.TemplateResponse(
        "drone_management.html", 
        {
            "request": request,
            "delivery_points": delivery_points
        }
    )

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
            parameters.model_dump()
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
            result.model_dump()
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
        created_drone = await db_service.create_drone(drone.model_dump())
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
        created_delivery = await db_service.create_delivery(delivery.model_dump())
        return {"message": "Delivery created successfully", "delivery": created_delivery}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/drones/{drone_id}/status")
async def update_drone_status(drone_id: str, status: str, db: Session = Depends(get_db)):
    try:
        updated_drone = await db_service.update_drone_status(drone_id, status)
        # Broadcast drone status update
        await manager.broadcast_drone_positions([{
            "drone_id": drone_id,
            "status": status,
            "position": updated_drone.current_position
        }])
        return {"message": "Drone status updated successfully", "drone": updated_drone}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/deliveries/{delivery_id}/status")
async def update_delivery_status(delivery_id: str, status: str, db: Session = Depends(get_db)):
    try:
        updated_delivery = await db_service.update_delivery_status(delivery_id, status)
        # Broadcast delivery status update
        await manager.broadcast_delivery_update({
            "delivery_id": delivery_id,
            "status": status
        })
        return {"message": "Delivery status updated successfully", "delivery": updated_delivery}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate-route")
async def calculate_route(route_request: RouteRequest) -> Dict[str, Any]:
    """
    Calculate the drone route from pickup to drop location and back to base.
    
    Args:
        route_request: Contains pickup and drop location coordinates and drone_id
        
    Returns:
        Dictionary containing route segments, total distance, time, and energy consumption
    """
    try:
        # Validate coordinates
        if not (-90 <= route_request.pickup['lat'] <= 90) or not (-180 <= route_request.pickup['lon'] <= 180):
            raise HTTPException(status_code=400, detail="Invalid pickup coordinates")
        if not (-90 <= route_request.drop['lat'] <= 90) or not (-180 <= route_request.drop['lon'] <= 180):
            raise HTTPException(status_code=400, detail="Invalid drop coordinates")
        
        # Calculate route
        route = await routing_service.calculate_route(
            route_request.pickup, 
            route_request.drop,
            route_request.drone_id
        )
        return route
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dataset endpoints
@app.get("/api/delivery-points", response_model=List[DeliveryPointResponse])
async def get_delivery_points():
    """Get all delivery points from the dataset"""
    try:
        return dataset_service.get_delivery_points()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/delivery-points/{point_id}", response_model=DeliveryPointResponse)
async def get_delivery_point(point_id: str):
    """Get a specific delivery point by ID"""
    try:
        return dataset_service.get_delivery_point_by_id(point_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/delivery-points/region", response_model=List[DeliveryPointResponse])
async def get_points_in_region(
    min_lat: float,
    max_lat: float,
    min_lon: float,
    max_lon: float
):
    """Get delivery points within a specific geographical region"""
    try:
        return dataset_service.get_points_in_region(min_lat, max_lat, min_lon, max_lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Clear database and create tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Drone test interface
@app.get("/test", response_class=HTMLResponse)
async def get_drone_test(request: Request):
    """Serve the drone test interface"""
    return templates.TemplateResponse(
        "drone_test.html", 
        {
            "request": request
        }
    )

@app.post("/api/simulations")
async def create_simulation(parameters: SimulationParameters):
    try:
        simulation = drone_simulation.create_simulation(parameters.num_drones, parameters.num_deliveries)
        return simulation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulations/{simulation_id}")
async def get_simulation(simulation_id: str):
    try:
        simulation = drone_simulation.get_simulation(simulation_id)
        if not simulation:
            raise HTTPException(status_code=404, detail="Simulation not found")
        return simulation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulations/{simulation_id}/drones")
async def get_drones(simulation_id: str):
    try:
        drones = drone_simulation.get_drones(simulation_id)
        return drones
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulations/{simulation_id}/deliveries")
async def get_deliveries(simulation_id: str):
    try:
        deliveries = drone_simulation.get_deliveries(simulation_id)
        return deliveries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fleet management endpoints
@app.post("/api/fleet/start")
async def start_fleet():
    """Start the fleet operations"""
    try:
        if fleet_manager.is_running:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "FleetAlreadyRunning",
                    "message": "The fleet is already running"
                }
            )
        
        # Start the fleet
        try:
            success = await fleet_manager.start()
            if not success:
                raise ValueError("Failed to start fleet operations")
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "FleetStartFailed",
                    "message": str(e)
                }
            )
        
        # Start processing deliveries
        asyncio.create_task(fleet_manager.process_deliveries())
        return {
            "status": "started",
            "message": "Fleet operations started successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"An error occurred while starting the fleet: {str(e)}"
            }
        )

@app.post("/api/fleet/pause")
async def pause_fleet():
    """Pause the fleet operations"""
    if not fleet_manager.is_running:
        raise HTTPException(status_code=400, detail="Fleet is not running")
    fleet_manager.pause()
    return {"status": "paused"}

@app.post("/api/fleet/resume")
async def resume_fleet():
    """Resume the fleet operations"""
    if fleet_manager.is_running:
        raise HTTPException(status_code=400, detail="Fleet is already running")
    fleet_manager.resume()
    asyncio.create_task(fleet_manager.process_deliveries())
    return {"status": "resumed"}

@app.post("/api/fleet/reset")
async def reset_fleet():
    """Reset the fleet to initial state"""
    await fleet_manager.reset()
    return {"status": "reset"}

@app.get("/api/fleet/status")
async def get_fleet_status():
    """Get current status of the fleet"""
    return fleet_manager.get_status()

@app.get("/api/fleet/drones")
async def get_drones():
    """Get list of all drones"""
    return {
        "drones": [
            {
                "id": drone.id,
                "status": drone.status,
                "battery_level": drone.battery_level,
                "location": {
                    "lat": drone.current_location.lat,
                    "lon": drone.current_location.lon,
                    "altitude": drone.current_location.altitude
                },
                "current_delivery": drone.current_delivery,
                "completed_deliveries": drone.completed_deliveries,
                "total_distance": drone.total_distance,
                "total_flight_time": drone.total_flight_time
            }
            for drone in fleet_manager.drones.values()
        ]
    }

@app.get("/api/fleet/deliveries")
async def get_deliveries():
    """Get list of all deliveries"""
    return {
        "deliveries": [
            {
                "id": delivery.id,
                "status": delivery.status,
                "assigned_drone": delivery.assigned_drone,
                "priority": delivery.priority,
                "weight": delivery.weight,
                "pickup": {
                    "lat": delivery.pickup.lat,
                    "lon": delivery.pickup.lon,
                    "altitude": delivery.pickup.altitude
                },
                "dropoff": {
                    "lat": delivery.dropoff.lat,
                    "lon": delivery.dropoff.lon,
                    "altitude": delivery.dropoff.altitude
                },
                "creation_time": delivery.creation_time,
                "completion_time": delivery.completion_time,
                "estimated_time": delivery.estimated_time
            }
            for delivery in fleet_manager.deliveries.values()
        ]
    }

@app.get("/api/fleet/stats")
async def get_fleet_stats():
    """Get fleet statistics"""
    status = fleet_manager.get_status()
    return status["stats"]

@app.get("/api/fleet/statistics/history")
async def get_fleet_statistics_history():
    """Get the complete history of fleet statistics"""
    return fleet_manager.get_statistics_history()

@app.get("/api/fleet/statistics/current")
async def get_current_fleet_statistics():
    """Get the most recent fleet statistics"""
    return fleet_manager.get_current_statistics()

@app.get("/api/fleet/drone/{drone_id}/route-history")
async def get_drone_route_history(drone_id: str):
    """Get route history for a specific drone"""
    if drone_id not in fleet_manager.drones:
        raise HTTPException(status_code=404, detail="Drone not found")
    drone = fleet_manager.drones[drone_id]
    return {
        "drone_id": drone_id,
        "route_history": drone.route_history
    }

@app.get("/fleet", response_class=HTMLResponse)
async def get_fleet_management(request: Request):
    """Serve the fleet management visualization page"""
    return templates.TemplateResponse(
        "fleet_management.html",
        {"request": request}
    )

# WebSocket endpoints
@app.websocket("/ws/drone-updates")
async def websocket_drone_updates(websocket: WebSocket):
    await handle_drone_updates(websocket)

@app.websocket("/ws/fleet-status")
async def websocket_fleet_status(websocket: WebSocket):
    await handle_fleet_status(websocket)

@app.websocket("/ws/delivery-updates")
async def websocket_delivery_updates(websocket: WebSocket):
    await handle_delivery_updates(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 