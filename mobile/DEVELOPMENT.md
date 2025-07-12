# NutriAI Mobile Development Guide

## Development Environments

### 1. Expo Go (JS-only development)
- **Use for**: Quick JavaScript/React changes, UI development, non-native features
- **Limitations**: No native modules (Voice, Camera permissions, etc.)
- **How to run**: `npm start` then scan QR code with Expo Go app
- **When to use**: Daily JS edits, styling, navigation, API integration

### 2. EAS Development Build (Full native support)
- **Use for**: Testing native features (voice, camera, barcode scanning)
- **Contains**: All native modules and permissions
- **How to run**: `npm start --dev-client` with dev build installed
- **When to rebuild**: 
  - Adding/removing native modules
  - Changing Expo SDK version
  - Modifying app.json permissions/entitlements
  - Updating native dependencies

## Native Module Support

### Voice Recognition (@react-native-voice/voice)
- **Expo Go**: Falls back to Whisper recording
- **Dev Build**: Full native speech-to-text
- **Required**: Speech recognition entitlement in app.json

### Camera & Barcode Scanning
- **Expo Go**: Limited functionality
- **Dev Build**: Full camera access with barcode scanning
- **Note**: Uses expo-camera's built-in barcode scanner (not expo-barcode-scanner)

## Building & Deployment

### Initial Setup
```bash
# Install dependencies
npm install

# For development builds
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Daily Development
```bash
# With Expo Go (JS-only)
npm start

# With dev client (full features)
npm start --dev-client
```

### When to Rebuild
You need a new EAS build when:
- ✅ Adding/removing native modules in package.json
- ✅ Changing iOS permissions in app.json
- ✅ Modifying entitlements or capabilities
- ✅ Upgrading Expo SDK version
- ❌ Making JS/React changes (hot reload works)
- ❌ Changing styles or assets (hot reload works)

### Important: Prebuild for Native Changes
When changing permissions, entitlements, or native configurations:
```bash
# Run locally to ensure changes are applied
npx expo prebuild --clean --platform ios

# Then build with cache cleared
eas build --platform ios --profile development --clear-cache
```

Without `--clean` or `--clear-cache`, EAS might use cached native files and miss your changes!

## Troubleshooting

### "Native module not found" in Expo Go
This is expected. The app automatically falls back to alternative implementations (e.g., Whisper for voice).

### Camera/Microphone permissions crash
Ensure all required permissions are in app.json:
```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "...",
    "NSMicrophoneUsageDescription": "...",
    "NSSpeechRecognitionUsageDescription": "..."
  }
}
```

### Voice recognition not available
Check that speech recognition entitlement is enabled:
```json
"ios": {
  "entitlements": {
    "com.apple.developer.speechrecognition": true
  }
}
```

**iOS Note**: Voice.isAvailable() may return 0 initially. The actual availability is determined when Voice.start() is called and the user grants permission.

## Best Practices

1. **Test in both environments**: Ensure graceful fallbacks for Expo Go users
2. **Document native dependencies**: Keep track of what requires a dev build
3. **Use feature flags**: Conditionally enable features based on module availability
4. **Clear communication**: Let team know when a rebuild is needed

## Quick Reference

| Feature | Expo Go | Dev Build | Notes |
|---------|---------|-----------|-------|
| JS/React changes | ✅ | ✅ | Hot reload works |
| Voice input | ⚠️ | ✅ | Falls back to recording |
| Camera | ⚠️ | ✅ | Limited in Expo Go |
| Barcode scan | ❌ | ✅ | Requires dev build |
| Push notifications | ❌ | ✅ | Requires dev build |