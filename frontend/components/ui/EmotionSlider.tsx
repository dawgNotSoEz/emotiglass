import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface EmotionSliderProps {
  label: string;
  min?: number;
  max?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  accentColor?: string;
}

export const EmotionSlider: React.FC<EmotionSliderProps> = ({
  label,
  min = 0,
  max = 100,
  initialValue = 50,
  onValueChange,
  leftLabel = 'Low',
  rightLabel = 'High',
  accentColor = colors.primary,
}) => {
  const [value, setValue] = useState(initialValue);
  const animatedValue = new Animated.Value(
    ((initialValue - min) / (max - min)) * 100
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const trackWidth = 300; // Approximate width of the track
      let newValue = (gestureState.moveX / trackWidth) * (max - min) + min;
      
      // Clamp the value between min and max
      newValue = Math.max(min, Math.min(max, newValue));
      
      // Update the animated value and state
      const percentage = ((newValue - min) / (max - min)) * 100;
      animatedValue.setValue(percentage);
      setValue(newValue);
      
      if (onValueChange) {
        onValueChange(newValue);
      }
    },
  });

  const animatedStyle = {
    width: animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.endLabel}>{leftLabel}</Text>
        <View
          style={styles.track}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.fill,
              animatedStyle,
              { backgroundColor: accentColor },
            ]}
          />
          <Animated.View
            style={[
              styles.thumb,
              {
                left: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
        <Text style={styles.endLabel}>{rightLabel}</Text>
      </View>
      <Text style={styles.valueText}>{Math.round(value)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  endLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    width: 40,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.sm,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    height: '100%',
    left: 0,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -8,
    marginLeft: -10,
  },
  valueText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
}); 