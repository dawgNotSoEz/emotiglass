import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { LogBox, Text, View, Alert, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { initStorage } from './services/storage';
import { initDrawingStorage } from './services/drawingService';
import { 
  initializeAppDirectories, 
  requestFileSystemPermissions 
} from './utils/fileSystemUtils';
import { ToastProvider } from './components/ui/Toast';
import theme from './constants/theme';

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

export default function App() {
  // Handle errors in the app
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize directories using our utility
        const directoriesInitialized = await initializeAppDirectories();
        if (!directoriesInitialized) {
          console.warn('Some directories could not be initialized');
        }
        
        // Request permissions
        const permissions = await requestFileSystemPermissions();
        if (!permissions.mediaLibrary) {
          console.warn('Media library permission not granted. Some features may be limited.');
        }
        
        // Initialize storage services
        await initStorage();
        
        // Initialize drawing service
        await initDrawingStorage();
        
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
    return React.createElement(View, { 
      style: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 20,
        backgroundColor: theme.colors.background 
      }
    }, [
      React.createElement(Text, { 
        style: { 
          fontSize: theme.typography.fontSizes.lg, 
          color: theme.colors.error, 
          marginBottom: 10 
        }
      }, 'Error loading app:'),
      React.createElement(Text, { 
        style: { 
          fontSize: theme.typography.fontSizes.md, 
          color: theme.colors.text 
        }
      }, error.message)
    ]);
  }

  return React.createElement(GestureHandlerRootView, 
    { style: { flex: 1 } }, 
    [
      React.createElement(SafeAreaProvider, 
        {}, 
        [
          React.createElement(ToastProvider, 
            { children: [
              React.createElement(AppNavigator, {}, null),
              React.createElement(StatusBar, { style: 'auto' }, null)
            ]}
          )
        ]
      )
    ]
  );
} 