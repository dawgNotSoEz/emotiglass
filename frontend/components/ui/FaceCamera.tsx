import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { FaceAnalysisResult } from '../../services/faceAnalysis';

interface FaceCameraProps {
  onEmotionDetected: (result: FaceAnalysisResult) => void;
  style?: any;
}

export const FaceCamera: React.FC<FaceCameraProps> = ({ 
  onEmotionDetected,
  style
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Simulate face detection
  const simulateFaceDetection = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      const mockResult: FaceAnalysisResult = {
        faceDetected: true,
        dominantEmotion: 'joy',
        emotionScores: {
          happy: 0.7,
          sad: 0.1,
          neutral: 0.1,
          surprise: 0.05,
          fear: 0.02,
          disgust: 0.01,
          anger: 0.02,
          contentment: 0.4,
        }
      };
      onEmotionDetected(mockResult);
      setIsProcessing(false);
    }, 1000);
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholderContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.textLight} />
        <Text style={styles.infoText}>
          Camera placeholder - implementation requires additional setup
        </Text>
        <Text style={styles.subText}>
          Camera functionality requires expo-camera to be properly configured
        </Text>
        
        <TouchableOpacity
          style={[styles.simulateButton, { opacity: isProcessing ? 0.5 : 1 }]}
          onPress={simulateFaceDetection}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.simulateButtonText}>Simulate Face Detection</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 300,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#222',
  },
  infoText: {
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: spacing.md,
    fontSize: typography.fontSizes.md,
  },
  subText: {
    color: colors.textLight,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: typography.fontSizes.sm,
  },
  simulateButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
  },
}); 