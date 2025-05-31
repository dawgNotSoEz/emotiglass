import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import theme from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'round';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = 'medium',
  borderRadius = 'medium',
}) => {
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
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
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