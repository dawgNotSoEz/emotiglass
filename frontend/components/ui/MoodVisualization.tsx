import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { EmotionAnalysisResult } from '../../types';
import { EmotionParticles } from '../visualizations/SimpleEmotionParticles';
import { EmotionWaves } from '../visualizations/EmotionWaves';

interface MoodVisualizationProps {
  moodAnalysis: EmotionAnalysisResult;
}

// Helper function to get background color
const getEmotionBackgroundColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    joy: '#FFF8E1',
    contentment: '#E1F5FE',
    anger: '#FFEBEE',
    sadness: '#E8EAF6',
    fear: '#ECEFF1',
    surprise: '#F3E5F5',
    disgust: '#E8F5E9',
    neutral: '#F5F5F5',
  };
  
  return emotionColors[emotion] || '#F5F5F5';
};

// Helper function to get sound file
const getEmotionSoundFile = (moodAnalysis: EmotionAnalysisResult) => {
  // In a real app, you'd have different sound files for different emotions
  // For now, we'll use a placeholder
  try {
    return require('../../assets/sounds/ambient.mp3');
  } catch (error) {
    console.error('Error loading sound file:', error);
    return null;
  }
};

export const MoodVisualization: React.FC<MoodVisualizationProps> = ({ moodAnalysis }) => {
  const { width, height } = Dimensions.get('window');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Get colors based on the dominant emotion
  const backgroundColor = getEmotionBackgroundColor(moodAnalysis.dominantEmotion);
  
  // Play ambient sound based on mood
  useEffect(() => {
    const loadAndPlaySound = async () => {
      try {
        // Get the appropriate sound file based on emotion
        const soundFile = getEmotionSoundFile(moodAnalysis);
        
        // Load and play the sound
        const { sound } = await Audio.Sound.createAsync(
          soundFile,
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
  }, [moodAnalysis.dominantEmotion]);
  
  return (
    <View style={[styles.container, { width, height, backgroundColor }]}>
      {/* Base layer */}
      <View style={styles.background} />
      
      {/* Wave animations */}
      <EmotionWaves moodAnalysis={moodAnalysis} />
      
      {/* Particle system */}
      <EmotionParticles 
        moodAnalysis={moodAnalysis} 
        count={Math.round(30 + (moodAnalysis.intensity / 100) * 40)} 
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
}); 