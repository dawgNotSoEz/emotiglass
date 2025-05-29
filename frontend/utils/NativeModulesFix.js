import { NativeModules, Platform } from 'react-native';

/**
 * This utility helps fix issues with native modules in Hermes
 * Specifically targeting the "Cannot read property 'getConstants' of undefined" error
 */

// Create safe wrappers for potentially problematic native modules
const createSafeModule = (moduleName) => {
  const emptyModule = {
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
export const fixNativeModules = () => {
  if (!global.HermesInternal) return; // Only apply fixes for Hermes
  
  const modulesToFix = [
    'PlatformConstants',
    'ExponentConstants',
    'RNGestureHandlerModule',
    'RCTDeviceEventEmitter',
    'UIManager',
    'RCTLinkingManager'
  ];
  
  modulesToFix.forEach(moduleName => {
    const fixedModule = createSafeModule(moduleName);
    
    // Make the fixed module available globally
    if (!global[moduleName]) {
      global[moduleName] = fixedModule;
    }
    
    // Also patch the NativeModules object
    if (!NativeModules[moduleName]) {
      NativeModules[moduleName] = fixedModule;
    }
  });
  
  // Special case for TurboModuleRegistry
  if (!global.TurboModuleRegistry) {
    global.TurboModuleRegistry = {
      getEnforcing: (name) => {
        return global[name] || createSafeModule(name);
      }
    };
  }
};

export default fixNativeModules; 