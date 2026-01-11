import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Orientation } from '../hooks/useOrientation';
import { WORLD_DATABASE, POI } from '../constants/worldDatabase';
import { UserLocation } from '../hooks/useLocation';

interface EarthSceneProps {
  orientation: Orientation;
  userLocation: UserLocation | null;
}

// Colors for different POI types
const POI_COLORS = {
  city: 0xffaa00,      // Orange for cities
  landmark: 0xff4444,  // Red for landmarks
  natural: 0x44ff44,   // Green for natural wonders
  user: 0x00ffff,      // Cyan for user location
};

export function EarthScene({ orientation, userLocation }: EarthSceneProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Update camera rotation based on device orientation
  useEffect(() => {
    if (cameraRef.current) {
      const camera = cameraRef.current;

      // Convert device orientation to camera rotation
      // Alpha = yaw (compass), Beta = pitch (tilt forward/back), Gamma = roll (tilt left/right)
      camera.rotation.order = 'YXZ';
      camera.rotation.x = orientation.beta;
      camera.rotation.y = orientation.alpha;
      camera.rotation.z = -orientation.gamma;
    }
  }, [orientation]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 1);

    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // Create Earth sphere - solid with wireframe look
    const earthGeometry = new THREE.SphereGeometry(5, 48, 48);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x112244,
      transparent: false,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const latLine = createLatitudeLine(lat, 5.02);
      scene.add(latLine);
    }

    // Add longitude lines
    for (let lng = 0; lng < 180; lng += 30) {
      const lngLine = createLongitudeLine(lng, 5.02);
      scene.add(lngLine);
    }

    // Add equator (brighter)
    const equator = createLatitudeLine(0, 5.03, 0x66aaff);
    scene.add(equator);

    // Add POI markers from database
    const cityGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const landmarkGeometry = new THREE.SphereGeometry(0.12, 12, 12);

    const cityMaterial = new THREE.MeshBasicMaterial({ color: POI_COLORS.city });
    const landmarkMaterial = new THREE.MeshBasicMaterial({ color: POI_COLORS.landmark });
    const naturalMaterial = new THREE.MeshBasicMaterial({ color: POI_COLORS.natural });

    WORLD_DATABASE.forEach((poi: POI) => {
      let geometry: THREE.SphereGeometry;
      let material: THREE.MeshBasicMaterial;

      if (poi.type === 'city') {
        // Size cities by population (larger cities = bigger markers)
        const popScale = poi.population ? Math.log10(poi.population) / 8 : 0.5;
        geometry = new THREE.SphereGeometry(0.05 + popScale * 0.08, 12, 12);
        material = cityMaterial;
      } else if (poi.type === 'landmark') {
        geometry = landmarkGeometry;
        material = landmarkMaterial;
      } else {
        geometry = landmarkGeometry;
        material = naturalMaterial;
      }

      const marker = new THREE.Mesh(geometry, material);
      const pos = latLngToVector3(poi.lat, poi.lng, 5.08);
      marker.position.copy(pos);
      scene.add(marker);
    });

    // Add user location marker (if available)
    if (userLocation) {
      const userGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const userMaterial = new THREE.MeshBasicMaterial({ color: POI_COLORS.user });
      const userMarker = new THREE.Mesh(userGeometry, userMaterial);
      const userPos = latLngToVector3(userLocation.lat, userLocation.lng, 5.12);
      userMarker.position.copy(userPos);
      scene.add(userMarker);
    }

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

// Create a latitude line (circle at given latitude)
function createLatitudeLine(lat: number, radius: number, color: number = 0x4488ff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lng = 0; lng <= 360; lng += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
  return new THREE.Line(geometry, material);
}

// Create a longitude line (half circle from pole to pole)
function createLongitudeLine(lng: number, radius: number, color: number = 0x4488ff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lat = -90; lat <= 90; lat += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  // Also add the other half
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
