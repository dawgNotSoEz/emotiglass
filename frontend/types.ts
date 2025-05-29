// Common types used across the application

// Emotion data structure
export interface EmotionData {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  contentment: number;
  neutral: number;
  // Additional emotion parameters
  energy: number;
  calmness: number;
  tension: number;
}

// Result of emotion analysis
export interface EmotionAnalysisResult {
  emotions: EmotionData;
  dominantEmotion: keyof EmotionData;
  confidence: number;
  timestamp: number;
  intensity: number; // Overall intensity of emotion
}

// Mood entry for storage
export interface MoodEntry {
  id: string;
  timestamp: number;
  date: string;
  emotions: EmotionData;
  dominantEmotion: keyof EmotionData;
  confidence: number;
  notes?: string;
  source: 'sliders' | 'drawing' | 'voice' | 'face';
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  EmotionInput: undefined;
  MoodDiary: undefined;
  MoodAnalysis: undefined;
  Settings: undefined;
};

// Theme types
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // Emotion colors
  joy: string;
  contentment: string;
  anger: string;
  sadness: string;
  fear: string;
  surprise: string;
  disgust: string;
  neutral: string;
  
  // UI colors
  white: string;
  offWhite: string;
  lightGray: string;
  gray: string;
  darkGray: string;
  charcoal: string;
  black: string;
  
  // Functional colors
  text: string;
  textLight: string;
  background: string;
  cardBackground: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  glassBackground: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeights: {
    light: "300";
    regular: "400";
    medium: "500";
    bold: "700";
  };
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
}

export interface ThemeAnimation {
  scale: {
    in: object;
    out: object;
  };
  opacity: {
    in: object;
    out: object;
  };
  timing: {
    fast: number;
    normal: number;
    slow: number;
  };
}

export interface ThemeRadii {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radii: ThemeRadii;
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
  glass: {
    light: object;
    dark: object;
    accent: object;
  };
  animation: ThemeAnimation;
}

// Types for drawing paths
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  width: number;
} 