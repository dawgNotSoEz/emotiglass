import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the PlatformConstants module
if (!global.PlatformConstants) {
  const PlatformConstants = require('./constants/PlatformConstants').default;
  global.PlatformConstants = PlatformConstants;
}

// Register the app
registerRootComponent(App);
AppRegistry.registerComponent('main', () => App); 