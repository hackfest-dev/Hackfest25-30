import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Button, Box, Typography } from '@mui/material';
import FleetApiClient from '../api/fleetApi';
import FleetWebSocketClient from '../api/fleetWebSocket';

// Add these type definitions at the top of the file
interface FleetStatus {
  status: 'idle' | 'running' | 'paused';
  activeDrones: number;
  totalDrones: number;
  batteryLevel: number;
  energyConsumption: number;
}

interface FleetStatistics {
  totalDeliveries: number;
  averageDeliveryTime: number;
  successRate: number;
  batteryEfficiency: number;
}

interface DroneDetails {
  id: string;
  battery: number;
  status: string;
  position: THREE.Vector3;
  target: THREE.Vector3 | null;
}

interface FleetSettings {
  maxDrones: number;
  batteryCapacity: number;
  chargingRate: number;
  deliveryRadius: number;
  pickupRadius: number;
}

// Drone class to manage individual drones
class Drone {
  mesh: THREE.Group;
  basePosition: THREE.Vector3;
  targetPosition: THREE.Vector3 | null;
  speed: number;
  battery: number;
  maxBattery: number;
  state: 'idle' | 'takingOff' | 'movingToPickup' | 'descendingToPickup' | 'pickingUp' | 'ascendingFromPickup' | 'movingToDelivery' | 'descendingToDelivery' | 'dropping' | 'ascendingFromDelivery' | 'returningToBase';
  currentAltitude: number;
  cruisingAltitude: number;
  landingAltitude: number;
  verticalSpeed: number;
  pickupPoint: THREE.Vector3 | null;
  deliveryPoint: THREE.Vector3 | null;
  hasPackage: boolean;
  statusText: THREE.Mesh;
  bodyMaterial: THREE.MeshStandardMaterial;
  id: number;
  idText: THREE.Mesh;
  energyConsumption: number;
  pickupHeight: number;
  deliveryHeight: number;
  isDescending: boolean;
  isAscending: boolean;

  constructor(position: THREE.Vector3, id: number) {
    this.id = id;
    this.basePosition = position.clone();
    this.targetPosition = null;
    this.pickupPoint = null;
    this.deliveryPoint = null;
    this.speed = 0.5;
    this.battery = 100;
    this.maxBattery = 100;
    this.state = 'idle';
    this.currentAltitude = 5;
    this.cruisingAltitude = 30;
    this.landingAltitude = 5;
    this.verticalSpeed = 0.1;
    this.hasPackage = false;
    this.energyConsumption = 0.1;
    this.pickupHeight = 2;
    this.deliveryHeight = 2;
    this.isDescending = false;
    this.isAscending = false;

    // Create drone mesh
    this.mesh = new THREE.Group();

    // Drone body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 2);
    this.bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const body = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
    this.mesh.add(body);

    // Propellers
    const propellerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const propellerMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    // Create 4 propellers
    const propellerPositions = [
      new THREE.Vector3(1, 0.3, 1),
      new THREE.Vector3(-1, 0.3, 1),
      new THREE.Vector3(1, 0.3, -1),
      new THREE.Vector3(-1, 0.3, -1),
    ];

    propellerPositions.forEach(pos => {
      const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
      propeller.position.copy(pos);
      this.mesh.add(propeller);
    });

    // Create status text
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '12px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText('IDLE', canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const statusGeometry = new THREE.PlaneGeometry(4, 1);
    const statusMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.statusText = new THREE.Mesh(statusGeometry, statusMaterial);
    this.statusText.position.set(0, 2, 0);
    this.mesh.add(this.statusText);

    // Create ID text
    const idCanvas = document.createElement('canvas');
    idCanvas.width = 64;
    idCanvas.height = 32;
    const idContext = idCanvas.getContext('2d');
    if (idContext) {
      idContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
      idContext.fillRect(0, 0, idCanvas.width, idCanvas.height);
      idContext.font = 'bold 16px Arial';
      idContext.fillStyle = 'white';
      idContext.textAlign = 'center';
      idContext.fillText(`Drone ${id}`, idCanvas.width / 2, idCanvas.height / 2);
    }
    const idTexture = new THREE.CanvasTexture(idCanvas);
    const idGeometry = new THREE.PlaneGeometry(3, 1);
    const idMaterial = new THREE.MeshBasicMaterial({
      map: idTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.idText = new THREE.Mesh(idGeometry, idMaterial);
    this.idText.position.set(0, 1, 0);
    this.mesh.add(this.idText);

    // Set initial position
    this.mesh.position.copy(position);
    this.mesh.position.y = this.currentAltitude;
  }

  updateStatusText() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '12px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(this.state.toUpperCase(), canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    (this.statusText.material as THREE.MeshBasicMaterial).map = texture;
    (this.statusText.material as THREE.MeshBasicMaterial).needsUpdate = true;
  }

  updateColor() {
    switch (this.state) {
      case 'idle':
        this.bodyMaterial.color.set(0x00ff00); // Green
        break;
      case 'takingOff':
      case 'ascendingFromPickup':
      case 'ascendingFromDelivery':
        this.bodyMaterial.color.set(0xffff00); // Yellow
        break;
      case 'movingToPickup':
      case 'movingToDelivery':
      case 'returningToBase':
        this.bodyMaterial.color.set(0x0000ff); // Blue
        break;
      case 'descendingToPickup':
      case 'descendingToDelivery':
        this.bodyMaterial.color.set(0xff0000); // Red
        break;
      case 'pickingUp':
      case 'dropping':
        this.bodyMaterial.color.set(0xff00ff); // Purple
        break;
    }
  }

  findNearestPickupPoint(pickupPoints: THREE.Vector3[]): THREE.Vector3 | null {
    if (pickupPoints.length === 0) return null;
    
    let nearestPoint = pickupPoints[0];
    let minDistance = this.mesh.position.distanceTo(nearestPoint);
    
    for (let i = 1; i < pickupPoints.length; i++) {
      const distance = this.mesh.position.distanceTo(pickupPoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = pickupPoints[i];
      }
    }
    
    return nearestPoint;
  }

  calculateDistance(point1: THREE.Vector3, point2: THREE.Vector3): number {
    return point1.distanceTo(point2);
  }

  calculateVerticalDistance(startAlt: number, endAlt: number): number {
    return Math.abs(endAlt - startAlt);
  }
  calculateVerticalTime(verticalDistance: number, isAscent: boolean): number {
    const rate = isAscent ? this.verticalSpeed : this.verticalSpeed;
    return verticalDistance / rate;
  }

  calculateVerticalEnergy(verticalDistance: number): number {
    return verticalDistance * this.energyConsumption * 2;
  }

  createWaypoints(start: THREE.Vector3, end: THREE.Vector3, altitude: number): THREE.Vector3[] {
    const distance = this.calculateDistance(start, end);
    const numWaypoints = Math.max(2, Math.floor(distance / 10)); // One waypoint every 10 units
    const waypoints: THREE.Vector3[] = [];

    for (let i = 0; i < numWaypoints; i++) {
      const fraction = i / (numWaypoints - 1);
      const x = start.x + (end.x - start.x) * fraction;
      const z = start.z + (end.z - start.z) * fraction;
      waypoints.push(new THREE.Vector3(x, altitude, z));
    }

    return waypoints;
  }

  update() {
    if (this.state === 'idle') return;

    // Update battery
    this.battery = Math.max(0, this.battery - this.energyConsumption);

    console.log(`Drone ${this.id} state: ${this.state}, altitude: ${this.currentAltitude}, position: ${this.mesh.position.x}, ${this.mesh.position.y}, ${this.mesh.position.z}`);

    switch (this.state) {
      case 'takingOff':
        if (this.currentAltitude < this.cruisingAltitude) {
          this.currentAltitude += this.verticalSpeed;
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'movingToPickup';
          console.log(`Drone ${this.id} reached cruising altitude, moving to pickup`);
        }
        break;

      case 'movingToPickup':
        if (this.pickupPoint) {
          // Calculate direction to pickup point
          const direction = new THREE.Vector3(
            this.pickupPoint.x - this.mesh.position.x,
            0,
            this.pickupPoint.z - this.mesh.position.z
          );
          const distance = direction.length();

          console.log(`Drone ${this.id} distance to pickup: ${distance}, pickup point: ${this.pickupPoint.x}, ${this.pickupPoint.y}, ${this.pickupPoint.z}`);

          if (distance < 20) {
            console.log(`Drone ${this.id} starting descent to pickup`);
            this.state = 'descendingToPickup';
          } else {
            // Normalize direction and move with easing
            direction.normalize();
            const moveDistance = Math.min(distance, this.speed * (1 - Math.exp(-distance / 50)));
            
            // Update position
            this.mesh.position.x += direction.x * moveDistance;
            this.mesh.position.z += direction.z * moveDistance;
            this.mesh.position.y = this.currentAltitude;
            
            // Make drone face movement direction
            this.mesh.lookAt(this.pickupPoint);
          }
        }
        break;

      case 'descendingToPickup':
        console.log(`Drone ${this.id} descending, current altitude: ${this.currentAltitude}, target: ${this.pickupHeight}`);
        if (this.currentAltitude > this.pickupHeight) {
          this.currentAltitude = Math.max(this.pickupHeight, this.currentAltitude - this.verticalSpeed);
          this.mesh.position.y = this.currentAltitude;
        } else {
          console.log(`Drone ${this.id} reached pickup height`);
          this.state = 'pickingUp';
          setTimeout(() => {
            this.hasPackage = true;
            this.state = 'ascendingFromPickup';
            console.log(`Drone ${this.id} picked up package, ascending`);
          }, 2000);
        }
        break;

      case 'ascendingFromPickup':
        if (this.currentAltitude < this.cruisingAltitude) {
          this.currentAltitude += this.verticalSpeed;
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'movingToDelivery';
          console.log(`Drone ${this.id} reached cruising altitude, moving to delivery`);
        }
        break;

      case 'movingToDelivery':
        if (this.deliveryPoint) {
          // Calculate direction to delivery point
          const direction = new THREE.Vector3(
            this.deliveryPoint.x - this.mesh.position.x,
            0,
            this.deliveryPoint.z - this.mesh.position.z
          );
          const distance = direction.length();

          console.log(`Drone ${this.id} distance to delivery: ${distance}, delivery point: ${this.deliveryPoint.x}, ${this.deliveryPoint.y}, ${this.deliveryPoint.z}`);

          if (distance < 20) {
            console.log(`Drone ${this.id} starting descent to delivery`);
            this.state = 'descendingToDelivery';
          } else {
            // Normalize direction and move with easing
            direction.normalize();
            const moveDistance = Math.min(distance, this.speed * (1 - Math.exp(-distance / 50)));
            
            // Update position
            this.mesh.position.x += direction.x * moveDistance;
            this.mesh.position.z += direction.z * moveDistance;
            this.mesh.position.y = this.currentAltitude;
            
            // Make drone face movement direction
            this.mesh.lookAt(this.deliveryPoint);
          }
        }
        break;

      case 'descendingToDelivery':
        console.log(`Drone ${this.id} descending, current altitude: ${this.currentAltitude}, target: ${this.deliveryHeight}`);
        if (this.currentAltitude > this.deliveryHeight) {
          this.currentAltitude = Math.max(this.deliveryHeight, this.currentAltitude - this.verticalSpeed);
          this.mesh.position.y = this.currentAltitude;
        } else {
          console.log(`Drone ${this.id} reached delivery height`);
          this.state = 'dropping';
          setTimeout(() => {
            this.hasPackage = false;
            this.state = 'ascendingFromDelivery';
            console.log(`Drone ${this.id} dropped package, ascending`);
          }, 2000);
        }
        break;

      case 'ascendingFromDelivery':
        if (this.currentAltitude < this.cruisingAltitude) {
          this.currentAltitude += this.verticalSpeed;
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'returningToBase';
          console.log(`Drone ${this.id} reached cruising altitude, returning to base`);
        }
        break;

      case 'returningToBase':
        const returnDirection = new THREE.Vector3().subVectors(this.basePosition, this.mesh.position);
        const returnDistance = returnDirection.length();

        if (returnDistance < 20) {
          this.state = 'idle';
          this.battery = this.maxBattery;
          console.log(`Drone ${this.id} returned to base`);
        } else {
          returnDirection.normalize().multiplyScalar(this.speed);
          this.mesh.position.add(returnDirection);
          this.mesh.position.y = this.currentAltitude;
          this.mesh.lookAt(this.basePosition);
        }
        break;
    }

    // Update visual indicators
    this.updateStatusText();
    this.updateColor();
  }

  setTarget(pickup: THREE.Vector3, delivery: THREE.Vector3) {
    if (this.state === 'idle' && this.battery > 20) {
      this.pickupPoint = pickup.clone();
      this.deliveryPoint = delivery.clone();
      this.state = 'takingOff';
    }
  }

  reset() {
    this.mesh.position.copy(this.basePosition);
    this.mesh.position.y = this.landingAltitude;
    this.state = 'idle';
    this.battery = this.maxBattery;
    this.pickupPoint = null;
    this.deliveryPoint = null;
    this.targetPosition = null;
    this.hasPackage = false;
    this.currentAltitude = this.landingAltitude;
  }
}

const SceneContent: React.FC<{ 
  drones: Drone[]; 
  pickupPoints: THREE.Vector3[]; 
  deliveryPoints: THREE.Vector3[] 
}> = ({ drones, pickupPoints, deliveryPoints }) => {
  const { camera } = useThree();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const buildingsRef = useRef<THREE.Group>(new THREE.Group());
  const roadsRef = useRef<THREE.Group>(new THREE.Group());

  // Generate buildings
  useEffect(() => {
    const buildings = buildingsRef.current;
    const buildingColors = [0x8B4513, 0x808080, 0xA0522D, 0x696969, 0x4682B4, 0x556B2F];
    const citySize = 400;
    const gridSize = 8;
    const blockSize = citySize / gridSize;
    const minBuildingSize = 5;
    const maxBuildingSize = 15;
    const minHeight = 10;
    const maxHeight = 40;

    // Generate buildings for each block
    for (let i = -gridSize/2; i < gridSize/2; i++) {
      for (let j = -gridSize/2; j < gridSize/2; j++) {
        const blockX = i * blockSize;
        const blockZ = j * blockSize;
        
        // Calculate number of buildings in this block (1-4)
        const numBuildings = Math.floor(Math.random() * 4) + 1;
        
        for (let b = 0; b < numBuildings; b++) {
          // Calculate building position within the block
          const buildingWidth = minBuildingSize + Math.random() * (maxBuildingSize - minBuildingSize);
          const buildingDepth = minBuildingSize + Math.random() * (maxBuildingSize - minBuildingSize);
          const buildingHeight = minHeight + Math.random() * (maxHeight - minHeight);
          
          // Ensure building stays within block boundaries (accounting for roads)
          const maxX = blockX + blockSize - buildingWidth/2 - 5; // 5 is half road width
          const minX = blockX + buildingWidth/2 + 5;
          const maxZ = blockZ + blockSize - buildingDepth/2 - 5;
          const minZ = blockZ + buildingDepth/2 + 5;
          
          const x = minX + Math.random() * (maxX - minX);
          const z = minZ + Math.random() * (maxZ - minZ);
          
          // Create building
          const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
          const buildingMaterial = new THREE.MeshStandardMaterial({ 
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
            roughness: 0.7,
            metalness: 0.1
          });
          
          const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
          building.position.set(x, buildingHeight/2, z);
          building.castShadow = true;
          building.receiveShadow = true;
          
          // Add windows
          const windowSize = 1;
          const windowSpacing = 2;
          const numWindowsX = Math.floor(buildingWidth / windowSpacing) - 1;
          const numWindowsZ = Math.floor(buildingDepth / windowSpacing) - 1;
          
          for (let wx = 0; wx < numWindowsX; wx++) {
            for (let wz = 0; wz < numWindowsZ; wz++) {
              for (let wy = 0; wy < Math.floor(buildingHeight / windowSpacing) - 1; wy++) {
                const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                  color: 0xADD8E6,
                  side: THREE.DoubleSide
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                window.position.set(
                  -buildingWidth/2 + (wx + 1) * windowSpacing,
                  -buildingHeight/2 + (wy + 1) * windowSpacing,
                  buildingDepth/2 + 0.01
                );
                building.add(window);
                
                // Add windows to other sides
                const window2 = window.clone();
                window2.position.z = -buildingDepth/2 - 0.01;
                window2.rotation.y = Math.PI;
                building.add(window2);
                
                const window3 = window.clone();
                window3.position.set(
                  buildingWidth/2 + 0.01,
                  -buildingHeight/2 + (wy + 1) * windowSpacing,
                  -buildingDepth/2 + (wz + 1) * windowSpacing
                );
                window3.rotation.y = Math.PI/2;
                building.add(window3);
                
                const window4 = window.clone();
                window4.position.set(
                  -buildingWidth/2 - 0.01,
                  -buildingHeight/2 + (wy + 1) * windowSpacing,
                  -buildingDepth/2 + (wz + 1) * windowSpacing
                );
                window4.rotation.y = -Math.PI/2;
                building.add(window4);
              }
            }
          }
          
          buildings.add(building);
        }
      }
    }
  }, []);

  // Generate roads
  useEffect(() => {
    const roads = roadsRef.current;
    const roadWidth = 5;
    const mainRoadWidth = 8;
    const citySize = 400;
    const gridSize = 8; // Number of blocks in each direction
    const blockSize = citySize / gridSize;
    
    const roadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1
    });

    const markingMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    // Create main roads (vertical and horizontal)
    for (let i = -gridSize/2; i <= gridSize/2; i++) {
      const position = i * blockSize;
      
      // Vertical main roads
      const verticalRoad = new THREE.Mesh(
        new THREE.BoxGeometry(citySize, 0.1, mainRoadWidth),
        roadMaterial
      );
      verticalRoad.position.set(0, 0.05, position);
      verticalRoad.receiveShadow = true;
      roads.add(verticalRoad);

      // Vertical road markings
      const verticalMarking = new THREE.Mesh(
        new THREE.BoxGeometry(citySize, 0.11, 0.5),
        markingMaterial
      );
      verticalMarking.position.set(0, 0.06, position);
      roads.add(verticalMarking);

      // Horizontal main roads
      const horizontalRoad = new THREE.Mesh(
        new THREE.BoxGeometry(mainRoadWidth, 0.1, citySize),
        roadMaterial
      );
      horizontalRoad.position.set(position, 0.05, 0);
      horizontalRoad.receiveShadow = true;
      roads.add(horizontalRoad);

      // Horizontal road markings
      const horizontalMarking = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.11, citySize),
        markingMaterial
      );
      horizontalMarking.position.set(position, 0.06, 0);
      roads.add(horizontalMarking);
    }

    // Create connecting streets
    for (let i = -gridSize/2 + 1; i < gridSize/2; i++) {
      for (let j = -gridSize/2 + 1; j < gridSize/2; j++) {
        // Randomly decide if we want a connecting street
        if (Math.random() > 0.3) {
          const startX = i * blockSize;
          const startZ = j * blockSize;
          const endX = (i + 1) * blockSize;
          const endZ = (j + 1) * blockSize;

          // Vertical connecting street
          if (Math.random() > 0.5) {
            const verticalStreet = new THREE.Mesh(
              new THREE.BoxGeometry(blockSize, 0.1, roadWidth),
              roadMaterial
            );
            verticalStreet.position.set(
              startX + blockSize/2,
              0.05,
              startZ + blockSize/2
            );
            verticalStreet.receiveShadow = true;
            roads.add(verticalStreet);

            // Vertical street marking
            const verticalStreetMarking = new THREE.Mesh(
              new THREE.BoxGeometry(blockSize, 0.11, 0.3),
              markingMaterial
            );
            verticalStreetMarking.position.set(
              startX + blockSize/2,
              0.06,
              startZ + blockSize/2
            );
            roads.add(verticalStreetMarking);
          }

          // Horizontal connecting street
          if (Math.random() > 0.5) {
            const horizontalStreet = new THREE.Mesh(
              new THREE.BoxGeometry(roadWidth, 0.1, blockSize),
              roadMaterial
            );
            horizontalStreet.position.set(
              startX + blockSize/2,
              0.05,
              startZ + blockSize/2
            );
            horizontalStreet.receiveShadow = true;
            roads.add(horizontalStreet);

            // Horizontal street marking
            const horizontalStreetMarking = new THREE.Mesh(
              new THREE.BoxGeometry(0.3, 0.11, blockSize),
              markingMaterial
            );
            horizontalStreetMarking.position.set(
              startX + blockSize/2,
              0.06,
              startZ + blockSize/2
            );
            roads.add(horizontalStreetMarking);
          }
        }
      }
    }
  }, []);

  useFrame(() => {
    drones.forEach(drone => {
      if (drone.state !== 'idle') {
        drone.update();
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <OrbitControls />
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#3CB371" />
      </mesh>
      {/* Grid */}
      <gridHelper args={[500, 50, 0x000000, 0x000000]} position={[0, 0.01, 0]} />
      {/* Buildings */}
      <primitive object={buildingsRef.current} />
      {/* Roads */}
      <primitive object={roadsRef.current} />
      {/* Center base */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[10, 10, 0.2, 32]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
      {/* Pickup and Delivery Markers */}
      {pickupPoints.map((point, index) => (
        <mesh key={`pickup-${index}`} position={[point.x, 0.1, point.z]}>
          <cylinderGeometry args={[5, 5, 0.2, 32]} />
          <meshStandardMaterial color="#0000ff" transparent opacity={0.7} />
        </mesh>
      ))}
      {deliveryPoints.map((point, index) => (
        <mesh key={`delivery-${index}`} position={[point.x, 0.1, point.z]}>
          <cylinderGeometry args={[5, 5, 0.2, 32]} />
          <meshStandardMaterial color="#ff0000" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Drones */}
      {drones.map(drone => (
        <primitive key={drone.id} object={drone.mesh} />
      ))}
    </>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error in Map3D:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, color: 'error.main' }}>
          <Typography>Something went wrong. Please try refreshing the page.</Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

const Map3D: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [pickupPoints, setPickupPoints] = useState<THREE.Vector3[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<THREE.Vector3[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [fleetStatus, setFleetStatus] = useState<FleetStatus>({
    status: 'idle',
    activeDrones: 0,
    totalDrones: 0,
    batteryLevel: 0,
    energyConsumption: 0
  });
  const [statistics, setStatistics] = useState<FleetStatistics>({
    totalDeliveries: 0,
    averageDeliveryTime: 0,
    successRate: 0,
    batteryEfficiency: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [droneDetails, setDroneDetails] = useState<DroneDetails | null>(null);
  const [isDroneDetailsOpen, setIsDroneDetailsOpen] = useState(false);
  const [isDroneListOpen, setIsDroneListOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isFleetControlsOpen, setIsFleetControlsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<FleetSettings>({
    maxDrones: 10,
    batteryCapacity: 100,
    chargingRate: 5,
    deliveryRadius: 200,
    pickupRadius: 200
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [droneCount, setDroneCount] = useState(10);
  const fleetApi = useRef(new FleetApiClient());
  const [connectionStatus, setConnectionStatus] = useState<{
    droneUpdates: 'connecting' | 'connected' | 'error';
    fleetStatus: 'connecting' | 'connected' | 'error';
    deliveryUpdates: 'connecting' | 'connected' | 'error';
  }>({
    droneUpdates: 'connecting',
    fleetStatus: 'connecting',
    deliveryUpdates: 'connecting'
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const webSocketClient = useRef<FleetWebSocketClient | null>(null);
  const isConnecting = useRef(false);
  const [webglContextLost, setWebglContextLost] = useState(false);
  const lastStatusTimestamp = useRef<string>('');
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 100; // Minimum time between updates in milliseconds

  // Handle WebGL context loss
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('WebGL context lost, attempting to recover...');
      setWebglContextLost(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setWebglContextLost(false);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, []);

  const handleDroneUpdate = (data: any) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < updateInterval) {
      return; // Skip if too soon since last update
    }
    lastUpdateTime.current = now;

    setDrones(prevDrones => {
      return prevDrones.map(drone => {
        const droneData = data.data.find((d: any) => d.drone_id === drone.id.toString());
        if (droneData) {
          // Smoothly interpolate to new position
          const targetPosition = new THREE.Vector3(
            droneData.location.lon,
            droneData.location.altitude,
            droneData.location.lat
          );
          
          // Calculate direction to target
          const direction = new THREE.Vector3().subVectors(
            targetPosition,
            drone.mesh.position
          );
          
          // Normalize and scale by speed
          const speed = 0.1; // Adjust this value to control movement speed
          direction.normalize().multiplyScalar(speed);
          
          // Update position
          drone.mesh.position.add(direction);
          
          // Update state and battery
          drone.state = droneData.status;
          drone.battery = droneData.battery_level;
          
          // Make drone face movement direction
          if (direction.length() > 0.001) {
            drone.mesh.lookAt(targetPosition);
          }
        }
        return drone;
      });
    });
  };

  // Initialize WebSocket connection and API client
  useEffect(() => {
    const initWebSocket = async () => {
      if (isConnecting.current) return;
      isConnecting.current = true;

      try {
        if (!webSocketClient.current) {
          webSocketClient.current = new FleetWebSocketClient();
        }

        webSocketClient.current.setCallbacks({
          onDroneUpdate: (data) => {
            if (data.type === 'drone_positions') {
              setConnectionStatus(prev => ({ ...prev, droneUpdates: 'connected' }));
              handleDroneUpdate(data);
            }
          },
          onFleetStatus: (data) => {
            if (data.type === 'fleet_status') {
              setConnectionStatus(prev => ({ ...prev, fleetStatus: 'connected' }));
              console.log('Fleet status update received:', data);
              setFleetStatus(data.data);
              if (data.data.stats.total_drones !== droneCount) {
                setDroneCount(data.data.stats.total_drones);
              }
            }
          },
          onDeliveryUpdate: (data) => {
            if (data.type === 'delivery_update') {
              setConnectionStatus(prev => ({ ...prev, deliveryUpdates: 'connected' }));
              console.log('Delivery update received:', data);
              handleDeliveryUpdate(data);
            }
          }
        });

        await webSocketClient.current.connect();
        console.log('WebSocket connections established');
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        setConnectionError('Failed to initialize WebSocket connections. Please check your network connection.');
        setConnectionStatus({
          droneUpdates: 'error',
          fleetStatus: 'error',
          deliveryUpdates: 'error'
        });
      } finally {
        isConnecting.current = false;
      }
    };

    initWebSocket();

    // Cleanup function
    return () => {
      if (webSocketClient.current) {
        console.log('Cleaning up WebSocket connections');
        webSocketClient.current.disconnect();
        webSocketClient.current = null;
      }
    };
  }, []);

  // Initialize drones and points when drone count changes
  useEffect(() => {
    if (droneCount > 0) {
      initializeDronesAndPoints();
    }
  }, [droneCount]);

  const initializeDronesAndPoints = () => {
    // Create new drones
    const newDrones: Drone[] = [];
    for (let i = 0; i < droneCount; i++) {
      const drone = new Drone(new THREE.Vector3(0, 0, 0), i);
      newDrones.push(drone);
    }
    setDrones(newDrones);

    // Create pickup and delivery points
    const newPickupPoints: THREE.Vector3[] = [];
    const newDeliveryPoints: THREE.Vector3[] = [];

    for (let i = 0; i < droneCount; i++) {
      const pickupAngle = (i / droneCount) * Math.PI * 2;
      const pickupRadius = settings.pickupRadius;
      const pickupX = Math.cos(pickupAngle) * pickupRadius;
      const pickupZ = Math.sin(pickupAngle) * pickupRadius;
      const pickupPoint = new THREE.Vector3(pickupX, 0, pickupZ);
      newPickupPoints.push(pickupPoint);

      const deliveryAngle = pickupAngle + Math.PI;
      const deliveryRadius = settings.deliveryRadius;
      const deliveryX = Math.cos(deliveryAngle) * deliveryRadius;
      const deliveryZ = Math.sin(deliveryAngle) * deliveryRadius;
      const deliveryPoint = new THREE.Vector3(deliveryX, 0, deliveryZ);
      newDeliveryPoints.push(deliveryPoint);
    }

    setPickupPoints(newPickupPoints);
    setDeliveryPoints(newDeliveryPoints);

    // Assign points to drones
    newDrones.forEach((drone, index) => {
      drone.pickupPoint = newPickupPoints[index];
      drone.deliveryPoint = newDeliveryPoints[index];
    });

    setIsInitialized(true);
  };

  const handleDeliveryUpdate = (data: any) => {
    // Handle delivery updates
    console.log('Processing delivery update:', data);
  };

  const startSimulation = async () => {
    if (!isSimulationRunning) {
      try {
        setError(null);
        await fleetApi.current.startFleet();
        setIsSimulationRunning(true);
        
        const status = await fleetApi.current.getFleetStatus();
        setFleetStatus(status);
        
        const stats = await fleetApi.current.getCurrentStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to start fleet:', error);
        setError('Failed to start fleet. Please check if the server is running.');
      }
    }
  };

  const stopSimulation = async () => {
    try {
      setError(null);
      await fleetApi.current.pauseFleet();
      setIsSimulationRunning(false);
    } catch (error) {
      console.error('Failed to pause fleet:', error);
      setError('Failed to pause fleet. Please try again.');
    }
  };

  const resetSimulation = async () => {
    try {
      setError(null);
      await fleetApi.current.resetFleet();
      setIsSimulationRunning(false);
      setDrones(prevDrones => {
        return prevDrones.map(drone => {
          drone.reset();
          return drone;
        });
      });
    } catch (error) {
      console.error('Failed to reset fleet:', error);
      setError('Failed to reset fleet. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ width: '100%', height: '100vh' }}>
        {webglContextLost ? (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 2,
            borderRadius: 1,
            boxShadow: 3,
          }}>
            <Typography variant="h6" color="error">
              WebGL Context Lost
            </Typography>
            <Typography>
              The 3D rendering context has been lost. Please refresh the page to recover.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Refresh Page
            </Button>
          </Box>
        ) : (
          <>
            <Canvas 
              camera={{ position: [0, 50, 100], fov: 60 }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener('webglcontextlost', (e) => {
                  e.preventDefault();
                  setWebglContextLost(true);
                });
              }}
            >
              <SceneContent 
                drones={drones} 
                pickupPoints={pickupPoints} 
                deliveryPoints={deliveryPoints} 
              />
            </Canvas>
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: 2,
                borderRadius: 1,
                boxShadow: 3,
              }}
            >
              {connectionError && (
                <Box sx={{ color: 'error.main', mb: 2 }}>
                  <Typography>{connectionError}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Connection Status:</Typography>
                <Typography color={connectionStatus.droneUpdates === 'connected' ? 'success.main' : 'error.main'}>
                  Drone Updates: {connectionStatus.droneUpdates}
                </Typography>
                <Typography color={connectionStatus.fleetStatus === 'connected' ? 'success.main' : 'error.main'}>
                  Fleet Status: {connectionStatus.fleetStatus}
                </Typography>
                <Typography color={connectionStatus.deliveryUpdates === 'connected' ? 'success.main' : 'error.main'}>
                  Delivery Updates: {connectionStatus.deliveryUpdates}
                </Typography>
              </Box>
              {error && (
                <Box sx={{ color: 'error.main', mb: 2 }}>
                  <Typography>{error}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color={isSimulationRunning ? 'secondary' : 'primary'}
                  onClick={isSimulationRunning ? stopSimulation : startSimulation}
                >
                  {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={resetSimulation}
                  disabled={isSimulationRunning}
                >
                  Reset Simulation
                </Button>
              </Box>
              {fleetStatus && (
                <Box>
                  <Typography variant="h6">Fleet Status</Typography>
                  <Typography>Active Drones: {fleetStatus.activeDrones}</Typography>
                  <Typography>Total Drones: {fleetStatus.totalDrones}</Typography>
                  <Typography>Battery Level: {fleetStatus.batteryLevel}%</Typography>
                  <Typography>Energy Consumption: {fleetStatus.energyConsumption}W</Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Map3D; 