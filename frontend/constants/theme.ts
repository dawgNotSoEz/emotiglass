import { Dimensions, Platform } from 'react-native';
import { Theme, ThemeColors, ThemeSpacing, ThemeTypography, ThemeRadii } from '../types';

const { width, height } = Dimensions.get('window');
// Theme constants for EmotiGlass app
export const theme = {
  // Color palette
  colors: {
    primary: '#6A5ACD', // Slate Blue
    secondary: '#4169E1', // Royal Blue
    background: '#F0F4F8', // Light Blue-Gray
    cardBackground: '#FFFFFF', // White
    text: '#1A2B3C', // Dark Blue-Gray
    textLight: '#6B7280', // Gray
    border: '#E2E8F0', // Light Border
    accent: '#10B981', // Emerald Green
    error: '#EF4444', // Red
    success: '#10B981', // Green
    warning: '#E3A55D', // Warning color (orange)
    info: '#5DB1E3', // Info color (light blue)
  },
  
  // Typography
  typography: {
    // Font families
    fontFamily: {
      sans: 'System', // Default system font
      mono: 'Courier', // Monospace font
    },
    
    // Font sizes
    fontSizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
    },
    
    // Font weights
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    },
    
    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  // Border radius
  radii: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    light: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
    },
    medium: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
      textShadow: '2px 2px 3px rgba(0, 0, 0, 0.15)',
    },
    dark: {
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
      textShadow: '3px 3px 4px rgba(0, 0, 0, 0.2)',
    },
  },
  
  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Z-index values
  zIndices: {
    base: 0,
    content: 1,
    overlay: 10,
    modal: 20,
    toast: 30,
  },
};

export default theme; 