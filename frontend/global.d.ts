// Global type definitions for the application

// Define types for modules
interface SafeModule {
  getConstants?: () => Record<string, any>;
  [key: string]: any;
}

// Define global object extensions
declare global {
  var HermesInternal: any;
  
  // Native modules
  var PlatformConstants: SafeModule;
  var ExponentConstants: SafeModule;
  var ExpoConstants: SafeModule;
  var RNGestureHandlerModule: SafeModule;
  var RCTDeviceEventEmitter: SafeModule;
  var UIManager: SafeModule;
  var RCTLinkingManager: SafeModule;
  var ExponentAV: SafeModule;
  var ExponentCamera: SafeModule;
  
  // TurboModule registry
  var TurboModuleRegistry: {
    getEnforcing: (name: string) => SafeModule;
  };
  
  // Expo global
  var Expo: {
    Constants: Record<string, any>;
    [key: string]: any;
  };
}

// This export is needed to make this file a module
export {}; 