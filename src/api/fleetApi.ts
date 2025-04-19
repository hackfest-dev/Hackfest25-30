class FleetApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://192.168.42.79:8000') {
        this.baseUrl = baseUrl;
    }

    async startFleet(): Promise<any> {
        return this.sendRequest('/api/fleet/start', 'POST');
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

    private async sendRequest(endpoint: string, method: string, body: any = null): Promise<any> {
        try {
            const response = await fetch(this.baseUrl + endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body ? JSON.stringify(body) : null
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error in ${method} ${endpoint}:`, error);
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(`Unknown error occurred: ${error}`);
            }
        }
    }
}

export default FleetApiClient; 