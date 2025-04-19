class FleetApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://192.168.42.79:8000') {
        this.baseUrl = baseUrl;
    }

    async startFleet(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/fleet/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (response.status === 400) {
                    console.error('Bad Request details:', errorData);
                    throw new Error(`Failed to start fleet: ${errorData?.detail || 'Invalid request'}`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in startFleet:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to start fleet: ${error.message}`);
            }
            throw new Error('Failed to start fleet: Unknown error');
        }
    }

    async pauseFleet(): Promise<any> {
        return this.sendRequest('/api/fleet/pause', 'POST');
    }

    async resumeFleet(): Promise<any> {
        return this.sendRequest('/api/fleet/resume', 'POST');
    }

    async resetFleet(): Promise<any> {
        return this.sendRequest('/api/fleet/reset', 'POST');
    }

    async getFleetStatus(): Promise<any> {
        return this.sendRequest('/api/fleet/status', 'GET');
    }

    async getStatisticsHistory(): Promise<any> {
        return this.sendRequest('/api/fleet/statistics/history', 'GET');
    }

    async getCurrentStatistics(): Promise<any> {
        return this.sendRequest('/api/fleet/statistics/current', 'GET');
    }

    private async sendRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || `HTTP error! status: ${response.status}`;
                console.error(`Error in ${method} ${endpoint}:`, errorMessage);
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error in ${method} ${endpoint}:`, error.message);
                throw error;
            } else {
                console.error(`Unknown error in ${method} ${endpoint}:`, error);
                throw new Error('An unknown error occurred');
            }
        }
    }
}

export default FleetApiClient; 