import pandas as pd
from typing import Dict, List, Any
from dataclasses import dataclass
import os
from pathlib import Path

@dataclass
class DeliveryPoint:
    id: str
    latitude: float
    longitude: float
    demand: float
    priority: int
    time_window_start: int
    time_window_end: int

class DatasetService:
    def __init__(self):
        # Get the absolute path to the project root directory (where backend folder is)
        self.root_dir = Path(__file__).resolve().parents[2]
        self.dataset_path = self.root_dir / "dataset" / "small" / "delivery_points.csv"
        self.delivery_points: List[DeliveryPoint] = []
        self.load_dataset()

    def load_dataset(self):
        """Load the delivery points dataset from CSV file"""
        try:
            print(f"Attempting to load dataset from: {self.dataset_path}")
            if not self.dataset_path.exists():
                raise FileNotFoundError(f"Dataset file not found at: {self.dataset_path}")
            
            df = pd.read_csv(self.dataset_path)
            
            # Print column names to help debug
            print("Available columns:", df.columns.tolist())
            
            # Convert DataFrame to list of DeliveryPoint objects
            self.delivery_points = [
                DeliveryPoint(
                    id=str(row['ID']),
                    latitude=float(row['Latitude']),
                    longitude=float(row['Longitude']),
                    demand=float(row['Demand']),
                    priority=int(row['Priority']),
                    time_window_start=int(row['TimeWindowStart']),
                    time_window_end=int(row['TimeWindowEnd'])
                )
                for _, row in df.iterrows()
            ]
            
            print(f"Successfully loaded {len(self.delivery_points)} delivery points")
            
        except Exception as e:
            print(f"Error loading dataset: {str(e)}")
            # Create the directory structure if it doesn't exist
            os.makedirs(self.dataset_path.parent, exist_ok=True)
            raise

    def get_delivery_points(self) -> List[Dict[str, Any]]:
        """Get all delivery points as dictionaries"""
        return [
            {
                "id": point.id,
                "latitude": point.latitude,
                "longitude": point.longitude,
                "demand": point.demand,
                "priority": point.priority,
                "time_window_start": point.time_window_start,
                "time_window_end": point.time_window_end
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
                    "demand": point.demand,
                    "priority": point.priority,
                    "time_window_start": point.time_window_start,
                    "time_window_end": point.time_window_end
                }
        raise ValueError(f"Delivery point with ID {point_id} not found")

    def get_points_in_region(self, min_lat: float, max_lat: float, min_lon: float, max_lon: float) -> List[Dict[str, Any]]:
        """Get delivery points within a specific geographical region"""
        return [
            {
                "id": point.id,
                "latitude": point.latitude,
                "longitude": point.longitude,
                "demand": point.demand,
                "priority": point.priority,
                "time_window_start": point.time_window_start,
                "time_window_end": point.time_window_end
            }
            for point in self.delivery_points
            if min_lat <= point.latitude <= max_lat and min_lon <= point.longitude <= max_lon
        ] 