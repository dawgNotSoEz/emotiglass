import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, ColorValue } from 'react-native';
import theme from '../../constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // Corrected the type of gradientType to match the actual structure of the theme object
  gradientType?: keyof typeof theme.colors;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  animated?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  gradientType = 'primary',
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  animated = false,
}) => {
  // Get the gradient color (using just the primary color since we don't have LinearGradient)
  const backgroundColor = theme.colors[gradientType] || theme.colors.primary;
  
  return React.createElement(
    View, 
    { 
      style: [
        styles.container, 
        { backgroundColor },
        style
      ] 
    },
    children
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  }
});

export default GradientBackground; 