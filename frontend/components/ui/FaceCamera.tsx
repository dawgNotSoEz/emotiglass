import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { analyzeImage, FaceAnalysisResult } from '../../services/faceAnalysis';

export interface FaceCameraProps {
  onEmotionDetected?: (result: FaceAnalysisResult) => void;
  onFaceAnalysisComplete?: (result: FaceAnalysisResult) => void;
}

export const FaceCamera: React.FC<FaceCameraProps> = ({ 
  onEmotionDetected, 
  onFaceAnalysisComplete
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);
  
  const cameraRef = useRef<Camera>(null);
  
  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Process camera feed at intervals when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCameraActive && !isProcessing) {
      interval = setInterval(async () => {
        await processCameraFeed();
      }, 1000); // Process every second
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCameraActive, isProcessing]);
  
  // Process camera feed and detect emotions
  const processCameraFeed = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Take a photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        exif: false,
      });
      
      // Analyze the image
      const result = await analyzeImage(photo);
      
      if (result) {
        setFaceDetected(result.faceDetected);
        setLastEmotion(result.dominantEmotion);
        
        // Call the appropriate callback
        if (onEmotionDetected) {
          onEmotionDetected(result);
        } else if (onFaceAnalysisComplete) {
          onFaceAnalysisComplete(result);
        }
      } else {
        setFaceDetected(false);
      }
    } catch (error) {
      console.error('Error processing camera feed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Toggle camera
  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
    if (!isCameraActive) {
      setFaceDetected(false);
      setLastEmotion(null);
    }
  };
  
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={48} color={colors.textLight} />
        <Text style={styles.permissionText}>No access to camera</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.front}
          />
          <View style={styles.overlay}>
            {faceDetected && lastEmotion && (
              <View style={styles.emotionBadge}>
                <Text style={styles.emotionText}>
                  {lastEmotion.charAt(0).toUpperCase() + lastEmotion.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="camera" size={48} color={colors.textLight} />
          <Text style={styles.placeholderText}>
            Tap to analyze your facial expressions
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.cameraButton,
          isCameraActive ? styles.cameraButtonActive : null
        ]}
        onPress={toggleCamera}
      >
        <Ionicons 
          name={isCameraActive ? "stop-circle" : "scan"} 
          size={24} 
          color="#fff" 
        />
        <Text style={styles.buttonText}>
          {isCameraActive ? "Stop Analysis" : "Start Analysis"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    marginBottom: spacing.md,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: spacing.md,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
  },
  permissionText: {
    color: colors.textLight,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emotionBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  emotionText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: 500,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    margin: spacing.md,
  },
  cameraButtonActive: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: 500,
    marginLeft: spacing.xs,
  },
}); 