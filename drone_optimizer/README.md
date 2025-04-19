# Drone Route Optimizer

A high-performance Rust-based drone route optimizer using Random Forest for route optimization.

## Features

- Parallel route optimization using Rust's Rayon
- Random Forest-based route optimization
- Altitude-aware route calculations
- Energy and time optimization
- Python interface for easy integration

## Installation

1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install Python dependencies:
```bash
pip install maturin
```

3. Build and install the package:
```bash
cd drone_optimizer
maturin develop
```

## Usage

```python
from drone_optimizer.wrapper import RouteOptimizer

# Create optimizer
optimizer = RouteOptimizer()

# Train with historical data
training_data = [
    {
        "segments": [
            {
                "start": {"lat": 12.9716, "lon": 77.5946, "altitude": 0},
                "end": {"lat": 12.9784, "lon": 77.6408, "altitude": 100},
                "distance": 5.2,
                "time": 0.1,
                "energy": 0.52
            }
        ],
        "total_distance": 5.2,
        "total_time": 0.1,
        "total_energy": 0.52
    }
]
optimizer.train(training_data)

# Optimize a single route
route = {
    "segments": [
        {
            "start": {"lat": 12.9716, "lon": 77.5946, "altitude": 0},
            "end": {"lat": 12.9784, "lon": 77.6408, "altitude": 100},
            "distance": 5.2,
            "time": 0.1,
            "energy": 0.52
        }
    ],
    "total_distance": 5.2,
    "total_time": 0.1,
    "total_energy": 0.52
}
optimized_route = optimizer.optimize_route(route)

# Optimize multiple routes in parallel
routes = [route, route]  # List of routes
optimized_routes = optimizer.optimize_routes(routes)
```

## Performance

The optimizer uses several techniques to achieve high performance:

1. **Rust Implementation**: Core optimization logic is written in Rust for maximum performance
2. **Parallel Processing**: Uses Rayon for parallel route optimization
3. **Random Forest**: Efficient machine learning model for route optimization
4. **Memory Efficiency**: Optimized data structures and minimal copying

## Features

- Altitude optimization for better energy efficiency
- Time-based route optimization
- Energy consumption prediction
- Parallel processing of multiple routes
- Python interface for easy integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 