type WebSocketCallback = (data: any) => void;

class FleetWebSocketClient {
    private connections: {
        drone: WebSocket | null;
        fleet: WebSocket | null;
        delivery: WebSocket | null;
    };
    private callbacks: {
        onDroneUpdate: WebSocketCallback | null;
        onFleetStatus: WebSocketCallback | null;
        onDeliveryUpdate: WebSocketCallback | null;
    };
    private baseUrl: string;
    private retryCount: number;
    private maxRetries: number;
    private isConnecting: boolean;

    constructor() {
        this.connections = {
            drone: null,
            fleet: null,
            delivery: null
        };
        this.callbacks = {
            onDroneUpdate: null,
            onFleetStatus: null,
            onDeliveryUpdate: null
        };
        this.baseUrl = 'ws://192.168.42.79:8000';
        this.retryCount = 0;
        this.maxRetries = 5;
        this.isConnecting = false;
    }

    connect() {
        if (this.isConnecting) {
            console.log('Already attempting to connect, skipping...');
            return;
        }
        this.isConnecting = true;
        this.connectDroneUpdates();
        this.connectFleetStatus();
        this.connectDeliveryUpdates();
    }

    private connectWithRetry(ws: WebSocket, endpoint: string, onMessage: (data: any) => void) {
        ws.onopen = () => {
            console.log(`Connected to ${endpoint}`);
            this.retryCount = 0;
            this.isConnecting = false;
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error on ${endpoint}:`, error);
            if (!this.isConnecting) {
                this.isConnecting = true;
                this.retryConnection(ws, endpoint, onMessage);
            }
        };

        ws.onclose = () => {
            console.log(`WebSocket closed for ${endpoint}`);
            if (!this.isConnecting) {
                this.isConnecting = true;
                this.retryConnection(ws, endpoint, onMessage);
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error(`Error parsing message from ${endpoint}:`, error);
            }
        };
    }

    private retryConnection(ws: WebSocket, endpoint: string, onMessage: (data: any) => void) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.min(2000 * Math.pow(2, this.retryCount - 1), 30000); // Exponential backoff with max 30s
            console.log(`Retrying connection to ${endpoint} (attempt ${this.retryCount}) in ${delay}ms`);
            
            setTimeout(() => {
                const newWs = new WebSocket(`${this.baseUrl}${endpoint}`);
                this.connectWithRetry(newWs, endpoint, onMessage);
            }, delay);
        } else {
            console.error(`Max retries (${this.maxRetries}) reached for ${endpoint}`);
            this.isConnecting = false;
        }
    }

    private connectDroneUpdates() {
        const ws = new WebSocket(`${this.baseUrl}/ws/drone-updates`);
        this.connectWithRetry(ws, '/ws/drone-updates', (data) => {
            if (this.callbacks.onDroneUpdate) {
                this.callbacks.onDroneUpdate(data);
            }
        });
        this.connections.drone = ws;
    }

    private connectFleetStatus() {
        const ws = new WebSocket(`${this.baseUrl}/ws/fleet-status`);
        this.connectWithRetry(ws, '/ws/fleet-status', (data) => {
            if (this.callbacks.onFleetStatus) {
                this.callbacks.onFleetStatus(data);
            }
        });
        this.connections.fleet = ws;
    }

    private connectDeliveryUpdates() {
        const ws = new WebSocket(`${this.baseUrl}/ws/delivery-updates`);
        this.connectWithRetry(ws, '/ws/delivery-updates', (data) => {
            if (this.callbacks.onDeliveryUpdate) {
                this.callbacks.onDeliveryUpdate(data);
            }
        });
        this.connections.delivery = ws;
    }

    setCallbacks(callbacks: Partial<typeof this.callbacks>) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    disconnect() {
        Object.values(this.connections).forEach(ws => {
            if (ws) {
                ws.onclose = null; // Prevent retry on manual disconnect
                ws.close();
            }
        });
        this.isConnecting = false;
    }
}

export default FleetWebSocketClient; 