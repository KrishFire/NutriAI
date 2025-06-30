# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the App

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator/device
- `npm run web` - Run in web browser

### Development Workflow

1. Run `npm install` after pulling changes with new dependencies
2. Use `npx expo start` for more Expo CLI options
3. Press 'r' in terminal to reload the app
4. Press 'm' to toggle menu in Expo CLI

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
