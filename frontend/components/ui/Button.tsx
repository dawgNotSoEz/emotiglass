import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  style, 
  ...props 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant], style]} 
      {...props}
    >
      <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    color: 'white',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  outlineText: {
    color: colors.primary,
  },
}); 