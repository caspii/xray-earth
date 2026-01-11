import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from './src/hooks/useOrientation';
import { useLocation } from './src/hooks/useLocation';
import { useVisiblePOIs } from './src/hooks/useVisiblePOIs';
import { EarthScene } from './src/components/EarthScene';

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export default function App() {
  const { orientation, available: orientationAvailable } = useOrientation();
  const { location, loading: locationLoading } = useLocation();
  const visiblePOIs = useVisiblePOIs(location, orientation);

  if (orientationAvailable === false) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Motion sensors not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />

      {/* 3D Earth Scene */}
      <EarthScene orientation={orientation} userLocation={location} visiblePOIs={visiblePOIs} />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>
            Yaw: {radToDeg(orientation.alpha).toFixed(0)}°
          </Text>
          <Text style={styles.debugText}>
            Pitch: {radToDeg(orientation.beta).toFixed(0)}°
          </Text>
          <Text style={styles.debugText}>
            Roll: {radToDeg(orientation.gamma).toFixed(0)}°
          </Text>
          {location && !locationLoading && (
            <Text style={styles.debugText}>
              {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
            </Text>
          )}
          <Text style={styles.debugText}>
            POIs: {visiblePOIs.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#f66',
    fontSize: 18,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  debugPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
