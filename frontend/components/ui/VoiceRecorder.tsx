import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import theme from '../../constants/theme';

// Interface for voice recording data
export interface VoiceRecordingData {
  uri: string | null;
  duration: number;
  decibels: number;
}

interface VoiceRecorderProps {
  onRecordingComplete: (recordingData: VoiceRecordingData) => void;
  maxDuration?: number; // in seconds
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  maxDuration = 60 
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Permissions and setup
  useEffect(() => {
    const setupAudioPermissions = async () => {
      if (Platform.OS !== 'web') {
        try {
          await Audio.requestPermissionsAsync();
        } catch (err) {
          console.error('Microphone permission error:', err);
        }
      }
    };

    setupAudioPermissions();
  }, []);

  // Start recording
  const startRecording = async () => {
    if (Platform.OS === 'web') {
      console.warn('Voice recording not supported on web');
      return;
    }

    try {
      // Ensure we stop any existing recording
      if (recording) {
        await recording.stopAndUnloadAsync();
      }

      // Request permissions
      await Audio.requestPermissionsAsync();

      // Configure audio settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create a new recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setRecordingStatus('recording');

      // Start duration timer
      const recordingTimer = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      setTimer(recordingTimer);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (Platform.OS === 'web' || !recording) return;

    // Clear timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    try {
      // Stop and unload the recording
      await recording.stopAndUnloadAsync();
      
      // Get recording details
      const recordingDetails = await recording.getStatusAsync();
      
      // Generate unique filename
      const filename = `voice_${Date.now()}.m4a`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Move recording to app's document directory
      await FileSystem.moveAsync({
        from: recording.getURI() || '',
        to: fileUri
      });

      // Prepare recording data
      const recordingData: VoiceRecordingData = {
        uri: fileUri,
        duration: recordingDuration,
        decibels: recordingDetails.metering || 0
      };

      // Reset state
      setRecording(null);
      setRecordingStatus('stopped');
      setRecordingDuration(0);

      // Callback with recording data
      onRecordingComplete(recordingData);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Web fallback
  const webFallback = () => {
    const dummyRecordingData: VoiceRecordingData = {
      uri: null,
      duration: 0,
      decibels: 0
    };
    onRecordingComplete(dummyRecordingData);
  };

  // Render component
  return React.createElement(
    View, 
    { style: styles.container },
    Platform.OS !== 'web' 
      ? React.createElement(
          TouchableOpacity,
          {
            style: [
              styles.recordButton, 
              recordingStatus === 'recording' && styles.recordingButton
            ],
            onPress: recordingStatus === 'recording' ? stopRecording : startRecording
          },
          React.createElement(
            Text, 
            { style: styles.buttonText },
            recordingStatus === 'recording' 
              ? `Stop (${recordingDuration}s)` 
              : 'Start Recording'
          )
        )
      : React.createElement(
          TouchableOpacity,
          {
            style: styles.recordButton,
            onPress: webFallback
          },
          React.createElement(
            Text, 
            { style: styles.buttonText },
            'Voice Recording Not Supported'
          )
        )
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  recordButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    minWidth: 200,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: 'bold',
  },
});

export default VoiceRecorder; 