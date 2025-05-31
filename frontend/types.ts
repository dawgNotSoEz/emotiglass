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
  createdAt: number;
  date: string;
  emotions: EmotionData;
  dominantEmotion: keyof EmotionData;
  confidence: number;
  notes?: string;
  source: 'sliders' | 'drawing' | 'voice' | 'face';
  drawingData?: string; // JSON string of drawing paths for thumbnails
  
  // Personalization features
  tags?: string[]; // User-defined tags like "Morning", "Work", "Exercise", etc.
  emojiSummary?: string; // Emoji representing the mood
  title?: string; // User-defined title for the entry
  isFavorite?: boolean; // Whether entry is marked as favorite
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  EmotionInput: undefined;
  MoodDiary: undefined;
  MoodAnalysis: undefined;
  Settings: undefined;
  MoodVisualization: {
    emotionData: EmotionData;
  };
  EntryDetails: {
    entryId: string;
  };
  AmbientMode: undefined;
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
  
  // Transparent colors for glassmorphism
  glassLight: string;
  glassDark: string;
  glassBorder: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeTypography {
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    display: number;
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
    light: string;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
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

export interface ThemeGradients {
  primary: string[];
  secondary: string[];
  accent: string[];
  calm: string[];
  warm: string[];
  cool: string[];
  joyful: string[];
  sad: string[];
  angry: string[];
  neutral: string[];
  dark: string[];
}

export interface ThemeShadows {
  light: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  heavy: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface ThemeScreen {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  gradients: ThemeGradients;
  screen: ThemeScreen;
  animation: {
    fast: number;
    medium: number;
    slow: number;
  };
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