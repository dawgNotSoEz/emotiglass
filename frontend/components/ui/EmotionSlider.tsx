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
  TextStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

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
  thumbTintColor = theme.colors.white
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
  
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      
      <View 
        style={styles.sliderContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setSliderWidth(width);
          position.setValue(valueToPosition(value));
        }}
      >
        {/* Track background */}
        <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </View>
        
        {/* Active track - using a non-animated View for the fill */}
        <View 
          style={[
            styles.activeTrack,
            { 
              backgroundColor: minimumTrackTintColor,
              width: `${percentage}%`,
            }
          ]}
        />
        
        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumbContainer,
            {
              transform: [
                { translateX: Animated.subtract(position, THUMB_SIZE / 2) },
                { scale }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.thumb, { backgroundColor: thumbTintColor, borderColor: minimumTrackTintColor }]} />
        </Animated.View>
      </View>
      
      <View style={styles.labelsContainer}>
        <Text style={styles.minMaxLabel}>{minLabel}</Text>
        <Text style={styles.valueLabel}>{Math.round(value)}</Text>
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
  label: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.charcoal,
    marginBottom: theme.spacing.sm,
  },
  sliderContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: theme.colors.lightGray,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  activeTrack: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    left: 0,
    top: (THUMB_SIZE - TRACK_HEIGHT) / 2,
  },
  thumbContainer: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
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
  valueLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default EmotionSlider; 