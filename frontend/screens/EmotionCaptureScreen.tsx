import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { FaceDetector, FaceDetectionResult } from '../components/ui/FaceDetector';
import { VoiceRecorder, VoiceRecordingResult } from '../components/ui/VoiceRecorder';
import { useMediaPermissions } from '../hooks/useMediaPermissions';
import theme from '../constants/theme';

// Screen props
type RootStackParamList = {
  EmotionCapture: undefined;
};

type EmotionCaptureScreenProps = StackScreenProps<RootStackParamList, 'EmotionCapture'>;

// Emotion data structure
interface EmotionData {
  faceData?: FaceDetectionResult;
  voiceData?: VoiceRecordingResult;
  timestamp: number;
}

const EmotionCaptureScreen: React.FC<EmotionCaptureScreenProps> = ({ navigation }) => {
  // Permissions hook
  const [permissionState, permissionActions] = useMediaPermissions();
  
  // State for captured data
  const [capturedEmotion, setCapturedEmotion] = useState<EmotionData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'face' | 'voice'>('face');
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  
  // Request permissions on mount
  useEffect(() => {
    permissionActions.requestAllPermissions();
    
    return () => {
      // Clean up audio player on unmount
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);
  
  // Handle face detection result
  const handleFaceDetected = (result: FaceDetectionResult) => {
    setCapturedEmotion(prev => ({
      ...prev,
      faceData: result,
      timestamp: Date.now(),
    }));
  };
  
  // Handle voice recording result
  const handleRecordingComplete = (result: VoiceRecordingResult) => {
    if (result.status === 'completed' && result.audioUri) {
      setCapturedEmotion(prev => ({
        ...prev,
        voiceData: result,
        timestamp: Date.now(),
      }));
    }
  };
  
  // Play recorded audio
  const playAudio = async () => {
    if (!capturedEmotion?.voiceData?.audioUri) {
      return;
    }
    
    try {
      // Unload any existing audio
      if (soundObject) {
        await soundObject.unloadAsync();
      }
      
      // Create and load new sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: capturedEmotion.voiceData.audioUri },
        { shouldPlay: true }
      );
      
      setSoundObject(sound);
      setIsPlayingAudio(true);
      
      // Handle playback status updates
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      Alert.alert('Error', 'Failed to play audio recording');
      setIsPlayingAudio(false);
    }
  };
  
  // Format emotion data for display
  const formatEmotionData = (emotionData: EmotionData) => {
    if (!emotionData) return null;
    
    // Format face data
    const faceDataText = emotionData.faceData ? {
      happiness: `${(emotionData.faceData.emotions.happiness * 100).toFixed(1)}%`,
      surprise: `${(emotionData.faceData.emotions.surprise * 100).toFixed(1)}%`,
      neutral: `${(emotionData.faceData.emotions.neutral * 100).toFixed(1)}%`,
      anger: `${(emotionData.faceData.emotions.anger * 100).toFixed(1)}%`,
      eyesOpen: `${((emotionData.faceData.faceAttributes.leftEyeOpen + 
                    emotionData.faceData.faceAttributes.rightEyeOpen) / 2 * 100).toFixed(1)}%`,
    } : null;
    
    // Format voice data
    const voiceDataText = emotionData.voiceData?.status === 'completed' ? {
      duration: `${((emotionData.voiceData.durationMs || 0) / 1000).toFixed(1)}s`,
      uri: emotionData.voiceData.audioUri?.split('/').pop() || 'Unknown',
    } : null;
    
    return { faceDataText, voiceDataText };
  };
  
  // Save emotion data to the app's database (simulated)
  const saveEmotionData = () => {
    if (!capturedEmotion) {
      Alert.alert('Error', 'No emotion data to save');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Success',
        'Emotion data saved successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Clear data after saving
              setCapturedEmotion(null);
            } 
          }
        ]
      );
    }, 1500);
  };
  
  // Formatted data for display
  const formattedData = capturedEmotion ? formatEmotionData(capturedEmotion) : null;
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Emotion Capture</Text>
      
      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'face' && styles.activeTab]}
          onPress={() => setActiveTab('face')}
        >
          <Ionicons 
            name="happy" 
            size={24} 
            color={activeTab === 'face' ? theme.colors.primary : theme.colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'face' && styles.activeTabText
          ]}>
            Face
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voice' && styles.activeTab]}
          onPress={() => setActiveTab('voice')}
        >
          <Ionicons 
            name="mic" 
            size={24} 
            color={activeTab === 'voice' ? theme.colors.primary : theme.colors.textLight} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'voice' && styles.activeTabText
          ]}>
            Voice
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Main content area */}
      <View style={styles.contentContainer}>
        {/* Face detection tab */}
        {activeTab === 'face' && (
          <View style={styles.cameraContainer}>
            {permissionState.loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : !permissionState.camera ? (
              <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color={theme.colors.textLight} />
                <Text style={styles.permissionText}>
                  Camera permission is required for face detection
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={permissionActions.requestCameraPermission}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FaceDetector 
                onFaceDetected={handleFaceDetected}
                showFaceMarkers={true}
              />
            )}
          </View>
        )}
        
        {/* Voice recording tab */}
        {activeTab === 'voice' && (
          <View style={styles.voiceContainer}>
            {permissionState.loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : !permissionState.audio ? (
              <View style={styles.permissionContainer}>
                <Ionicons name="mic-off" size={64} color={theme.colors.textLight} />
                <Text style={styles.permissionText}>
                  Microphone permission is required for voice recording
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={permissionActions.requestAudioPermission}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDurationMs={30000}
                showWaveform={true}
              />
            )}
          </View>
        )}
      </View>
      
      {/* Results section */}
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Results</Text>
        
        {capturedEmotion ? (
          <ScrollView style={styles.resultsScroll}>
            {/* Face results */}
            {formattedData?.faceDataText && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="happy" size={24} color={theme.colors.primary} />
                  <Text style={styles.resultTitle}>Face Emotions</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Happiness:</Text>
                  <Text style={styles.resultValue}>{formattedData.faceDataText.happiness}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Surprise:</Text>
                  <Text style={styles.resultValue}>{formattedData.faceDataText.surprise}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Neutral:</Text>
                  <Text style={styles.resultValue}>{formattedData.faceDataText.neutral}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Anger:</Text>
                  <Text style={styles.resultValue}>{formattedData.faceDataText.anger}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Eyes Open:</Text>
                  <Text style={styles.resultValue}>{formattedData.faceDataText.eyesOpen}</Text>
                </View>
              </View>
            )}
            
            {/* Voice results */}
            {formattedData?.voiceDataText && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="mic" size={24} color={theme.colors.primary} />
                  <Text style={styles.resultTitle}>Voice Recording</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Duration:</Text>
                  <Text style={styles.resultValue}>{formattedData.voiceDataText.duration}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>File:</Text>
                  <Text style={styles.resultValue}>{formattedData.voiceDataText.uri}</Text>
                </View>
                
                {/* Play button */}
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={playAudio}
                  disabled={isPlayingAudio}
                >
                  <Ionicons 
                    name={isPlayingAudio ? "pause-circle" : "play-circle"} 
                    size={24} 
                    color="#fff" 
                  />
                  <Text style={styles.playButtonText}>
                    {isPlayingAudio ? "Playing..." : "Play Recording"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              Use the tabs above to capture facial expressions and voice recordings
            </Text>
          </View>
        )}
        
        {/* Save button */}
        {capturedEmotion && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveEmotionData}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Emotion Data</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.light,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  activeTab: {
    backgroundColor: theme.colors.lightGray,
  },
  tabText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.medium,
  },
  cameraContainer: {
    flex: 1,
  },
  voiceContainer: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  permissionText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
  resultsContainer: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.light,
    maxHeight: '40%',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  resultsScroll: {
    marginBottom: theme.spacing.md,
  },
  resultCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    ...theme.shadows.light,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  resultLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  resultValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
  },
  playButtonText: {
    color: '#fff',
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    ...theme.shadows.medium,
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default EmotionCaptureScreen; 