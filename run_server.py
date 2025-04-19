import uvicorn
from main import app

if __name__ == "__main__":
    # Run the server on all network interfaces (0.0.0.0)
    # This will make it accessible from other devices on the same network
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,       # Default port
        reload=True      # Enable auto-reload for development
    ) 