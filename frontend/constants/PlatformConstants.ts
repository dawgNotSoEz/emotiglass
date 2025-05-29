import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Create a custom PlatformConstants object that can be used throughout the app
const PlatformConstants = {
  // Basic platform detection
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  isWeb: Platform.OS === 'web',
  
  // Version information
  osVersion: Platform.Version,
  
  // Expo specific constants
  expoVersion: Constants.expoVersion,
  appVersion: Constants.expoConfig?.version || '1.0.0',
  
  // Device information
  deviceName: Constants.deviceName,
  
  // Custom values from app.config.js
  ...Constants.expoConfig?.extra?.platformConstants,
};

export default PlatformConstants; 