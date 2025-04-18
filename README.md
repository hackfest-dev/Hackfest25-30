# Drone Delivery Simulation Backend

This is a backend service for simulating drone delivery operations using Python, FastAPI, and PostgreSQL.

## Features

- Real-time drone simulation
- Delivery management
- Battery and capacity tracking
- Location tracking
- Simulation logging
- RESTful API endpoints

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=drone_delivery
   APP_HOST=0.0.0.0
   APP_PORT=8000
   DEBUG=True
   ```

## Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE drone_delivery;
   ```

2. The application will automatically create the necessary tables using SQLAlchemy models:
   - `drones` table for drone information
   - `deliveries` table for delivery tracking
   - `simulation_logs` table for simulation events

## Running the Application

1. Start PostgreSQL server
2. Start the application:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
.
├── main.py              # Main application entry point
├── config.py            # Configuration settings
├── requirements.txt     # Project dependencies
├── models/
│   └── mcp.py          # Model Context Protocol implementation
└── services/
    └── database_service.py  # PostgreSQL database service
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 