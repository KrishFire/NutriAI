import { registerRootComponent } from 'expo';
import App from './App';

// Import global.css after registering the app to ensure React Native is ready
import './global.css';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
