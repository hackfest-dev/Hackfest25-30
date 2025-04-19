#!/bin/bash

# Base URL - replace with your server's IP if testing from another machine
BASE_URL="http://localhost:8000"

echo "Testing Drone Fleet Management API Endpoints"
echo "==========================================="

# 1. Start Fleet
echo -e "\n1. Starting Fleet..."
curl -X POST "${BASE_URL}/api/fleet/start" -H "Content-Type: application/json"
echo -e "\n"

# 2. Get Fleet Status
echo -e "\n2. Getting Fleet Status..."
curl "${BASE_URL}/api/fleet/status"
echo -e "\n"

# 3. Pause Fleet
echo -e "\n3. Pausing Fleet..."
curl -X POST "${BASE_URL}/api/fleet/pause" -H "Content-Type: application/json"
echo -e "\n"

# 4. Resume Fleet
echo -e "\n4. Resuming Fleet..."
curl -X POST "${BASE_URL}/api/fleet/resume" -H "Content-Type: application/json"
echo -e "\n"

# 5. Get Current Statistics
echo -e "\n5. Getting Current Statistics..."
curl "${BASE_URL}/api/fleet/statistics/current"
echo -e "\n"

# 6. Get Statistics History
echo -e "\n6. Getting Statistics History..."
curl "${BASE_URL}/api/fleet/statistics/history"
echo -e "\n"

# 7. Get Delivery Points
echo -e "\n7. Getting Delivery Points..."
curl "${BASE_URL}/api/delivery-points"
echo -e "\n"

# 8. Calculate Route (example coordinates for Delhi)
echo -e "\n8. Calculating Route..."
curl -X POST "${BASE_URL}/api/calculate-route" \
     -H "Content-Type: application/json" \
     -d '{
           "pickup": {
             "lat": 28.6139,
             "lon": 77.209
           },
           "drop": {
             "lat": 28.5090,
             "lon": 77.1708
           },
           "drone_id": "drone_1"
         }'
echo -e "\n"

# 9. Get Drone Route History (replace drone_1 with actual drone ID)
echo -e "\n9. Getting Drone Route History..."
curl "${BASE_URL}/api/fleet/drone/drone_1/route-history"
echo -e "\n"

# 10. Reset Fleet
echo -e "\n10. Resetting Fleet..."
curl -X POST "${BASE_URL}/api/fleet/reset" -H "Content-Type: application/json"
echo -e "\n"

echo "All endpoints tested!" 