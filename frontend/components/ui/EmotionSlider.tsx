import React from 'react';
import { StyleSheet, View, Text, Slider } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface EmotionSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  leftLabel?: string;
  rightLabel?: string;
}

export const EmotionSlider: React.FC<EmotionSliderProps> = ({
  label,
  value,
  onValueChange,
  minimumTrackTintColor = colors.primary,
  maximumTrackTintColor = '#e0e0e0',
  thumbTintColor = colors.primary,
  leftLabel = 'Low',
  rightLabel = 'High',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.rangeLabel}>{leftLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={minimumTrackTintColor}
          maximumTrackTintColor={maximumTrackTintColor}
          thumbTintColor={thumbTintColor}
          step={1}
        />
        <Text style={styles.rangeLabel}>{rightLabel}</Text>
      </View>
      <Text style={styles.valueText}>{Math.round(value)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
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
  },
  slider: {
    flex: 1,
    height: 40,
  },
  rangeLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    width: 50,
    textAlign: 'center',
  },
  valueText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
}); 