import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#3498db',
  },
  secondary: {
    backgroundColor: '#2ecc71',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#3498db',
  },
}); 