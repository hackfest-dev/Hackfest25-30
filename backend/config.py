import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from pathlib import Path

load_dotenv()

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./fleet_management.db')

# Application Configuration
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Drone Simulation Configuration
MAX_DRONE_CAPACITY = float(os.getenv("MAX_DRONE_CAPACITY", "5.0"))  # in kg
MAX_DRONE_BATTERY = float(os.getenv("MAX_DRONE_BATTERY", "100.0"))  # in percentage
BATTERY_CONSUMPTION_RATE = float(os.getenv("BATTERY_CONSUMPTION_RATE", "0.1"))  # per km
DRONE_SPEED = float(os.getenv("DRONE_SPEED", "50.0"))  # in km/h

# Database Tables
DRONES_TABLE = "drones"
DELIVERIES_TABLE = "deliveries"
SIMULATION_LOGS_TABLE = "simulation_logs"

# WebSocket configuration
WS_HOST = "localhost"
WS_PORT = 8000

# Fleet configuration
DEFAULT_NUM_DRONES = 10
DEFAULT_NUM_DELIVERIES = 20

# Service area boundaries (Delhi NCR coordinates)
SERVICE_AREA = {
    "min_lat": 28.4,
    "max_lat": 28.8,
    "min_lon": 76.8,
    "max_lon": 77.4
}

# Drone specifications
DRONE_SPECS = {
    "max_speed": 50,  # km/h
    "max_battery": 100,  # percentage
    "battery_drain_rate": 0.1,  # percentage per km
    "max_payload": 5.0,  # kg
    "charging_rate": 2.0  # percentage per minute
}

# Time scaling for simulation
DEFAULT_TIME_SCALE = 1.0  # Real-time 