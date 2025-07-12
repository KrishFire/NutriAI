#!/bin/bash

echo "🔧 Regenerating iOS project with Speech Recognition entitlements..."

# Remove iOS directory completely
rm -rf ios

# Regenerate with clean slate
npx expo prebuild --platform ios --clean

# Verify entitlements are in place
if grep -q "com.apple.developer.speechrecognition" ios/mobile/mobile.entitlements; then
    echo "✅ Speech Recognition entitlement found in entitlements file"
else
    echo "❌ Speech Recognition entitlement NOT found - there may be an issue"
fi

# Check Info.plist
if grep -q "NSSpeechRecognitionUsageDescription" ios/mobile/Info.plist; then
    echo "✅ Speech Recognition usage description found in Info.plist"
else
    echo "❌ Speech Recognition usage description NOT found"
fi

echo "🚀 Starting EAS Build with Speech Recognition support..."
eas build --platform ios --profile development --clear-cache --non-interactive 