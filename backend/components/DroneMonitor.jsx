import React, { useEffect, useState } from 'react';
import WebSocketClient from '../static/js/websocket-client';

const DroneMonitor = () => {
    const [droneUpdates, setDroneUpdates] = useState([]);
    const [fleetStatus, setFleetStatus] = useState({});
    const [deliveryUpdates, setDeliveryUpdates] = useState([]);
    const [wsClient, setWsClient] = useState(null);

    useEffect(() => {
        // Initialize WebSocket client
        const client = new WebSocketClient();
        
        client.setCallbacks({
            onDroneUpdate: (data) => {
                setDroneUpdates(prev => [...prev, data].slice(-10)); // Keep last 10 updates
            },
            onFleetStatus: (data) => {
                setFleetStatus(data);
            },
            onDeliveryUpdate: (data) => {
                setDeliveryUpdates(prev => [...prev, data].slice(-10)); // Keep last 10 updates
            }
        });

        client.connect();
        setWsClient(client);

        // Cleanup on unmount
        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, []);

    return (
        <div className="drone-monitor">
            <h2>Real-time Drone Monitor</h2>
            
            <div className="monitor-section">
                <h3>Fleet Status</h3>
                <div className="status-box">
                    <p>Active Drones: {fleetStatus.activeDrones || 0}</p>
                    <p>Total Deliveries: {fleetStatus.totalDeliveries || 0}</p>
                    <p>Fleet Status: {fleetStatus.status || 'Unknown'}</p>
                </div>
            </div>

            <div className="monitor-section">
                <h3>Recent Drone Updates</h3>
                <div className="updates-list">
                    {droneUpdates.map((update, index) => (
                        <div key={index} className="update-item">
                            <p>Drone ID: {update.droneId}</p>
                            <p>Position: {update.latitude}, {update.longitude}</p>
                            <p>Altitude: {update.altitude}m</p>
                            <p>Status: {update.status}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="monitor-section">
                <h3>Recent Delivery Updates</h3>
                <div className="updates-list">
                    {deliveryUpdates.map((update, index) => (
                        <div key={index} className="update-item">
                            <p>Delivery ID: {update.deliveryId}</p>
                            <p>Status: {update.status}</p>
                            <p>ETA: {update.estimatedTime}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .drone-monitor {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .monitor-section {
                    margin-bottom: 30px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 20px;
                }

                .status-box {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .updates-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                }

                .update-item {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                h2 {
                    color: #333;
                    margin-bottom: 30px;
                }

                h3 {
                    color: #444;
                    margin-bottom: 15px;
                }

                p {
                    margin: 5px 0;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default DroneMonitor; 