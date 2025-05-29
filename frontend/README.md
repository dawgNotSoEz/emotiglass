# EmotiGlass Frontend

EmotiGlass is a React Native/Expo app that enables users to express, visualize, and track their emotions through various interactive input methods. The app uses different visualization techniques to represent emotional states and provides tools for tracking emotional patterns over time.

## Features

- **Multiple Emotion Input Methods:**
  - Interactive sliders to manually adjust emotion parameters
  - Drawing canvas for expressing emotions through art
  - Voice recorder to analyze emotional content in speech
  - Facial expression analysis using the device camera

- **Advanced Emotion Visualizations:**
  - Dynamic animated backgrounds that change with emotions
  - Particle effects that respond to emotional intensity
  - Interactive charts for visualizing emotional trends

- **Emotion Tracking and Analysis:**
  - Mood diary to record and review emotional states
  - Trend analysis with multiple chart types
  - Filtering and searching through historical entries

## Setup Instructions

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A mobile device or emulator/simulator

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd emotiglass/frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npx expo start
   ```

4. Open the app on your device:
   - Scan the QR code with the Expo Go app (Android) or Camera app (iOS)
   - Or press 'a' to open on an Android emulator or 'i' for iOS simulator

### Required Permissions

The app requires the following permissions:
- Camera access (for facial expression analysis)
- Microphone access (for voice recording)
- Storage access (for saving drawings and recordings)

## Directory Structure

```
frontend/
  ├── assets/            # Static assets (images, fonts)
  ├── components/        # React components
  │   ├── ui/            # Reusable UI components
  │   └── visualizations/ # Emotion visualization components
  ├── constants/         # App constants and configuration
  ├── docs/              # Documentation
  ├── hooks/             # Custom React hooks
  ├── navigation/        # Navigation configuration
  ├── screens/           # App screens
  ├── services/          # Business logic and data services
  └── utils/             # Utility functions
```

## Usage Guide

### Emotion Input

1. **Sliders:** Adjust the sliders to indicate your energy, calmness, and tension levels.
2. **Drawing:** Express your emotions by drawing on the canvas with different colors and brush sizes.
3. **Voice:** Record a voice note to analyze emotional content in your speech patterns.
4. **Face:** Use the camera to capture and analyze your facial expressions.

### Visualization

After inputting your emotions, the app will:
1. Analyze the inputs to determine your emotional state
2. Generate visualizations based on the analysis
3. Provide options to save the entry to your mood diary

### Trend Analysis

Access the Mood Analysis screen to:
1. View charts of your emotional trends over time
2. Adjust the time range (1 week, 2 weeks, 1 month, 3 months)
3. Gain insights about your emotional patterns

## Development Guidelines

### Adding New Components

1. Create the component in the appropriate directory
2. Follow the existing design patterns and styling approaches
3. Use the theme constants for colors, spacing, and typography
4. Write proper TypeScript interfaces for props

### Styling Conventions

- Use StyleSheet.create() for all styles
- Reference theme constants for consistent design
- Use the GlassCard component for card-like UI elements
- Implement responsive layouts using percentages and Dimensions API

### Testing

Run tests with:
```
npm test
```

## Learn More

See the [architecture documentation](./docs/architecture.md) for a deeper understanding of how the app works.

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 