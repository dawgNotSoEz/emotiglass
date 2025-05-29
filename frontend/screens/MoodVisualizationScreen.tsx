import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import { RootStackParamList } from '../types';
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

// Placeholder component for visualization
const MoodVisualization: React.FC<{ moodAnalysis: EmotionAnalysisResult }> = ({ moodAnalysis }) => {
  return (
    <View style={{
      flex: 1,
      backgroundColor: getEmotionColor(moodAnalysis.dominantEmotion),
      opacity: 0.7
    }} />
  );
};

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
            {Object.entries(moodAnalysis.emotions).map(([emotion, value]) => {
              // Skip non-emotion properties
              if (['energy', 'calmness', 'tension'].includes(emotion)) return null;
              
              return (
                <View key={emotion} style={styles.emotionBarContainer}>
                  <Text style={styles.emotionBarLabel}>{emotion}</Text>
                  <View style={styles.emotionBarBackground}>
                    <View
                      style={[
                        styles.emotionBarFill,
                        { width: `${value * 100}%`, backgroundColor: getEmotionColor(emotion) }
                      ]}
                    />
                  </View>
                  <Text style={styles.emotionBarValue}>
                    {Math.round(value * 100)}%
                  </Text>
                </View>
              );
            })}
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
    neutral: '#A9A9A9',
  };
  
  return emotionColors[emotion] || theme.colors.primary;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emotionLabel: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  emotionBars: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: theme.spacing.md,
  },
  emotionBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emotionBarLabel: {
    width: 80,
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
  },
  emotionBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  emotionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emotionBarValue: {
    width: 40,
    textAlign: 'right',
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: theme.spacing.sm,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  diaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500',
  },
}); 