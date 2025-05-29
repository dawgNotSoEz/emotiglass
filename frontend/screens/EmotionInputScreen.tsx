import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DrawingCanvas, Path } from '../components/ui/DrawingCanvas';
import { EmotionSlider } from '../components/ui/EmotionSlider';
import { VoiceRecorder } from '../components/ui/VoiceRecorder';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type EmotionInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmotionInput'>;

interface EmotionData {
  drawing: Path[];
  energy: number;
  calmness: number;
  tension: number;
  voiceUri?: string;
  timestamp: number;
}

export const EmotionInputScreen: React.FC = () => {
  const navigation = useNavigation<EmotionInputScreenNavigationProp>();
  const { width } = useWindowDimensions();
  
  const [emotionData, setEmotionData] = useState<EmotionData>({
    drawing: [],
    energy: 50,
    calmness: 50,
    tension: 50,
    timestamp: Date.now(),
  });
  
  const handleDrawingUpdate = (paths: Path[]) => {
    setEmotionData(prev => ({ ...prev, drawing: paths }));
  };
  
  const handleSliderChange = (key: 'energy' | 'calmness' | 'tension', value: number) => {
    setEmotionData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleVoiceRecordingComplete = (uri: string) => {
    setEmotionData(prev => ({ ...prev, voiceUri: uri }));
  };
  
  const handleSubmit = () => {
    // Here we would process the emotion data and then navigate
    navigation.navigate('MoodVisualization', { emotionData });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Express Your Emotions</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.sectionTitle}>Draw How You Feel</Text>
        <View style={styles.canvasContainer}>
          <DrawingCanvas 
            width={width - spacing.lg * 2}
            height={300}
            onDrawingUpdate={handleDrawingUpdate}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Emotion Parameters</Text>
        <View style={styles.slidersContainer}>
          <EmotionSlider 
            label="Energy Level" 
            leftLabel="Low" 
            rightLabel="High"
            accentColor={colors.primary}
            onValueChange={(value) => handleSliderChange('energy', value)}
          />
          <EmotionSlider 
            label="Calmness" 
            leftLabel="Agitated" 
            rightLabel="Peaceful"
            accentColor={colors.secondary}
            onValueChange={(value) => handleSliderChange('calmness', value)}
          />
          <EmotionSlider 
            label="Tension" 
            leftLabel="Relaxed" 
            rightLabel="Tense"
            accentColor={colors.accent}
            onValueChange={(value) => handleSliderChange('tension', value)}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Voice Tone</Text>
        <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create My Mood Visualization</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  canvasContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  slidersContainer: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
}); 