import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { EmotionData, EmotionAnalysisResult } from '../types';
import { analyzeEmotions } from './emotionAnalysis';

// Constants
const RECORDINGS_DIR = FileSystem.documentDirectory + 'recordings/';

// Initialize recording directory
export const initAudioStorage = async (): Promise<boolean> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize audio storage:', error);
    return false;
  }
};

/**
 * Start a new audio recording
 * @returns Recording object or null if recording failed
 */
export const startRecording = async (): Promise<Audio.Recording | null> => {
  try {
    // Request permissions
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.error('Audio recording permissions not granted');
      return null;
    }
    
    // Set audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    // Start recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
};

/**
 * Stop an audio recording
 * @param recording Recording object to stop
 * @returns URI of the recording or null if stopping failed
 */
export const stopRecording = async (recording: Audio.Recording): Promise<string | null> => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    if (!uri) {
      console.error('No URI returned from recording');
      return null;
    }
    
    // Save recording to storage directory
    await initAudioStorage();
    const fileName = `recording_${Date.now()}.m4a`;
    const destinationUri = RECORDINGS_DIR + fileName;
    
    // Copy to storage directory
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
  }
};

/**
 * Delete an audio recording
 * @param uri URI of recording to delete
 * @returns Whether deletion was successful
 */
export const deleteRecording = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri);
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
};

/**
 * Play an audio recording
 * @param uri URI of the recording to play
 * @returns Sound object or null if playback failed
 */
export const playRecording = async (uri: string): Promise<Audio.Sound | null> => {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri });
    await sound.playAsync();
    return sound;
  } catch (error) {
    console.error('Error playing recording:', error);
    return null;
  }
};

/**
 * Get all saved recordings
 * @returns Array of recording URIs
 */
export const getAllRecordings = async (): Promise<string[]> => {
  try {
    await initAudioStorage();
    
    const files = await FileSystem.readDirectoryAsync(RECORDINGS_DIR);
    const recordingFiles = files.filter(file => file.endsWith('.m4a'));
    const recordingUris = recordingFiles.map(file => RECORDINGS_DIR + file);
    
    return recordingUris;
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
};

/**
 * Analyze audio recording for emotional content
 * This is a placeholder that would normally use speech-to-text and then analyze the text
 * @param uri URI of the recording to analyze
 * @returns Analysis result
 */
export const analyzeAudioRecording = async (uri: string): Promise<EmotionAnalysisResult> => {
  try {
    // Get audio file info for analysis
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    // In a real app, this would use a speech-to-text service
    // For now, we'll use filesize and creation timestamp to generate random but consistent emotion data
    const fileSize = fileInfo.exists ? (fileInfo.size || 0) : 0;
    const modificationTime = fileInfo.exists && 'modificationTime' in fileInfo ? fileInfo.modificationTime : Date.now();
    
    // Generate pseudo-random emotion values based on file characteristics
    const randomSeed = (fileSize + modificationTime) % 1000 / 1000;
    
    const emotions: EmotionData = {
      joy: Math.min(0.2 + randomSeed * 0.5, 1),
      sadness: Math.min(0.1 + (1 - randomSeed) * 0.3, 1),
      anger: Math.min(0.05 + randomSeed * 0.2, 1),
      fear: Math.min(0.05 + (1 - randomSeed) * 0.15, 1),
      surprise: Math.min(0.1 + randomSeed * 0.3, 1),
      disgust: Math.min(0.05 + randomSeed * 0.1, 1),
      contentment: Math.min(0.2 + (1 - randomSeed) * 0.5, 1),
      neutral: Math.min(0.1 + randomSeed * 0.2, 1),
      energy: Math.min(40 + randomSeed * 50, 100),
      calmness: Math.min(30 + (1 - randomSeed) * 60, 100),
      tension: Math.min(20 + randomSeed * 70, 100)
    };
    
    // Normalize to ensure values sum to 1
    const emotionKeys = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'contentment', 'neutral'];
    const total = emotionKeys.reduce((sum, key) => sum + emotions[key as keyof EmotionData], 0);
    
    emotionKeys.forEach(key => {
      const emotionKey = key as keyof EmotionData;
      emotions[emotionKey] = emotions[emotionKey] / total;
    });
    
    return analyzeEmotions(emotions);
  } catch (error) {
    console.error('Error analyzing audio recording:', error);
    // Return neutral emotion if analysis fails
    const neutralEmotions: EmotionData = {
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
    };
    return analyzeEmotions(neutralEmotions);
  }
}; 