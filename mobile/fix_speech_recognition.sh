#!/bin/bash

echo "🔧 Fixing Speech Recognition Issue - Complete Solution"
echo "=================================================="

echo "📋 Step 1: Verifying app.json configuration..."
if grep -q "speechrecognition" app.json; then
    echo "✅ Speech Recognition entitlement found in app.json"
else
    echo "❌ Speech Recognition entitlement NOT found in app.json"
    echo "Please ensure your app.json has:"
    echo '  "entitlements": { "com.apple.developer.speechrecognition": true }'
    exit 1
fi

echo "📋 Step 2: Completely regenerating iOS project..."
rm -rf ios
npx expo prebuild --platform ios --clean

echo "📋 Step 3: Verifying entitlements in generated project..."
if grep -q "com.apple.developer.speechrecognition" ios/mobile/mobile.entitlements; then
    echo "✅ Speech Recognition entitlement found in entitlements file"
else
    echo "❌ Speech Recognition entitlement NOT found in generated entitlements file"
    echo "There may be an issue with Expo's entitlements generation"
fi

echo "📋 Step 4: Clearing ALL EAS credentials to force regeneration..."
eas credentials -p ios --clear-credentials --non-interactive

echo "📋 Step 5: Important Manual Step Required!"
echo "🚨 YOU MUST DO THIS MANUALLY:"
echo "1. Go to https://developer.apple.com/account/resources/identifiers/list"
echo "2. Find your App ID: com.kricel.nutriai.v2"
echo "3. Click on it and enable 'Speech Recognition' capability"
echo "4. Save the changes"
echo ""
echo "📋 Step 6: After manual step, run the build..."
echo "eas build --platform ios --profile development --clear-cache --non-interactive"

echo ""
echo "🎯 Why this is necessary:"
echo "- EAS Build doesn't support Speech Recognition capability sync"
echo "- Apple requires manual enablement in Developer Portal"
echo "- New provisioning profiles will be generated with the capability" 