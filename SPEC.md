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
  "react-native": "0.73.0"
}
```

### Native APIs Required
- **DeviceMotion API**: High-frequency orientation tracking (60Hz+)
- **Gyroscope**: Rotation rate measurement
- **Magnetometer**: Compass heading
- **Location Services**: GPS coordinates
- **OpenGL ES**: Via expo-gl for 3D rendering

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
- **No manual input required** - the app works entirely through device orientation

**Location Permission Flow**:
```javascript
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
  const location = await Location.getCurrentPositionAsync({});
}
```

#### 4. Built-in City & POI Database

**Overview**: The app includes a pre-loaded database of 150 cities and points of interest. No user input is required - cities are automatically displayed based on the user's current view direction and location.

**Database Contents**:
- **100 major world cities** (by population and global significance)
- **50 notable points of interest** (landmarks, natural wonders, etc.)

**Data Structure - City/POI Entry**:
```javascript
{
  id: "tokyo",
  name: "Tokyo",
  country: "Japan",
  type: "city",           // 'city' | 'landmark' | 'natural'
  population: 37400068,   // null for non-cities
  lat: 35.6762,
  lng: 139.6503
}
```

**Sample Database Entries**:
```javascript
export const WORLD_DATABASE = [
  // Major cities
  { id: "tokyo", name: "Tokyo", country: "Japan", type: "city", population: 37400068, lat: 35.6762, lng: 139.6503 },
  { id: "delhi", name: "Delhi", country: "India", type: "city", population: 28514000, lat: 28.7041, lng: 77.1025 },
  { id: "shanghai", name: "Shanghai", country: "China", type: "city", population: 25582000, lat: 31.2304, lng: 121.4737 },
  { id: "sao_paulo", name: "São Paulo", country: "Brazil", type: "city", population: 21650000, lat: -23.5505, lng: -46.6333 },
  { id: "mexico_city", name: "Mexico City", country: "Mexico", type: "city", population: 21581000, lat: 19.4326, lng: -99.1332 },
  { id: "cairo", name: "Cairo", country: "Egypt", type: "city", population: 20076000, lat: 30.0444, lng: 31.2357 },
  { id: "mumbai", name: "Mumbai", country: "India", type: "city", population: 19980000, lat: 19.0760, lng: 72.8777 },
  { id: "beijing", name: "Beijing", country: "China", type: "city", population: 19618000, lat: 39.9042, lng: 116.4074 },
  { id: "dhaka", name: "Dhaka", country: "Bangladesh", type: "city", population: 19578000, lat: 23.8103, lng: 90.4125 },
  { id: "osaka", name: "Osaka", country: "Japan", type: "city", population: 19281000, lat: 34.6937, lng: 135.5023 },
  { id: "new_york", name: "New York", country: "United States", type: "city", population: 18819000, lat: 40.7128, lng: -74.0060 },
  { id: "karachi", name: "Karachi", country: "Pakistan", type: "city", population: 15400000, lat: 24.8607, lng: 67.0011 },
  { id: "buenos_aires", name: "Buenos Aires", country: "Argentina", type: "city", population: 14967000, lat: -34.6037, lng: -58.3816 },
  { id: "istanbul", name: "Istanbul", country: "Turkey", type: "city", population: 14751000, lat: 41.0082, lng: 28.9784 },
  { id: "kolkata", name: "Kolkata", country: "India", type: "city", population: 14681000, lat: 22.5726, lng: 88.3639 },
  // ... additional cities and POIs

  // Notable landmarks/POIs
  { id: "great_wall", name: "Great Wall", country: "China", type: "landmark", population: null, lat: 40.4319, lng: 116.5704 },
  { id: "machu_picchu", name: "Machu Picchu", country: "Peru", type: "landmark", population: null, lat: -13.1631, lng: -72.5450 },
  { id: "grand_canyon", name: "Grand Canyon", country: "United States", type: "natural", population: null, lat: 36.0544, lng: -112.1401 },
  { id: "mount_everest", name: "Mount Everest", country: "Nepal", type: "natural", population: null, lat: 27.9881, lng: 86.9250 },
  { id: "eiffel_tower", name: "Eiffel Tower", country: "France", type: "landmark", population: null, lat: 48.8584, lng: 2.2945 },
];
```

#### 5. Visibility Algorithm

**Overview**: The app automatically determines which cities and POIs to display based on the user's location and current view direction. The algorithm prioritizes showing interesting content without cluttering the screen.

**Display Constraints**:
- Maximum **15 labels visible** at any time to prevent clutter
- Labels fade in/out smoothly as the view changes
- Minimum angular separation of **10 degrees** between labels to prevent overlap

**Scoring Algorithm**:
Each city/POI receives a visibility score based on two main factors:

1. **Horizon Proximity Score** (for nearby cities):
   - Cities within 500km get high priority
   - Score = `1 - (distance / 500)` for cities under 500km
   - These represent "what's on the horizon" when looking sideways

2. **Antipodal Interest Score** (for distant large cities):
   - Cities on the opposite side of the globe (>10,000km away)
   - Score weighted by population: `log10(population) / 8`
   - These represent "what you're looking through the Earth at"

**Combined Scoring Formula**:
```javascript
function calculateVisibilityScore(poi, userLocation, viewDirection) {
  const distance = calculateDistance(userLocation, poi);
  const angularDistance = calculateAngularDistance(viewDirection, poi);

  // Base score from distance categories
  let score = 0;

  // Horizon cities (close, within 500km)
  if (distance < 500) {
    score += (1 - distance / 500) * 50;  // Up to 50 points for proximity
  }

  // Antipodal cities (far, over 10,000km - "through the Earth")
  if (distance > 10000) {
    const antipodeFactor = (distance - 10000) / 10000;  // 0-1 scale
    const populationFactor = poi.population ? Math.log10(poi.population) / 8 : 0.3;
    score += antipodeFactor * populationFactor * 100;  // Up to 100 points for large antipodal cities
  }

  // Boost for being in current view direction (within 60° of center)
  if (angularDistance < 60) {
    score *= 1 + (1 - angularDistance / 60);  // Up to 2x multiplier
  }

  // Penalty for being outside view (behind user)
  if (angularDistance > 90) {
    score *= 0.1;
  }

  return score;
}
```

**Visibility Selection Process**:
```javascript
function selectVisiblePOIs(allPOIs, userLocation, viewDirection, maxVisible = 15) {
  // Score all POIs
  const scored = allPOIs.map(poi => ({
    ...poi,
    score: calculateVisibilityScore(poi, userLocation, viewDirection),
    distance: calculateDistance(userLocation, poi)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Select top POIs while respecting minimum angular separation
  const selected = [];
  for (const poi of scored) {
    if (selected.length >= maxVisible) break;

    // Check angular separation from already selected POIs
    const tooClose = selected.some(s =>
      calculateAngularSeparation(poi, s) < 10
    );

    if (!tooClose && poi.score > 0) {
      selected.push(poi);
    }
  }

  return selected;
}
```

**Visual Representation**:
- **Horizon cities** (close): Appear at edge of Earth sphere with subtle glow
- **Antipodal cities** (far): Appear "through" the translucent Earth, slightly dimmer
- **Label sizing**: Larger labels for higher-scored POIs
- **Distance indicator**: Small text showing km from user

#### 6. POI Rendering
- Display cities and landmarks as visible points on Earth
- Render POIs as 3D spheres slightly outside Earth surface
- Show names as floating labels (Text sprites or native overlays)
- Labels include distance from user in km
- Efficient rendering for up to 15 visible POIs at once
- Smooth fade transitions when POIs enter/exit visibility

## User Interface Requirements

### Visual Design
- **Background/Space**: Dark purple-black (#0a0014) to clearly distinguish from Earth
- **Earth**: Solid dark blue (#112244) with grid lines
- **Horizon View**: When phone is held upright in front of user, the horizon should be visible at eye level
- **Camera Position**: User is positioned on Earth's surface at their GPS location, looking outward
- **Landmarks**: Colored spheres (yellow=nearby, magenta=antipodal, orange=cities, red=landmarks, green=natural)
- **User Location**: Cyan marker
- **Labels**: White text with dark semi-transparent background
- **UI Elements**: Native iOS/Android design patterns
- **Status Bar**: Hidden for immersive experience

### Component Structure
```
App.js
├── SafeAreaView (handles notches/safe areas)
├── StatusBar (hidden or translucent)
├── PermissionGate (location/sensor permissions)
├── EarthScene (main 3D view)
│   └── GLView (expo-gl OpenGL surface)
└── OverlayUI
    ├── POILabels (dynamically positioned city/landmark labels)
    ├── DebugInfo (orientation values, optional)
    └── Instructions (usage guide - minimal, dismiss on first interaction)
```

### Interaction Model
- **Primary**: Physical device movement (tilt, rotate, compass) - **this is the only required input**
- **Touch**:
  - Tap to dismiss info panels or instructions
  - Tap on POI label to see additional details (optional enhancement)
- **Gestures**: Pinch-to-zoom for camera control
- **Haptics**: Subtle feedback when pointing at landmarks

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
│   │   └── POILabel.js             # Individual POI/city labels
│   ├── hooks/
│   │   ├── useOrientation.js       # Device orientation hook
│   │   ├── useLocation.js          # GPS location hook
│   │   ├── useThreeScene.js        # Three.js scene management
│   │   └── useVisiblePOIs.js       # POI visibility algorithm hook
│   ├── utils/
│   │   ├── coordinates.js          # Lat/lng conversions
│   │   ├── distance.js             # Haversine calculations
│   │   ├── earthRotation.js        # Rotation math
│   │   └── visibility.js           # POI visibility scoring algorithm
│   ├── constants/
│   │   ├── worldDatabase.js        # 150 cities + POIs database
│   │   └── config.js               # App configuration
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

#### useVisiblePOIs.js (Visibility Algorithm Hook)
```javascript
import { useMemo } from 'react';
import { WORLD_DATABASE } from '../constants/worldDatabase';
import { calculateDistance, calculateAngularDistance, calculateAngularSeparation } from '../utils/distance';

const MAX_VISIBLE = 15;
const MIN_ANGULAR_SEPARATION = 10; // degrees

function calculateVisibilityScore(poi, userLocation, viewDirection) {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
  const angularDistance = calculateAngularDistance(viewDirection, poi);

  let score = 0;

  // Horizon cities (close, within 500km)
  if (distance < 500) {
    score += (1 - distance / 500) * 50;
  }

  // Antipodal cities (far, over 10,000km - "through the Earth")
  if (distance > 10000) {
    const antipodeFactor = Math.min((distance - 10000) / 10000, 1);
    const populationFactor = poi.population ? Math.log10(poi.population) / 8 : 0.3;
    score += antipodeFactor * populationFactor * 100;
  }

  // Boost for being in current view direction (within 60° of center)
  if (angularDistance < 60) {
    score *= 1 + (1 - angularDistance / 60);
  }

  // Penalty for being outside view (behind user)
  if (angularDistance > 90) {
    score *= 0.1;
  }

  return score;
}

export function useVisiblePOIs(userLocation, viewDirection) {
  return useMemo(() => {
    if (!userLocation) return [];

    // Score all POIs
    const scored = WORLD_DATABASE.map(poi => ({
      ...poi,
      score: calculateVisibilityScore(poi, userLocation, viewDirection),
      distance: calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Select top POIs while respecting minimum angular separation
    const selected = [];
    for (const poi of scored) {
      if (selected.length >= MAX_VISIBLE) break;

      const tooClose = selected.some(s =>
        calculateAngularSeparation(poi, s) < MIN_ANGULAR_SEPARATION
      );

      if (!tooClose && poi.score > 0) {
        selected.push(poi);
      }
    }

    return selected;
  }, [userLocation, viewDirection]);
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
- ✅ Built-in database of 150 cities and POIs loads correctly
- ✅ Visibility algorithm correctly prioritizes horizon and antipodal cities
- ✅ Maximum 15 labels displayed with proper separation
- ✅ Automatic GPS location detection works correctly
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
