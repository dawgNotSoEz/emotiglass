import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  PanResponder, 
  Animated, 
  Dimensions,
  ViewStyle,
  StyleProp,
  TextStyle,
  ColorValue
} from 'react-native';
// Using regular View instead of LinearGradient since it's not available
import theme from '../../constants/theme';
// Using Animated.View instead of external slider
// import Slider from '@react-native-community/slider';

// Add missing theme color
const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    lightGray: '#e0e0e0' // Fallback for missing theme color
  }
};

interface EmotionSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  gradientColors?: string[];
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  colorGradient?: ColorValue[];
}

const { width } = Dimensions.get('window');
const TRACK_HEIGHT = 8;
const THUMB_SIZE = 28;

export const EmotionSlider: React.FC<EmotionSliderProps> = ({
  label,
  value,
  onValueChange,
  minLabel = 'Low',
  maxLabel = 'High',
  min = 0,
  max = 100,
  step = 1,
  style,
  labelStyle,
  gradientColors = [customTheme.colors.primary, customTheme.colors.secondary],
  minimumTrackTintColor = customTheme.colors.primary,
  maximumTrackTintColor = customTheme.colors.lightGray,
  thumbTintColor = customTheme.colors.text,
  colorGradient = [customTheme.colors.primary, customTheme.colors.secondary]
}) => {
  const [sliderWidth, setSliderWidth] = useState(width - 40);
  
  // Convert value to position
  const valueToPosition = (val: number) => {
    return ((val - min) / (max - min)) * sliderWidth;
  };
  
  // Convert position to value
  const positionToValue = (pos: number) => {
    const rawValue = min + (pos / sliderWidth) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };
  
  // Animated values
  const position = new Animated.Value(valueToPosition(value));
  const scale = new Animated.Value(1);
  
  // Update position when value changes
  useEffect(() => {
    position.setValue(valueToPosition(value));
  }, [value, sliderWidth]);
  
  // Calculate the percentage for rendering (not animation)
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Pan responder for handling gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => {
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }).start();
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 20));
      position.setValue(newPosition);
      onValueChange(positionToValue(newPosition));
    },
    onPanResponderRelease: () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }).start();
    }
  });
  
  // Function to normalize value from 0-100 to 0-1
  const normalizeValue = (val: number): number => val / 100;

  // Create a custom slider instead of using the community slider
  const renderCustomSlider = () => {
    const thumbPosition = position.interpolate({
      inputRange: [0, sliderWidth],
      outputRange: [0, sliderWidth],
      extrapolate: 'clamp',
    });

    return React.createElement(
      View, 
      { style: styles.sliderContainer },
      // Track background
      React.createElement(
        View, 
        { style: [styles.track, { backgroundColor: maximumTrackTintColor }] }
      ),
      // Active track
      React.createElement(
        View, 
        { 
          style: [
            styles.activeTrack, 
            { 
              width: `${percentage}%`,
              backgroundColor: minimumTrackTintColor 
            }
          ] 
        }
      ),
      // Thumb
      React.createElement(
        Animated.View,
        {
          ...panResponder.panHandlers,
          style: [
            styles.thumb,
            {
              backgroundColor: thumbTintColor,
              transform: [
                { translateX: thumbPosition },
                { scale: scale }
              ],
            }
          ]
        }
      )
    );
  };

  return React.createElement(
    View, 
    { style: [styles.container, style] },
    // Label Container
    React.createElement(
      View, 
      { style: styles.labelContainer },
      React.createElement(
        Text, 
        { style: [styles.label, labelStyle] },
        label
      ),
      React.createElement(
        Text, 
        { style: styles.valueText },
        Math.round(value).toString()
      )
    ),
    // Slider Container
    renderCustomSlider(),
    // Labels Container
    React.createElement(
      View, 
      { style: styles.labelsContainer },
      React.createElement(
        Text, 
        { style: styles.minMaxLabel },
        minLabel
      ),
      React.createElement(
        Text, 
        { style: styles.minMaxLabel },
        maxLabel
      )
    )
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as '700',
    color: theme.colors.text,
  },
  valueText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as '700',
    color: theme.colors.primary,
  },
  sliderContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: TRACK_HEIGHT,
    width: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  activeTrack: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    top: -(THUMB_SIZE - TRACK_HEIGHT) / 2,
    left: 0,
    marginLeft: -(THUMB_SIZE / 2),
    ...theme.shadows.light,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  minMaxLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
});

export default EmotionSlider; 