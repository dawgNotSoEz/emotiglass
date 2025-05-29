// Learn more https://docs.expo.io/guides/customizing-metro
import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

// Get the default config
const config = getDefaultConfig(__dirname);

// Fix for PlatformConstants not found error
if (config.resolver) {
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules || {},
    'react-native': require.resolve('react-native'),
  };

  // Add additional configuration for newer Expo versions
  config.resolver.sourceExts = [
    ...(config.resolver.sourceExts || []),
    'mjs'
  ];
}

// Export the configuration
export default config; 