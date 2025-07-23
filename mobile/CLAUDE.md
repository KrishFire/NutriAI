# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Managing Native Dependencies

### Installing Packages with Native Code

**ALWAYS use `npx expo install` for packages with native dependencies!**

When adding libraries that contain native iOS/Android code (e.g., expo-notifications, expo-camera, expo-background-fetch), you MUST:

1. **Install with Expo CLI** (NOT npm or yarn):
   ```bash
   cd mobile
   npx expo install <package-name>
   ```

2. **Rebuild the native app** to include new native modules:
   ```bash
   # For iOS
   npx expo run:ios
   
   # For Android
   npx expo run:android
   ```

3. **If you see "Cannot find native module" errors**, the native code is missing. Fix by:
   ```bash
   cd mobile/ios
   pod install
   cd ..
   npx expo run:ios
   ```

### Common Native Module Errors

- **"Cannot find native module 'ExpoPushTokenManager'"** - expo-notifications not linked
- **"Invariant Violation"** - Native module missing from build
- **Solution**: Always rebuild after adding native dependencies!

## Development Commands

### Running the App

- `npm start` - Start Expo development server (Expo Go)
- `npm start --dev-client` - Start with EAS development build
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator/device
- `npm run web` - Run in web browser

### Development Workflow

1. Run `npm install` after pulling changes with new dependencies
2. Use `npx expo start` for more Expo CLI options
3. Press 'r' in terminal to reload the app
4. Press 'm' to toggle menu in Expo CLI
5. See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed workflow guide

## Architecture Overview

This is a React Native app built with Expo SDK 53, using TypeScript and React Navigation for a nutrition AI application.

### Core Stack

- **Expo SDK 53** - Managed workflow for React Native development
- **React Navigation v7** - Stack-based navigation with @react-navigation/native-stack
- **Supabase** - Backend services and database (@supabase/supabase-js)
- **TypeScript** - Strict mode enabled for type safety

### Project Structure

```
App.tsx                 # Root component with navigation container
navigation/
  └── RootNavigator.tsx # Stack navigator defining app screens
screens/                # Individual screen components
services/               # Supabase client and API calls
components/             # Reusable UI components
hooks/                  # Custom React hooks
types/                  # TypeScript type definitions
constants/              # App-wide constants
```

### Key Capabilities

- **Camera Integration**: expo-camera for photo capture
- **Image Selection**: expo-image-picker for gallery access
- **Text-to-Speech**: expo-speech for accessibility
- **File System**: expo-file-system for local storage

### Navigation Pattern

The app uses a stack navigator pattern. New screens should be:

1. Created in `screens/` directory
2. Added to the Stack.Navigator in `navigation/RootNavigator.tsx`
3. Typed using the RootStackParamList in navigation types

### Backend Integration

Supabase is configured for backend services. When implementing:

1. Initialize Supabase client in `services/supabase.ts`
2. Create service functions for database operations
3. Use environment variables for Supabase URL and anon key

### Testing

No testing framework is currently configured. When adding tests:

1. Install Jest and React Native Testing Library
2. Add test scripts to package.json
3. Configure Jest for React Native/Expo environment

### Code Style

- Use TypeScript with strict mode
- Follow React Native naming conventions (PascalCase for components)
- Organize imports: React → React Native → Third-party → Local
- Use functional components with hooks

## Current Implementation Status

### Completed Features
- ✅ Basic project structure
- ✅ Navigation setup with fixed MealDetails routing
- ✅ Dependencies installed
- ✅ Supabase integration (auth, database, storage)
- ✅ AI services (GPT-4 Vision for food recognition, Whisper for voice-to-text)
- ✅ Core screens (Home, Camera, History, Profile)
- ✅ Voice recording with native speech-to-text
- ✅ Photo capture and barcode scanning
- ✅ User preferences system with AuthContext
- ✅ Authentication flow (email/password)

### Recent Fixes (Phase 1 - Critical Fixes)
- ✅ **MealDetails Navigation**: Moved screen from AddMealStack to RootStackNavigator to fix navigation errors
- ✅ **User Preferences Table**: Created missing table with proper schema and RLS policies
- ✅ **AuthContext Enhancement**: Added preferences management to centralized state
- ✅ **ProfileScreen**: Updated to use preferences from AuthContext instead of direct DB queries

### Recent Features (Phase 2 - Streak Tracking)
- ✅ **Streak Tracking System**: Complete implementation with StreakContext, database integration, and UI components
- ✅ **Push Notifications**: expo-notifications setup with permission handling
- ✅ **Background Tasks**: expo-background-fetch for nutrition reminders
- ✅ **Streak UI Components**: DailyStreakCard, StreakBadge, StreakCelebration with animations
- ✅ **Native Module Fix**: Resolved ExpoPushTokenManager error with proper pod installation

### Pending Features (from development plan)
- ⏳ **Phase 2 - Auth & Monetization**: Google/Apple login, basic premium features, RevenueCat
- ⏳ **Phase 3 - Core UX Redesign**: Home screen dashboard, History calendar view, Profile completion
- ⏳ **Phase 4 - Engagement**: Push notifications, onboarding flow, streak celebrations
- ⏳ **Phase 5 - Advanced Features**: Recipe saving, meal templates, premium features
- ⏳ **Phase 6 - Polish**: Offline support, performance optimization
