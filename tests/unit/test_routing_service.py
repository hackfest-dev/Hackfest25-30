import pytest
from services.routing_service import RoutingService, Point

@pytest.fixture
def routing_service():
    return RoutingService()

def test_calculate_distance(routing_service):
    # Test distance calculation between two points
    point1 = Point(lat=0.0, lon=0.0)
    point2 = Point(lat=1.0, lon=1.0)
    
    distance = routing_service.calculate_distance(point1, point2)
    
    print("\n=== Distance Calculation Test ===")
    print(f"Distance between points: {distance} km")
    
    assert distance > 0
    assert isinstance(distance, float)

def test_calculate_route(routing_service):
    # Test route calculation
    pickup = {'lat': 0.0, 'lon': 0.0}
    drop = {'lat': 1.0, 'lon': 1.0}
    
    route = routing_service.calculate_route(pickup, drop)
    
    print("\n=== Route Calculation Test ===")
    print(route)
    
    assert route is not None
    assert 'segments' in route
    assert len(route['segments']) == 3  # Base->Pickup->Drop->Base
    assert 'total_distance' in route
    assert 'total_time' in route
    assert 'total_energy_consumption' in route
    assert route['total_distance'] > 0
    assert route['total_time'] > 0
    assert route['total_energy_consumption'] > 0

def test_route_optimization(routing_service):
    # Test route optimization
    pickup = {'lat': 0.0, 'lon': 0.0}
    drop = {'lat': 1.0, 'lon': 1.0}
    
    initial_route = routing_service.calculate_route(pickup, drop)
    optimized_route = routing_service.optimize_route(initial_route)
    
    print("\n=== Route Optimization Test ===")
    print("Initial Route:", initial_route)
    print("Optimized Route:", optimized_route)
    
    assert optimized_route is not None
    assert 'segments' in optimized_route
    assert len(optimized_route['segments']) == 3
    assert 'total_distance' in optimized_route
    assert 'total_time' in optimized_route
    assert 'total_energy_consumption' in optimized_route

def test_route_segments(routing_service):
    # Test route segments calculation
    pickup = {'lat': 0.0, 'lon': 0.0}
    drop = {'lat': 1.0, 'lon': 1.0}
    
    route = routing_service.calculate_route(pickup, drop)
    
    print("\n=== Route Segments Test ===")
    print(route['segments'])
    
    # Check each segment
    segments = route['segments']
    assert len(segments) == 3
    
    # Base to Pickup segment
    assert segments[0]['start']['lat'] == 0.0  # Base location
    assert segments[0]['start']['lon'] == 0.0
    assert segments[0]['end']['lat'] == 0.0    # Pickup location
    assert segments[0]['end']['lon'] == 0.0
    
    # Pickup to Drop segment
    assert segments[1]['start']['lat'] == 0.0  # Pickup location
    assert segments[1]['start']['lon'] == 0.0
    assert segments[1]['end']['lat'] == 1.0    # Drop location
    assert segments[1]['end']['lon'] == 1.0
    
    # Drop to Base segment
    assert segments[2]['start']['lat'] == 1.0  # Drop location
    assert segments[2]['start']['lon'] == 1.0
    assert segments[2]['end']['lat'] == 0.0    # Base location
    assert segments[2]['end']['lon'] == 0.0

def test_edge_cases(routing_service):
    # Test with same pickup and drop locations as base
    same_location = {'lat': 0.0, 'lon': 0.0}
    route = routing_service.calculate_route(same_location, same_location)
    assert route['total_distance'] == 0.0  # No distance to travel since at base
    
    # Test with same pickup and drop locations but different from base
    different_location = {'lat': 1.0, 'lon': 1.0}
    route = routing_service.calculate_route(different_location, different_location)
    assert route['total_distance'] > 0  # Should travel to location and back to base
    
    # Test with very far locations
    far_pickup = {'lat': 90.0, 'lon': 180.0}
    far_drop = {'lat': -90.0, 'lon': -180.0}
    route = routing_service.calculate_route(far_pickup, far_drop)
    assert route['total_distance'] > 0
    assert route['total_energy_consumption'] > 0 