# X-ray Earth Development Plan

## Overview
This plan breaks down the development of X-ray Earth into incremental milestones, each with a testable checkpoint. The goal is to get a working app on your iPhone as quickly as possible, validating each piece before moving on.

---

## Phase 1: Project Setup & Deployment Validation
**Goal**: Verify the development environment and Expo Go deployment works.

### 1.1 Create Expo Project
- Initialize new Expo project with TypeScript template
- Install core dependencies (expo-gl, expo-three, expo-sensors, expo-location, three)
- Verify project runs locally with `npx expo start`

### 1.2 Dummy App Deployment
- Create minimal "Hello World" app with black background
- Display text: "X-ray Earth" and current timestamp
- Add a simple animation (pulsing text) to verify refresh works

#### Checkpoint 1: Deploy dummy app to iPhone via Expo Go
- [ ] QR code scan works
- [ ] App loads on phone
- [ ] Text is visible
- [ ] Animation runs smoothly

---

## Phase 2: Sensor Integration
**Goal**: Verify device sensors work before adding 3D complexity.

### 2.1 Orientation Tracking
- Implement `useOrientation` hook using `expo-sensors` DeviceMotion
- Display raw orientation values on screen (alpha, beta, gamma)
- Verify values update in real-time as phone moves

### 2.2 Location Detection
- Implement `useLocation` hook using `expo-location`
- Request permissions on app start
- Display current GPS coordinates on screen
- Handle permission denied gracefully

#### Checkpoint 2: Sensors working on device
- [ ] Orientation values update when phone rotates
- [ ] GPS coordinates display correctly
- [ ] Permission prompts appear and work
- [ ] No crashes or freezes

---

## Phase 3: Basic 3D Rendering
**Goal**: Get Three.js rendering working on device.

### 3.1 Static Earth Sphere
- Set up GLView with expo-gl
- Initialize Three.js scene, camera, renderer
- Create semi-transparent blue sphere (Earth)
- Render static scene with black background

### 3.2 Camera Rotation
- Connect device orientation to camera rotation
- Map alpha → yaw, beta → pitch, gamma → roll
- Verify Earth appears to stay fixed while phone moves

#### Checkpoint 3: 3D Earth responds to phone movement
- [ ] Blue sphere renders on screen
- [ ] Sphere stays in place as phone rotates
- [ ] 60 FPS performance (no jank)
- [ ] No WebGL errors or crashes

---

## Phase 4: World Database
**Goal**: Create the built-in database of cities and POIs.

### 4.1 Database Structure
- Create `worldDatabase.ts` with TypeScript interfaces
- Add 100 major world cities (by population)
- Add 50 notable POIs (landmarks, natural wonders)
- Include: id, name, country, type, population, lat, lng

### 4.2 Coordinate Utilities
- Implement `latLngToVector3` conversion for Three.js
- Implement Haversine distance calculation
- Implement angular distance/separation functions
- Add unit tests for coordinate math

#### Checkpoint 4: Database and utilities complete
- [ ] 150 entries in database
- [ ] All coordinate functions work correctly
- [ ] Unit tests pass

---

## Phase 5: POI Visualization
**Goal**: Display cities/POIs as points on the Earth.

### 5.1 Static POI Markers
- Render all 150 POIs as small spheres on Earth surface
- Position using latLngToVector3
- Use different colors for cities vs landmarks vs natural

### 5.2 POI Labels
- Add text labels for each POI (name + distance)
- Position labels near their markers
- Ensure labels face camera (billboarding)

#### Checkpoint 5: All POIs visible on Earth
- [ ] 150 markers render on sphere
- [ ] Markers positioned correctly (Tokyo in Japan, etc.)
- [ ] Labels readable and properly positioned
- [ ] Performance still 60 FPS

---

## Phase 6: Visibility Algorithm
**Goal**: Implement smart filtering to show only relevant POIs.

### 6.1 Scoring System
- Implement horizon proximity score (close cities)
- Implement antipodal interest score (far large cities)
- Implement view direction boost/penalty
- Combine into final visibility score

### 6.2 Selection & Filtering
- Implement `useVisiblePOIs` hook
- Select top 15 POIs by score
- Enforce 10-degree minimum angular separation
- Add smooth fade in/out transitions

#### Checkpoint 6: Smart POI visibility working
- [ ] Only ~15 labels visible at once
- [ ] Close cities appear when looking at horizon
- [ ] Large distant cities appear when looking down
- [ ] Labels don't overlap
- [ ] Smooth transitions as view changes

---

## Phase 7: Polish & UX
**Goal**: Make the app feel complete and polished.

### 7.1 Visual Polish
- Add subtle glow effect to POI markers
- Improve label styling (semi-transparent background)
- Add distance indicator to labels (e.g., "12,450 km")
- Differentiate horizon vs antipodal cities visually

### 7.2 User Experience
- Add brief instructions overlay (dismiss on first interaction)
- Implement pinch-to-zoom for camera
- Add subtle haptic feedback when pointing at POIs (optional)
- Handle edge cases (no GPS, sensors unavailable)

### 7.3 Performance Optimization
- Profile and optimize render loop
- Reduce draw calls where possible
- Ensure battery drain is acceptable
- Test on older devices if available

#### Checkpoint 7: App is polished and ready
- [ ] Visually appealing
- [ ] Intuitive without tutorial
- [ ] Smooth 60 FPS on target devices
- [ ] All error cases handled gracefully

---

## Phase 8: Final Testing & Packaging
**Goal**: Prepare for potential App Store submission.

### 8.1 Comprehensive Testing
- Test full user flow on iOS device
- Test permission flows (grant, deny, revoke)
- Test in various locations (indoors, outdoors)
- 30-minute continuous use test

### 8.2 Build Configuration
- Configure app.json with proper metadata
- Create app icon and splash screen
- Set up EAS Build (optional, for standalone app)
- Document build and deployment process

#### Checkpoint 8: Production-ready app
- [ ] No crashes in extended testing
- [ ] All features work as specified
- [ ] App can be built as standalone (if desired)
- [ ] Documentation complete

---

## Progress Notes

### Checkpoint 1 - COMPLETE
- Using Expo SDK 54 (to match Expo Go on device)
- 3D libraries (expo-gl, expo-three, three) deferred to Phase 3 due to compatibility issues
- Will need to resolve expo-three + React 19 peer dependency conflicts

### Checkpoint 2 - COMPLETE
- Orientation tracking working (alpha, beta, gamma)
- GPS location working with permission flow

### Checkpoint 3 - COMPLETE
- 3D Earth renders with grid lines
- Camera responds to device orientation
- Red markers visible at reference points

### Checkpoint 4 - COMPLETE
- 150 POIs in database (100 cities + 50 landmarks/natural wonders)
- Coordinate utilities (distance, angular separation, etc.)

### Checkpoint 5 - COMPLETE
- All POI markers render on Earth with color coding
- User location marker (cyan)

### Checkpoint 6 - COMPLETE
- Visibility algorithm filters to max 15 POIs
- Prioritizes: nearby horizon cities (yellow), large antipodal cities (magenta)
- 10° minimum angular separation between markers

### Additional Updates
- Camera positioned on Earth's surface at user's GPS location
- Horizon visible when phone held upright
- Space (dark purple) clearly distinguishable from Earth (dark blue)
- POI labels added with name + distance, color-coded by type
- 3D-to-2D projection for label positioning

### Bug Fixes Applied
- **Stickiness algorithm**: POIs that are visible on screen get a +200 score boost to prevent disappearing while user is looking at them (only within 90° of view)
- **Distance formatting**: Changed from confusing "1.6k km" to proper comma formatting "1,600 km"
- **Left/right orientation**: Fixed inverted yaw rotation (removed negative sign from alpha)
- **North/south compass**: Fixed forward direction vector so geographical north displays correctly
- **Hide current location**: POIs within 50km of user are hidden (prevents seeing "Berlin" when standing in Berlin)
- **Expanded horizon range**: Increased from 500km to 2,000km to show more nearby cities
- **Same-country boost**: +40 points for all POIs in user's country (detected from nearest city)
- **Infinite loop fix**: Separated camera updates from label updates, added throttling to POI visibility calculations (500ms interval)
- **Label jitter fix**: Changed label updates from setInterval to requestAnimationFrame for smooth sync with camera

### Visual Improvements
- **Earth texture**: NASA Blue Marble texture (2K resolution, 287KB)
- **Transparent Earth**: 40% opacity so POIs on far side are visible (X-ray effect)
- **Starfield**: 2,000 procedural stars with varied colors and brightness
- **Simplified markers**: Clean solid spheres (removed glow effects that didn't render well on mobile)
- **Distance-based marker sizing**: Close POIs (< 500km) rendered at 40-100% size to compensate for perspective
- **Grid lines**: More subtle (30% opacity, lighter blue) to not obscure Earth texture

### Performance Optimizations
- **POI visibility throttling**: Recalculates every 500ms instead of every frame
- **Label updates**: Uses requestAnimationFrame with pending flag to batch updates
- **Reduced draw calls**: Single sphere per POI instead of 3 (removed glow layers)

### Database Additions
- Added 9 German cities: Hamburg, Frankfurt, Cologne, Düsseldorf, Stuttgart, Leipzig, Dresden, Hanover, Nuremberg
- Total POIs now: 159 (109 cities + 50 landmarks/natural)

---

## Quick Reference: Checkpoints Summary

| # | Checkpoint | Key Validation |
|---|------------|----------------|
| 1 | Dummy app on phone | Expo Go deployment works |
| 2 | Sensors working | Orientation + GPS functional |
| 3 | 3D Earth renders | Three.js + device motion integrated |
| 4 | Database complete | 150 POIs + coordinate utilities |
| 5 | POIs on Earth | All markers and labels render |
| 6 | Visibility algorithm | Smart filtering, no clutter |
| 7 | Polish complete | Production-quality UX |
| 8 | Final testing | Ready for release |

---

## Estimated Complexity

| Phase | Complexity | Notes |
|-------|------------|-------|
| 1 | Low | Boilerplate setup |
| 2 | Low | Standard Expo APIs |
| 3 | Medium | Three.js integration can be tricky |
| 4 | Low | Data entry + simple math |
| 5 | Medium | 3D positioning and labels |
| 6 | Medium | Algorithm implementation |
| 7 | Medium | Many small improvements |
| 8 | Low | Testing and config |

---

## Dependencies Between Phases

```
Phase 1 (Setup)
    ↓
Phase 2 (Sensors) ──────────────────┐
    ↓                               ↓
Phase 3 (3D Rendering)    Phase 4 (Database)
    ↓                               ↓
    └──────────> Phase 5 (POI Visualization)
                        ↓
                Phase 6 (Visibility Algorithm)
                        ↓
                Phase 7 (Polish)
                        ↓
                Phase 8 (Final Testing)
```

Phases 2 and 4 can be worked on in parallel. All other phases are sequential.

---

## Risk Mitigation

### Risk: expo-gl doesn't work well in Expo Go
**Mitigation**: If 3D rendering fails in Expo Go, switch to development build:
```bash
npx expo install expo-dev-client
npx expo run:ios
```
This requires Xcode but gives full native module access.

### Risk: Performance issues on device
**Mitigation**:
- Reduce sphere geometry segments (64 → 32)
- Reduce max visible POIs (15 → 10)
- Use simpler label rendering

### Risk: Sensor data is noisy/jittery
**Mitigation**:
- Apply low-pass filter to orientation data
- Reduce update frequency if needed (60Hz → 30Hz)
