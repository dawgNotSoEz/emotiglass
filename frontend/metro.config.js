// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for PlatformConstants not found error
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': require.resolve('react-native'),
};

// Add additional configuration for newer Expo versions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config; 