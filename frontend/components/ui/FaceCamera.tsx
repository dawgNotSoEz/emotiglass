import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

// Types for face analysis result
export interface FaceAnalysisResult {
  faceDetected: boolean;
  dominantEmotion: string;
  emotionScores: Record<string, number>;
  timestamp: number;
}

interface FaceCameraProps {
  onEmotionDetected: (result: FaceAnalysisResult) => void;
}

export const FaceCamera: React.FC<FaceCameraProps> = ({ onEmotionDetected }) => {
  // States
  const [cameraPermission, setCameraPermission] = useState<boolean>(true); // Simulated
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  
  // Refs
  const scanAnimation = useRef(new Animated.Value(0)).current;
  
  // Available emotions for cycling
  const emotions = [
    'neutral',
    'joy',
    'sadness',
    'anger',
    'surprise',
    'fear',
    'disgust',
    'contentment'
  ];
  
  // Start scanning animation
  const startScanAnimation = () => {
    scanAnimation.setValue(0);
    Animated.timing(scanAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isCapturing) {
        analyzeFace();
      }
    });
  };
  
  // Simulate face analysis
  const analyzeFace = () => {
    // Generate random emotion scores with the current emotion being dominant
    const emotionScores: Record<string, number> = {};
    let totalScore = 0;
    
    // Assign scores to all emotions, with current emotion having highest
    emotions.forEach(emotion => {
      if (emotion === currentEmotion) {
        // Current emotion gets a high score (0.6-0.9)
        emotionScores[emotion] = Math.random() * 0.3 + 0.6;
      } else {
        // Other emotions get lower scores (0-0.3)
        emotionScores[emotion] = Math.random() * 0.3;
      }
      totalScore += emotionScores[emotion];
    });
    
    // Normalize scores to sum up to 1
    Object.keys(emotionScores).forEach(emotion => {
      emotionScores[emotion] = emotionScores[emotion] / totalScore;
    });
    
    // Create result object
    const result: FaceAnalysisResult = {
      faceDetected: true,
      dominantEmotion: currentEmotion,
      emotionScores,
      timestamp: Date.now(),
    };
    
    // Notify parent component
    onEmotionDetected(result);
    setFaceDetected(true);
    setIsCapturing(false);
  };
  
  // Cycle to the next emotion
  const cycleEmotion = () => {
    const currentIndex = emotions.indexOf(currentEmotion);
    const nextIndex = (currentIndex + 1) % emotions.length;
    setCurrentEmotion(emotions[nextIndex]);
  };
  
  // Start face detection
  const startFaceDetection = () => {
    setIsCapturing(true);
    setFaceDetected(false);
    startScanAnimation();
  };
  
  // Render method
  return (
    <View style={styles.container}>
      {cameraPermission ? (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraSimulator}>
            {/* Simulated camera view with face outline */}
            <View style={styles.faceOutline}>
              <Ionicons name="person-outline" size={120} color="#fff" />
              <Text style={styles.currentEmotionText}>
                {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
              </Text>
            </View>
            
            {/* Scanning animation */}
            {isCapturing && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 240]
                        })
                      }
                    ]
                  }
                ]}
              />
            )}
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.emotionButton}
              onPress={cycleEmotion}
            >
              <Ionicons name="sync" size={20} color="#fff" />
              <Text style={styles.buttonText}>Cycle Emotion</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.capturingButton]}
              onPress={startFaceDetection}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons 
                  name="scan" 
                  size={28} 
                  color="#fff" 
                />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              This is a simulation. Press "Cycle Emotion" to change the emotion,
              then press the scan button to detect.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.permissionText}>
            Camera permission is required for face detection.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => setCameraPermission(true)}
          >
            <Text style={styles.permissionButtonText}>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Create emotion color mapping
const getEmotionColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    joy: theme.colors.joy,
    sadness: theme.colors.sadness,
    anger: theme.colors.anger,
    fear: theme.colors.fear,
    surprise: theme.colors.surprise,
    disgust: theme.colors.disgust,
    contentment: theme.colors.contentment,
    neutral: theme.colors.neutral,
  };
  
  return emotionColors[emotion] || theme.colors.primary;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.light,
  },
  cameraContainer: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  cameraSimulator: {
    width: 240,
    height: 240,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  faceOutline: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    height: 2,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  currentEmotionText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    marginTop: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: theme.spacing.md,
  },
  emotionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginLeft: 4,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  capturingButton: {
    backgroundColor: theme.colors.textLight,
  },
  instructions: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  instructionText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
  },
  permissionContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
}); 