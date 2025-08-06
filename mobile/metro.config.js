const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Reset cache on startup
config.resetCache = true;

// Ensure proper module resolution
config.resolver = {
  ...config.resolver,
  // Add any custom resolver configuration here
};

module.exports = withNativeWind(config, { input: './global.css' });
