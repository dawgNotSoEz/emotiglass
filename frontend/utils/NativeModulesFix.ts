import { NativeModules, Platform } from 'react-native';

/**
 * This utility helps fix issues with native modules in Hermes
 * Specifically targeting the "Cannot read property 'getConstants' of undefined" error
 */

// Define types for modules
interface SafeModule {
  getConstants: () => Record<string, any>;
  [key: string]: any;
}

// Create safe wrappers for potentially problematic native modules
const createSafeModule = (moduleName: string): SafeModule => {
  const emptyModule: SafeModule = {
    getConstants: () => ({}),
  };

  try {
    const module = NativeModules[moduleName];
    if (!module) {
      console.warn(`Module ${moduleName} is undefined, using fallback`);
      return emptyModule;
    }
    
    // If getConstants is missing, add it
    if (!module.getConstants) {
      console.warn(`Module ${moduleName} missing getConstants, adding fallback`);
      module.getConstants = () => ({});
    }
    
    return module;
  } catch (e) {
    console.warn(`Error accessing module ${moduleName}:`, e);
    return emptyModule;
  }
};

// Fix common problematic modules
export const fixNativeModules = (): void => {
  const modulesToFix: string[] = [
    'PlatformConstants',
    'ExponentConstants',
    'ExpoConstants',
    'RNGestureHandlerModule',
    'RCTDeviceEventEmitter',
    'UIManager',
    'RCTLinkingManager',
    'ExponentAV',
    'ExponentCamera'
  ];
  
  modulesToFix.forEach(moduleName => {
    const fixedModule = createSafeModule(moduleName);
    
    // Make the fixed module available globally
    if (typeof global !== 'undefined' && !(global as any)[moduleName]) {
      (global as any)[moduleName] = fixedModule;
    }
    
    // Also patch the NativeModules object
    if (!NativeModules[moduleName]) {
      (NativeModules as any)[moduleName] = fixedModule;
    }
  });
};

export default fixNativeModules; 