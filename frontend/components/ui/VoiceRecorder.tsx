import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  
  // Request permissions
  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
    
    return () => {
      if (recording) {
        stopRecording();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);
  
  // Update duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (recordingStatus === 'recording') {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recordingStatus]);
  
  // Start recording
  const startRecording = async () => {
    try {
      // Clear previous recording
      if (recordingUri) {
        setRecordingUri(null);
      }
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Reset duration
      setRecordingDuration(0);
      
      // Start new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setRecordingStatus('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        setRecordingUri(uri);
        onRecordingComplete(uri);
      }
      
      setRecording(null);
      setRecordingStatus('recorded');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };
  
  // Play recording
  const playRecording = async () => {
    if (!recordingUri) return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setRecordingStatus('playing');
      
      // When playback finishes
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setRecordingStatus('recorded');
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
    }
  };
  
  // Stop playback
  const stopPlayback = async () => {
    if (!sound) return;
    
    try {
      await sound.stopAsync();
      setRecordingStatus('recorded');
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        {recordingStatus === 'idle' ? (
          <Text style={styles.statusText}>Tap to record your voice note</Text>
        ) : recordingStatus === 'recording' ? (
          <View style={styles.recordingInfo}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingText}>Recording... {formatTime(recordingDuration)}</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>
            Voice note recorded ({formatTime(recordingDuration)})
          </Text>
        )}
      </View>
      
      <View style={styles.controlsContainer}>
        {recordingStatus === 'idle' ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <Ionicons name="mic" size={32} color="#fff" />
          </TouchableOpacity>
        ) : recordingStatus === 'recording' ? (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
          >
            <Ionicons name="stop" size={32} color="#fff" />
          </TouchableOpacity>
        ) : recordingStatus === 'recorded' ? (
          <TouchableOpacity
            style={styles.playButton}
            onPress={playRecording}
          >
            <Ionicons name="play" size={32} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopPlayback}
          >
            <Ionicons name="stop" size={32} color="#fff" />
          </TouchableOpacity>
        )}
        
        {recordingStatus !== 'idle' && recordingStatus !== 'recording' && (
          <TouchableOpacity
            style={styles.newRecordingButton}
            onPress={startRecording}
          >
            <Ionicons name="refresh" size={24} color={colors.primary} />
            <Text style={styles.newRecordingText}>New Recording</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    height: 40,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    marginRight: spacing.sm,
  },
  recordingText: {
    fontSize: typography.fontSizes.md,
    color: colors.error,
    fontWeight: typography.fontWeights.medium,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.lg,
    padding: spacing.sm,
  },
  newRecordingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
}); 