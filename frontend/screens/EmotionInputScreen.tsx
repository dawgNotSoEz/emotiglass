import React, { useState } from 'react';
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
import theme from '../constants/theme';
import { EmotionSlider } from '../components/ui/EmotionSlider';
import { EmotionData, RootStackParamList } from '../types';
import { generateRandomEmotionData } from '../services/dummyData';

type EmotionInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmotionInput'>;

// Placeholder components for prototype
const DrawingCanvas: React.FC<{ onDrawingComplete: (data: string) => void }> = ({ onDrawingComplete }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Text style={{ color: theme.colors.textLight }}>Drawing Canvas Placeholder</Text>
      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: theme.colors.primary,
          padding: 10,
          borderRadius: 8
        }}
        onPress={() => onDrawingComplete('dummy-drawing-data')}
      >
        <Text style={{ color: 'white' }}>Generate Random Drawing</Text>
      </TouchableOpacity>
    </View>
  );
};

const VoiceRecorder: React.FC<{ onRecordingComplete: (uri: string) => void }> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      onRecordingComplete('dummy-voice-recording');
    }
  };
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Text style={{ color: theme.colors.textLight, marginBottom: 20 }}>Voice Recorder Placeholder</Text>
      <TouchableOpacity
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onPress={toggleRecording}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color="white" />
      </TouchableOpacity>
      <Text style={{ marginTop: 20, color: theme.colors.text }}>
        {isRecording ? 'Recording...' : 'Tap to start recording'}
      </Text>
    </View>
  );
};

const FaceCamera: React.FC<{ onEmotionDetected: (result: any) => void }> = ({ onEmotionDetected }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Text style={{ color: theme.colors.textLight }}>Face Camera Placeholder</Text>
      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: theme.colors.primary,
          padding: 10,
          borderRadius: 8
        }}
        onPress={() => onEmotionDetected({
          faceDetected: true,
          dominantEmotion: 'joy',
          emotionScores: {
            joy: 0.8,
            sadness: 0.1,
            anger: 0.05,
            fear: 0.02,
            surprise: 0.1,
            disgust: 0.03,
            contentment: 0.5,
            neutral: 0.2
          }
        })}
      >
        <Text style={{ color: 'white' }}>Simulate Face Detection</Text>
      </TouchableOpacity>
    </View>
  );
};

export const EmotionInputScreen: React.FC = () => {
  const navigation = useNavigation<EmotionInputScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'sliders' | 'drawing' | 'voice' | 'face'>('sliders');
  const [emotionData, setEmotionData] = useState<EmotionData>({
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    contentment: 0,
    neutral: 1,
    energy: 50,
    calmness: 50,
    tension: 50
  });
  const [faceAnalysis, setFaceAnalysis] = useState<any | null>(null);
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
    // For prototype, generate random emotion data
    const randomData = generateRandomEmotionData();
    setEmotionData(prev => ({
      ...prev,
      ...randomData
    }));
  };
  
  // Update emotion data from voice recording
  const handleVoiceRecorded = (uri: string) => {
    // For prototype, generate random emotion data
    const randomData = generateRandomEmotionData();
    setEmotionData(prev => ({
      ...prev,
      ...randomData
    }));
  };
  
  // Handle face emotion detection
  const handleFaceEmotionDetected = (result: any) => {
    setFaceAnalysis(result);
    
    // For prototype, use the simulated emotion scores
    if (result.faceDetected) {
      setEmotionData(prev => ({
        ...prev,
        ...result.emotionScores,
        energy: Math.random() * 100,
        calmness: Math.random() * 100,
        tension: Math.random() * 100
      }));
    }
  };
  
  // Submit and analyze emotion data
  const handleSubmit = async () => {
    setAnalyzing(true);
    
    try {
      // Navigate to visualization screen after a short delay
      setTimeout(() => {
        navigation.navigate('MoodVisualization', {
          emotionData: emotionData
        });
        setAnalyzing(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to analyze emotions:', error);
      Alert.alert('Error', 'Failed to analyze emotions. Please try again.');
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
            color={activeTab === 'sliders' ? theme.colors.primary : theme.colors.textLight} 
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
            color={activeTab === 'drawing' ? theme.colors.primary : theme.colors.textLight} 
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
            color={activeTab === 'voice' ? theme.colors.primary : theme.colors.textLight} 
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
            color={activeTab === 'face' ? theme.colors.primary : theme.colors.textLight} 
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
                            { width: `${(score as number) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.emotionScoreValue}>
                        {Math.round((score as number) * 100)}%
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginTop: 2,
    fontWeight: '400',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  slidersContainer: {
    marginVertical: theme.spacing.md,
  },
  drawingContainer: {
    marginVertical: theme.spacing.md,
  },
  voiceContainer: {
    marginVertical: theme.spacing.md,
  },
  faceContainer: {
    marginVertical: theme.spacing.md,
  },
  detectedEmotionContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
  },
  detectedEmotionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  detectedEmotionText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  emotionScoresContainer: {
    marginTop: theme.spacing.sm,
  },
  emotionScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  emotionScoreLabel: {
    width: 80,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  emotionScoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.sm,
  },
  emotionScoreBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  emotionScoreValue: {
    width: 40,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    textAlign: 'right',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500',
  },
}); 