import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [timestamp, setTimestamp] = React.useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Update timestamp every second
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.Text style={[styles.title, { transform: [{ scale: pulseAnim }] }]}>
        X-ray Earth
      </Animated.Text>
      <Text style={styles.subtitle}>See through the planet</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
      <Text style={styles.status}>Expo Go deployment test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4488ff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 40,
  },
  timestamp: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: '#4a4',
    position: 'absolute',
    bottom: 50,
  },
});
