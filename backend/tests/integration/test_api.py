import pytest

@pytest.mark.asyncio
async def test_create_simulation(client):
    response = client.post(
        "/simulations",
        json={
            "dataset_name": "test_dataset",
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    print("\n=== Create Simulation Response ===")
    print(response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Simulation created successfully"
    assert "simulation" in data

@pytest.mark.asyncio
async def test_get_simulations(client):
    # First create a simulation
    client.post(
        "/simulations",
        json={
            "dataset_name": "test_dataset",
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    
    # Then get all simulations
    response = client.get("/simulations")
    print("\n=== Get All Simulations Response ===")
    print(response.json())
    assert response.status_code == 200
    data = response.json()
    assert "simulations" in data
    assert len(data["simulations"]) > 0

@pytest.mark.asyncio
async def test_get_simulation(client):
    # First create a simulation
    create_response = client.post(
        "/simulations",
        json={
            "dataset_name": "test_dataset",
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    simulation_id = create_response.json()["simulation"]["id"]
    
    # Then get the specific simulation
    response = client.get(f"/simulations/{simulation_id}")
    print("\n=== Get Single Simulation Response ===")
    print(response.json())
    assert response.status_code == 200
    data = response.json()
    assert "simulation" in data
    assert data["simulation"]["id"] == simulation_id

@pytest.mark.asyncio
async def test_update_simulation_status(client):
    # First create a simulation
    create_response = client.post(
        "/simulations",
        json={
            "dataset_name": "test_dataset",
            "battery_consumption_rate": 0.1,
            "max_speed": 50.0
        }
    )
    simulation_id = create_response.json()["simulation"]["id"]
    
    # Then update its status
    response = client.put(
        f"/simulations/{simulation_id}/status",
        params={"status": "completed"}
    )
    print("\n=== Update Simulation Status Response ===")
    print(response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Simulation status updated successfully"
    assert data["simulation"]["status"] == "completed" 