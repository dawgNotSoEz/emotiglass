# EmotiGlass - Emotion Tracking and Visualization App

EmotiGlass is a cross-platform (mobile + web) emotion journaling tool that uses drawing, sliders, voice, and facial expression to detect emotions and visualize them.

## Features

- **Emotion Input Methods**:
  - Drawing canvas with touch support
  - Voice recording (mobile only, with web fallback)
  - Face detection (mobile only, with web fallback)
  - Emotion sliders for manual input

- **Visualization**:
  - Mood trends and analysis
  - Daily emotion journal
  - Ambient visualization mode

- **Cross-Platform Support**:
  - Mobile-first design
  - Web compatibility with graceful fallbacks
  - Responsive UI for different screen sizes

## Technical Implementation

### UI Components

The app is built with modular, reusable components:

- **VoiceRecorder**: Records audio on mobile with expo-av, provides dummy data on web
- **FaceDetector**: Captures facial expressions with expo-camera and expo-face-detector
- **EmotionSlider**: Custom slider for emotion intensity input
- **DrawingCanvas**: Touch-enabled drawing surface with gesture support
- **MoodVisualization**: Visualization components for emotion data

All components use React.createElement for improved type safety and cross-platform compatibility.

### File System & Platform Compatibility

- Custom file system utilities for both web and mobile
- Platform-specific implementations with graceful fallbacks
- Web-specific mocks for mobile-only features

### State Management

- React Context API for global state
- Custom hooks for feature-specific logic
- Efficient data flow with prop drilling minimization

## Cross-Platform Implementation

### TypeScript and React.createElement

To ensure maximum compatibility between web and mobile platforms, we use the following strategies:

1. **React.createElement Instead of JSX**: Many components are implemented using React.createElement instead of JSX syntax. This approach resolves TypeScript compatibility issues that can arise between different React type definitions in the web and mobile environments.

2. **Type-Safe Components**: All UI components are designed with strict TypeScript typing to catch errors at compile time rather than runtime.

### Platform-Specific Features with Fallbacks

For features that are only available on certain platforms, we implement graceful fallbacks:

1. **Storage**: 
   - Mobile: Uses `expo-secure-store` and `expo-file-system` for secure, persistent storage
   - Web: Falls back to `localStorage` with similar API signatures

2. **Media Features**:
   - Mobile: Uses native camera and microphone access
   - Web: Provides simulated data or simplified alternatives

3. **UI Components**:
   - Mobile-specific UI (like BlurView) is replaced with cross-platform alternatives on web
   - Maintains consistent look and feel across platforms

### Module Declarations

To support TypeScript with platform-specific modules, we provide custom type declarations in `global.d.ts` for:

- expo-linear-gradient
- expo-blur
- react-native-chart-kit
- expo-secure-store
- expo-media-library
- expo-image-manipulator
- react-native-view-shot

This allows the TypeScript compiler to understand these modules even when they're not available on web platforms.

## Development Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd emotiglass/frontend
   npm install
   ```

### Running the App

- **Mobile (iOS/Android)**:
  ```
  npm start
  ```
  Then scan the QR code with the Expo Go app

- **Web**:
  ```
  npm run web
  ```

## Project Structure

```
frontend/
  ├── assets/          # Static assets (images, sounds)
  ├── components/      # UI components
  │   ├── ui/          # Base UI components
  │   └── visualizations/ # Visualization components
  ├── constants/       # App constants and theme
  ├── hooks/           # Custom React hooks
  ├── navigation/      # Navigation setup
  ├── screens/         # App screens
  ├── services/        # Business logic and services
  └── utils/           # Utility functions
```

## Architecture Decisions

- **TypeScript** for type safety and better developer experience
- **Expo** for simplified mobile development and web compatibility
- **React Navigation** for smooth navigation between screens
- **React.createElement** for consistent rendering across platforms
- **Platform-specific modules** for native features with web fallbacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License. 

## Development Tips

When working on this codebase:

1. **Testing Cross-Platform**: Always test changes on both web and mobile platforms
2. **Platform Detection**: Use `Platform.OS` to provide platform-specific implementations
3. **Error Handling**: Implement robust error handling for platform-specific features
4. **Dependency Imports**: Use conditional imports for native modules to prevent web build errors 