import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Orientation } from '../hooks/useOrientation';
import { UserLocation } from '../hooks/useLocation';
import { ScoredPOI } from '../hooks/useVisiblePOIs';

interface EarthSceneProps {
  orientation: Orientation;
  userLocation: UserLocation | null;
  visiblePOIs: ScoredPOI[];
}

// Colors for different POI types
const POI_COLORS = {
  city: 0xffaa00,      // Orange for cities
  landmark: 0xff4444,  // Red for landmarks
  natural: 0x44ff44,   // Green for natural wonders
  user: 0x00ffff,      // Cyan for user location
  horizon: 0xffff00,   // Yellow for horizon cities
  antipodal: 0xff00ff, // Magenta for antipodal cities
};

export function EarthScene({ orientation, userLocation, visiblePOIs }: EarthSceneProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const poiGroupRef = useRef<THREE.Group | null>(null);
  const userMarkerRef = useRef<THREE.Mesh | null>(null);

  // Update camera position and rotation based on user location and device orientation
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    // Position camera at user's location on Earth's surface (or default)
    const lat = userLocation?.lat ?? 0;
    const lng = userLocation?.lng ?? 0;

    // Get position on sphere surface (slightly above to see horizon)
    const cameraPos = latLngToVector3(lat, lng, 5.3);
    camera.position.copy(cameraPos);

    // Calculate the "up" direction (radially outward from Earth center)
    const up = cameraPos.clone().normalize();

    // Calculate initial forward direction (tangent to surface, pointing north)
    // This is the direction along the surface towards north pole
    const north = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3().crossVectors(up, new THREE.Vector3().crossVectors(north, up)).normalize();

    // If at poles, use a different reference
    if (Math.abs(lat) > 89) {
      forward.set(1, 0, 0);
    }

    // Create rotation matrix for local coordinate frame
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // Apply device orientation
    // Beta (pitch): tilt phone forward/back - look up/down
    // Alpha (yaw): compass heading - look left/right
    // Gamma (roll): tilt phone left/right - roll view

    // Start with looking at horizon (forward direction)
    const lookTarget = new THREE.Vector3()
      .copy(cameraPos)
      .add(forward.clone().multiplyScalar(10));

    // Apply yaw (alpha) - rotate around up axis
    const yawAxis = up;
    lookTarget.sub(cameraPos);
    lookTarget.applyAxisAngle(yawAxis, -orientation.alpha);
    lookTarget.add(cameraPos);

    // Apply pitch (beta) - rotate around right axis
    // When phone is upright (beta ~ 90°), we want to look at horizon
    // Subtract 90° so that upright phone = horizon view
    const pitchAngle = orientation.beta - Math.PI / 2;
    const pitchAxis = right.clone().applyAxisAngle(yawAxis, -orientation.alpha);
    lookTarget.sub(cameraPos);
    lookTarget.applyAxisAngle(pitchAxis, pitchAngle);
    lookTarget.add(cameraPos);

    camera.up.copy(up);
    camera.lookAt(lookTarget);

    // Apply roll (gamma)
    camera.rotateZ(-orientation.gamma);

  }, [orientation, userLocation]);

  // Update visible POIs
  useEffect(() => {
    if (!poiGroupRef.current) return;

    const poiGroup = poiGroupRef.current;

    // Clear existing POI markers
    while (poiGroup.children.length > 0) {
      const child = poiGroup.children[0];
      poiGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }

    // Add new POI markers
    visiblePOIs.forEach((poi) => {
      let color: number;
      let size: number;

      if (poi.isHorizon) {
        color = POI_COLORS.horizon;
        size = 0.12;
      } else if (poi.isAntipodal) {
        color = POI_COLORS.antipodal;
        size = 0.15;
      } else if (poi.type === 'city') {
        color = POI_COLORS.city;
        const popScale = poi.population ? Math.log10(poi.population) / 8 : 0.5;
        size = 0.06 + popScale * 0.08;
      } else if (poi.type === 'landmark') {
        color = POI_COLORS.landmark;
        size = 0.1;
      } else {
        color = POI_COLORS.natural;
        size = 0.1;
      }

      const geometry = new THREE.SphereGeometry(size, 12, 12);
      const material = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(geometry, material);
      const pos = latLngToVector3(poi.lat, poi.lng, 5.08);
      marker.position.copy(pos);
      poiGroup.add(marker);
    });
  }, [visiblePOIs]);

  // Update user location marker
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      sceneRef.current.remove(userMarkerRef.current);
      userMarkerRef.current.geometry.dispose();
      userMarkerRef.current = null;
    }

    // Add new user marker
    if (userLocation) {
      const geometry = new THREE.SphereGeometry(0.18, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: POI_COLORS.user });
      const marker = new THREE.Mesh(geometry, material);
      const pos = latLngToVector3(userLocation.lat, userLocation.lng, 5.12);
      marker.position.copy(pos);
      sceneRef.current.add(marker);
      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    // Dark purple-black for space - clearly different from Earth
    renderer.setClearColor(0x0a0014, 1);

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera - positioned on Earth's surface looking outward
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    // Position camera slightly outside Earth's surface
    // Will be updated based on user location
    camera.position.set(0, 0, 5.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create Earth sphere
    const earthGeometry = new THREE.SphereGeometry(5, 48, 48);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x112244,
      transparent: false,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      scene.add(createLatitudeLine(lat, 5.02));
    }

    // Add longitude lines
    for (let lng = 0; lng < 180; lng += 30) {
      scene.add(createLongitudeLine(lng, 5.02));
    }

    // Add equator (brighter)
    scene.add(createLatitudeLine(0, 5.03, 0x66aaff));

    // Create POI group for dynamic updates
    const poiGroup = new THREE.Group();
    poiGroup.name = 'poiGroup';
    scene.add(poiGroup);
    poiGroupRef.current = poiGroup;

    // Render loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
}

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Create a latitude line
function createLatitudeLine(lat: number, radius: number, color: number = 0x4488ff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lng = 0; lng <= 360; lng += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
  return new THREE.Line(geometry, material);
}

// Create a longitude line
function createLongitudeLine(lng: number, radius: number, color: number = 0x4488ff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lat = -90; lat <= 90; lat += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  for (let lat = 90; lat >= -90; lat -= 5) {
    points.push(latLngToVector3(lat, lng + 180, radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
  return new THREE.Line(geometry, material);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});
