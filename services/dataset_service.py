import pandas as pd
from typing import Dict, List, Any
from dataclasses import dataclass
import os

@dataclass
class DeliveryPoint:
    id: str
    latitude: float
    longitude: float
    altitude: float
    state: str
    battery_percent: float
    service_time: float
    zone: str
    surveillance_duration: float
    geofence_sw: str
    geofence_ne: str

class DatasetService:
    def __init__(self):
        self.dataset_path = os.path.join("dataset", "small", "Delivery_Drones_Small_Dataset.xlsx")
        self.delivery_points: List[DeliveryPoint] = []
        self.load_dataset()

    def load_dataset(self):
        """Load the delivery drone dataset from Excel file"""
        try:
            df = pd.read_excel(self.dataset_path)
            
            # Print column names to help debug
            print("Available columns:", df.columns.tolist())
            
            # Convert DataFrame to list of DeliveryPoint objects
            self.delivery_points = [
                DeliveryPoint(
                    id=str(row['Drone_ID']),
                    latitude=float(row['X_Coordinate']),
                    longitude=float(row['Y_Coordinate']),
                    altitude=float(row['Z_Altitude']),
                    state=str(row['State']),
                    battery_percent=float(row['Battery (%)']),
                    service_time=float(row['Service Time (min)']),
                    zone=str(row['Zone']),
                    surveillance_duration=float(row['Surveillance Duration (min)']),
                    geofence_sw=str(row['Geofence_SW']),
                    geofence_ne=str(row['Geofence_NE'])
                )
                for _, row in df.iterrows()
            ]
            
            print(f"Successfully loaded {len(self.delivery_points)} delivery points")
            
        except Exception as e:
            print(f"Error loading dataset: {str(e)}")
            raise

    def get_delivery_points(self) -> List[Dict[str, Any]]:
        """Get all delivery points as dictionaries"""
        return [
            {
                "id": point.id,
                "latitude": point.latitude,
                "longitude": point.longitude,
                "altitude": point.altitude,
                "state": point.state,
                "battery_percent": point.battery_percent,
                "service_time": point.service_time,
                "zone": point.zone,
                "surveillance_duration": point.surveillance_duration,
                "geofence_sw": point.geofence_sw,
                "geofence_ne": point.geofence_ne
            }
            for point in self.delivery_points
        ]

    def get_delivery_point_by_id(self, point_id: str) -> Dict[str, Any]:
        """Get a specific delivery point by ID"""
        for point in self.delivery_points:
            if point.id == point_id:
                return {
                    "id": point.id,
                    "latitude": point.latitude,
                    "longitude": point.longitude,
                    "altitude": point.altitude,
                    "state": point.state,
                    "battery_percent": point.battery_percent,
                    "service_time": point.service_time,
                    "zone": point.zone,
                    "surveillance_duration": point.surveillance_duration,
                    "geofence_sw": point.geofence_sw,
                    "geofence_ne": point.geofence_ne
                }
        raise ValueError(f"Delivery point with ID {point_id} not found")

    def get_points_in_region(self, min_lat: float, max_lat: float, min_lon: float, max_lon: float) -> List[Dict[str, Any]]:
        """Get delivery points within a specific geographical region"""
        return [
            {
                "id": point.id,
                "latitude": point.latitude,
                "longitude": point.longitude,
                "altitude": point.altitude,
                "state": point.state,
                "battery_percent": point.battery_percent,
                "service_time": point.service_time,
                "zone": point.zone,
                "surveillance_duration": point.surveillance_duration,
                "geofence_sw": point.geofence_sw,
                "geofence_ne": point.geofence_ne
            }
            for point in self.delivery_points
            if min_lat <= point.latitude <= max_lat and min_lon <= point.longitude <= max_lon
        ] 