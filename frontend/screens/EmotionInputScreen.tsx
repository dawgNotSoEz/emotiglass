import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { EmotionSlider } from '../components/ui/EmotionSlider';
import { DrawingCanvas } from '../components/ui/DrawingCanvas';
import { VoiceRecorder } from '../components/ui/VoiceRecorder';
import { FaceCamera } from '../components/ui/FaceCamera';
import { analyzeEmotion, EmotionData, EmotionAnalysisResult } from '../services/emotionAnalysis';
import { saveMoodEntry } from '../services/storage';
import { FaceAnalysisResult, integrateEmotionData } from '../services/faceAnalysis';

type EmotionInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmotionInput'>;

export const EmotionInputScreen: React.FC = () => {
  const navigation = useNavigation<EmotionInputScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'sliders' | 'drawing' | 'voice' | 'face'>('sliders');
  const [emotionData, setEmotionData] = useState<EmotionData>({
    energy: 50,
    calmness: 50,
    tension: 50,
    drawing: null,
    voiceNote: null,
    notes: '',
  });
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Update emotion data from sliders
  const handleSliderChange = (name: keyof EmotionData, value: number) => {
    setEmotionData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Update emotion data from drawing
  const handleDrawingComplete = (drawingData: string) => {
    setEmotionData(prev => ({
      ...prev,
      drawing: drawingData,
    }));
  };
  
  // Update emotion data from voice recording
  const handleVoiceRecorded = (uri: string) => {
    setEmotionData(prev => ({
      ...prev,
      voiceNote: uri,
    }));
  };
  
  // Handle face emotion detection
  const handleFaceEmotionDetected = (result: FaceAnalysisResult) => {
    setFaceAnalysis(result);
    
    // Integrate face analysis with current emotion data
    const updatedData = integrateEmotionData(emotionData, result);
    setEmotionData(updatedData);
  };
  
  // Submit and analyze emotion data
  const handleSubmit = async () => {
    setAnalyzing(true);
    
    try {
      // Analyze emotion data
      const analysisResult = await analyzeEmotion(emotionData);
      
      // Save mood entry
      await saveMoodEntry({
        id: Date.now().toString(),
        createdAt: Date.now(),
        emotionData,
        analysis: analysisResult,
      });
      
      // Navigate to visualization screen
      navigation.navigate('MoodVisualization', {
        emotionData: {
          ...emotionData,
          analysis: analysisResult,
        },
      });
    } catch (error) {
      console.error('Failed to analyze emotions:', error);
      Alert.alert('Error', 'Failed to analyze emotions. Please try again.');
    } finally {
      setAnalyzing(false);
    }
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
        <Text style={styles.headerTitle}>How are you feeling?</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sliders' ? styles.activeTab : null]}
          onPress={() => setActiveTab('sliders')}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={activeTab === 'sliders' ? colors.primary : colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'sliders' ? styles.activeTabText : null
            ]}
          >
            Sliders
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drawing' ? styles.activeTab : null]}
          onPress={() => setActiveTab('drawing')}
        >
          <Ionicons 
            name="brush" 
            size={20} 
            color={activeTab === 'drawing' ? colors.primary : colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'drawing' ? styles.activeTabText : null
            ]}
          >
            Draw
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voice' ? styles.activeTab : null]}
          onPress={() => setActiveTab('voice')}
        >
          <Ionicons 
            name="mic" 
            size={20} 
            color={activeTab === 'voice' ? colors.primary : colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'voice' ? styles.activeTabText : null
            ]}
          >
            Voice
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'face' ? styles.activeTab : null]}
          onPress={() => setActiveTab('face')}
        >
          <Ionicons 
            name="camera" 
            size={20} 
            color={activeTab === 'face' ? colors.primary : colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'face' ? styles.activeTabText : null
            ]}
          >
            Face
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'sliders' && (
          <View style={styles.slidersContainer}>
            <EmotionSlider
              label="Energy"
              value={emotionData.energy}
              onValueChange={(value) => handleSliderChange('energy', value)}
              minimumTrackTintColor="#3498db"
              maximumTrackTintColor="#bdc3c7"
              thumbTintColor="#3498db"
            />
            <EmotionSlider
              label="Calmness"
              value={emotionData.calmness}
              onValueChange={(value) => handleSliderChange('calmness', value)}
              minimumTrackTintColor="#2ecc71"
              maximumTrackTintColor="#bdc3c7"
              thumbTintColor="#2ecc71"
            />
            <EmotionSlider
              label="Tension"
              value={emotionData.tension}
              onValueChange={(value) => handleSliderChange('tension', value)}
              minimumTrackTintColor="#e74c3c"
              maximumTrackTintColor="#bdc3c7"
              thumbTintColor="#e74c3c"
            />
          </View>
        )}
        
        {activeTab === 'drawing' && (
          <View style={styles.drawingContainer}>
            <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
          </View>
        )}
        
        {activeTab === 'voice' && (
          <View style={styles.voiceContainer}>
            <VoiceRecorder onRecordingComplete={handleVoiceRecorded} />
          </View>
        )}
        
        {activeTab === 'face' && (
          <View style={styles.faceContainer}>
            <FaceCamera onEmotionDetected={handleFaceEmotionDetected} />
            
            {faceAnalysis && faceAnalysis.faceDetected && (
              <View style={styles.detectedEmotionContainer}>
                <Text style={styles.detectedEmotionTitle}>Detected Emotion:</Text>
                <Text style={styles.detectedEmotionText}>
                  {faceAnalysis.dominantEmotion.charAt(0).toUpperCase() + 
                   faceAnalysis.dominantEmotion.slice(1)}
                </Text>
                
                <View style={styles.emotionScoresContainer}>
                  {Object.entries(faceAnalysis.emotionScores).map(([emotion, score]) => (
                    <View key={emotion} style={styles.emotionScoreItem}>
                      <Text style={styles.emotionScoreLabel}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
                      </Text>
                      <View style={styles.emotionScoreBarContainer}>
                        <View 
                          style={[
                            styles.emotionScoreBar, 
                            { width: `${score * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.emotionScoreValue}>
                        {Math.round(score * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Analyze My Mood</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  slidersContainer: {
    marginVertical: spacing.md,
  },
  drawingContainer: {
    marginVertical: spacing.md,
  },
  voiceContainer: {
    marginVertical: spacing.md,
  },
  faceContainer: {
    marginVertical: spacing.md,
  },
  detectedEmotionContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  detectedEmotionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detectedEmotionText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  emotionScoresContainer: {
    marginTop: spacing.sm,
  },
  emotionScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emotionScoreLabel: {
    width: 80,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  emotionScoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  emotionScoreBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  emotionScoreValue: {
    width: 40,
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    textAlign: 'right',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    marginRight: spacing.xs,
  },
}); 