from sqlalchemy.orm import Session
from models.drone_simulation import DroneSimulationData, DroneSimulationResult
import json
from typing import Dict, List, Any
import numpy as np
from datetime import datetime
import os

class SimulationService:
    def __init__(self, db: Session):
        self.db = db

    async def create_simulation(self, dataset_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Create sample dataset structure
            dataset = {
                'coordinates': {
                    'pickup': {'lat': 0.0, 'lon': 0.0},
                    'delivery': {'lat': 1.0, 'lon': 1.0}
                },
                'sensor_readings': {
                    'altitude': 100.0,
                    'speed': parameters.get('max_speed', 50.0)
                },
                'weather': parameters.get('weather_conditions', {})
            }
            
            # Create simulation data
            simulation_data = DroneSimulationData(
                dataset_name=dataset_name,
                location_data=json.dumps(dataset['coordinates']),
                sensor_data=json.dumps(dataset['sensor_readings']),
                battery_data=json.dumps({
                    'initial_level': 100.0,
                    'consumption_rate': parameters.get('battery_consumption_rate', 0.1)
                }),
                weather_data=json.dumps(dataset['weather']),
                simulation_parameters=json.dumps(parameters),
                status='created'
            )
            
            self.db.add(simulation_data)
            self.db.commit()
            self.db.refresh(simulation_data)
            
            return simulation_data.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create simulation: {str(e)}")

    async def get_simulation(self, simulation_id: str) -> Dict[str, Any]:
        try:
            simulation = self.db.query(DroneSimulationData).filter(
                DroneSimulationData.id == simulation_id
            ).first()
            
            if not simulation:
                raise Exception("Simulation not found")
                
            return simulation.__dict__
        except Exception as e:
            raise Exception(f"Failed to get simulation: {str(e)}")

    async def get_all_simulations(self) -> List[Dict[str, Any]]:
        try:
            simulations = self.db.query(DroneSimulationData).all()
            return [sim.__dict__ for sim in simulations]
        except Exception as e:
            raise Exception(f"Failed to get simulations: {str(e)}")

    async def update_simulation_status(self, simulation_id: str, status: str) -> Dict[str, Any]:
        try:
            simulation = self.db.query(DroneSimulationData).filter(
                DroneSimulationData.id == simulation_id
            ).first()
            
            if not simulation:
                raise Exception("Simulation not found")
                
            simulation.status = status
            self.db.commit()
            self.db.refresh(simulation)
            
            return simulation.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update simulation status: {str(e)}")

    async def add_simulation_result(self, simulation_id: str, result_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = DroneSimulationResult(
                simulation_id=simulation_id,
                path_data=json.dumps(result_data.get('path', {})),
                energy_consumption=result_data.get('energy_consumption', 0.0),
                time_taken=result_data.get('time_taken', 0.0),
                success_rate=result_data.get('success_rate', 0.0)
            )
            
            self.db.add(result)
            self.db.commit()
            self.db.refresh(result)
            
            return result.__dict__
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to add simulation result: {str(e)}")

    async def get_simulation_results(self, simulation_id: str) -> List[Dict[str, Any]]:
        try:
            results = self.db.query(DroneSimulationResult).filter(
                DroneSimulationResult.simulation_id == simulation_id
            ).all()
            
            return [result.__dict__ for result in results]
        except Exception as e:
            raise Exception(f"Failed to get simulation results: {str(e)}") 