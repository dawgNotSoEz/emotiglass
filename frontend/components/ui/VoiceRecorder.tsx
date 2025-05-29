import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  maxDuration?: number; // in seconds
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 10,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Request permissions when component mounts
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status === 'granted');
    })();

    return () => {
      // Clean up recording if component unmounts while recording
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, maxDuration]);

  const startRecording = async () => {
    try {
      // Configure the recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri);
      }
      
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  if (permissionStatus === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (permissionStatus === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Microphone permission is required to record your voice.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Voice Tone Recorder</Text>
      <Text style={styles.instruction}>
        Record a short sound that represents how you feel (no words needed)
      </Text>
      
      <View style={styles.recordingInfo}>
        {isRecording && (
          <Text style={styles.durationText}>
            {recordingDuration}s / {maxDuration}s
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recordingActive : null,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={32}
          color={isRecording ? colors.error : colors.primary}
        />
      </TouchableOpacity>
      
      <Text style={styles.hintText}>
        {isRecording
          ? 'Tap to stop recording'
          : 'Tap to start recording your voice tone'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  instruction: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  recordingInfo: {
    height: 20,
    marginBottom: spacing.sm,
  },
  durationText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginVertical: spacing.md,
  },
  recordingActive: {
    borderColor: colors.error,
    backgroundColor: colors.background,
  },
  hintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
}); 