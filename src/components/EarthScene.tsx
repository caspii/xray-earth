import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Orientation } from '../hooks/useOrientation';
import { UserLocation } from '../hooks/useLocation';
import { ScoredPOI } from '../hooks/useVisiblePOIs';
import { formatDistance } from '../utils/coordinates';

interface EarthSceneProps {
  orientation: Orientation;
  userLocation: UserLocation | null;
  visiblePOIs: ScoredPOI[];
}

interface LabelPosition {
  poi: ScoredPOI;
  x: number;
  y: number;
  visible: boolean;
  distance: number;
}

// Colors for different POI types
const POI_COLORS = {
  city: 0xffaa00,
  landmark: 0xff4444,
  natural: 0x44ff44,
  user: 0x00ffff,
  horizon: 0xffff00,
  antipodal: 0xff00ff,
};

const LABEL_COLORS: Record<string, string> = {
  city: '#ffaa00',
  landmark: '#ff4444',
  natural: '#44ff44',
  horizon: '#ffff00',
  antipodal: '#ff00ff',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function EarthScene({ orientation, userLocation, visiblePOIs }: EarthSceneProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const poiGroupRef = useRef<THREE.Group | null>(null);
  const userMarkerRef = useRef<THREE.Mesh | null>(null);
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);

  // Update camera position and rotation based on user location and device orientation
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    const lat = userLocation?.lat ?? 0;
    const lng = userLocation?.lng ?? 0;

    const cameraPos = latLngToVector3(lat, lng, 5.3);
    camera.position.copy(cameraPos);

    const up = cameraPos.clone().normalize();
    const north = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3().crossVectors(up, new THREE.Vector3().crossVectors(north, up)).normalize().negate();

    if (Math.abs(lat) > 89) {
      forward.set(1, 0, 0);
    }

    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    const lookTarget = new THREE.Vector3()
      .copy(cameraPos)
      .add(forward.clone().multiplyScalar(10));

    const yawAxis = up;
    lookTarget.sub(cameraPos);
    lookTarget.applyAxisAngle(yawAxis, orientation.alpha);
    lookTarget.add(cameraPos);

    const pitchAngle = orientation.beta - Math.PI / 2;
    const pitchAxis = right.clone().applyAxisAngle(yawAxis, orientation.alpha);
    lookTarget.sub(cameraPos);
    lookTarget.applyAxisAngle(pitchAxis, pitchAngle);
    lookTarget.add(cameraPos);

    camera.up.copy(up);
    camera.lookAt(lookTarget);
    camera.rotateZ(-orientation.gamma);

    // Update projection matrix for label positioning
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    // Project POI positions to screen coordinates
    const newLabelPositions: LabelPosition[] = visiblePOIs.map(poi => {
      const pos3D = latLngToVector3(poi.lat, poi.lng, 5.08);
      const projected = pos3D.clone().project(camera);

      // Check if in front of camera (z < 1 means in front)
      const visible = projected.z < 1;

      // Convert from normalized device coords (-1 to 1) to screen pixels
      const x = (projected.x + 1) / 2 * SCREEN_WIDTH;
      const y = (1 - projected.y) / 2 * SCREEN_HEIGHT;

      return {
        poi,
        x,
        y,
        visible,
        distance: poi.distance,
      };
    });

    setLabelPositions(newLabelPositions);

  }, [orientation, userLocation, visiblePOIs]);

  // Update visible POIs markers
  useEffect(() => {
    if (!poiGroupRef.current) return;

    const poiGroup = poiGroupRef.current;

    while (poiGroup.children.length > 0) {
      const child = poiGroup.children[0];
      poiGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }

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

    if (userMarkerRef.current) {
      sceneRef.current.remove(userMarkerRef.current);
      userMarkerRef.current.geometry.dispose();
      userMarkerRef.current = null;
    }

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
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x0a0014, 1);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const earthGeometry = new THREE.SphereGeometry(5, 48, 48);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x112244,
      transparent: false,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    for (let lat = -60; lat <= 60; lat += 30) {
      scene.add(createLatitudeLine(lat, 5.02));
    }

    for (let lng = 0; lng < 180; lng += 30) {
      scene.add(createLongitudeLine(lng, 5.02));
    }

    scene.add(createLatitudeLine(0, 5.03, 0x66aaff));

    const poiGroup = new THREE.Group();
    poiGroup.name = 'poiGroup';
    scene.add(poiGroup);
    poiGroupRef.current = poiGroup;

    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  const getLabelColor = (poi: ScoredPOI): string => {
    if (poi.isHorizon) return LABEL_COLORS.horizon;
    if (poi.isAntipodal) return LABEL_COLORS.antipodal;
    return LABEL_COLORS[poi.type] || '#ffffff';
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />

      {/* Labels overlay */}
      <View style={styles.labelsContainer} pointerEvents="none">
        {labelPositions
          .filter(lp => lp.visible && lp.x > 0 && lp.x < SCREEN_WIDTH && lp.y > 0 && lp.y < SCREEN_HEIGHT)
          .map(lp => (
            <View
              key={lp.poi.id}
              style={[
                styles.labelWrapper,
                { left: lp.x, top: lp.y }
              ]}
            >
              <Text style={[styles.labelName, { color: getLabelColor(lp.poi) }]}>
                {lp.poi.name}
              </Text>
              <Text style={styles.labelDistance}>
                {formatDistance(lp.distance)}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createLatitudeLine(lat: number, radius: number, color: number = 0x4488ff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lng = 0; lng <= 360; lng += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
  return new THREE.Line(geometry, material);
}

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
  labelsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  labelWrapper: {
    position: 'absolute',
    transform: [{ translateX: 10 }, { translateY: -10 }],
  },
  labelName: {
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  labelDistance: {
    fontSize: 10,
    color: '#aaaaaa',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
