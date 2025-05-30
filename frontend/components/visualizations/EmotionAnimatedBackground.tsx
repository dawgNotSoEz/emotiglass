import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, ColorValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EmotionData } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EmotionAnimatedBackgroundProps {
  emotion: EmotionData;
  dominantEmotion: keyof EmotionData;
}

export const EmotionAnimatedBackground: React.FC<EmotionAnimatedBackgroundProps> = ({ 
  emotion,
  dominantEmotion
}) => {
  // Animation values
  const backgroundOpacity = useSharedValue(0.4);
  const particleScale = useSharedValue(1);
  const particleRotation = useSharedValue(0);
  const wavyBackgroundY = useSharedValue(0);
  
  // Determine colors based on dominant emotion
  const getEmotionColors = (emotion: keyof EmotionData): ColorValue[] => {
    switch(emotion) {
      case 'joy':
        return ['#FFD700', '#FFA500', '#FF8C00'];
      case 'sadness':
        return ['#4682B4', '#1E90FF', '#00BFFF'];
      case 'anger':
        return ['#FF0000', '#8B0000', '#B22222'];
      case 'fear':
        return ['#556B2F', '#6B8E23', '#808000'];
      case 'surprise':
        return ['#9932CC', '#8A2BE2', '#9400D3'];
      case 'disgust':
        return ['#228B22', '#008000', '#006400'];
      case 'contentment':
        return ['#20B2AA', '#48D1CC', '#40E0D0'];
      case 'neutral':
        return ['#A9A9A9', '#D3D3D3', '#DCDCDC'];
      default:
        return ['#4682B4', '#87CEEB', '#ADD8E6'];
    }
  };
  
  // Animation parameters based on emotion values
  const animationSpeed = 0.5 + (emotion.energy / 100);
  const waveAmplitude = 10 + (emotion.tension / 5);
  const particleAmount = 10 + Math.floor(emotion.energy / 10);
  
  // Generate particle positions
  const generateParticles = () => {
    const particles = [];
    
    for (let i = 0; i < particleAmount; i++) {
      const size = 10 + Math.random() * 40;
      const x = Math.random() * SCREEN_WIDTH;
      const y = Math.random() * SCREEN_HEIGHT;
      const opacity = 0.1 + Math.random() * 0.6;
      const rotation = Math.random() * 360;
      const emotionColors = getEmotionColors(dominantEmotion);
      const color = emotionColors[Math.floor(Math.random() * emotionColors.length)];
      
      particles.push({ size, x, y, opacity, rotation, color });
    }
    
    return particles;
  };
  
  const particles = generateParticles();
  
  // Start animations
  useEffect(() => {
    // Background opacity animation
    backgroundOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 * (1 / animationSpeed), easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000 * (1 / animationSpeed), easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Particle scale animation
    particleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500 * (1 / animationSpeed), easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 1500 * (1 / animationSpeed), easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Particle rotation animation
    particleRotation.value = withRepeat(
      withTiming(360, { 
        duration: 10000 * (1 / animationSpeed), 
        easing: Easing.linear 
      }),
      -1,
      false
    );
    
    // Wavy background animation
    wavyBackgroundY.value = withRepeat(
      withSequence(
        withTiming(waveAmplitude, { duration: 1000 * (1 / animationSpeed), easing: Easing.inOut(Easing.ease) }),
        withTiming(-waveAmplitude, { duration: 1000 * (1 / animationSpeed), easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [dominantEmotion, emotion.energy, emotion.tension]);
  
  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });
  
  const particleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: particleScale.value },
        { rotate: `${particleRotation.value}deg` }
      ],
    };
  });
  
  const wavyBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: wavyBackgroundY.value }
      ],
    };
  });
  
  // Get appropriate icon for the emotion
  const getEmotionIcon = (emotion: keyof EmotionData): string => {
    switch(emotion) {
      case 'joy':
        return 'happy';
      case 'sadness':
        return 'sad';
      case 'anger':
        return 'flame';
      case 'fear':
        return 'warning';
      case 'surprise':
        return 'flash';
      case 'disgust':
        return 'remove-circle';
      case 'contentment':
        return 'heart';
      case 'neutral':
        return 'radio-button-off';
      default:
        return 'help-circle';
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <Animated.View style={[styles.backgroundGradient, backgroundStyle]}>
        <LinearGradient
          colors={getEmotionColors(dominantEmotion) as unknown as readonly [ColorValue, ColorValue, ColorValue]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      {/* Wavy background */}
      <Animated.View style={[styles.wavyBackground, wavyBackgroundStyle]}>
        <View style={styles.wave} />
      </Animated.View>
      
      {/* Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              borderRadius: particle.size / 2,
              transform: [
                { rotate: `${particle.rotation}deg` }
              ]
            },
            particleStyle
          ]}
        />
      ))}
      
      {/* Center icon */}
      <View style={styles.centerIconContainer}>
        <Ionicons 
          name={getEmotionIcon(dominantEmotion) as any} 
          size={100} 
          color="rgba(255, 255, 255, 0.8)" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  wavyBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT * 0.8,
    left: -SCREEN_WIDTH * 0.25,
    bottom: -SCREEN_HEIGHT * 0.2,
  },
  wave: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: SCREEN_WIDTH * 0.5,
    borderTopRightRadius: SCREEN_WIDTH * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  centerIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const drawingToBase64 = async (drawingData: string): Promise<string | null> => {
  try {
    // In a real implementation, we would:
    // 1. Create an SVG from the drawing data
    // 2. Convert SVG to image (canvas or native module)
    // 3. Convert image to base64
    
    // For now, we'll return a placeholder base64 string
    // that starts with the drawing data but looks like base64
    const base64Prefix = 'data:image/png;base64,';
    // React Native doesn't have btoa, so use a workaround
    const mockBase64 = base64Prefix + `MockDrawing_${Date.now()}`;
    
    return mockBase64;
  } catch (error) {
    console.error('Failed to convert drawing to base64:', error);
    return null;
  }
}; 