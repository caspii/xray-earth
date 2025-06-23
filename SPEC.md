# X-ray Earth App Specification

## Overview
X-ray Earth is a mobile web application that provides users with a "see-through" view of the planet, showing the direct line of sight to major landmarks around the world. The app responds in real-time to device orientation, allowing users to point their phone in any direction and visualize what lies on the other side of the Earth.

## Core Concept
The application displays a semi-transparent 3D Earth globe that rotates based on the user's phone orientation. Major landmarks are plotted as visible points on the sphere, creating an "X-ray vision" effect where users can see through the planet to distant locations.

## Technical Requirements

### Platform
- **Primary Target**: Mobile web browsers (iOS Safari, Android Chrome)
- **Secondary Target**: Desktop browsers for development/testing
- **Implementation**: Single HTML file with embedded JavaScript
- **No App Store**: Web-based for easy distribution and updates

### Core Technologies
- **3D Rendering**: Three.js (WebGL)
- **Device Orientation**: Device Orientation API
- **Geolocation**: HTML5 Geolocation API
- **Responsive Design**: CSS viewport units and media queries

### Browser APIs Required
- `DeviceOrientationEvent` for real-time orientation tracking
- `navigator.geolocation` for user positioning
- `WebGL` support for 3D rendering
- `requestAnimationFrame` for smooth animations

## Functional Requirements

### Core Features

#### 1. 3D Earth Visualization
- Semi-transparent blue sphere representing Earth
- Smooth rotation based on device orientation
- Real-time response to phone movement (compass, tilt, roll)
- Proper scaling for mobile screens

#### 2. Device Orientation Integration
- **Compass Tracking**: Alpha rotation (Z-axis) for directional pointing
- **Tilt Response**: Beta rotation (X-axis) for front/back tilt
- **Roll Response**: Gamma rotation (Y-axis) for left/right roll
- **iOS Permission**: Handle DeviceOrientationEvent.requestPermission() for iOS 13+
- **Fallback**: Graceful degradation when orientation unavailable

#### 3. User Location Awareness
- Automatically detect user's GPS coordinates
- Position Earth sphere relative to user's location
- Handle location permission requests
- Fallback to default location (0,0) if denied

#### 4. Landmark System
- Display major world landmarks as visible points on Earth
- Show landmark names as floating labels
- Calculate and optionally display distances from user
- Support for easy addition/removal of landmarks

### Landmark Data Structure
```javascript
{
  name: "City Name",
  lat: decimal_latitude,
  lng: decimal_longitude
}
```

### Initial Landmark Set
- New York (40.7128, -74.0060)
- London (51.5074, -0.1278)
- Tokyo (35.6762, 139.6503)
- Sydney (-33.8688, 151.2093)
- Rio de Janeiro (-22.9068, -43.1729)
- Dubai (25.2048, 55.2708)

## User Interface Requirements

### Visual Design
- **Background**: Black space-like background
- **Earth**: Semi-transparent blue sphere (opacity ~0.3)
- **Landmarks**: Bright red dots slightly outside Earth surface
- **Labels**: White text on transparent dark background
- **Clean Interface**: Minimal UI elements, focus on 3D experience

### Information Display
- Current device orientation values (debug info)
- User location coordinates
- Basic usage instructions
- Permission request prompts

### Interaction Model
- **Primary Interaction**: Physical device movement
- **Tap Interaction**: Request orientation permissions
- **No Complex UI**: Avoid buttons/menus that interfere with orientation tracking

## Performance Requirements

### Rendering Performance
- Maintain 30+ FPS on modern mobile devices
- Efficient WebGL rendering with optimized geometry
- Smooth orientation updates without lag
- Minimal battery impact

### Loading Performance
- Single file delivery (no external dependencies except Three.js CDN)
- Fast initial load (under 3 seconds on 3G)
- Immediate orientation response after permissions granted

## Mathematical Requirements

### Coordinate Conversions
- Convert latitude/longitude to 3D Cartesian coordinates
- Spherical coordinate system for landmark positioning
- Great circle distance calculations between points

### Distance Calculation Formula
```
Haversine formula for great circle distance:
R = Earth's radius (6371 km)
dLat = (lat2-lat1) * π/180
dLng = (lng2-lng1) * π/180
a = sin²(dLat/2) + cos(lat1)*cos(lat2)*sin²(dLng/2)
c = 2*atan2(√a, √(1-a))
distance = R * c
```

## Technical Implementation Details

### Device Orientation Handling
```javascript
// iOS permission request pattern
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        // Enable orientation tracking
      }
    });
}
```

### Earth Positioning Logic
- Rotate Earth so user's location faces camera initially
- Apply device orientation rotations to camera, not Earth
- Maintain landmark positions relative to Earth surface

### Responsive Design
- Full viewport usage (100vw x 100vh)
- Fixed positioning for UI elements
- Appropriate font scaling for mobile devices

## Error Handling Requirements

### Permission Failures
- Graceful fallback when location denied
- Clear messaging for orientation permission requirements
- Continue functionality with limited features

### Browser Compatibility
- Feature detection for required APIs
- Fallback messages for unsupported browsers
- Progressive enhancement approach

### Network Issues
- Handle Three.js CDN loading failures
- Offline functionality once loaded
- Clear error messages for critical failures

## Future Enhancement Considerations

### Potential Features (Not Required for MVP)
- Distance display on landmarks
- Custom landmark addition
- Terrain elevation data
- Night/day terminator line
- Satellite imagery textures
- Sound effects for immersion
- Sharing/screenshot functionality

### Scalability Considerations
- Efficient landmark data structure for larger datasets
- Level-of-detail rendering for performance
- Configurable landmark sets
- Analytics integration points

## Development Notes

### File Structure
```
index.html
├── HTML structure
├── CSS styles (embedded)
├── JavaScript logic (embedded)
└── Three.js import (CDN)
```

### Key Functions Required
- `init()` - Initialize Three.js scene
- `setupOrientation()` - Configure device tracking
- `handleOrientation(event)` - Process orientation changes
- `getUserLocation()` - Handle geolocation
- `addLandmarks()` - Create landmark visualizations
- `calculateDistance()` - Compute great circle distances
- `animate()` - Render loop

### Testing Requirements
- Test on iOS Safari (iPhone)
- Test on Android Chrome
- Verify orientation permissions work
- Test with location services disabled
- Performance testing on older devices

This specification provides a complete blueprint for implementing the X-ray Earth application as a mobile-optimized web experience.
