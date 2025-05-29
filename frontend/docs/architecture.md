# EmotiGlass App Architecture

## Overview

EmotiGlass is a React Native/Expo app that allows users to express and visualize their emotions through various input methods including sliders, drawings, voice recordings, and facial expressions. The app then analyzes these inputs and provides visual representations of the emotional state, along with tracking and analyzing emotional trends over time.

## Project Structure

```
emotiglass/
  ├── frontend/              # Frontend application code
  │   ├── assets/            # Static assets (images, fonts)
  │   ├── components/        # React components
  │   │   ├── ui/            # Reusable UI components
  │   │   └── visualizations/ # Emotion visualization components
  │   ├── constants/         # App constants and configuration
  │   ├── hooks/             # Custom React hooks
  │   ├── navigation/        # Navigation configuration
  │   ├── screens/           # App screens
  │   ├── services/          # Business logic and data services
  │   └── utils/             # Utility functions
  ├── backend/               # Backend services (placeholder for future implementation)
  └── ai-models/             # AI model specifications (placeholder for future implementation)
```

## Key Components

### UI Components

- **EmotionSlider**: Interactive sliders for selecting emotion parameters (energy, calmness, tension).
- **DrawingCanvas**: Canvas for expressing emotions through drawing, with color and brush size options.
- **VoiceRecorder**: Records and analyzes voice input for emotional content.
- **FaceCamera**: Captures facial expressions and analyzes them for emotions.
- **GlassCard**: Glassmorphism-styled card component for consistent UI elements.
- **GradientBackground**: Dynamic gradient backgrounds that change based on emotions.
- **AnimatedTabBar**: Custom animated tab bar for app navigation.

### Visualization Components

- **EmotionAnimatedBackground**: Dynamic animated background that reflects the current emotional state.
- **EmotionParticles**: Particle effects that respond to emotion intensity.
- **EmotionWaves**: Wave animations that reflect emotional rhythms.
- **SimpleEmotionParticles**: Simplified version of the particle effects for lower-end devices.
- **MoodTrendCharts**: Various chart types (line, bar, pie, radar, heatmap) for visualizing emotional trends.

### Screens

- **HomeScreen**: Main entry point with overview of current emotional state.
- **EmotionInputScreen**: Hub for the different emotion input methods (sliders, drawing, voice, face).
- **MoodVisualizationScreen**: Displays visualizations of the analyzed emotions.
- **MoodDiaryScreen**: Historical log of emotional states with filtering options.
- **MoodAnalysisScreen**: Advanced analysis of emotional trends over time.

## Data Flow

1. **Input Collection**: User inputs emotional data through one of the four methods:
   - Manual adjustment of sliders
   - Drawing on the canvas
   - Recording voice notes
   - Capturing facial expressions

2. **Data Processing**: The input is processed by the corresponding service:
   - `drawingService.ts` for canvas drawings
   - `audioService.ts` for voice recordings
   - `faceAnalysis.ts` for facial expressions

3. **Emotion Analysis**: The processed data is analyzed to extract emotion parameters:
   - `emotionAnalysis.ts` converts raw inputs into standardized `EmotionData`
   - The analysis produces values for joy, sadness, anger, fear, surprise, disgust, contentment, neutral, energy, calmness, and tension

4. **Visualization**: The emotion data is used to generate visualizations:
   - Background colors and animations adjust to reflect emotional state
   - Particle effects change in intensity and color
   - Charts display current and historical data

5. **Storage**: Emotion data is stored locally using:
   - `storage.ts` manages mood entries in the device's secure storage
   - Entries can be filtered, searched, and analyzed over time

## Emotion Data Structure

The core data structure used throughout the app is the `EmotionData` interface:

```typescript
interface EmotionData {
  // Primary emotions (0-1 scale)
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  contentment: number;
  neutral: number;
  
  // Additional parameters (0-100 scale)
  energy: number;
  calmness: number;
  tension: number;
}
```

## Emotion Analysis Methods

### Drawing Analysis

The drawing analysis uses several heuristics:
- Stroke count (more strokes might indicate higher energy)
- Color variety (more colors might indicate emotional complexity)
- Line thickness (thicker lines might indicate stronger emotions)

### Voice Analysis

Voice analysis evaluates:
- Pitch variations
- Speaking rate
- Volume modulations
- Pauses and rhythms

### Facial Expression Analysis

Facial analysis looks at:
- Facial landmarks
- Movement patterns
- Known emotional expressions (smiling, frowning, etc.)

### Slider Inputs

Direct user inputs through sliders provide a baseline for comparison with the automated analysis methods.

## Visualization Techniques

### Color Mapping

Each emotion has an associated color palette:
- Joy: Gold/Yellow (#FFD700)
- Sadness: Blue (#4682B4)
- Anger: Red (#B22222)
- Fear: Green (#556B2F)
- Surprise: Purple (#9932CC)
- Disgust: Forest Green (#228B22)
- Contentment: Teal (#20B2AA)
- Neutral: Gray (#A9A9A9)

### Animation Parameters

- **Background Opacity**: Varies with emotional intensity
- **Particle Movement**: Changes with energy levels
- **Wave Amplitude**: Responds to tension levels
- **Animation Speed**: Increases with energy

## Storage and Persistence

The app uses several storage mechanisms:
- **SecureStore**: For sensitive data
- **FileSystem**: For larger data like images and recordings
- **AsyncStorage**: For general app data

Mood entries are stored as `MoodEntry` objects:

```typescript
interface MoodEntry {
  id: string;
  timestamp: number;
  createdAt: number;
  date: string;
  emotions: EmotionData;
  dominantEmotion: keyof EmotionData;
  confidence: number;
  notes?: string;
  source: 'sliders' | 'drawing' | 'voice' | 'face';
}
```

## Extending the App

### Adding New Input Methods

To add a new input method:
1. Create a new UI component in `components/ui/`
2. Implement a service in `services/` for processing the input
3. Add the method to the `EmotionInputScreen`
4. Update the `EmotionData` generation logic

### Creating New Visualizations

To create a new visualization:
1. Add a new component in `components/visualizations/`
2. Implement the necessary animation and rendering logic
3. Ensure it responds to the `EmotionData` structure
4. Add it to the appropriate screen(s)

## Future Development

- **Backend Integration**: Connect with a backend service for data synchronization
- **AI Model Integration**: Integrate more sophisticated emotion analysis models
- **Social Sharing**: Allow users to share their emotion visualizations
- **Wearable Integration**: Connect with wearable devices for continuous monitoring
- **Therapy Integration**: Provide insights and recommendations based on emotional patterns 