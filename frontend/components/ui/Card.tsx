import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import theme from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'round';
}

/**
 * A reusable card component with consistent styling
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'low',
  padding = 'medium',
  borderRadius = 'medium',
}) => {
  return (
    <View 
      style={[
        styles.card,
        elevation === 'none' ? null : styles[`elevation${elevation.charAt(0).toUpperCase() + elevation.slice(1)}`],
        padding === 'none' ? null : styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        borderRadius === 'none' ? null : styles[`borderRadius${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)}`],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    overflow: 'hidden',
  },
  // Elevation styles
  elevationLow: {
    ...theme.shadows.light,
  },
  elevationMedium: {
    ...theme.shadows.medium,
  },
  elevationHigh: {
    ...theme.shadows.heavy,
  },
  // Padding styles
  paddingSmall: {
    padding: theme.spacing.sm,
  },
  paddingMedium: {
    padding: theme.spacing.md,
  },
  paddingLarge: {
    padding: theme.spacing.lg,
  },
  // Border radius styles
  borderRadiusSmall: {
    borderRadius: theme.radii.sm,
  },
  borderRadiusMedium: {
    borderRadius: theme.radii.md,
  },
  borderRadiusLarge: {
    borderRadius: theme.radii.lg,
  },
  borderRadiusRound: {
    borderRadius: theme.radii.round,
  },
}); 