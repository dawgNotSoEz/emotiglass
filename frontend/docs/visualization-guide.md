# EmotiGlass Visualization Guide

This document explains the various visualization techniques used in the EmotiGlass app to represent emotions.

## Color Mapping

Each emotion is associated with specific colors that are used throughout the app's visualizations:

| Emotion      | Primary Color | Hex Code | Secondary Color | Description                                   |
|--------------|---------------|----------|----------------|-----------------------------------------------|
| Joy          | Yellow/Gold   | #FFD700  | #FFA500        | Bright, warm colors representing happiness    |
| Sadness      | Blue          | #4682B4  | #1E90FF        | Cool, deep colors representing melancholy     |
| Anger        | Red           | #B22222  | #8B0000        | Intense, hot colors representing frustration  |
| Fear         | Dark Green    | #556B2F  | #2F4F4F        | Muted, dark colors representing apprehension  |
| Surprise     | Purple        | #9932CC  | #8A2BE2        | Vibrant, striking colors representing shock   |
| Disgust      | Forest Green  | #228B22  | #006400        | Sickly, unsettling greens representing aversion |
| Contentment  | Teal          | #20B2AA  | #5F9EA0        | Balanced, cool colors representing satisfaction |
| Neutral      | Gray          | #A9A9A9  | #D3D3D3        | Balanced, neutral colors representing calmness  |

## Animated Background

The `EmotionAnimatedBackground` component creates a dynamic background that shifts based on the current emotional state:

1. **Color Transition**: The background color shifts between colors based on the dominant emotion
2. **Opacity Variation**: The background opacity changes with the intensity of the emotion
3. **Flow Movement**: Subtle flow patterns move at different speeds based on energy levels

## Particle Effects

The `EmotionParticles` component generates particle systems that respond to emotional states:

### Particle Properties by Emotion

| Emotion      | Particle Shape | Movement Pattern | Speed   | Size Variation |
|--------------|----------------|------------------|---------|----------------|
| Joy          | Circle/Star    | Rising/Floating  | Fast    | Medium to Large |
| Sadness      | Droplet        | Falling          | Slow    | Small to Medium |
| Anger        | Sharp/Angular  | Explosive        | Rapid   | Variable       |
| Fear         | Dot/Smoke      | Scattered        | Erratic | Small          |
| Surprise     | Starburst      | Expanding        | Very Fast | Large        |
| Disgust      | Irregular      | Repelling        | Medium  | Small          |
| Contentment  | Rounded        | Flowing          | Gentle  | Medium         |
| Neutral      | Simple         | Drifting         | Steady  | Uniform        |

### Intensity Factors

The intensity of emotions affects:
- Number of particles (more particles = higher intensity)
- Speed of movement (faster = higher energy)
- Size variation (more variation = more complex emotions)
- Opacity (more solid = stronger emotion)

## Wave Animations

The `EmotionWaves` component generates wave patterns that represent emotional rhythms:

### Wave Properties

| Emotion Parameter | Wave Effect                                             |
|-------------------|--------------------------------------------------------|
| Energy            | Wave frequency (higher energy = more frequent waves)    |
| Calmness          | Wave smoothness (higher calmness = smoother waves)      |
| Tension           | Wave amplitude (higher tension = larger amplitude)      |

### Wave Types

1. **Sinusoidal Waves**: Smooth, regular waves representing balanced emotions
2. **Jagged Waves**: Sharp, irregular waves representing stress or tension
3. **Ripple Waves**: Concentric circles representing focused emotions
4. **Noise Waves**: Random, textured patterns representing emotional complexity

## Chart Visualizations

The `MoodTrendCharts` component offers several chart types for emotional data:

### Line Chart
Shows emotional parameters (energy, calmness, tension) over time.
- X-axis: Time (days)
- Y-axis: Parameter values (0-100)
- Multiple lines show different parameters

### Pie Chart
Shows the distribution of emotions in the selected period.
- Segments represent proportion of different emotions
- Size corresponds to frequency
- Colors match the emotion color map

### Bar Chart
Shows time-of-day distribution of emotional states.
- X-axis: Time periods (morning, afternoon, evening, night)
- Y-axis: Frequency of entries
- Colors can represent dominant emotions

### Radar/Progress Chart
Shows current emotional profile across multiple dimensions.
- Each axis represents a different emotion or parameter
- Shape indicates the overall emotional balance
- Larger areas indicate stronger emotions

### Heatmap
Shows mood activity calendar over time.
- Calendar view with color intensity showing entry frequency
- Darker colors indicate more entries on that day
- Patterns reveal emotional rhythms over weeks/months

## Interactive Elements

Visualizations include interactive elements:
- Touch feedback with ripple effects
- Zoom capabilities on charts
- Time period selection for trend analysis
- Animation transitions between different visualization types
- Real-time updates as new emotional data is added

## Accessibility Considerations

All visualizations include:
- Text descriptions of emotional states
- High contrast mode for visibility
- Alternative representations for color-blind users
- Haptic feedback for interactive elements

## Technical Implementation

Visualizations are implemented using:
- React Native's Animated API
- react-native-reanimated for performance
- SVG components for precise rendering
- react-native-chart-kit for data visualization
- Linear gradients for smooth color transitions
- Particle systems built with custom algorithms

## Platform-Specific Optimizations

The app includes specialized versions of visualizations for different devices:
- `SimpleEmotionParticles` for lower-end devices
- High-performance rendering on newer devices
- Reduced animation complexity when battery is low 