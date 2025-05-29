// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for PlatformConstants not found error
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': require.resolve('react-native'),
};

module.exports = config; 