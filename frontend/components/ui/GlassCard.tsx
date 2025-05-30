import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  StyleProp, 
  TouchableOpacity,
  Platform,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  onPress?: () => void;
  variant?: 'light' | 'medium' | 'heavy' | 'card';
}

const { width } = Dimensions.get('window');

// Glass styles for different variants
const glassStyles = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: theme.radii.md,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: theme.radii.md,
    ...theme.shadows.light,
  },
  heavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderRadius: theme.radii.lg,
    ...theme.shadows.medium,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: theme.radii.md,
    ...theme.shadows.medium,
  },
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 50,
  tint = 'default',
  onPress,
  variant = 'medium'
}) => {
  // Get the appropriate glass style based on the variant
  const glassStyle = glassStyles[variant];
  
  // Determine if we should make the card touchable
  const CardComponent = onPress ? TouchableOpacity : View;
  
  // We need to handle iOS and Android differently for the glass effect
  if (Platform.OS === 'ios') {
    return (
      <CardComponent
        style={[styles.container, glassStyle, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <BlurView intensity={intensity} tint={tint} style={styles.blurView}>
          {children}
        </BlurView>
      </CardComponent>
    );
  } else {
    // On Android, we'll use a semi-transparent background instead
    return (
      <CardComponent
        style={[styles.container, glassStyle, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        {children}
      </CardComponent>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    margin: theme.spacing.md,
    width: width - theme.spacing.md * 2,
  },
  blurView: {
    padding: theme.spacing.md,
    width: '100%',
    height: '100%',
  },
});

export default GlassCard; 