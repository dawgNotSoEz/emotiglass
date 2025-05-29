import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Fallback implementation for PlatformConstants
 * This provides a consistent interface for platform-specific constants
 */
const PlatformConstants = {
  getConstants: () => ({
    // Basic platform information
    platform: Platform.OS,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
    
    // Version information
    Version: Platform.Version,
    osVersion: Platform.Version,
    
    // Device information
    deviceName: Constants.deviceName || 'unknown',
    
    // App information
    appVersion: Constants.expoConfig?.version || '1.0.0',
    appName: Constants.expoConfig?.name || 'EmotiGlass',
    
    // Screen dimensions
    screenWidth: 0,  // Will be set at runtime
    screenHeight: 0, // Will be set at runtime
    
    // Status bar height
    statusBarHeight: Constants.statusBarHeight || 0,
  }),
};

export default PlatformConstants; 