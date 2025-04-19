import pytest
from datetime import datetime
from services.simulation_service import SimulationService

@pytest.mark.asyncio
async def test_create_simulation(db_session):
    service = SimulationService(db_session)
    simulation = await service.create_simulation(
        "test_dataset",
        {
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    print("\n=== Create Simulation Service Response ===")
    print(simulation)
    assert simulation is not None
    assert simulation["dataset_name"] == "test_dataset"
    assert simulation["status"] == "created"

@pytest.mark.asyncio
async def test_get_simulation(db_session):
    service = SimulationService(db_session)
    # First create a simulation
    simulation = await service.create_simulation(
        "test_dataset",
        {
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    
    # Then try to get it
    retrieved_simulation = await service.get_simulation(simulation["id"])
    print("\n=== Get Simulation Service Response ===")
    print(retrieved_simulation)
    assert retrieved_simulation is not None
    assert retrieved_simulation["id"] == simulation["id"]

@pytest.mark.asyncio
async def test_get_all_simulations(db_session):
    service = SimulationService(db_session)
    # Create multiple simulations
    for i in range(3):
        await service.create_simulation(
            f"test_dataset_{i}",
            {
                "battery_consumption_rate": 0.1,
                "max_speed": 50.0
            }
        )
    
    simulations = await service.get_all_simulations()
    print("\n=== Get All Simulations Service Response ===")
    print(simulations)
    assert len(simulations) == 3

@pytest.mark.asyncio
async def test_update_simulation_status(db_session):
    service = SimulationService(db_session)
    # Create a simulation
    simulation = await service.create_simulation(
        "test_dataset",
        {
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    
    # Update its status
    updated_simulation = await service.update_simulation_status(simulation["id"], "completed")
    print("\n=== Update Simulation Status Service Response ===")
    print(updated_simulation)
    assert updated_simulation["status"] == "completed" 