class WebSocketClient {
    constructor() {
        this.droneSocket = null;
        this.fleetSocket = null;
        this.deliverySocket = null;
        this.callbacks = {
            onDroneUpdate: null,
            onFleetStatus: null,
            onDeliveryUpdate: null
        };
    }

    connect() {
        const wsBase = `ws://${window.location.host}`;
        
        // Connect to drone updates
        this.droneSocket = new WebSocket(`${wsBase}/ws/drone-updates`);
        this.droneSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.callbacks.onDroneUpdate) {
                this.callbacks.onDroneUpdate(data);
            }
        };

        // Connect to fleet status
        this.fleetSocket = new WebSocket(`${wsBase}/ws/fleet-status`);
        this.fleetSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.callbacks.onFleetStatus) {
                this.callbacks.onFleetStatus(data);
            }
        };

        // Connect to delivery updates
        this.deliverySocket = new WebSocket(`${wsBase}/ws/delivery-updates`);
        this.deliverySocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.callbacks.onDeliveryUpdate) {
                this.callbacks.onDeliveryUpdate(data);
            }
        };
    }

    setCallbacks({
        onDroneUpdate = null,
        onFleetStatus = null,
        onDeliveryUpdate = null
    }) {
        this.callbacks = {
            onDroneUpdate,
            onFleetStatus,
            onDeliveryUpdate
        };
    }

    disconnect() {
        if (this.droneSocket) this.droneSocket.close();
        if (this.fleetSocket) this.fleetSocket.close();
        if (this.deliverySocket) this.deliverySocket.close();
    }
}

// Example usage:
/*
const wsClient = new WebSocketClient();
wsClient.setCallbacks({
    onDroneUpdate: (data) => {
        console.log('Drone update received:', data);
        // Update drone markers on the map
    },
    onFleetStatus: (data) => {
        console.log('Fleet status update:', data);
        // Update fleet status display
    },
    onDeliveryUpdate: (data) => {
        console.log('Delivery update:', data);
        // Update delivery status display
    }
});
wsClient.connect();
*/

// Export the WebSocketClient class
export default WebSocketClient; 