type WebSocketCallback = (data: any) => void;

class FleetWebSocketClient {
    private baseUrl: string;
    private droneUpdatesSocket: WebSocket | null = null;
    private fleetStatusSocket: WebSocket | null = null;
    private deliveryUpdatesSocket: WebSocket | null = null;
    private callbacks: any = {};
    private reconnectAttempts: { [key: string]: number } = {
        'drone-updates': 0,
        'fleet-status': 0,
        'delivery-updates': 0
    };
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 2000;

    constructor(baseUrl: string = 'http://192.168.42.79:8000') {
        this.baseUrl = baseUrl.replace('http', 'ws');
    }

    setCallbacks(callbacks: any) {
        this.callbacks = callbacks;
    }

    async connect() {
        await this.connectDroneUpdates();
        await this.connectFleetStatus();
        await this.connectDeliveryUpdates();
    }

    private async connectDroneUpdates() {
        if (this.droneUpdatesSocket?.readyState === WebSocket.OPEN) return;

        try {
            this.droneUpdatesSocket = new WebSocket(`${this.baseUrl}/ws/drone-updates`);
            this.setupSocketHandlers(this.droneUpdatesSocket, 'drone-updates', this.callbacks.onDroneUpdate);
        } catch (error) {
            console.error('Failed to connect to drone updates WebSocket:', error);
            this.scheduleReconnect('drone-updates');
        }
    }

    private setupSocketHandlers(socket: WebSocket, type: string, callback: (data: any) => void) {
        socket.onopen = () => {
            console.log(`WebSocket connected for /ws/${type}`);
            this.reconnectAttempts[type] = 0;
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                callback(data);
            } catch (error) {
                console.error(`Error processing ${type} message:`, error);
            }
        };

        socket.onclose = () => {
            console.log(`WebSocket closed for /ws/${type}`);
            this.scheduleReconnect(type);
        };

        socket.onerror = (error) => {
            console.error(`WebSocket error for /ws/${type}:`, error);
        };
    }

    private scheduleReconnect(type: string) {
        if (this.reconnectAttempts[type] < this.maxReconnectAttempts) {
            this.reconnectAttempts[type]++;
            const delay = this.reconnectTimeout * this.reconnectAttempts[type];
            console.log(`Retrying connection to /ws/${type} (attempt ${this.reconnectAttempts[type]}) in ${delay}ms`);
            
            setTimeout(() => {
                switch (type) {
                    case 'drone-updates':
                        this.connectDroneUpdates();
                        break;
                    case 'fleet-status':
                        this.connectFleetStatus();
                        break;
                    case 'delivery-updates':
                        this.connectDeliveryUpdates();
                        break;
                }
            }, delay);
        } else {
            console.error(`Max reconnection attempts reached for /ws/${type}`);
        }
    }

    private async connectFleetStatus() {
        if (this.fleetStatusSocket?.readyState === WebSocket.OPEN) return;

        try {
            this.fleetStatusSocket = new WebSocket(`${this.baseUrl}/ws/fleet-status`);
            this.setupSocketHandlers(this.fleetStatusSocket, 'fleet-status', this.callbacks.onFleetStatus);
        } catch (error) {
            console.error('Failed to connect to fleet status WebSocket:', error);
            this.scheduleReconnect('fleet-status');
        }
    }

    private async connectDeliveryUpdates() {
        if (this.deliveryUpdatesSocket?.readyState === WebSocket.OPEN) return;

        try {
            this.deliveryUpdatesSocket = new WebSocket(`${this.baseUrl}/ws/delivery-updates`);
            this.setupSocketHandlers(this.deliveryUpdatesSocket, 'delivery-updates', this.callbacks.onDeliveryUpdate);
        } catch (error) {
            console.error('Failed to connect to delivery updates WebSocket:', error);
            this.scheduleReconnect('delivery-updates');
        }
    }

    disconnect() {
        // Close each WebSocket connection if it exists
        if (this.droneUpdatesSocket) {
            this.droneUpdatesSocket.close();
            this.droneUpdatesSocket = null;
        }
        if (this.fleetStatusSocket) {
            this.fleetStatusSocket.close();
            this.fleetStatusSocket = null;
        }
        if (this.deliveryUpdatesSocket) {
            this.deliveryUpdatesSocket.close();
            this.deliveryUpdatesSocket = null;
        }
        
        // Reset reconnection attempts
        this.reconnectAttempts = {
            'drone-updates': 0,
            'fleet-status': 0,
            'delivery-updates': 0
        };
    }
}

export default FleetWebSocketClient; 