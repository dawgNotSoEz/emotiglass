import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

// Face detection result interface
export interface FaceDetectionResult {
  faceDetected: boolean;
  emotions: {
    happiness: number;
    surprise: number;
    neutral: number;
    anger: number;
  };
  faceAttributes: {
    leftEyeOpen: number;
    rightEyeOpen: number;
    rollAngle: number;
    yawAngle: number;
  };
  timestamp: number;
}

interface FaceDetectorProps {
  onFaceDetected: (result: FaceDetectionResult) => void;
  showFaceMarkers?: boolean;
}

export const FaceDetector: React.FC<FaceDetectorProps> = ({
  onFaceDetected,
  showFaceMarkers = false
}) => {
  // Permission states
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Camera refs and states
  const cameraRef = useRef<Camera | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [type, setType] = useState(Camera.Constants.Type.front);
  
  // Face detection states
  const [detectedFace, setDetectedFace] = useState<any>(null);
  const [lastDetection, setLastDetection] = useState<number>(0);
  
  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
        setIsLoading(false);
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        Alert.alert('Error', 'Could not request camera permission');
        setIsLoading(false);
      }
    })();
  }, []);
  
  // Handle face detection
  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    if (faces.length === 0) {
      if (detectedFace !== null) {
        setDetectedFace(null);
      }
      return;
    }
    
    // Get the first detected face
    const face = faces[0];
    setDetectedFace(face);
    
    // Throttle results to not overwhelm the parent component
    const now = Date.now();
    if (now - lastDetection > 300) { // Send updates at most every 300ms
      setLastDetection(now);
      
      // Calculate emotion probabilities based on face attributes
      // This is simplified - in a real app, you'd use a more sophisticated algorithm
      const happiness = face.smilingProbability || 0;
      const surprise = Math.max((face.leftEyeOpenProbability + face.rightEyeOpenProbability) / 2 - 0.5, 0) * 2;
      const neutral = 1 - (happiness + surprise) / 2;
      const anger = Math.max(Math.abs(face.rollAngle) / 45, 0) * 0.5; // Roll angle can indicate anger
      
      // Normalize emotion values to sum to 1
      const total = happiness + surprise + neutral + anger;
      const normalizedEmotions = {
        happiness: happiness / total,
        surprise: surprise / total,
        neutral: neutral / total,
        anger: anger / total,
      };
      
      // Create result object
      const result: FaceDetectionResult = {
        faceDetected: true,
        emotions: normalizedEmotions,
        faceAttributes: {
          leftEyeOpen: face.leftEyeOpenProbability || 0,
          rightEyeOpen: face.rightEyeOpenProbability || 0,
          rollAngle: face.rollAngle || 0,
          yawAngle: face.yawAngle || 0,
        },
        timestamp: now,
      };
      
      // Send result to parent
      onFaceDetected(result);
    }
  };
  
  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.front
        ? Camera.Constants.Type.back
        : Camera.Constants.Type.front
    );
  };
  
  // Capture button handler
  const handleCapture = () => {
    if (isCapturing) {
      setIsCapturing(false);
    } else {
      setIsCapturing(true);
    }
  };
  
  // If permission not yet determined
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.infoText}>Initializing camera...</Text>
      </View>
    );
  }
  
  // If camera permission denied
  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={theme.colors.textLight} />
        <Text style={styles.errorText}>
          Camera permission is required for face detection.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
          }}
        >
          <Text style={styles.permissionButtonText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        onFacesDetected={isCapturing ? handleFacesDetected : undefined}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        <View style={styles.cameraContent}>
          {/* Face markers */}
          {showFaceMarkers && detectedFace && (
            <View
              style={[
                styles.faceBox,
                {
                  left: detectedFace.bounds.origin.x,
                  top: detectedFace.bounds.origin.y,
                  width: detectedFace.bounds.size.width,
                  height: detectedFace.bounds.size.height,
                  borderColor: detectedFace.smilingProbability > 0.7 ? theme.colors.success : theme.colors.primary,
                },
              ]}
            />
          )}
          
          {/* Camera controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.flipButton}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.activeButton
                ]}
                onPress={handleCapture}
              >
                <Ionicons
                  name={isCapturing ? "stop-circle" : "scan-circle"}
                  size={36}
                  color="#fff"
                />
              </TouchableOpacity>
              
              <View style={styles.placeholderButton} />
            </View>
            
            <Text style={styles.captureText}>
              {isCapturing ? 'Detecting faces...' : 'Tap to start detecting'}
            </Text>
          </View>
        </View>
      </Camera>
      
      {/* Face metrics display (for debugging) */}
      {detectedFace && isCapturing && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricTitle}>Face Metrics:</Text>
          <Text style={styles.metricText}>
            Smiling: {(detectedFace.smilingProbability * 100).toFixed(1)}%
          </Text>
          <Text style={styles.metricText}>
            Left Eye: {(detectedFace.leftEyeOpenProbability * 100).toFixed(1)}%
            Right Eye: {(detectedFace.rightEyeOpenProbability * 100).toFixed(1)}%
          </Text>
          <Text style={styles.metricText}>
            Roll: {detectedFace.rollAngle.toFixed(1)}°
            Yaw: {detectedFace.yawAngle.toFixed(1)}°
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraContent: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  infoText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
  controlsContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  activeButton: {
    backgroundColor: theme.colors.error,
  },
  placeholderButton: {
    width: 44,
    height: 44,
  },
  captureText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.sm,
  },
  faceBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  metricsContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  metricTitle: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.xs,
  },
  metricText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.xs,
  },
}); 