from fastapi import APIRouter, HTTPException
from typing import List, Dict
from services.fleet_manager import FleetManager
import logging

router = APIRouter()
fleet_manager = FleetManager()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/start")
async def start_fleet(drone_configs: List[Dict]):
    """Start the fleet with the given drone configurations"""
    try:
        logger.info("Received fleet start request with configurations: %s", drone_configs)
        
        if not drone_configs:
            logger.error("No drone configurations provided")
            raise HTTPException(status_code=400, detail="No drone configurations provided")
            
        # Validate drone configurations
        for config in drone_configs:
            if not isinstance(config, dict):
                logger.error("Invalid configuration format: %s", config)
                raise HTTPException(status_code=400, detail="Invalid configuration format")
                
            required_fields = ["drone_id", "start", "end"]
            missing_fields = [field for field in required_fields if field not in config]
            if missing_fields:
                logger.error("Missing required fields in configuration: %s", missing_fields)
                raise HTTPException(status_code=400, detail=f"Missing required fields: {missing_fields}")
                
        # Start the fleet
        result = await fleet_manager.start_fleet(drone_configs)
        
        if "error" in result:
            logger.error("Failed to start fleet: %s", result["error"])
            raise HTTPException(status_code=400, detail=result["error"])
            
        logger.info("Successfully started fleet")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error starting fleet: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 