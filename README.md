# X-ray Earth 🌍

A native mobile app that lets you "see through" the Earth to view major landmarks on the other side of the planet. Point your phone in any direction to discover what lies beyond!

## Tech Stack

- **React Native** with **Expo** for cross-platform development
- **Three.js** (via expo-gl + expo-three) for 3D rendering
- **expo-sensors** for device orientation and motion
- **expo-location** for GPS positioning
- Native performance with smooth 60 FPS rendering

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for development)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Run on Device

**Option A: Expo Go (Fastest for Development)**
1. Install Expo Go from App Store or Google Play
2. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

**Option B: Development Build (Recommended for Production-Like Testing)**
```bash
# iOS
npm run ios

# Android
npm run android
```

**Option C: Physical Device via USB**
```bash
# iOS (requires Mac + Xcode)
expo run:ios --device

# Android
expo run:android --device
```

## Project Structure

```
xray-earth/
├── App.js                 # Main application component
├── src/
│   ├── components/
│   │   ├── EarthScene.js  # Three.js 3D Earth visualization
│   │   └── PermissionUI.js # Location/sensor permission UI
│   ├── hooks/
│   │   ├── useOrientation.js # Device orientation hook
│   │   └── useLocation.js    # GPS location hook
│   ├── utils/
│   │   ├── coordinates.js    # Lat/lng to 3D conversions
│   │   └── landmarks.js      # Landmark data and utilities
│   └── constants/
│       └── landmarks.js      # Landmark coordinates
├── app.json              # Expo configuration
└── package.json
```

## Features

- 🌐 High-performance 3D Earth with transparency
- 📱 Smooth, responsive device orientation tracking (60Hz+)
- 📍 GPS-based user positioning
- 🏙️ Major world landmarks visualization
- 🎯 Low-latency sensor fusion
- ⚡ Native-quality performance
- 🔄 Works on iOS and Android from single codebase

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**iOS**
```bash
expo build:ios
```

**Android**
```bash
expo build:android
```

### Using EAS Build (Modern Approach)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

## Permissions Required

- **Location Services**: To position the Earth relative to your location
- **Motion & Orientation**: To track device movement for rotating the view

Permissions are requested on first launch.

## Troubleshooting

### Sensors Not Working
- Ensure you're testing on a physical device (simulators don't have real sensors)
- Check that Motion & Orientation permissions are granted
- Try restarting the app

### 3D Scene Not Rendering
- Verify WebGL support on device
- Check console for Three.js errors
- Ensure expo-gl is properly installed

### Performance Issues
- Close other apps running in background
- Reduce landmark count for testing
- Check device temperature (thermal throttling)

## Future Enhancements

- AR mode with ARKit/ARCore integration
- Real-time satellite imagery
- User-added custom landmarks
- Night/day terminator visualization
- Distance measurement tools
- Social sharing features

## License

MIT
