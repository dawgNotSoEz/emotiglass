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
  // Create shadow style based on elevation
  let shadowStyle: ViewStyle = {};
  if (elevation === 'low') {
    shadowStyle = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    };
  } else if (elevation === 'medium') {
    shadowStyle = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };
  } else if (elevation === 'high') {
    shadowStyle = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.32,
      shadowRadius: 5.46,
      elevation: 9,
    };
  }
  
  const paddingStyle = padding !== 'none'
    ? styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles]
    : {};
  
  const borderRadiusStyle = borderRadius !== 'none'
    ? styles[`borderRadius${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)}` as keyof typeof styles]
    : {};

  return React.createElement(
    View, 
    {
      style: [
        styles.card,
        shadowStyle,
        paddingStyle,
        borderRadiusStyle,
        style,
      ]
    },
    children
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    overflow: 'hidden',
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
    borderRadius: theme.radii.full,
  },
}); 