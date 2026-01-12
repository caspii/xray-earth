import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { Orientation } from '../hooks/useOrientation';
import { UserLocation } from '../hooks/useLocation';
import { ScoredPOI } from '../hooks/useVisiblePOIs';
import { formatDistance } from '../utils/coordinates';

// Earth texture asset
const earthTextureAsset = Asset.fromModule(require('../../assets/earth-2k.jpg'));

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
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const labelUpdatePending = useRef(false);

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

    // Schedule label update on next frame (batched to avoid too many re-renders)
    if (!labelUpdatePending.current && visiblePOIs.length > 0) {
      labelUpdatePending.current = true;
      requestAnimationFrame(() => {
        if (!cameraRef.current) return;

        const newLabelPositions: LabelPosition[] = visiblePOIs.map(poi => {
          const pos3D = latLngToVector3(poi.lat, poi.lng, 5.08);
          const projected = pos3D.clone().project(cameraRef.current!);

          const visible = projected.z < 1;
          const x = (projected.x + 1) / 2 * SCREEN_WIDTH;
          const y = (1 - projected.y) / 2 * SCREEN_HEIGHT;

          return { poi, x, y, visible, distance: poi.distance };
        });

        setLabelPositions(newLabelPositions);
        labelUpdatePending.current = false;
      });
    }
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
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    }

    visiblePOIs.forEach((poi) => {
      let color: number;
      let baseSize: number;

      if (poi.isHorizon) {
        color = POI_COLORS.horizon;
        baseSize = 0.12;
      } else if (poi.isAntipodal) {
        color = POI_COLORS.antipodal;
        baseSize = 0.15;
      } else if (poi.type === 'city') {
        color = POI_COLORS.city;
        const popScale = poi.population ? Math.log10(poi.population) / 8 : 0.5;
        baseSize = 0.06 + popScale * 0.08;
      } else if (poi.type === 'landmark') {
        color = POI_COLORS.landmark;
        baseSize = 0.1;
      } else {
        color = POI_COLORS.natural;
        baseSize = 0.1;
      }

      // Scale down markers that are close (they appear larger due to perspective)
      // Close POIs (< 500km) get reduced to 40-100% of base size
      // Far POIs (> 2000km) stay at full size
      const distanceFactor = Math.min(1, 0.4 + (poi.distance / 2500) * 0.6);
      const size = baseSize * distanceFactor;

      const pos = latLngToVector3(poi.lat, poi.lng, 5.08);

      // Simple clean marker with slight transparency
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
      });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.copy(pos);
      poiGroup.add(marker);
    });
  }, [visiblePOIs]);

  // Update user location marker
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clean up previous user marker
    const existingMarker = sceneRef.current.getObjectByName('userMarker');
    if (existingMarker) {
      if (existingMarker instanceof THREE.Mesh) {
        existingMarker.geometry.dispose();
        if (existingMarker.material instanceof THREE.Material) {
          existingMarker.material.dispose();
        }
      }
      sceneRef.current.remove(existingMarker);
    }

    if (userLocation) {
      const pos = latLngToVector3(userLocation.lat, userLocation.lng, 5.12);
      const geometry = new THREE.SphereGeometry(0.08, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: POI_COLORS.user,
        transparent: true,
        opacity: 0.9,
      });
      const marker = new THREE.Mesh(geometry, material);
      marker.name = 'userMarker';
      marker.position.copy(pos);
      sceneRef.current.add(marker);
    }
  }, [userLocation]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000008, 1);

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

    // Create starfield
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Random position on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 80 + Math.random() * 20;

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      // Vary star colors slightly (white to blue-white)
      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = brightness * (0.8 + Math.random() * 0.2);
      starColors[i * 3 + 1] = brightness * (0.8 + Math.random() * 0.2);
      starColors[i * 3 + 2] = brightness;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Load Earth texture
    await earthTextureAsset.downloadAsync();
    const textureLoader = new TextureLoader();
    const earthTexture = await textureLoader.loadAsync(earthTextureAsset.localUri || earthTextureAsset.uri);

    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshBasicMaterial({
      map: earthTexture,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Semi-transparent grid lines overlay
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

function createLatitudeLine(lat: number, radius: number, color: number = 0x88bbff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lng = 0; lng <= 360; lng += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
  return new THREE.Line(geometry, material);
}

function createLongitudeLine(lng: number, radius: number, color: number = 0x88bbff): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let lat = -90; lat <= 90; lat += 5) {
    points.push(latLngToVector3(lat, lng, radius));
  }
  for (let lat = 90; lat >= -90; lat -= 5) {
    points.push(latLngToVector3(lat, lng + 180, radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
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
