import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Button, Box, Typography } from '@mui/material';

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
  state: 'idle' | 'takingOff' | 'movingToPickup' | 'descendingToPickup' | 'pickingUp' | 
         'ascendingFromPickup' | 'movingToDelivery' | 'descendingToDelivery' | 'dropping' | 
         'ascendingFromDelivery' | 'returningToBase' | 'descendingToBase';
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
  collisionRadius: number;
  avoidanceRadius: number;
  reroutePoints: THREE.Vector3[];
  currentRerouteIndex: number;
  lastCollisionCheck: number;
  collisionCheckInterval: number;
  collisionsAvoided: number;
  lastPosition: THREE.Vector3;
  collisionDetails: Array<{ timestamp: number; otherDroneId: number; distance: number }>;

  constructor(position: THREE.Vector3, id: number) {
    this.id = id;
    this.basePosition = position.clone();
    this.targetPosition = null;
    this.pickupPoint = null;
    this.deliveryPoint = null;
    this.speed = 5;
    this.battery = 100;
    this.maxBattery = 100;
    this.state = 'idle';
    this.currentAltitude = 2;
    this.cruisingAltitude = 50;
    this.landingAltitude = 2;
    this.verticalSpeed = 2;
    this.hasPackage = false;
    this.energyConsumption = 0.1;
    this.pickupHeight = 2;
    this.deliveryHeight = 2;
    this.isDescending = false;
    this.isAscending = false;
    this.collisionRadius = 10;
    this.avoidanceRadius = 20;
    this.reroutePoints = [];
    this.currentRerouteIndex = 0;
    this.lastCollisionCheck = 0;
    this.collisionCheckInterval = 1000;
    this.collisionsAvoided = 0;
    this.lastPosition = position.clone();
    this.collisionDetails = [];

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

  update(drones: Drone[]) {
    if (this.state === 'idle') return;

    // Update battery
    this.battery = Math.max(0, this.battery - this.energyConsumption * 0.5);

    // Check for collisions first
    const collidingDrone = this.checkForCollisions(drones);
    if (collidingDrone) {
      if (this.reroutePoints.length === 0) {
        this.reroutePoints = this.calculateAvoidancePath(collidingDrone);
        this.currentRerouteIndex = 0;
      }
    }

    // Basic logging
    console.log(`Drone ${this.id}: ${this.state} at (${this.mesh.position.x.toFixed(1)}, ${this.mesh.position.y.toFixed(1)}, ${this.mesh.position.z.toFixed(1)})`);

    // Handle rerouting if needed
    if (this.reroutePoints.length > 0 && this.currentRerouteIndex < this.reroutePoints.length) {
      const targetPoint = this.reroutePoints[this.currentRerouteIndex];
      const dx = targetPoint.x - this.mesh.position.x;
      const dy = targetPoint.y - this.mesh.position.y;
      const dz = targetPoint.z - this.mesh.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < 0.1) {
        this.currentRerouteIndex++;
        if (this.currentRerouteIndex >= this.reroutePoints.length) {
          this.reroutePoints = [];
          this.currentRerouteIndex = 0;
        }
      } else {
        const moveX = (dx / distance) * Math.min(this.speed, distance);
        const moveY = (dy / distance) * Math.min(this.speed, distance);
        const moveZ = (dz / distance) * Math.min(this.speed, distance);
        
        this.mesh.position.x += moveX;
        this.mesh.position.y += moveY;
        this.mesh.position.z += moveZ;
        this.mesh.lookAt(targetPoint);
        return;
      }
    }

    // Normal movement logic
    switch (this.state) {
      case 'takingOff':
        if (this.currentAltitude < this.cruisingAltitude) {
          this.currentAltitude += this.verticalSpeed;
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'movingToPickup';
        }
        break;

      case 'movingToPickup':
        if (this.pickupPoint) {
          const dx = this.pickupPoint.x - this.mesh.position.x;
          const dz = this.pickupPoint.z - this.mesh.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < 0.1) {
            this.mesh.position.x = this.pickupPoint.x;
            this.mesh.position.z = this.pickupPoint.z;
            this.state = 'descendingToPickup';
          } else {
            const moveX = (dx / distance) * Math.min(this.speed, distance);
            const moveZ = (dz / distance) * Math.min(this.speed, distance);
            
            this.mesh.position.x += moveX;
            this.mesh.position.z += moveZ;
            this.mesh.position.y = this.currentAltitude;
            this.mesh.lookAt(this.pickupPoint);
          }
        }
        break;

      case 'descendingToPickup':
        if (this.currentAltitude > this.pickupHeight) {
          this.currentAltitude = Math.max(this.pickupHeight, this.currentAltitude - this.verticalSpeed);
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'pickingUp';
          setTimeout(() => {
            this.hasPackage = true;
            this.state = 'ascendingFromPickup';
          }, 2000);
        }
        break;

      case 'ascendingFromPickup':
        if (this.currentAltitude < this.cruisingAltitude) {
          this.currentAltitude += this.verticalSpeed;
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'movingToDelivery';
        }
        break;

      case 'movingToDelivery':
        if (this.deliveryPoint) {
          const dx = this.deliveryPoint.x - this.mesh.position.x;
          const dz = this.deliveryPoint.z - this.mesh.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < 0.1) {
            this.mesh.position.x = this.deliveryPoint.x;
            this.mesh.position.z = this.deliveryPoint.z;
            this.state = 'descendingToDelivery';
          } else {
            const moveX = (dx / distance) * Math.min(this.speed, distance);
            const moveZ = (dz / distance) * Math.min(this.speed, distance);
            
            this.mesh.position.x += moveX;
            this.mesh.position.z += moveZ;
            this.mesh.position.y = this.currentAltitude;
            this.mesh.lookAt(this.deliveryPoint);
          }
        }
        break;

      case 'descendingToDelivery':
        if (this.currentAltitude > this.deliveryHeight) {
          this.currentAltitude = Math.max(this.deliveryHeight, this.currentAltitude - this.verticalSpeed);
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'dropping';
          setTimeout(() => {
            this.hasPackage = false;
            this.state = 'ascendingFromDelivery';
          }, 2000);
        }
        break;

      case 'ascendingFromDelivery':
        if (this.currentAltitude < this.cruisingAltitude) {
          this.currentAltitude += this.verticalSpeed;
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'returningToBase';
        }
        break;

      case 'returningToBase':
        const bx = this.basePosition.x - this.mesh.position.x;
        const bz = this.basePosition.z - this.mesh.position.z;
        const baseDistance = Math.sqrt(bx * bx + bz * bz);

        if (baseDistance < 0.1) {
          this.mesh.position.x = this.basePosition.x;
          this.mesh.position.z = this.basePosition.z;
          this.state = 'descendingToBase';
        } else {
          const moveX = (bx / baseDistance) * Math.min(this.speed, baseDistance);
          const moveZ = (bz / baseDistance) * Math.min(this.speed, baseDistance);
          
          this.mesh.position.x += moveX;
          this.mesh.position.z += moveZ;
          this.mesh.position.y = this.currentAltitude;
          this.mesh.lookAt(this.basePosition);
        }
        break;

      case 'descendingToBase':
        if (this.currentAltitude > this.landingAltitude) {
          this.currentAltitude = Math.max(this.landingAltitude, this.currentAltitude - this.verticalSpeed);
          this.mesh.position.y = this.currentAltitude;
        } else {
          this.state = 'idle';
          this.battery = this.maxBattery;
        }
        break;
    }

    // Update visual indicators
    this.updateStatusText();
    this.updateColor();
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
        if (this.reroutePoints.length > 0) {
          this.bodyMaterial.color.set(0xffa500); // Orange for rerouting
        } else {
          this.bodyMaterial.color.set(0x0000ff); // Blue
        }
        break;
      case 'descendingToPickup':
      case 'descendingToDelivery':
      case 'descendingToBase':
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

  // Add new methods for collision avoidance
  checkForCollisions(drones: Drone[]): Drone | null {
    const now = Date.now();
    if (now - this.lastCollisionCheck < this.collisionCheckInterval) {
      return null;
    }
    this.lastCollisionCheck = now;

    for (const otherDrone of drones) {
      if (otherDrone.id === this.id) continue;

      const distance = this.mesh.position.distanceTo(otherDrone.mesh.position);
      const altitudeDiff = Math.abs(this.currentAltitude - otherDrone.currentAltitude);
      
      if (distance < this.avoidanceRadius) {
        this.collisionsAvoided++;
        this.collisionDetails.push({
          timestamp: now,
          otherDroneId: otherDrone.id,
          distance: distance
        });
        console.log(`Potential collision detected between drone ${this.id} and ${otherDrone.id} at distance ${distance.toFixed(1)}`);
        return otherDrone;
      }
    }
    return null;
  }

  calculateAvoidancePath(collidingDrone: Drone): THREE.Vector3[] {
    const path: THREE.Vector3[] = [];
    const currentPos = this.mesh.position.clone();
    const targetPos = this.getCurrentTarget();
    const collidingPos = collidingDrone.mesh.position.clone();

    // Calculate direction to collision
    const directionToCollision = new THREE.Vector3().subVectors(collidingPos, currentPos);
    const perpendicular = new THREE.Vector3(-directionToCollision.z, 0, directionToCollision.x).normalize();
    
    // Calculate multiple avoidance points
    const avoidanceDistance = this.avoidanceRadius * 1.5; // Increased avoidance distance
    const altitudeChange = this.id < collidingDrone.id ? 25 : -25; // Increased altitude difference
    
    // First avoidance point (lateral movement)
    const lateralAvoidance = currentPos.clone().add(
      perpendicular.multiplyScalar(avoidanceDistance)
    );
    lateralAvoidance.y = this.currentAltitude;
    path.push(lateralAvoidance);

    // Second avoidance point (altitude change)
    const verticalAvoidance = currentPos.clone();
    verticalAvoidance.y = this.currentAltitude + altitudeChange;
    path.push(verticalAvoidance);

    // Final point (back to original path)
    const finalPoint = targetPos.clone();
    finalPoint.y = this.currentAltitude + altitudeChange;
    path.push(finalPoint);

    console.log(`Drone ${this.id} executing avoidance maneuver with altitude change ${altitudeChange}`);
    return path;
  }

  getCurrentTarget(): THREE.Vector3 {
    switch (this.state) {
      case 'movingToPickup':
        return this.pickupPoint!;
      case 'movingToDelivery':
        return this.deliveryPoint!;
      case 'returningToBase':
        return this.basePosition;
      default:
        return this.mesh.position;
    }
  }
}

const SceneContent: React.FC<{ 
  drones: Drone[]; 
  pickupPoints: THREE.Vector3[]; 
  deliveryPoints: THREE.Vector3[];
  selectedDroneId: number | null;
}> = ({ drones, pickupPoints, deliveryPoints, selectedDroneId }) => {
  const { camera } = useThree();
  const buildingsRef = useRef<THREE.Group>(new THREE.Group());
  const roadsRef = useRef<THREE.Group>(new THREE.Group());
  const controlsRef = useRef<any>(null);
  const targetDroneRef = useRef<Drone | null>(null);
  const lastCameraUpdateRef = useRef<number>(0);
  const lastDronePositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const cameraPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Enhanced camera settings
  const cameraOffset = new THREE.Vector3(0, 20, 40); // Increased height and distance
  const cameraLookOffset = new THREE.Vector3(0, 5, 0);
  const cameraSmoothness = 0.1; // Increased for smoother movement
  const minCameraDistance = 30;
  const maxCameraDistance = 150;
  const cameraUpdateInterval = 16; // 60 FPS
  const maxCameraSpeed = 1.0; // Increased for more responsive movement
  const viewAngleThreshold = Math.PI / 4; // 45 degrees

  // Improve camera controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05; // Reduced for smoother movement
      controlsRef.current.rotateSpeed = 0.5; // Increased for better control
      controlsRef.current.zoomSpeed = 0.8; // Increased for better control
      controlsRef.current.panSpeed = 0.8; // Increased for better control
      controlsRef.current.minDistance = minCameraDistance;
      controlsRef.current.maxDistance = maxCameraDistance;
      controlsRef.current.maxPolarAngle = Math.PI / 2;
      controlsRef.current.minPolarAngle = Math.PI / 6;
      controlsRef.current.enabled = false;
    }
  }, []);

  // Update camera position to follow target drone
  useFrame((state, delta) => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    drones.forEach(drone => {
      if (drone.state !== 'idle') {
        drone.update(drones);
      }
    });

    const now = Date.now();
    if (now - lastCameraUpdateRef.current >= cameraUpdateInterval) {
      lastCameraUpdateRef.current = now;

      let droneToFollow: Drone | null = null;
      
      if (selectedDroneId !== null) {
        droneToFollow = drones.find(drone => drone.id === selectedDroneId) || null;
      }
      
      if (!droneToFollow) {
        droneToFollow = drones.find(drone => drone.state !== 'idle') || null;
      }

      if (droneToFollow) {
        targetDroneRef.current = droneToFollow;
        const targetPosition = droneToFollow.mesh.position.clone();
        
        // Calculate movement direction with improved smoothing
        const movementDirection = new THREE.Vector3().subVectors(
          targetPosition,
          lastDronePositionRef.current
        ).normalize();
        
        // Calculate camera position with dynamic offset based on drone's altitude
        const altitudeFactor = Math.max(1, targetPosition.y / 50); // Scale offset with altitude
        const dynamicOffset = cameraOffset.clone().multiplyScalar(altitudeFactor);
        
        // Calculate camera position behind the drone with improved limits
        const behindOffset = movementDirection.length() > 0.1 
          ? movementDirection.clone().multiplyScalar(-1)
          : new THREE.Vector3(0, 0, -1);
        
        behindOffset.y = 0;
        behindOffset.normalize();
        
        // Calculate desired camera position with dynamic height
        const desiredPosition = targetPosition.clone()
          .add(behindOffset.multiplyScalar(dynamicOffset.z))
          .add(new THREE.Vector3(0, dynamicOffset.y, 0));
        
        // Calculate look-ahead point with improved prediction
        const lookAhead = movementDirection.multiplyScalar(15 * altitudeFactor);
        const desiredLookAt = targetPosition.clone()
          .add(cameraLookOffset)
          .add(lookAhead);

        // Smooth camera movement with improved limits
        const positionDiff = new THREE.Vector3().subVectors(desiredPosition, cameraPositionRef.current);
        const distance = positionDiff.length();
        const moveAmount = Math.min(distance * cameraSmoothness, maxCameraSpeed * altitudeFactor);
        
        if (distance > 0.01) {
          positionDiff.normalize().multiplyScalar(moveAmount);
          cameraPositionRef.current.add(positionDiff);
          camera.position.copy(cameraPositionRef.current);
        }

        // Smooth look-at point movement with improved limits
        cameraTargetRef.current.lerp(desiredLookAt, cameraSmoothness);
        camera.lookAt(cameraTargetRef.current);
        
        // Update last position
        lastDronePositionRef.current.copy(targetPosition);
      }
    }
  });

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
      <OrbitControls ref={controlsRef} />
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

// Add new DroneInfoSidebar component
const DroneInfoSidebar: React.FC<{ drones: Drone[] }> = ({ drones }) => {
  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '300px',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '20px',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Drone Information</h3>
      {drones.map(drone => (
        <div key={drone.id} style={{
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Drone {drone.id}</h4>
          <div style={{ marginBottom: '5px' }}>
            <strong>State:</strong> {drone.state}
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Battery:</strong> {Math.round(drone.battery)}%
          </div>
          <div>
            <strong>Collisions Avoided:</strong> {drone.collisionsAvoided}
          </div>
        </div>
      ))}
    </div>
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
        <div style={{ 
          padding: '16px', 
          color: '#d32f2f', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          margin: '16px'
        }}>
          <h6 style={{ margin: 0 }}>
            Something went wrong. Please try refreshing the page.
          </h6>
        </div>
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
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);

  // Initialize drones and points
  useEffect(() => {
    const initializeDronesAndPoints = () => {
      const newDrones: Drone[] = [];
      const newPickupPoints: THREE.Vector3[] = [];
      const newDeliveryPoints: THREE.Vector3[] = [];

      // Create 5 drones
      for (let i = 0; i < 5; i++) {
        const drone = new Drone(new THREE.Vector3(0, 0, 0), i);
        newDrones.push(drone);

        // Create pickup and delivery points in a circle
        const angle = (i / 5) * Math.PI * 2;
        const radius = 100;
        
        const pickupX = Math.cos(angle) * radius;
        const pickupZ = Math.sin(angle) * radius;
        const pickupPoint = new THREE.Vector3(pickupX, 0, pickupZ);
        newPickupPoints.push(pickupPoint);

        const deliveryX = Math.cos(angle + Math.PI) * radius;
        const deliveryZ = Math.sin(angle + Math.PI) * radius;
        const deliveryPoint = new THREE.Vector3(deliveryX, 0, deliveryZ);
        newDeliveryPoints.push(deliveryPoint);
      }

      setDrones(newDrones);
      setPickupPoints(newPickupPoints);
      setDeliveryPoints(newDeliveryPoints);
    };

    initializeDronesAndPoints();
  }, []);

  const startSimulation = () => {
    if (!isSimulationRunning) {
      setIsSimulationRunning(true);
      setDrones(prevDrones => {
        return prevDrones.map((drone, index) => {
          if (drone.state === 'idle' && drone.battery > 20) {
            const pickupPoint = pickupPoints[index];
            const deliveryPoint = deliveryPoints[index];
            if (pickupPoint && deliveryPoint) {
              drone.setTarget(pickupPoint, deliveryPoint);
            }
          }
          return drone;
        });
      });
    }
  };

  const stopSimulation = () => {
    setIsSimulationRunning(false);
    setDrones(prevDrones => {
      return prevDrones.map(drone => {
        drone.reset();
        return drone;
      });
    });
  };

  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
        }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Follow Drone:</label>
          <select 
            value={selectedDroneId ?? ''}
            onChange={(e) => setSelectedDroneId(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: '5px',
              borderRadius: '3px',
              background: 'white',
              color: 'black'
            }}
          >
            <option value="">Auto (Follow First Active)</option>
            {drones.map((drone) => (
              <option key={drone.id} value={drone.id}>
                Drone {drone.id} - {drone.state} (Battery: {Math.round(drone.battery)}%)
              </option>
            ))}
          </select>
        </div>
        <Canvas>
          <SceneContent 
            drones={drones} 
            pickupPoints={pickupPoints} 
            deliveryPoints={deliveryPoints}
            selectedDroneId={selectedDroneId}
          />
        </Canvas>
        <DroneInfoSidebar drones={drones} />
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: '10px'
        }}>
          <Button
            variant="contained"
            color={isSimulationRunning ? 'secondary' : 'primary'}
            onClick={isSimulationRunning ? stopSimulation : startSimulation}
          >
            {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Map3D; 