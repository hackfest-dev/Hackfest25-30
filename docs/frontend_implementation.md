# Drone Fleet Management System - Frontend Implementation Guide

## API Endpoints

### Fleet Management Endpoints

#### Start Fleet
```http
POST /api/fleet/start
```
**Response:**
```json
{
    "status": "started",
    "message": "Fleet operations started successfully"
}
```

#### Pause Fleet
```http
POST /api/fleet/pause
```
**Response:**
```json
{
    "status": "paused"
}
```

#### Resume Fleet
```http
POST /api/fleet/resume
```
**Response:**
```json
{
    "status": "resumed"
}
```

#### Reset Fleet
```http
POST /api/fleet/reset
```
**Response:**
```json
{
    "status": "reset"
}
```

#### Get Fleet Status
```http
GET /api/fleet/status
```
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
    "deliveries": {...},
    "stats": {...}
}
```

#### Get Fleet Statistics History
```http
GET /api/fleet/statistics/history
```
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

#### Get Current Statistics
```http
GET /api/fleet/statistics/current
```
**Response:** Same as statistics history, but only the latest entry

## Frontend Implementation

### 2D Implementation (Leaflet)

```javascript
// Initialize the map
const map = L.map('map').setView([28.6139, 77.209], 12); // Delhi coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Store drone markers and routes
const droneMarkers = {};
const droneRoutes = {};

// Function to update drone positions
async function updateDronePositions() {
    const response = await fetch('/api/fleet/status');
    const data = await response.json();
    
    // Update each drone
    for (const [droneId, drone] of Object.entries(data.drones)) {
        const position = [drone.location.lat, drone.location.lon];
        
        // Update or create marker
        if (!droneMarkers[droneId]) {
            droneMarkers[droneId] = L.marker(position)
                .bindPopup(`Drone ${droneId}<br>Status: ${drone.status}<br>Battery: ${drone.battery_level}%`)
                .addTo(map);
        } else {
            droneMarkers[droneId].setLatLng(position);
        }
        
        // Update route if drone is moving
        if (drone.status === 'en_route') {
            const route = droneMarkers[droneId].route || [];
            route.push(position);
            if (route.length > 1) {
                if (droneRoutes[droneId]) {
                    map.removeLayer(droneRoutes[droneId]);
                }
                droneRoutes[droneId] = L.polyline(route, {color: 'red'}).addTo(map);
            }
        }
    }
}

// Update statistics
async function updateStatistics() {
    const response = await fetch('/api/fleet/statistics/current');
    const stats = await response.json();
    
    document.getElementById('stats').innerHTML = `
        <h3>Fleet Statistics</h3>
        <p>Active Drones: ${stats.active_drones}</p>
        <p>Idle Drones: ${stats.idle_drones}</p>
        <p>Charging Drones: ${stats.charging_drones}</p>
        <p>Completed Deliveries: ${stats.completed_deliveries}</p>
        <p>Average Waiting Time: ${stats.avg_waiting_time.toFixed(2)}s</p>
        <p>Average Battery: ${stats.avg_battery_level.toFixed(1)}%</p>
    `;
}

// Update every 5 seconds
setInterval(() => {
    updateDronePositions();
    updateStatistics();
}, 5000);
```

### 3D Implementation (Three.js)

```javascript
// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Store drone objects
const droneObjects = {};

// Function to create drone model
function createDroneModel() {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const drone = new THREE.Mesh(geometry, material);
    return drone;
}

// Function to update drone positions in 3D
async function updateDronePositions3D() {
    const response = await fetch('/api/fleet/status');
    const data = await response.json();
    
    for (const [droneId, drone] of Object.entries(data.drones)) {
        // Convert lat/lon to 3D coordinates
        const x = (drone.location.lon - 77.209) * 100; // Scale factor
        const z = (drone.location.lat - 28.6139) * 100;
        const y = drone.location.altitude / 1000; // Convert to km
        
        if (!droneObjects[droneId]) {
            droneObjects[droneId] = createDroneModel();
            scene.add(droneObjects[droneId]);
        }
        
        // Update position
        droneObjects[droneId].position.set(x, y, z);
        
        // Update color based on status
        const material = droneObjects[droneId].material;
        switch(drone.status) {
            case 'idle': material.color.set(0x00ff00); break;
            case 'en_route': material.color.set(0xff0000); break;
            case 'charging': material.color.set(0x0000ff); break;
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Update every 5 seconds
setInterval(updateDronePositions3D, 5000);
animate();
```

### Control Panel HTML

```html
<div class="control-panel">
    <h2>Fleet Controls</h2>
    <button onclick="startFleet()">Start Fleet</button>
    <button onclick="pauseFleet()">Pause Fleet</button>
    <button onclick="resumeFleet()">Resume Fleet</button>
    <button onclick="resetFleet()">Reset Fleet</button>
    
    <div id="stats" class="statistics-panel">
        <!-- Statistics will be updated here -->
    </div>
</div>

<script>
async function startFleet() {
    await fetch('/api/fleet/start', { method: 'POST' });
}

async function pauseFleet() {
    await fetch('/api/fleet/pause', { method: 'POST' });
}

async function resumeFleet() {
    await fetch('/api/fleet/resume', { method: 'POST' });
}

async function resetFleet() {
    await fetch('/api/fleet/reset', { method: 'POST' });
}
</script>
```

### CSS Styling

```css
.control-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 1000;
}

.statistics-panel {
    margin-top: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
}

button {
    margin: 5px;
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background: #45a049;
}
```

## Implementation Notes

1. **Real-time Updates**: Both 2D and 3D implementations update every 5 seconds to show current drone positions and status.

2. **Status Colors**:
   - Green: Idle drones
   - Red: Drones in route
   - Blue: Charging drones

3. **Coordinate Conversion**:
   - 2D: Uses direct latitude/longitude coordinates
   - 3D: Converts lat/lon to 3D space with appropriate scaling

4. **Performance Considerations**:
   - Use requestAnimationFrame for smooth 3D animations
   - Implement proper cleanup of old routes and markers
   - Consider using Web Workers for heavy computations

5. **Error Handling**:
   - Implement proper error handling for API calls
   - Add loading states and error messages
   - Handle network disconnections gracefully

## Dependencies

- Leaflet.js (for 2D map)
- Three.js (for 3D visualization)
- Fetch API (for API calls)
- Modern browser with WebGL support (for 3D)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

Note: For optimal performance, use the latest version of Chrome or Firefox. 