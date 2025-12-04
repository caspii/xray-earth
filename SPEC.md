# X-ray Earth App Specification - React Native

## Overview
X-ray Earth is a native mobile application built with React Native and Expo that provides users with a "see-through" view of the planet. The app responds in real-time to device orientation with native-quality performance, allowing users to point their phone in any direction and visualize what lies on the other side of the Earth.

## Core Concept
The application displays a semi-transparent 3D Earth globe rendered using Three.js that rotates based on the user's phone orientation. Major landmarks are plotted as visible points on the sphere, creating an "X-ray vision" effect where users can see through the planet to distant locations.

## Technical Requirements

### Platform
- **Framework**: React Native with Expo (SDK 50+)
- **Target Platforms**: iOS 13+ and Android 8.0+ (API 26+)
- **Primary Distribution**: App Store and Google Play
- **Development**: Cross-platform from single JavaScript/TypeScript codebase

### Core Technologies
- **React Native**: v0.73+
- **Expo SDK**: v50+
- **3D Rendering**: Three.js via `expo-gl` and `expo-three`
- **Sensors**: `expo-sensors` for device orientation and motion
- **Location**: `expo-location` for GPS positioning
- **Local Storage**: `@react-native-async-storage/async-storage` for persisting user location preferences
- **State Management**: React Context API / Zustand (optional)

### Required Expo Packages
```json
{
  "expo": "~50.0.0",
  "expo-gl": "~14.0.0",
  "expo-three": "~7.0.0",
  "expo-sensors": "~13.0.0",
  "expo-location": "~17.0.0",
  "three": "^0.160.0",
  "react-native": "0.73.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

### Native APIs Required
- **DeviceMotion API**: High-frequency orientation tracking (60Hz+)
- **Gyroscope**: Rotation rate measurement
- **Magnetometer**: Compass heading
- **Location Services**: GPS coordinates
- **OpenGL ES**: Via expo-gl for 3D rendering
- **AsyncStorage**: Local key-value storage for persisting user preferences

## Functional Requirements

### Core Features

#### 1. 3D Earth Visualization
- Semi-transparent blue sphere representing Earth
- Smooth 60 FPS rotation based on device orientation
- Real-time response to phone movement (yaw, pitch, roll)
- Optimized for mobile GPUs
- Proper aspect ratio handling for all screen sizes

**Technical Implementation**:
- Use `expo-gl` GLView component
- Initialize Three.js scene with WebGL renderer
- Earth geometry: SphereGeometry with 64 segments
- Material: MeshBasicMaterial with transparency (opacity: 0.3)
- Camera: PerspectiveCamera with appropriate FOV

#### 2. Device Orientation Integration
- **Native Sensor Fusion**: Use `expo-sensors` DeviceMotion API
- **Yaw (Compass)**: Alpha rotation for directional pointing
- **Pitch (Tilt)**: Beta rotation for forward/back tilt
- **Roll**: Gamma rotation for left/right roll
- **Update Frequency**: 60Hz+ for smooth tracking
- **Sensor Calibration**: Handle magnetic declination

**Permission Handling**:
- iOS: Automatically request motion permissions on first use
- Android: Sensors generally available without explicit permission
- Graceful fallback if sensors unavailable

#### 3. User Location Awareness
- Automatically detect user's GPS coordinates using `expo-location`
- Request location permissions on app launch
- Position Earth sphere relative to user's location
- Handle permission denied gracefully (default to 0,0)
- Support foreground location access only

**Location Permission Flow**:
```javascript
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
  const location = await Location.getCurrentPositionAsync({});
}
```

#### 4. City Selection and Manual Coordinate Entry

**Overview**: Users can set their viewing position by selecting from a list of the world's 100 most populated cities or by manually entering latitude/longitude coordinates. This position is stored locally and persists across app sessions.

**City Selection Features**:
- Searchable list of 100 most populated cities worldwide
- Fast fuzzy search/filter by city name
- Display city name, country, and population
- Alphabetically sorted with search ranking
- Tap to select and set as current location
- Visual confirmation when city is selected

**Manual Coordinate Entry Features**:
- Input fields for latitude (-90 to 90) and longitude (-180 to 180)
- Real-time validation of coordinate ranges
- Format support: Decimal degrees (e.g., 40.7128, -74.0060)
- Clear error messaging for invalid inputs
- "Set Location" button to confirm and apply coordinates

**Local Storage Implementation**:
- Use `@react-native-async-storage/async-storage` for persistence
- Store selected city or manual coordinates
- Store last updated timestamp
- Load saved location on app startup
- Fallback to GPS location if no saved position exists

**Data Structure - City Database**:
```javascript
{
  id: "nyc",
  name: "New York City",
  country: "United States",
  population: 8336817,
  lat: 40.7128,
  lng: -74.0060,
  timezone: "America/New_York"
}
```

**Storage Keys**:
```javascript
const STORAGE_KEYS = {
  LOCATION_TYPE: '@xray_earth:location_type',    // 'gps' | 'city' | 'manual'
  SELECTED_CITY: '@xray_earth:selected_city',    // City object
  MANUAL_COORDS: '@xray_earth:manual_coords',    // { lat, lng }
  LAST_UPDATED: '@xray_earth:last_updated'       // ISO timestamp
};
```

**AsyncStorage Operations**:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save city selection
async function saveCity(city) {
  await AsyncStorage.multiSet([
    ['@xray_earth:location_type', 'city'],
    ['@xray_earth:selected_city', JSON.stringify(city)],
    ['@xray_earth:last_updated', new Date().toISOString()]
  ]);
}

// Save manual coordinates
async function saveManualCoords(lat, lng) {
  await AsyncStorage.multiSet([
    ['@xray_earth:location_type', 'manual'],
    ['@xray_earth:manual_coords', JSON.stringify({ lat, lng })],
    ['@xray_earth:last_updated', new Date().toISOString()]
  ]);
}

// Load saved location
async function loadSavedLocation() {
  const locationType = await AsyncStorage.getItem('@xray_earth:location_type');

  if (locationType === 'city') {
    const cityData = await AsyncStorage.getItem('@xray_earth:selected_city');
    return JSON.parse(cityData);
  } else if (locationType === 'manual') {
    const coordsData = await AsyncStorage.getItem('@xray_earth:manual_coords');
    return JSON.parse(coordsData);
  }

  return null; // Use GPS
}
```

**UI Components Required**:
1. **LocationSettingsModal**: Main modal for location selection
   - Tab 1: City Search
   - Tab 2: Manual Entry
   - Tab 3: Use GPS (current location)

2. **CitySearchList**: Searchable FlatList with 100 cities
   - Search input at top
   - Filtered, sorted list items
   - City name, country, population display
   - Selection indicator

3. **ManualCoordinateForm**: Coordinate entry form
   - Latitude TextInput with validation
   - Longitude TextInput with validation
   - Validate button
   - Error/success feedback

4. **LocationIndicator**: Current location display
   - Shows active location source (GPS/City/Manual)
   - Tap to open LocationSettingsModal
   - Display coordinates and city name if applicable

**Top 100 Most Populated Cities** (Sample):
```javascript
export const TOP_CITIES = [
  { id: "tokyo", name: "Tokyo", country: "Japan", population: 37400068, lat: 35.6762, lng: 139.6503 },
  { id: "delhi", name: "Delhi", country: "India", population: 28514000, lat: 28.7041, lng: 77.1025 },
  { id: "shanghai", name: "Shanghai", country: "China", population: 25582000, lat: 31.2304, lng: 121.4737 },
  { id: "sao_paulo", name: "São Paulo", country: "Brazil", population: 21650000, lat: -23.5505, lng: -46.6333 },
  { id: "mexico_city", name: "Mexico City", country: "Mexico", population: 21581000, lat: 19.4326, lng: -99.1332 },
  // ... 95 more cities
];
```

**Search Implementation**:
```javascript
function searchCities(query, cities) {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return cities;

  return cities
    .filter(city =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => {
      // Prioritize matches at start of name
      const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then by population
      return b.population - a.population;
    });
}
```

**Coordinate Validation**:
```javascript
function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Coordinates must be numbers' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true, lat: latitude, lng: longitude };
}
```

**Location Priority Logic**:
1. Check for saved location in AsyncStorage
2. If saved location exists, use it
3. If no saved location, request GPS permission
4. If GPS granted, use current GPS location
5. If GPS denied, default to (0, 0) or prompt user to select city

#### 5. Landmark System
- Display major world landmarks as visible points on Earth
- Render landmarks as 3D spheres slightly outside Earth surface
- Show landmark names as floating labels (Text sprites or native overlays)
- Calculate great circle distances from user
- Support for dynamic landmark loading
- Efficient rendering for 50+ landmarks

### Landmark Data Structure
```typescript
interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  icon?: string;
}
```

### Initial Landmark Set
- New York City (40.7128, -74.0060)
- London (51.5074, -0.1278)
- Tokyo (35.6762, 139.6503)
- Sydney (-33.8688, 151.2093)
- Rio de Janeiro (-22.9068, -43.1729)
- Dubai (25.2048, 55.2708)
- Paris (48.8566, 2.3522)
- Cairo (30.0444, 31.2357)
- Mumbai (19.0760, 72.8777)
- Mexico City (19.4326, -99.1332)

## User Interface Requirements

### Visual Design
- **Background**: Black space-like gradient
- **Earth**: Semi-transparent blue sphere (opacity: 0.3)
- **Landmarks**: Bright red/orange glowing spheres
- **Labels**: White text with dark semi-transparent background
- **UI Elements**: Native iOS/Android design patterns
- **Status Bar**: Translucent/hidden for immersive experience

### Component Structure
```
App.js
├── SafeAreaView (handles notches/safe areas)
├── StatusBar (hidden or translucent)
├── PermissionGate (location/sensor permissions)
├── LocationSettingsModal (city selection / manual entry / GPS)
│   ├── CitySearchList (searchable city list)
│   ├── ManualCoordinateForm (lat/lng entry)
│   └── Tab Navigation (city/manual/GPS tabs)
├── EarthScene (main 3D view)
│   └── GLView (expo-gl OpenGL surface)
└── OverlayUI
    ├── LocationIndicator (current location button - opens modal)
    ├── DebugInfo (orientation values, optional)
    └── Instructions (usage guide)
```

### Interaction Model
- **Primary**: Physical device movement (tilt, rotate, compass)
- **Touch**:
  - Tap LocationIndicator to open location settings modal
  - Tap city from list to select
  - Tap to dismiss overlays or info panels
- **Gestures**: Optional pinch-to-zoom for camera control
- **Text Input**: Manual coordinate entry via keyboard
- **Haptics**: Subtle feedback when pointing at landmarks or selecting location

### Performance Requirements

#### Rendering Performance
- **Frame Rate**: Maintain 60 FPS minimum
- **Sensor Latency**: < 16ms orientation update delay
- **Battery Impact**: Optimize to < 5% drain per 10 minutes
- **Memory**: Keep under 150MB RAM usage
- **GPU**: Efficient use of mobile GPU, avoid overdraw

#### Loading Performance
- **Cold Start**: App launch to interactive < 3 seconds
- **Scene Initialization**: Three.js setup < 1 second
- **Orientation Active**: Immediate response after permissions

### Optimization Strategies
- Use `requestAnimationFrame` for render loop
- Debounce/throttle sensor updates if needed
- Lazy load landmarks outside viewport
- Use geometry instancing for multiple landmarks
- Minimize draw calls

## Mathematical Requirements

### Coordinate Conversions
Convert latitude/longitude to 3D Cartesian coordinates for Three.js:

```javascript
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
```

### Distance Calculation (Haversine Formula)
```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

## Architecture & File Structure

### Project Organization
```
xray-earth/
├── App.js                          # Root component
├── app.json                        # Expo configuration
├── package.json
├── babel.config.js
├── src/
│   ├── components/
│   │   ├── EarthScene.js           # Main 3D scene component
│   │   ├── PermissionGate.js       # Permission request UI
│   │   ├── OverlayUI.js            # On-screen info display
│   │   ├── LandmarkLabel.js        # Individual landmark labels
│   │   ├── LocationSettingsModal.js # City/manual coord selection modal
│   │   ├── CitySearchList.js       # Searchable city list
│   │   ├── ManualCoordinateForm.js # Manual lat/lng entry form
│   │   └── LocationIndicator.js    # Current location display button
│   ├── hooks/
│   │   ├── useOrientation.js       # Device orientation hook
│   │   ├── useLocation.js          # GPS & saved location hook
│   │   ├── useThreeScene.js        # Three.js scene management
│   │   └── useStorage.js           # AsyncStorage operations
│   ├── utils/
│   │   ├── coordinates.js          # Lat/lng conversions
│   │   ├── distance.js             # Haversine calculations
│   │   ├── earthRotation.js        # Rotation math
│   │   ├── storage.js              # AsyncStorage helpers
│   │   └── validation.js           # Coordinate validation
│   ├── constants/
│   │   ├── landmarks.js            # Landmark data
│   │   ├── cities.js               # Top 100 cities database
│   │   ├── storageKeys.js          # AsyncStorage key definitions
│   │   └── config.js               # App configuration
│   ├── data/
│   │   └── top100cities.json       # Full city database (optional JSON file)
│   └── contexts/
│       └── AppContext.js           # Global state (optional)
└── assets/
    ├── icon.png                    # App icon
    ├── splash.png                  # Splash screen
    └── adaptive-icon.png           # Android adaptive icon
```

### Key Components

#### EarthScene.js
```javascript
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as Three from 'three';

export default function EarthScene({ orientation, location }) {
  const onContextCreate = async (gl) => {
    // Initialize Three.js renderer
    const renderer = new Renderer({ gl });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, ...);

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.3
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add landmarks
    addLandmarks(scene);

    // Render loop
    const render = () => {
      requestAnimationFrame(render);
      applyOrientation(camera, orientation);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}
```

#### useOrientation.js
```javascript
import { useEffect, useState } from 'react';
import { DeviceMotion } from 'expo-sensors';

export function useOrientation() {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16); // ~60Hz

    const subscription = DeviceMotion.addListener((data) => {
      setOrientation({
        alpha: data.rotation.alpha,
        beta: data.rotation.beta,
        gamma: data.rotation.gamma
      });
    });

    return () => subscription.remove();
  }, []);

  return orientation;
}
```

#### LocationSettingsModal.js
```javascript
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CitySearchList from './CitySearchList';
import ManualCoordinateForm from './ManualCoordinateForm';

export default function LocationSettingsModal({ visible, onClose, onLocationSelect }) {
  const [activeTab, setActiveTab] = useState('city'); // 'city' | 'manual' | 'gps'

  const handleCitySelect = (city) => {
    onLocationSelect({ type: 'city', data: city });
    onClose();
  };

  const handleManualSubmit = (lat, lng) => {
    onLocationSelect({ type: 'manual', data: { lat, lng } });
    onClose();
  };

  const handleUseGPS = () => {
    onLocationSelect({ type: 'gps', data: null });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Your Location</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'city' && styles.activeTab]}
            onPress={() => setActiveTab('city')}
          >
            <Text>Select City</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
            onPress={() => setActiveTab('manual')}
          >
            <Text>Manual Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gps' && styles.activeTab]}
            onPress={() => setActiveTab('gps')}
          >
            <Text>Use GPS</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'city' && (
          <CitySearchList onSelectCity={handleCitySelect} />
        )}

        {activeTab === 'manual' && (
          <ManualCoordinateForm onSubmit={handleManualSubmit} />
        )}

        {activeTab === 'gps' && (
          <View style={styles.gpsTab}>
            <Text style={styles.gpsText}>Use your device's GPS location</Text>
            <TouchableOpacity style={styles.gpsButton} onPress={handleUseGPS}>
              <Text style={styles.gpsButtonText}>Use Current Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { fontSize: 24 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  gpsTab: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  gpsText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  gpsButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10 },
  gpsButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
```

#### CitySearchList.js
```javascript
import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TOP_CITIES } from '../constants/cities';

export default function CitySearchList({ onSelectCity }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return TOP_CITIES;

    const lowerQuery = searchQuery.toLowerCase();
    return TOP_CITIES
      .filter(city =>
        city.name.toLowerCase().includes(lowerQuery) ||
        city.country.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return b.population - a.population;
      });
  }, [searchQuery]);

  const renderCity = ({ item }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => onSelectCity(item)}
    >
      <Text style={styles.cityName}>{item.name}</Text>
      <Text style={styles.cityCountry}>{item.country}</Text>
      <Text style={styles.cityCoords}>
        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search cities..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
      />
      <FlatList
        data={filteredCities}
        renderItem={renderCity}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchInput: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 16
  },
  list: { flex: 1 },
  cityItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cityName: { fontSize: 16, fontWeight: 'bold' },
  cityCountry: { fontSize: 14, color: '#666', marginTop: 2 },
  cityCoords: { fontSize: 12, color: '#999', marginTop: 4 }
});
```

#### ManualCoordinateForm.js
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { validateCoordinates } from '../utils/validation';

export default function ManualCoordinateForm({ onSubmit }) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const validation = validateCoordinates(latitude, longitude);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    onSubmit(validation.lat, validation.lng);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Latitude (-90 to 90)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 40.7128"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Longitude (-180 to 180)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., -74.0060"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Set Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16
  },
  error: { color: 'red', marginTop: 10, fontSize: 14 },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
```

#### useStorage.js (Custom Hook)
```javascript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const locationType = await AsyncStorage.getItem('@xray_earth:location_type');

      if (locationType === 'city') {
        const cityData = await AsyncStorage.getItem('@xray_earth:selected_city');
        setLocation({ type: 'city', data: JSON.parse(cityData) });
      } else if (locationType === 'manual') {
        const coordsData = await AsyncStorage.getItem('@xray_earth:manual_coords');
        setLocation({ type: 'manual', data: JSON.parse(coordsData) });
      } else {
        setLocation({ type: 'gps', data: null });
      }
    } catch (error) {
      console.error('Error loading location:', error);
      setLocation({ type: 'gps', data: null });
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = async (locationType, data) => {
    try {
      if (locationType === 'city') {
        await AsyncStorage.multiSet([
          ['@xray_earth:location_type', 'city'],
          ['@xray_earth:selected_city', JSON.stringify(data)],
          ['@xray_earth:last_updated', new Date().toISOString()]
        ]);
      } else if (locationType === 'manual') {
        await AsyncStorage.multiSet([
          ['@xray_earth:location_type', 'manual'],
          ['@xray_earth:manual_coords', JSON.stringify(data)],
          ['@xray_earth:last_updated', new Date().toISOString()]
        ]);
      } else {
        await AsyncStorage.setItem('@xray_earth:location_type', 'gps');
      }

      setLocation({ type: locationType, data });
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return { location, loading, saveLocation };
}
```

## Error Handling Requirements

### Permission Failures
- Clear messaging when permissions denied
- Provide deep links to Settings app to enable permissions
- Continue with limited functionality (no location/orientation)
- Show educational UI explaining why permissions needed

### Device Compatibility
- Feature detection for required sensors
- Fallback message on devices without gyroscope/magnetometer
- Graceful degradation on low-end devices
- Handle orientation lock/unlock

### Network & Loading Issues
- Handle expo-three loading failures gracefully
- Offline functionality (app works without network)
- Asset preloading with loading screen
- Error boundaries for component crashes

## Testing Requirements

### Manual Testing
- Test on physical iOS devices (iPhone 12+)
- Test on physical Android devices (Pixel, Samsung)
- Verify orientation tracking smoothness
- Check performance on older devices (iPhone X, Pixel 3)
- Test in different lighting conditions (magnetometer)
- Verify battery usage over 30 minutes

### Automated Testing
- Unit tests for coordinate conversion functions
- Unit tests for distance calculations
- Component tests with React Native Testing Library
- Integration tests for permission flows

### Performance Testing
- FPS monitoring during active use
- Memory leak detection
- Battery drain measurement
- CPU/GPU profiling

## Build & Deployment

### Development Build
```bash
# iOS
expo run:ios

# Android
expo run:android
```

### Production Build (EAS)
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### App Store Requirements

**iOS**:
- Privacy manifest explaining sensor/location usage
- App Store screenshots showing UI
- Usage descriptions in Info.plist:
  - NSLocationWhenInUseUsageDescription
  - NSMotionUsageDescription

**Android**:
- Play Store listing with feature graphic
- Permissions in AndroidManifest.xml:
  - ACCESS_FINE_LOCATION
  - ACCESS_COARSE_LOCATION

## Future Enhancement Considerations

### Phase 2 Features
- **AR Mode**: Use expo-camera + ARKit/ARCore for augmented reality overlay
- **Custom Landmarks**: Allow users to add personal landmarks
- **Social Sharing**: Share screenshots or AR videos
- **Haptic Feedback**: Vibrate when pointing at landmarks
- **Night Mode**: Dark interface with night-time Earth rendering
- **Detailed Info**: Tap landmarks for Wikipedia/photos
- **Distance Display**: Show km to each landmark
- **Compass Rose**: Visual compass overlay

### Performance Enhancements
- Level-of-detail (LOD) for distant landmarks
- Frustum culling for off-screen landmarks
- Texture mapping for realistic Earth surface
- Cloud layer with transparency
- Atmospheric glow effect

### Advanced Features
- Real-time ISS tracking
- Earthquake visualization
- Weather overlay
- Day/night terminator line
- Satellite imagery from NASA
- Time travel (historical landmarks)

## Configuration Files

### app.json
```json
{
  "expo": {
    "name": "X-ray Earth",
    "slug": "xray-earth",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourcompany.xrayearth",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to show your position on Earth",
        "NSMotionUsageDescription": "We need motion access to track your device orientation"
      }
    },
    "android": {
      "package": "com.yourcompany.xrayearth",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

## Success Criteria

### MVP Launch Requirements
- ✅ Smooth 60 FPS rendering on iPhone 12+ and Pixel 5+
- ✅ < 16ms orientation latency
- ✅ All 10 initial landmarks visible and labeled
- ✅ City selection with searchable list of 100 cities
- ✅ Manual coordinate entry with validation
- ✅ Location preferences persist across app restarts
- ✅ Permission flows work correctly on iOS and Android
- ✅ App passes App Store and Play Store review
- ✅ No crashes during 30-minute continuous use
- ✅ Battery drain < 5% per 10 minutes

### User Experience Goals
- Feels "native" and responsive
- Intuitive without tutorial
- Impressive "wow factor" on first use
- Smooth motion tracking with no lag
- Clear, readable labels
- Professional polish

This specification provides a complete blueprint for implementing X-ray Earth as a high-performance React Native mobile application with native-quality sensor integration and 3D rendering.
