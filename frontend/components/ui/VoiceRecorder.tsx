import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

// Voice recording result interface
export interface VoiceRecordingResult {
  status: 'completed' | 'cancelled' | 'error';
  audioUri?: string;
  durationMs?: number;
  timestamp: number;
}

interface VoiceRecorderProps {
  onRecordingComplete: (result: VoiceRecordingResult) => void;
  maxDurationMs?: number;
  showWaveform?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  maxDurationMs = 30000, // Default 30 seconds
  showWaveform = true,
}) => {
  // Permission and recorder state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  
  // Animation values for visualization
  const soundLevel = useRef(new Animated.Value(0)).current;
  const visualizerValues = useRef(Array(20).fill(0).map(() => new Animated.Value(1))).current;
  
  // Timer ref for recording duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Request audio permissions on component mount
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        setIsLoading(false);
      } catch (error) {
        console.error('Error requesting audio permission:', error);
        Alert.alert('Error', 'Could not request microphone permission');
        setIsLoading(false);
      }
    })();
    
    // Cleanup function to stop any active recording
    return () => {
      stopRecording();
    };
  }, []);
  
  // Effect to handle max duration timer
  useEffect(() => {
    if (recordingStatus === 'recording') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Set timer to track duration
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 100;
          
          // If reached max duration, stop recording
          if (newDuration >= maxDurationMs) {
            stopRecording();
            return maxDurationMs;
          }
          
          return newDuration;
        });
      }, 100);
      
      // Animate visualizer
      animateVisualizer();
    } else {
      // Clear timer when not recording
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingStatus, maxDurationMs]);
  
  // Generate a random directory for storing recordings
  const getRecordingFileUri = async () => {
    const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'recordings/');
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/');
    }
    
    return FileSystem.documentDirectory + 'recordings/' + `recording-${Date.now()}.m4a`;
  };
  
  // Start recording function
  const startRecording = async () => {
    try {
      // Reset states
      setRecordingDuration(0);
      setAudioUri(null);
      
      // Create and prepare recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setRecordingStatus('recording');
      
      // Monitor recording status
      recording.setOnRecordingStatusUpdate(status => {
        if (status.isRecording) {
          const level = status.metering ? Math.max(-160, status.metering) + 160 : 0;
          const normalizedLevel = Math.min(1, level / 40);
          soundLevel.setValue(normalizedLevel);
        }
      });
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
      setRecordingStatus('idle');
    }
  };
  
  // Stop recording function
  const stopRecording = async () => {
    if (!recording) {
      return;
    }
    
    try {
      setRecordingStatus('idle');
      
      // Stop the recording
      await recording.stopAndUnloadAsync();
      
      // Get the recorded URI
      const uri = recording.getURI();
      setAudioUri(uri);
      
      // Create a new filename and move the recording to our app's documents directory
      if (uri) {
        const destinationUri = await getRecordingFileUri();
        await FileSystem.moveAsync({
          from: uri,
          to: destinationUri,
        });
        
        // Pass the result to parent component
        onRecordingComplete({
          status: 'completed',
          audioUri: destinationUri,
          durationMs: recordingDuration,
          timestamp: Date.now(),
        });
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
      
      // Handle error in stopping recording
      onRecordingComplete({
        status: 'error',
        timestamp: Date.now(),
      });
      
      setRecording(null);
      setRecordingStatus('idle');
    }
  };
  
  // Cancel recording function
  const cancelRecording = async () => {
    if (!recording) {
      return;
    }
    
    try {
      setRecordingStatus('idle');
      await recording.stopAndUnloadAsync();
      
      // Notify parent of cancellation
      onRecordingComplete({
        status: 'cancelled',
        timestamp: Date.now(),
      });
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to cancel recording', error);
      setRecording(null);
      setRecordingStatus('idle');
    }
  };
  
  // Function to animate the visualizer
  const animateVisualizer = () => {
    visualizerValues.forEach((value, index) => {
      const delay = index * 50;
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1 + Math.random() * 1.5,
            duration: 700 + Math.random() * 300,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: 700 + Math.random() * 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };
  
  // Format milliseconds to MM:SS format
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // If permission not yet determined
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.infoText}>Initializing audio...</Text>
      </View>
    );
  }
  
  // If audio permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="mic-off" size={64} color={theme.colors.textLight} />
        <Text style={styles.errorText}>
          Microphone permission is required for voice recording.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');
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
      {/* Recording status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {recordingStatus === 'recording' 
            ? 'Recording...' 
            : 'Ready to record'}
        </Text>
        
        {recordingStatus === 'recording' && (
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)} / {formatDuration(maxDurationMs)}
          </Text>
        )}
      </View>
      
      {/* Sound level visualization */}
      {showWaveform && (
        <View style={styles.visualizerContainer}>
          {recordingStatus === 'recording' ? (
            <View style={styles.waveformContainer}>
              {visualizerValues.map((value, index) => (
                <Animated.View
                  key={`bar-${index}`}
                  style={[
                    styles.waveformBar,
                    {
                      height: value.interpolate({
                        inputRange: [0, 2.5],
                        outputRange: [3, 40],
                      }),
                      opacity: soundLevel.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.waveformPlaceholder}>
              <Ionicons name="mic" size={32} color={theme.colors.textLight} />
              <Text style={styles.placeholderText}>
                Tap the button below to start recording
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Recording controls */}
      <View style={styles.controlsContainer}>
        {recordingStatus === 'recording' ? (
          <View style={styles.recordingControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.cancelButton]}
              onPress={cancelRecording}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={stopRecording}
            >
              <Ionicons name="stop-circle" size={48} color="#fff" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
            
            <View style={styles.placeholderButton} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <Ionicons name="mic" size={40} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
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
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  durationText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  visualizerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: '100%',
  },
  waveformBar: {
    width: 4,
    marginHorizontal: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  waveformPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  cancelButton: {
    marginRight: theme.spacing.lg,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 40,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  placeholderButton: {
    width: 48,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    marginTop: theme.spacing.xs,
  },
}); 
}); 