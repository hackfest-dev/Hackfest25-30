from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import json
import asyncio
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "drone_updates": [],
            "fleet_status": [],
            "delivery_updates": []
        }

    async def connect(self, websocket: WebSocket, client_type: str):
        try:
            await websocket.accept()
            if client_type in self.active_connections:
                self.active_connections[client_type].append(websocket)
                logger.info(f"New {client_type} connection established")
            else:
                logger.warning(f"Invalid client type: {client_type}")
                await websocket.close(code=1003)  # Unsupported data
        except Exception as e:
            logger.error(f"Error establishing {client_type} connection: {str(e)}")
            try:
                await websocket.close(code=1011)  # Internal error
            except:
                pass

    def disconnect(self, websocket: WebSocket, client_type: str):
        try:
            if client_type in self.active_connections:
                self.active_connections[client_type].remove(websocket)
                logger.info(f"{client_type} connection closed")
        except Exception as e:
            logger.error(f"Error disconnecting {client_type}: {str(e)}")

    async def broadcast_drone_positions(self, drone_positions: List[Dict[str, Any]]):
        """Broadcast drone position updates to all connected clients"""
        try:
            message = {
                "type": "drone_positions",
                "data": drone_positions,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self._broadcast_to_group("drone_updates", message)
        except Exception as e:
            logger.error(f"Error broadcasting drone positions: {str(e)}")

    async def broadcast_fleet_status(self, fleet_status: Dict[str, Any]):
        """Broadcast fleet status updates to all connected clients"""
        try:
            message = {
                "type": "fleet_status",
                "data": fleet_status,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self._broadcast_to_group("fleet_status", message)
        except Exception as e:
            logger.error(f"Error broadcasting fleet status: {str(e)}")

    async def broadcast_delivery_update(self, delivery_update: Dict[str, Any]):
        """Broadcast delivery status updates to all connected clients"""
        try:
            message = {
                "type": "delivery_update",
                "data": delivery_update,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self._broadcast_to_group("delivery_updates", message)
        except Exception as e:
            logger.error(f"Error broadcasting delivery update: {str(e)}")

    async def _broadcast_to_group(self, group: str, message: Dict[str, Any]):
        """Send message to all connected clients in a specific group"""
        if group not in self.active_connections:
            logger.warning(f"Invalid group for broadcast: {group}")
            return
        
        dead_connections = []
        for connection in self.active_connections[group]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to client: {str(e)}")
                dead_connections.append(connection)
        
        # Clean up dead connections
        for dead_connection in dead_connections:
            try:
                self.active_connections[group].remove(dead_connection)
                logger.info(f"Removed dead connection from {group}")
            except Exception as e:
                logger.error(f"Error removing dead connection: {str(e)}")

# Create a global connection manager instance
manager = ConnectionManager()

# WebSocket endpoint handlers
async def handle_drone_updates(websocket: WebSocket):
    logger.info("New drone updates connection request")
    await manager.connect(websocket, "drone_updates")
    try:
        while True:
            # Keep the connection alive and handle incoming messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.debug(f"Received drone update: {message}")
                # Handle any custom messages from clients if needed
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON data from drone updates client")
    except WebSocketDisconnect:
        logger.info("Drone updates client disconnected")
        manager.disconnect(websocket, "drone_updates")
    except Exception as e:
        logger.error(f"Error in drone updates handler: {str(e)}")
        manager.disconnect(websocket, "drone_updates")

async def handle_fleet_status(websocket: WebSocket):
    logger.info("New fleet status connection request")
    await manager.connect(websocket, "fleet_status")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.debug(f"Received fleet status update: {message}")
                # Handle any custom messages from clients if needed
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON data from fleet status client")
    except WebSocketDisconnect:
        logger.info("Fleet status client disconnected")
        manager.disconnect(websocket, "fleet_status")
    except Exception as e:
        logger.error(f"Error in fleet status handler: {str(e)}")
        manager.disconnect(websocket, "fleet_status")

async def handle_delivery_updates(websocket: WebSocket):
    logger.info("New delivery updates connection request")
    await manager.connect(websocket, "delivery_updates")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.debug(f"Received delivery update: {message}")
                # Handle any custom messages from clients if needed
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON data from delivery updates client")
    except WebSocketDisconnect:
        logger.info("Delivery updates client disconnected")
        manager.disconnect(websocket, "delivery_updates")
    except Exception as e:
        logger.error(f"Error in delivery updates handler: {str(e)}")
        manager.disconnect(websocket, "delivery_updates") 