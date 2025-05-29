import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import 'react-native-gesture-handler';
import fixNativeModules from './utils/NativeModulesFix';
import { LogBox } from 'react-native';

// Ignore specific warnings that might be related to our fixes
LogBox.ignoreLogs([
  'Warning: ...',
  'Cannot read property \'getConstants\' of undefined',
]);

// Apply native module fixes as early as possible
if (typeof global !== 'undefined') {
  fixNativeModules();
}

export default function App() {
  // Also apply fixes when the component mounts
  useEffect(() => {
    try {
      fixNativeModules();
    } catch (error) {
      console.warn('Error applying native module fixes:', error);
    }
    
    // Re-apply after a short delay to catch any late-initialized modules
    const timer = setTimeout(() => {
      try {
        fixNativeModules();
      } catch (error) {
        console.warn('Error in delayed native module fixes:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
} 