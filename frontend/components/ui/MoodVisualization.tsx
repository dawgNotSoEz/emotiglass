import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { MoodAnalysis } from '../../services/emotionAnalysis';
import { colors } from '../../constants/theme';

interface MoodVisualizationProps {
  moodAnalysis: MoodAnalysis;
}

// Helper to get colors based on emotion
const getEmotionColors = (emotion: string) => {
  const emotionColors: Record<string, string[]> = {
    joy: ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'],
    contentment: ['#4682B4', '#6495ED', '#87CEEB', '#ADD8E6'],
    anger: ['#8B0000', '#B22222', '#CD5C5C', '#FF6347'],
    sadness: ['#191970', '#000080', '#4169E1', '#6495ED'],
    fear: ['#2F4F4F', '#556B2F', '#708090', '#778899'],
    surprise: ['#9932CC', '#8A2BE2', '#9370DB', '#BA55D3'],
    disgust: ['#006400', '#228B22', '#6B8E23', '#808000'],
    neutral: ['#A9A9A9', '#D3D3D3', '#DCDCDC', '#F5F5F5'],
  };
  
  return emotionColors[emotion] || emotionColors.neutral;
};

export const MoodVisualization: React.FC<MoodVisualizationProps> = ({ moodAnalysis }) => {
  const { width, height } = Dimensions.get('window');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Animation values
  const animatedValues = {
    scale: useRef(new Animated.Value(0.8)).current,
    rotate: useRef(new Animated.Value(0)).current,
    opacity1: useRef(new Animated.Value(0.4)).current,
    opacity2: useRef(new Animated.Value(0.6)).current,
    opacity3: useRef(new Animated.Value(0.8)).current,
    movement: useRef(new Animated.Value(0)).current,
  };
  
  // Get colors based on the dominant emotion
  const emotionColors = getEmotionColors(moodAnalysis.dominantEmotion);
  
  // Play ambient sound based on mood
  useEffect(() => {
    const loadAndPlaySound = async () => {
      try {
        // In a real app, you would have actual audio files for each theme
        // For now, we'll use a placeholder sound
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/ambient.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.5 }
        );
        setSound(sound);
      } catch (error) {
        console.error('Error loading sound', error);
      }
    };
    
    loadAndPlaySound();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [moodAnalysis.audioTheme]);
  
  // Start animations
  useEffect(() => {
    const createAnimation = (value: Animated.Value, toValue: number, duration: number, easing = Easing.inOut(Easing.ease)) => {
      return Animated.timing(value, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      });
    };
    
    // Create animation sequences based on mood intensity
    const intensity = moodAnalysis.intensity / 100;
    const duration = 3000 - intensity * 1000; // Faster for higher intensity
    
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          createAnimation(animatedValues.scale, 1, duration),
          createAnimation(animatedValues.scale, 0.8, duration),
        ]),
        Animated.sequence([
          createAnimation(animatedValues.rotate, 1, duration * 2),
          createAnimation(animatedValues.rotate, 0, duration * 2),
        ]),
        Animated.sequence([
          createAnimation(animatedValues.opacity1, 0.7, duration),
          createAnimation(animatedValues.opacity1, 0.4, duration),
        ]),
        Animated.sequence([
          createAnimation(animatedValues.opacity2, 0.9, duration * 1.2),
          createAnimation(animatedValues.opacity2, 0.6, duration * 1.2),
        ]),
        Animated.sequence([
          createAnimation(animatedValues.opacity3, 1, duration * 1.5),
          createAnimation(animatedValues.opacity3, 0.8, duration * 1.5),
        ]),
        Animated.sequence([
          createAnimation(animatedValues.movement, 20, duration),
          createAnimation(animatedValues.movement, -20, duration),
          createAnimation(animatedValues.movement, 0, duration),
        ]),
      ])
    ).start();
    
  }, [moodAnalysis]);
  
  const spin = animatedValues.rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Create animated shapes based on mood
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background color */}
      <View style={[styles.background, { backgroundColor: emotionColors[0] }]} />
      
      {/* Animated circles */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: emotionColors[1],
            opacity: animatedValues.opacity1,
            transform: [
              { scale: animatedValues.scale },
              { translateX: animatedValues.movement },
              { rotate: spin },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: emotionColors[2],
            width: width * 0.7,
            height: width * 0.7,
            opacity: animatedValues.opacity2,
            transform: [
              { scale: animatedValues.scale },
              { translateY: animatedValues.movement },
              { rotate: spin },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: emotionColors[3],
            width: width * 0.4,
            height: width * 0.4,
            opacity: animatedValues.opacity3,
            transform: [
              { scale: animatedValues.scale },
              { translateX: Animated.multiply(animatedValues.movement, -1) },
              { translateY: Animated.multiply(animatedValues.movement, -1) },
              { rotate: spin },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    borderRadius: Dimensions.get('window').width / 2,
  },
}); 