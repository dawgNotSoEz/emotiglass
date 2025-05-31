# EmotiGlass UI Components

## Voice Recorder Component

### Features
- Cross-platform voice recording support
- Mobile-specific audio recording with expo-av
- Web fallback with dummy data
- Configurable max recording duration
- Type-safe implementation with React.createElement

### Usage
```typescript
import VoiceRecorder from './VoiceRecorder';

function MyComponent() {
  const handleRecordingComplete = (recordingData) => {
    // Handle recording data
    console.log(recordingData);
  };

  return (
    <VoiceRecorder 
      onRecordingComplete={handleRecordingComplete}
      maxDuration={60} // Optional: max recording duration in seconds
    />
  );
}
```

### Props
- `onRecordingComplete`: Callback function receiving recording data
- `maxDuration`: Maximum recording duration (default: 60 seconds)

### Recording Data Structure
```typescript
interface VoiceRecordingData {
  uri: string | null;     // File URI of the recording
  duration: number;       // Recording duration in seconds
  decibels: number;       // Approximate sound level
}
```

## Face Detector Component

### Features
- Cross-platform face detection with expo-camera
- Mobile camera preview and face detection
- Detects facial features and expressions
- Web fallback with dummy data
- Type-safe implementation with React.createElement

### Usage
```typescript
import FaceDetector from './FaceDetector';

function MyComponent() {
  const handleFaceDetected = (faceData) => {
    // Handle face detection data
    console.log(faceData);
  };

  return (
    <FaceDetector 
      onFaceDetected={handleFaceDetected}
      showPreview={true} // Optional: show camera preview
    />
  );
}
```

### Props
- `onFaceDetected`: Callback function receiving face detection data
- `showPreview`: Whether to show camera preview (default: true)

### Face Detection Data Structure
```typescript
interface FaceDetectionData {
  smilingProbability: number;        // 0-1 probability of smiling
  leftEyeOpenProbability: number;    // 0-1 probability of left eye being open
  rightEyeOpenProbability: number;   // 0-1 probability of right eye being open
  headEulerAngleX: number;           // Head tilt (pitch)
  headEulerAngleY: number;           // Head rotation (yaw)
  headEulerAngleZ: number;           // Head roll
}
```

## Emotion Slider Component

### Features
- Custom slider for emotion input
- Animated thumb and track
- Range values from 0-100
- Support for custom colors and styling
- Type-safe implementation with React.createElement

### Usage
```typescript
import EmotionSlider from './EmotionSlider';

function MyComponent() {
  const [happinessValue, setHappinessValue] = useState(50);
  
  return (
    <EmotionSlider 
      label="Happiness"
      value={happinessValue}
      onValueChange={setHappinessValue}
      minLabel="Sad"
      maxLabel="Happy"
    />
  );
}
```

### Props
- `label`: The name of the emotion to display
- `value`: Current value of the slider (0-100)
- `onValueChange`: Callback function for value changes
- `minLabel` / `maxLabel`: Labels for min/max values
- Additional styling props available

## Platform Compatibility
- Mobile (iOS/Android): Full feature support
- Web: Limited functionality with dummy data fallback

## Dependencies
- expo-av (voice recording)
- expo-camera and expo-face-detector (face detection)
- expo-file-system (file handling)

## Type Safety
All components use React.createElement for improved type safety and cross-platform compatibility.

## Permissions
Requires camera and microphone permissions on mobile platforms.

## Cross-Platform Design Philosophy

Our UI components use several strategies to achieve maximum platform compatibility:

### React.createElement vs JSX

Most components use `React.createElement` instead of JSX syntax for rendering. This approach:

1. Provides better TypeScript compatibility across platforms
2. Avoids type conflicts between React Native and React Web definitions
3. Makes the components more resilient to type-checking errors

Example:
```typescript
// Instead of JSX:
<View style={styles.container}>
  <Text>Hello World</Text>
</View>

// We use React.createElement:
React.createElement(
  View,
  { style: styles.container },
  React.createElement(Text, null, "Hello World")
);
```

### Platform-Specific Component Alternatives

For components that depend on native-only features:

1. **GradientBackground**: Uses standard View with backgroundColor on web instead of LinearGradient
2. **FaceDetector**: Provides a simulated face detection experience on web
3. **VoiceRecorder**: Falls back to a simulated recording interface on web

### Type Safety Enhancements

All components use:

1. Strictly typed props interfaces
2. Type assertions where necessary for cross-platform compatibility
3. Defensive coding with nullish coalescing and optional chaining

## Dependency Management

The UI components avoid direct dependencies on native-only modules by:

1. Using conditional imports based on Platform.OS
2. Providing web-compatible alternatives for UI elements
3. Using type definitions in global.d.ts to satisfy TypeScript 