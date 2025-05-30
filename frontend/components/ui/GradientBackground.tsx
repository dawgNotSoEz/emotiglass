import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradientType?: keyof typeof theme.gradients;
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
  // Get the gradient colors based on the type
  const colors = theme.gradients[gradientType] || theme.gradients.primary;
  
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors as unknown as readonly [ColorValue, ColorValue, ColorValue]}
        style={[styles.gradient, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default GradientBackground; 