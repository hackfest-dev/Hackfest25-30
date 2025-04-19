# Drone Fleet Management System - API Documentation

## Fleet Management Endpoints

### 1. Start Fleet
```http
POST /api/fleet/start
```
**Request Body:** None

**Response:**
```json
{
    "status": "started",
    "message": "Fleet operations started successfully"
}
```

### 2. Pause Fleet
```http
POST /api/fleet/pause
```
**Request Body:** None

**Response:**
```json
{
    "status": "paused"
}
```

### 3. Resume Fleet
```http
POST /api/fleet/resume
```
**Request Body:** None

**Response:**
```json
{
    "status": "resumed"
}
```

### 4. Reset Fleet
```http
POST /api/fleet/reset
```
**Request Body:** None

**Response:**
```json
{
    "status": "reset"
}
```

### 5. Get Fleet Status
```http
GET /api/fleet/status
```
**Request Body:** None

**Response:**
```json
{
    "drones": {
        "drone_id": {
            "status": "idle|en_route|charging",
            "battery_level": float,
            "location": {
                "lat": float,
                "lon": float,
                "altitude": float
            },
            "current_delivery": string|null,
            "total_distance": float,
            "total_flight_time": float
        }
    },
    "deliveries": {
        "delivery_id": {
            "status": "pending|in_progress|completed",
            "pickup_location": {
                "lat": float,
                "lon": float
            },
            "delivery_location": {
                "lat": float,
                "lon": float
            },
            "assigned_drone": string|null,
            "weight": float,
            "priority": int
        }
    },
    "stats": {
        "total_drones": int,
        "active_drones": int,
        "idle_drones": int,
        "charging_drones": int,
        "total_deliveries": int,
        "completed_deliveries": int,
        "avg_waiting_time": float,
        "avg_battery_level": float
    }
}
```

### 6. Get Fleet Statistics History
```http
GET /api/fleet/statistics/history
```
**Request Body:** None

**Response:**
```json
[
    {
        "timestamp": "ISO datetime",
        "total_drones": int,
        "active_drones": int,
        "idle_drones": int,
        "charging_drones": int,
        "total_deliveries": int,
        "completed_deliveries": int,
        "avg_waiting_time": float,
        "avg_battery_level": float,
        "total_distance": float,
        "total_flight_time": float,
        "total_waiting_time": float
    }
]
```

### 7. Get Current Statistics
```http
GET /api/fleet/statistics/current
```
**Request Body:** None

**Response:** Same as statistics history, but only the latest entry

### 8. Get Drone Route History
```http
GET /api/fleet/drone/{drone_id}/route-history
```
**Request Parameters:**
- `drone_id`: string (required)

**Response:**
```json
{
    "drone_id": string,
    "route_history": [
        {
            "timestamp": "ISO datetime",
            "location": {
                "lat": float,
                "lon": float,
                "altitude": float
            },
            "status": string,
            "battery_level": float,
            "current_delivery": string|null
        }
    ]
}
```

### 9. Calculate Route
```http
POST /api/calculate-route
```
**Request Body:**
```json
{
    "pickup": {
        "lat": float,
        "lon": float
    },
    "drop": {
        "lat": float,
        "lon": float
    },
    "drone_id": string
}
```

**Response:**
```json
{
    "route": [
        {
            "lat": float,
            "lon": float,
            "altitude": float
        }
    ],
    "distance": float,
    "estimated_time": float,
    "energy_consumption": float
}
```

### 10. Get Delivery Points
```http
GET /api/delivery-points
```
**Request Body:** None

**Response:**
```json
[
    {
        "id": string,
        "latitude": float,
        "longitude": float,
        "demand": float,
        "priority": int,
        "time_window_start": float,
        "time_window_end": float
    }
]
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "detail": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
    "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "detail": "Internal server error occurred"
}
```

## Example Usage

### Starting the Fleet
```javascript
fetch('http://localhost:8000/api/fleet/start', {
    method: 'POST'
})
.then(response => response.json())
.then(data => console.log(data));
```

### Getting Fleet Status
```javascript
fetch('http://localhost:8000/api/fleet/status')
.then(response => response.json())
.then(data => {
    console.log('Active Drones:', data.stats.active_drones);
    console.log('Completed Deliveries:', data.stats.completed_deliveries);
});
```

### Calculating a Route
```javascript
fetch('http://localhost:8000/api/calculate-route', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        pickup: {
            lat: 28.6139,
            lon: 77.209
        },
        drop: {
            lat: 28.5090,
            lon: 77.1708
        },
        drone_id: "drone_1"
    })
})
.then(response => response.json())
.then(data => console.log('Route:', data.route));
```

## Notes

1. All coordinates use the WGS84 coordinate system (standard GPS coordinates)
2. Altitude is measured in meters
3. Time values are in seconds unless specified otherwise
4. Battery levels are percentages (0-100)
5. All timestamps are in ISO 8601 format
6. The API uses CORS and is accessible from any origin 