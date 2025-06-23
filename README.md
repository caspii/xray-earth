# X-ray Earth 🌍

A mobile web app that lets you "see through" the Earth to view major landmarks on the other side of the planet. Point your phone in any direction to discover what lies beyond!

## Quick Start

### Option 1: Local Testing (Limited Features)
```bash
python3 serve.py
```
Visit the URL shown on your phone. Note: Device orientation won't work without HTTPS.

### Option 2: HTTPS Server (Full Features)
```bash
python3 serve-https.py
```
Accept the security warning in your browser.

### Option 3: Deploy to GitHub Pages (Recommended)
1. Push this code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main → / (root)
4. Visit `https://[username].github.io/[repo-name]`

### Option 4: Use ngrok (Instant HTTPS)
1. Install ngrok: `brew install ngrok` (Mac) or download from ngrok.com
2. Run: `python3 serve.py` 
3. In another terminal: `ngrok http 8000`
4. Use the HTTPS URL provided by ngrok

## Features
- 🌐 Semi-transparent 3D Earth visualization
- 📱 Real-time device orientation tracking
- 📍 GPS-based user positioning
- 🏙️ Major world landmarks (NYC, London, Tokyo, Sydney, Rio, Dubai)
- 🏷️ Dynamic landmark labels

## Requirements
- Modern mobile browser (iOS Safari, Android Chrome)
- HTTPS connection for device orientation
- Location services enabled

## How It Works
1. Grant location permission to center the Earth on your position
2. On iOS: Tap "Enable Device Orientation" button
3. Move your phone to rotate your view through the Earth
4. Red dots mark major cities
5. City names appear when visible

## Tech Stack
- Three.js for 3D rendering
- Device Orientation API
- HTML5 Geolocation API
- Single-file architecture for easy deployment