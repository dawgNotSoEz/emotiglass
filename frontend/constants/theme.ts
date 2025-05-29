import { Dimensions, Platform } from 'react-native';
import { Theme, ThemeColors, ThemeSpacing, ThemeTypography, ThemeRadii } from '../types';

const { width, height } = Dimensions.get('window');

// Color palette
export const colors: ThemeColors = {
  // Primary colors
  primary: '#4A90E2',
  primaryLight: '#6BA5E9',
  primaryDark: '#2E74C9',
  
  // Secondary colors
  secondary: '#50E3C2',
  secondaryLight: '#7FEBD1',
  secondaryDark: '#29C9A8',
  
  // Accent colors
  accent: '#FF6B6B',
  accentLight: '#FF9494',
  accentDark: '#E84A4A',
  
  // Emotion colors
  joy: '#FFD700', // Gold
  contentment: '#4682B4', // Steel Blue
  anger: '#B22222', // Firebrick
  sadness: '#4169E1', // Royal Blue
  fear: '#556B2F', // Dark Olive Green
  surprise: '#9932CC', // Dark Orchid
  disgust: '#228B22', // Forest Green
  neutral: '#808080', // Gray
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  lightGray: '#E9ECEF',
  gray: '#CED4DA',
  darkGray: '#6C757D',
  charcoal: '#343A40',
  black: '#212529',
  
  // UI specific
  background: '#F8F9FA',
  text: '#212529',
  textLight: '#6C757D',
  
  // Transparent colors for glassmorphism
  glassLight: 'rgba(255, 255, 255, 0.25)',
  glassDark: 'rgba(0, 0, 0, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  
  // Functional colors
  cardBackground: '#FFFFFF',
  border: '#DEE2E6',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
};

// Gradients
export const gradients = {
  primary: ['#7371FC', '#5E60CE'],
  secondary: ['#64DFDF', '#48BFE3'],
  accent: ['#FF5E78', '#D62246'],
  calm: ['#80FFDB', '#64DFDF'],
  warm: ['#FFD700', '#FF9E9E'],
  cool: ['#A594F9', '#64DFDF'],
  joyful: ['#FFD700', '#FFA500'],
  sad: ['#191970', '#4682B4'],
  angry: ['#FF4500', '#D62246'],
  neutral: ['#E9ECEF', '#CED4DA'],
  dark: ['#343A40', '#212529'],
};

// Typography
export const typography: ThemeTypography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

// Spacing
export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const radii: ThemeRadii = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 9999
};

// Shadows
export const shadows = {
  light: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Screen dimensions
export const screen = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Animation durations
export const animation = {
  fast: 200,
  medium: 300,
  slow: 500,
};

// Default export for convenience
const theme: Theme = {
  colors,
  gradients,
  typography,
  spacing,
  radii,
  shadows,
  screen,
  animation,
};

export default theme; 