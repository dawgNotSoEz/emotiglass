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
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';
import Slider from '@react-native-community/slider';

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
  gradientColors = theme.gradients.primary,
  minimumTrackTintColor = theme.colors.primary,
  maximumTrackTintColor = theme.colors.lightGray,
  thumbTintColor = theme.colors.white,
  colorGradient = [theme.colors.primary, theme.colors.secondary]
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
  const normalizeValue = (val: number) => val / 100;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        <Text style={styles.valueText}>{Math.round(value)}</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={normalizeValue(value)}
          onValueChange={(val) => onValueChange(val * 100)}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={minimumTrackTintColor}
          maximumTrackTintColor={maximumTrackTintColor}
          thumbTintColor={thumbTintColor}
        />
        <LinearGradient
          style={styles.gradient}
          colors={colorGradient as unknown as readonly [ColorValue, ColorValue, ColorValue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      
      <View style={styles.labelsContainer}>
        <Text style={styles.minMaxLabel}>{minLabel}</Text>
        <Text style={styles.minMaxLabel}>{maxLabel}</Text>
      </View>
    </View>
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
    fontWeight: '700',
    color: theme.colors.charcoal,
  },
  valueText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sliderContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    width: '100%',
    height: THUMB_SIZE,
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
    color: theme.colors.darkGray,
  },
});

export default EmotionSlider; 