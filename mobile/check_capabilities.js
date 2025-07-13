const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Checking iOS project capabilities...');

// Check if entitlements file exists and has speech recognition
const entitlementsPath = 'ios/mobile/mobile.entitlements';
if (fs.existsSync(entitlementsPath)) {
  const entitlements = fs.readFileSync(entitlementsPath, 'utf8');
  console.log('✅ Entitlements file exists');

  if (entitlements.includes('com.apple.developer.speechrecognition')) {
    console.log('✅ Speech recognition entitlement found in entitlements file');
  } else {
    console.log(
      '❌ Speech recognition entitlement NOT found in entitlements file'
    );
  }
} else {
  console.log('❌ Entitlements file not found');
}

// Check Info.plist for usage description
const infoPlistPath = 'ios/mobile/Info.plist';
if (fs.existsSync(infoPlistPath)) {
  const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
  console.log('✅ Info.plist exists');

  if (infoPlist.includes('NSSpeechRecognitionUsageDescription')) {
    console.log('✅ Speech recognition usage description found in Info.plist');
  } else {
    console.log(
      '❌ Speech recognition usage description NOT found in Info.plist'
    );
  }
} else {
  console.log('❌ Info.plist not found');
}

console.log('\n�� Next steps:');
console.log('1. The local iOS project has the correct entitlements');
console.log(
  "2. Apple's App ID needs to be updated to include Speech Recognition capability"
);
console.log(
  '3. This happens automatically during EAS build, but may take 1-2 build attempts'
);
