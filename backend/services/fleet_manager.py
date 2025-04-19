from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import numpy as np
from datetime import datetime, UTC, timedelta
import random
import heapq
from concurrent.futures import ThreadPoolExecutor
from backend.services.routing_service import RoutingService, Point
import asyncio
import logging
from backend.websocket_endpoints import manager as ws_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Drone:
    id: str
    current_location: Point
    status: str  # 'idle', 'en_route', 'charging'
    battery_level: float
    current_delivery: Optional[str] = None
    completed_deliveries: int = 0
    total_distance: float = 0.0
    total_flight_time: float = 0.0
    total_waiting_time: float = 0.0  # Add waiting time tracking
    last_update: datetime = datetime.now(UTC)
    route_history: List[Dict[str, Any]] = None
    last_status_change: datetime = datetime.now(UTC)  # Track status changes

    def __post_init__(self):
        self.route_history = []

@dataclass
class Delivery:
    id: str
    pickup: Point
    dropoff: Point
    status: str  # 'pending', 'assigned', 'in_progress', 'completed'
    assigned_drone: Optional[str] = None
    priority: int = 1
    weight: float = 1.0
    creation_time: datetime = datetime.now(UTC)
    completion_time: Optional[datetime] = None
    estimated_time: Optional[float] = None

class FleetManager:
    def __init__(self, num_drones: int = 100, num_deliveries: int = 1000):
        self.routing_service = RoutingService()
        self.active_drones = {}  # Initialize active_drones dictionary
        self.drones: Dict[str, Drone] = {}
        self.deliveries: Dict[str, Delivery] = {}
        self.delivery_queue: List[str] = []  # Priority queue of delivery IDs
        self.executor = ThreadPoolExecutor(max_workers=50)
        self.is_running = False
        self.start_time = None
        self.pause_time = None
        self.total_pause_duration = timedelta(0)
        self.num_drones = num_drones  # Store the number of drones
        self.num_deliveries = num_deliveries
        self.time_scale = 1.0  # Time scale factor (1.0 = real time)
        self.statistics_history: List[Dict[str, Any]] = []  # Store historical statistics
        
        # Initialize drones
        self._initialize_drones(num_drones)
        # Generate random deliveries will be handled in start() method

    def _initialize_drones(self, num_drones: int):
        """Initialize the drone fleet"""
        base_location = self.routing_service.base_location
        for i in range(num_drones):
            drone_id = f"drone_{i}"
            self.drones[drone_id] = Drone(
                id=drone_id,
                current_location=base_location,  # All drones start at base
                status='idle',
                battery_level=100.0
            )

    async def _generate_deliveries(self, num_deliveries: int):
        """Generate random deliveries within service area"""
        logger.info(f"Generating {num_deliveries} deliveries...")
        try:
            for i in range(num_deliveries):
                delivery_id = f"delivery_{i}"
                
                # Generate random pickup and dropoff points with retries
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        # Generate random pickup and dropoff points
                        pickup = self.routing_service._generate_random_point()
                        dropoff = self.routing_service._generate_random_point()
                        
                        # Validate points are within service area
                        if not self.routing_service.is_point_in_service_area(pickup) or \
                           not self.routing_service.is_point_in_service_area(dropoff):
                            continue
                        
                        # Try to calculate initial route for time estimation
                        try:
                            route = await self.routing_service.calculate_route(
                                {"lat": pickup.lat, "lon": pickup.lon},
                                {"lat": dropoff.lat, "lon": dropoff.lon},
                                f"drone_{i % self.num_drones}"  # Assign to a drone in round-robin fashion
                            )
                            estimated_time = route["total_time"] if route else None
                        except Exception as e:
                            logger.warning(f"Failed to calculate route for delivery {delivery_id}: {str(e)}")
                            estimated_time = None
                        
                        # Create the delivery
                        delivery = Delivery(
                            id=delivery_id,
                            pickup=pickup,
                            dropoff=dropoff,
                            status='pending',
                            priority=random.randint(1, 3),  # Random priority between 1 and 3
                            weight=random.uniform(0.1, 5.0),  # Random weight between 0.1 and 5.0 kg
                            estimated_time=estimated_time
                        )
                        
                        self.deliveries[delivery_id] = delivery
                        # Add to priority queue with priority and weight consideration
                        heapq.heappush(self.delivery_queue, (delivery.priority, delivery.weight, delivery_id))
                        
                        # Log success and break retry loop
                        logger.debug(f"Generated delivery {delivery_id}")
                        break
                        
                    except Exception as e:
                        logger.warning(f"Failed attempt {attempt + 1} to generate delivery {delivery_id}: {str(e)}")
                        if attempt == max_retries - 1:
                            raise ValueError(f"Failed to generate delivery after {max_retries} attempts")
                
            logger.info(f"Successfully generated {len(self.deliveries)} deliveries")
            return True
            
        except Exception as e:
            logger.error(f"Failed to generate deliveries: {str(e)}")
            raise ValueError(f"Failed to generate deliveries: {str(e)}")

    async def _find_nearest_delivery(self, drone: Drone) -> Optional[str]:
        """Find the nearest unassigned delivery for a drone"""
        min_distance = float('inf')
        nearest_delivery_id = None
        
        # Check all pending deliveries
        pending_deliveries = [d for d in self.deliveries.values() if d.status == 'pending']
        for delivery in pending_deliveries:
            # Calculate distance from drone to pickup
            distance = self.routing_service.calculate_distance(
                drone.current_location,
                delivery.pickup
            )
            # Consider battery level and delivery weight
            if (distance < min_distance and 
                drone.battery_level > 30 and  # Ensure enough battery
                delivery.weight <= 5.0):  # Check weight limit
                min_distance = distance
                nearest_delivery_id = delivery.id
        
        return nearest_delivery_id

    async def _assign_delivery(self, drone_id: str, delivery_id: str):
        """Assign a delivery to a drone"""
        try:
            drone = self.drones[drone_id]
            delivery = self.deliveries[delivery_id]
            
            # Update statuses
            drone.status = 'en_route'
            drone.current_delivery = delivery_id
            delivery.status = 'assigned'
            delivery.assigned_drone = drone_id
            
            # Remove from delivery queue if present
            if delivery_id in self.delivery_queue:
                self.delivery_queue.remove(delivery_id)
            
            # Broadcast updates
            await ws_manager.broadcast_drone_positions([{
                "drone_id": drone_id,
                "status": drone.status,
                "position": {
                    "lat": drone.current_location.lat,
                    "lon": drone.current_location.lon,
                    "altitude": drone.current_location.altitude
                }
            }])
            
            await ws_manager.broadcast_delivery_update({
                "delivery_id": delivery_id,
                "status": delivery.status,
                "assigned_drone": drone_id
            })
            
            logger.info(f"Assigned delivery {delivery_id} to drone {drone_id}")
            
        except Exception as e:
            logger.error(f"Error assigning delivery {delivery_id} to drone {drone_id}: {str(e)}")
            # Reset statuses on error
            drone.status = 'idle'
            drone.current_delivery = None
            delivery.status = 'pending'
            delivery.assigned_drone = None
            raise

    async def _complete_delivery(self, drone_id: str):
        """Mark a delivery as completed and update drone status"""
        drone = self.drones[drone_id]
        delivery = self.deliveries[drone.current_delivery]
        
        # Update delivery status
        delivery.status = 'completed'
        delivery.completion_time = datetime.now(UTC)
        
        # Update drone status
        drone.status = 'idle'
        drone.current_location = delivery.dropoff
        drone.current_delivery = None
        drone.completed_deliveries += 1
        
        # Broadcast updates
        await ws_manager.broadcast_drone_positions([{
            "drone_id": drone_id,
            "status": drone.status,
            "position": {
                "lat": drone.current_location.lat,
                "lon": drone.current_location.lon,
                "altitude": drone.current_location.altitude
            }
        }])
        
        await ws_manager.broadcast_delivery_update({
            "delivery_id": delivery.id,
            "status": delivery.status,
            "completion_time": delivery.completion_time.isoformat()
        })

    async def process_deliveries(self):
        """Main loop to process all deliveries"""
        try:
            self.is_running = True
            self.start_time = datetime.now(UTC)
            
            # Broadcast initial fleet status
            await ws_manager.broadcast_fleet_status(self.get_status())
            
            while self.is_running:
                # Get idle drones
                idle_drones = [d for d in self.drones.values() if d.status == 'idle']
                
                # Update waiting times for idle drones
                now = datetime.now(UTC)
                for drone in idle_drones:
                    time_since_last_update = (now - drone.last_status_change).total_seconds()
                    drone.total_waiting_time += time_since_last_update
                    drone.last_status_change = now
                
                # Process each idle drone
                for drone in idle_drones:
                    # Find nearest delivery
                    nearest_delivery_id = await self._find_nearest_delivery(drone)
                    if nearest_delivery_id:
                        # Assign and process the delivery
                        await self._process_drone_delivery(drone.id, nearest_delivery_id)
                
                # Record statistics and broadcast status
                if len(self.statistics_history) == 0 or \
                   (now - self.statistics_history[-1]["timestamp"]).total_seconds() >= 60:
                    self._record_statistics()
                    await ws_manager.broadcast_fleet_status(self.get_status())
                
                # Check if there are any pending deliveries or active drones
                if not self.delivery_queue and not any(d.status != 'idle' for d in self.drones.values()):
                    break
                
                # Small delay to prevent CPU overload
                await asyncio.sleep(self._get_scaled_sleep(0.1))
                
        except Exception as e:
            logger.error(f"Error in process_deliveries: {str(e)}")
            self.is_running = False
            # Broadcast error status
            await ws_manager.broadcast_fleet_status({
                "error": str(e),
                "is_running": False
            })

    def _record_statistics(self):
        """Record current statistics"""
        now = datetime.now(UTC)
        stats = {
            "timestamp": now,
            "total_drones": len(self.drones),
            "active_drones": len([d for d in self.drones.values() if d.status != 'idle']),
            "idle_drones": len([d for d in self.drones.values() if d.status == 'idle']),
            "charging_drones": len([d for d in self.drones.values() if d.status == 'charging']),
            "total_deliveries": len(self.deliveries),
            "completed_deliveries": len([d for d in self.deliveries.values() if d.status == 'completed']),
            "avg_waiting_time": sum(d.total_waiting_time for d in self.drones.values()) / len(self.drones),
            "avg_battery_level": sum(d.battery_level for d in self.drones.values()) / len(self.drones),
            "total_distance": sum(d.total_distance for d in self.drones.values()),
            "total_flight_time": sum(d.total_flight_time for d in self.drones.values()),
            "total_waiting_time": sum(d.total_waiting_time for d in self.drones.values())
        }
        self.statistics_history.append(stats)

    def get_statistics_history(self) -> List[Dict[str, Any]]:
        """Get the complete statistics history"""
        return self.statistics_history

    def get_current_statistics(self) -> Dict[str, Any]:
        """Get the most recent statistics"""
        if not self.statistics_history:
            return {}
        return self.statistics_history[-1]

    async def _process_drone_delivery(self, drone_id: str, delivery_id: str):
        """Process a single delivery for a drone"""
        try:
            drone = self.drones[drone_id]
            delivery = self.deliveries[delivery_id]
            
            # Update status and waiting time
            drone.status = 'en_route'
            drone.last_status_change = datetime.now(UTC)
            
            print(f"Starting delivery {delivery_id} for drone {drone_id}")
            print(f"Current waiting time: {drone.total_waiting_time:.2f} seconds")
            
            # Assign the delivery
            await self._assign_delivery(drone_id, delivery_id)
            
            # First, calculate route from base to pickup
            route = await self.routing_service.calculate_route(
                start={"lat": drone.current_location.lat, "lon": drone.current_location.lon},
                end={"lat": delivery.pickup.lat, "lon": delivery.pickup.lon},
                drone_id=drone_id
            )
            
            # Move drone from base to pickup
            for segment in route["segments"]:
                move_time = segment["time"]
                await asyncio.sleep(self._get_scaled_sleep(move_time))
                
                drone.battery_level -= segment["energy_consumption"]
                drone.current_location = Point(
                    lat=segment["end"]["lat"],
                    lon=segment["end"]["lon"],
                    altitude=segment["end"]["altitude"]
                )
                drone.total_distance += segment["distance"]
                drone.total_flight_time += move_time
                
                print(f"Drone {drone_id} moved to {drone.current_location}")
            
            # Simulate pickup time
            await asyncio.sleep(self._get_scaled_sleep(2))
            
            # Calculate route from pickup to dropoff
            route = await self.routing_service.calculate_route(
                start={"lat": delivery.pickup.lat, "lon": delivery.pickup.lon},
                end={"lat": delivery.dropoff.lat, "lon": delivery.dropoff.lon},
                drone_id=drone_id
            )
            
            # Move drone from pickup to dropoff
            for segment in route["segments"]:
                move_time = segment["time"]
                await asyncio.sleep(self._get_scaled_sleep(move_time))
                
                drone.battery_level -= segment["energy_consumption"]
                drone.current_location = Point(
                    lat=segment["end"]["lat"],
                    lon=segment["end"]["lon"],
                    altitude=segment["end"]["altitude"]
                )
                drone.total_distance += segment["distance"]
                drone.total_flight_time += move_time
                
                print(f"Drone {drone_id} moved to {drone.current_location}")
            
            # Calculate route back to base
            route = await self.routing_service.calculate_route(
                start={"lat": delivery.dropoff.lat, "lon": delivery.dropoff.lon},
                end={"lat": self.routing_service.base_location.lat, "lon": self.routing_service.base_location.lon},
                drone_id=drone_id
            )
            
            # Move drone back to base
            for segment in route["segments"]:
                move_time = segment["time"]
                await asyncio.sleep(self._get_scaled_sleep(move_time))
                
                drone.battery_level -= segment["energy_consumption"]
                drone.current_location = Point(
                    lat=segment["end"]["lat"],
                    lon=segment["end"]["lon"],
                    altitude=segment["end"]["altitude"]
                )
                drone.total_distance += segment["distance"]
                drone.total_flight_time += move_time
                
                print(f"Drone {drone_id} moved to {drone.current_location}")
            
            # Complete the delivery
            await self._complete_delivery(drone_id)
            
            # If battery low, charge the drone
            if drone.battery_level < 20:
                await self._charge_drone(drone_id)
                
        except Exception as e:
            print(f"Error processing delivery for drone {drone_id}: {str(e)}")
            # Reset drone status on error
            drone = self.drones[drone_id]
            drone.status = 'idle'
            drone.current_delivery = None

    def pause(self):
        """Pause the fleet operations"""
        if self.is_running:
            self.is_running = False
            self.pause_time = datetime.now(UTC)

    def resume(self):
        """Resume the fleet operations"""
        if not self.is_running and self.pause_time:
            self.is_running = True
            self.total_pause_duration += datetime.now(UTC) - self.pause_time
            self.pause_time = None

    async def reset(self):
        """Reset the fleet to initial state"""
        self.is_running = False
        self.start_time = None
        self.pause_time = None
        self.total_pause_duration = timedelta(0)
        
        # Reset drones
        for drone in self.drones.values():
            drone.status = 'idle'
            drone.battery_level = 100.0
            drone.current_delivery = None
            drone.completed_deliveries = 0
            drone.total_distance = 0.0
            drone.total_flight_time = 0.0
            drone.route_history = []
            drone.current_location = self.routing_service.base_location
        
        # Reset deliveries
        self.deliveries.clear()
        self.delivery_queue = []
        await self._generate_deliveries(len(self.drones) * 10)  # 10 deliveries per drone

    def get_status(self) -> Dict[str, Any]:
        """Get current status of all drones and deliveries"""
        now = datetime.now(UTC)
        total_runtime = (now - self.start_time - self.total_pause_duration).total_seconds() / 60 if self.start_time else 0
        
        # Calculate statistics
        completed_deliveries = [d for d in self.deliveries.values() if d.status == 'completed']
        active_drones = [d for d in self.drones.values() if d.status != 'idle']
        charging_drones = [d for d in self.drones.values() if d.status == 'charging']
        
        # Calculate average delivery time
        avg_delivery_time = None
        if completed_deliveries:
            total_time = sum((d.completion_time - d.creation_time).total_seconds() / 60 
                           for d in completed_deliveries)
            avg_delivery_time = total_time / len(completed_deliveries)
        
        # Calculate average battery usage
        avg_battery_usage = None
        if self.drones:
            total_battery_used = sum(100 - d.battery_level for d in self.drones.values())
            avg_battery_usage = total_battery_used / len(self.drones)
        
        # Calculate total distance
        total_distance = sum(d.total_distance for d in self.drones.values())
        
        return {
            "drones": {
                drone_id: {
                    "status": drone.status,
                    "battery_level": drone.battery_level,
                    "completed_deliveries": drone.completed_deliveries,
                    "location": {
                        "lat": drone.current_location.lat,
                        "lon": drone.current_location.lon,
                        "altitude": drone.current_location.altitude
                    },
                    "current_delivery": drone.current_delivery,
                    "total_distance": drone.total_distance,
                    "total_flight_time": drone.total_flight_time
                }
                for drone_id, drone in self.drones.items()
            },
            "deliveries": {
                delivery_id: {
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
                    }
                }
                for delivery_id, delivery in self.deliveries.items()
            },
            "stats": {
                "total_drones": len(self.drones),
                "total_deliveries": len(self.deliveries),
                "completed_deliveries": len(completed_deliveries),
                "active_drones": len(active_drones),
                "charging_drones": len(charging_drones),
                "avg_delivery_time": avg_delivery_time,
                "avg_battery_usage": avg_battery_usage,
                "total_distance": total_distance,
                "total_runtime": total_runtime,
                "is_running": self.is_running
            }
        }

    async def start(self):
        """Start the fleet manager and initialize deliveries"""
        try:
            logger.info("Starting fleet manager...")
            
            # Check if already running
            if self.is_running:
                logger.warning("Fleet is already running")
                raise ValueError("Fleet is already running")
            
            # Clear existing deliveries and generate new ones
            logger.info("Clearing existing deliveries...")
            self.deliveries.clear()
            self.delivery_queue = []
            
            # Initialize drones if not already done
            if not self.drones:
                logger.info("Initializing drones...")
                self._initialize_drones(self.num_drones)
            
            # Generate deliveries
            logger.info(f"Generating {self.num_deliveries} deliveries...")
            await self._generate_deliveries(self.num_deliveries)
            
            # Reset drones to initial state
            logger.info("Resetting drones to initial state...")
            for drone in self.drones.values():
                drone.status = 'idle'
                drone.battery_level = 100.0
                drone.current_delivery = None
                drone.completed_deliveries = 0
                drone.total_distance = 0.0
                drone.total_flight_time = 0.0
                drone.route_history = []
                drone.current_location = self.routing_service.base_location
            
            self.start_time = datetime.now(UTC)
            self.is_running = True
            
            # Broadcast initial status
            await ws_manager.broadcast_fleet_status(self.get_status())
            
            logger.info("Fleet manager started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error starting fleet manager: {str(e)}")
            self.is_running = False
            # Broadcast error status
            await ws_manager.broadcast_fleet_status({
                "error": str(e),
                "is_running": False
            })
            raise

    def set_time_scale(self, scale: float):
        """Set the time scale factor for simulation speed"""
        if scale <= 0:
            raise ValueError("Time scale must be positive")
        self.time_scale = scale

    def _get_scaled_sleep(self, seconds: float) -> float:
        """Get the scaled sleep duration based on time scale"""
        return seconds / self.time_scale 

    async def start_fleet(self, drone_configs: List[Dict]) -> Dict:
        """Start the fleet with the given drone configurations"""
        try:
            print("Starting fleet with configurations:", drone_configs)
            
            if not drone_configs:
                print("No drone configurations provided")
                return {"error": "No drone configurations provided"}
                
            results = {}
            for config in drone_configs:
                try:
                    drone_id = config.get("drone_id")
                    start = config.get("start")
                    end = config.get("end")
                    
                    if not all([drone_id, start, end]):
                        print(f"Missing required configuration for drone {drone_id}")
                        results[drone_id] = {"error": "Missing required configuration"}
                        continue
                        
                    print(f"Calculating route for drone {drone_id}")
                    route = await self.routing_service.calculate_route(start, end, drone_id)
                    
                    if route is None:
                        print(f"Failed to calculate route for drone {drone_id}")
                        results[drone_id] = {"error": "Failed to calculate route"}
                        continue
                        
                    print(f"Successfully calculated route for drone {drone_id}")
                    results[drone_id] = {"route": route}
                    self.active_drones[drone_id] = route
                    
                except Exception as e:
                    print(f"Error processing drone {drone_id}: {str(e)}")
                    import traceback
                    print(traceback.format_exc())
                    results[drone_id] = {"error": str(e)}
                    
            return {"results": results}
            
        except Exception as e:
            print(f"Error starting fleet: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return {"error": str(e)} 