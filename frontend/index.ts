import { registerRootComponent } from 'expo';
import { AppRegistry, NativeModules } from 'react-native';
import App from './App';

// Define types for modules
interface SafeModule {
  getConstants?: () => Record<string, any>;
  [key: string]: any;
}

// Polyfill for native modules with getConstants issues
if (global.HermesInternal) {
  const originalGetConstants = (moduleName: string): Record<string, any> => {
    try {
      if (NativeModules && NativeModules[moduleName]) {
        const module = NativeModules[moduleName] as SafeModule;
        return module.getConstants?.() || {};
      }
      return {};
    } catch (e) {
      console.warn(`Error getting constants for ${moduleName}:`, e);
      return {};
    }
  };

  // Add polyfill for specific modules that might be causing issues
  const moduleNames: string[] = ['PlatformConstants', 'ExponentConstants', 'RNGestureHandlerModule'];
  moduleNames.forEach(moduleName => {
    if (!(global as any)[moduleName]) {
      (global as any)[moduleName] = {
        getConstants: () => originalGetConstants(moduleName)
      };
    }
  });
}

// Register the PlatformConstants module
if (!(global as any).PlatformConstants) {
  const PlatformConstants = require('./constants/PlatformConstants').default;
  (global as any).PlatformConstants = PlatformConstants;
}

// Register the app
registerRootComponent(App);
AppRegistry.registerComponent('main', () => App); 