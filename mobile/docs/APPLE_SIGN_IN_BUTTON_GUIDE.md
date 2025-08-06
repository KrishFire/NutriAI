# Apple Sign In Button Implementation Guide

## Overview

This guide documents the implementation of the official Apple logo for the "Sign in with Apple" button in the NutriAI mobile app.

## Current Implementation

We're using the official `@invertase/react-native-apple-authentication` library, which provides Apple's official button component. This ensures:

1. **Compliance** with Apple's Human Interface Guidelines
2. **Automatic updates** if Apple changes their design
3. **Proper accessibility** features
4. **Correct Apple logo** rendering

## Installation

```bash
npm install @invertase/react-native-apple-authentication
cd ios && pod install
```

## Usage in AuthScreen

```typescript
import { AppleButton } from '@invertase/react-native-apple-authentication';

// In your component:
{Platform.OS === 'ios' && (
  <AppleButton
    buttonStyle={AppleButton.Style.BLACK}
    buttonType={AppleButton.Type.CONTINUE}
    style={styles.appleButton}
    onPress={() => handleSocialSignIn('apple')}
  />
)}
```

## Button Customization Options

### Button Styles

- `AppleButton.Style.WHITE` - White button with black text
- `AppleButton.Style.WHITE_OUTLINE` - White button with black text and border
- `AppleButton.Style.BLACK` - Black button with white text (currently used)

### Button Types

- `AppleButton.Type.SIGN_IN` - "Sign in with Apple"
- `AppleButton.Type.CONTINUE` - "Continue with Apple" (currently used)
- `AppleButton.Type.SIGN_UP` - "Sign up with Apple" (iOS 13.2+)

### Additional Props

- `cornerRadius` - Customize the corner radius
- `style` - Apply custom styles (width, height, margins)

## Alternative Custom Implementation

If you need a custom design that doesn't comply with Apple's guidelines (not recommended for App Store submission), we've created:

1. **Custom Apple Logo SVG**: `/src/components/icons/AppleLogo.tsx`
2. **Custom Button Example**: `/src/screens/onboarding/AuthScreen.alternative.tsx`

⚠️ **Warning**: Using custom implementations may result in App Store rejection. Apple requires using their official button design.

## Apple's Requirements

According to Apple's Human Interface Guidelines:

1. The Sign in with Apple button must be **no smaller** than other sign-in buttons
2. It should be **prominently displayed** without requiring scrolling
3. The button must use Apple's official design and logo
4. The button includes automatic translation based on device language

## iOS Configuration

Make sure to enable "Sign In with Apple" capability in Xcode:

1. Open the project in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Add "Sign In with Apple" capability

## References

- [Apple Human Interface Guidelines - Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- [React Native Apple Authentication Library](https://github.com/invertase/react-native-apple-authentication)
- [Apple Developer - Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
