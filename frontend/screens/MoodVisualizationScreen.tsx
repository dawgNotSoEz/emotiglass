import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MoodVisualization } from '../components/ui/MoodVisualization';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { analyzeEmotions } from '../services/emotionAnalysis';
import { saveMoodEntry } from '../services/storage';
import { EmotionData, EmotionAnalysisResult, MoodEntry } from '../types';

type MoodVisualizationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MoodVisualization'
>;

type MoodVisualizationScreenRouteProp = RouteProp<
  RootStackParamList,
  'MoodVisualization'
>;

export const MoodVisualizationScreen: React.FC = () => {
  const navigation = useNavigation<MoodVisualizationScreenNavigationProp>();
  const route = useRoute<MoodVisualizationScreenRouteProp>();
  const { emotionData } = route.params;
  
  const [moodAnalysis, setMoodAnalysis] = useState<EmotionAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  
  useEffect(() => {
    // Analyze the emotion data
    const analyzeData = async () => {
      const analysis = await analyzeEmotions(emotionData);
      setMoodAnalysis(analysis);
    };
    
    analyzeData();
  }, [emotionData]);
  
  const handleSave = async () => {
    if (!moodAnalysis) return;
    
    setIsSaving(true);
    try {
      // Create a mood entry
      const moodEntry: MoodEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        createdAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
        emotions: emotionData,
        dominantEmotion: moodAnalysis.dominantEmotion,
        confidence: moodAnalysis.confidence,
        notes: '',
        source: 'sliders'
      };
      
      await saveMoodEntry(moodEntry);
      setSaveComplete(true);
      
      // Reset state after a short delay
      setTimeout(() => {
        setSaveComplete(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to save mood entry:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleViewDiary = () => {
    navigation.navigate('MoodDiary');
  };
  
  if (!moodAnalysis) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing your emotions...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Full screen visualization */}
      <MoodVisualization moodAnalysis={moodAnalysis} />
      
      {/* Overlay controls */}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Mood Visualization</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.emotionLabel}>
            {moodAnalysis.dominantEmotion.toUpperCase()}
          </Text>
          
          <View style={styles.emotionBars}>
            {Object.entries(moodAnalysis.emotions).map(([emotion, value]) => (
              <View key={emotion} style={styles.emotionBarContainer}>
                <Text style={styles.emotionLabel}>{emotion}</Text>
                <View style={styles.emotionBarBackground}>
                  <View
                    style={[
                      styles.emotionBarFill,
                      { width: `${value * 100}%`, backgroundColor: getEmotionColor(emotion) }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving || saveComplete}
          >
            <Text style={styles.buttonText}>
              {saveComplete ? 'Saved!' : isSaving ? 'Saving...' : 'Save to Diary'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.diaryButton]}
            onPress={handleViewDiary}
          >
            <Text style={styles.buttonText}>View Diary</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Helper function to get a color for each emotion
const getEmotionColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    joy: '#FFD700',
    sadness: '#4169E1',
    anger: '#B22222',
    fear: '#556B2F',
    surprise: '#9932CC',
    disgust: '#228B22',
    contentment: '#4682B4',
  };
  
  return emotionColors[emotion] || colors.primary;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: 700,
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emotionLabel: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: 700,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  emotionBars: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: spacing.md,
  },
  emotionBarContainer: {
    marginBottom: spacing.sm,
  },
  emotionBarBackground: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  emotionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  diaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: 500,
  },
}); 