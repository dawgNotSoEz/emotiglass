import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { LogBox, Text, View, Alert, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { initStorage } from './services/storage';
import { initDrawingStorage } from './services/drawingService';

// Keep the splash screen visible while we initialize the app
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: ...',
  'Cannot read property',
  'Non-serializable values were found in the navigation state',
  '[expo-av]: Expo AV has been deprecated and will be removed in SDK 54',
]);

// Ensure native modules are available globally
if (typeof global !== 'undefined' && !global.Expo) {
  global.Expo = {
    Constants: Constants || {},
  };
}

// Initialize directories
const initializeDirectories = async () => {
  try {
    // Create necessary directories
    const rootDir = FileSystem.documentDirectory;
    const dirs = ['drawings', 'mood_entries', 'voice_recordings'];
    
    console.log(`App documentDirectory: ${rootDir}`);
    
    for (const dir of dirs) {
      const dirPath = `${rootDir}${dir}`;
      console.log(`Initializing directory: ${dirPath}`);
      
      try {
        const dirInfo = await FileSystem.getInfoAsync(dirPath);
        
        if (!dirInfo.exists) {
          console.log(`Creating directory: ${dirPath}`);
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
          
          // Verify directory was created
          const verifyInfo = await FileSystem.getInfoAsync(dirPath);
          if (!verifyInfo.exists) {
            console.error(`Failed to create directory: ${dirPath}`);
            return false;
          }
          
          console.log(`Directory created successfully: ${dirPath}`);
        } else {
          console.log(`Directory already exists: ${dirPath}`);
        }
        
        // Test directory is writable
        const testFile = `${dirPath}/test_${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(testFile, 'test');
        await FileSystem.deleteAsync(testFile, { idempotent: true });
        console.log(`Directory is writable: ${dirPath}`);
      } catch (dirError) {
        console.error(`Error handling directory ${dirPath}:`, dirError);
        Alert.alert(
          'Storage Error',
          `Unable to access or create directory: ${dir}. Some features may not work correctly.`,
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing directories:', error);
    Alert.alert(
      'Storage Error',
      'Unable to initialize storage directories. Some features may not work correctly.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

// Request permissions
const requestPermissions = async () => {
  try {
    // Media library permission
    const mediaPermission = await MediaLibrary.requestPermissionsAsync();
    const mediaStatus = mediaPermission.status;
    
    // Log permission statuses
    console.log('Media library permission:', mediaStatus);
    
    // If any permissions are denied, show a warning
    if (mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Some features may not work without required permissions. You can grant them in your device settings.',
        [{ text: 'OK' }]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

export default function App() {
  // Handle errors in the app
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize directories
        await initializeDirectories();
        
        // Initialize storage services
        await initStorage();
        await initDrawingStorage();
        
        // Request permissions
        await requestPermissions();
        
        // Pre-load any assets or data here
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error loading app:', e);
        setError(e as Error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null; // Still showing splash screen
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>
          Error loading app:
        </Text>
        <Text style={{ fontSize: 14 }}>{error.message}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
} 