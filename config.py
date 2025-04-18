import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

# PostgreSQL Configuration
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "drone_delivery")

# Database URL with proper password encoding
DATABASE_URL = f"postgresql://{POSTGRES_USER}:{quote_plus(POSTGRES_PASSWORD)}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

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