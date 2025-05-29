import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { EmotionAnalysisResult, EmotionData } from '../types';
import { analyzeEmotions } from './emotionAnalysis';

// Directory for storing audio recordings
const RECORDINGS_DIRECTORY = FileSystem.documentDirectory + 'recordings/';

/**
 * Initialize the audio service
 */
export const initAudioService = async (): Promise<void> => {
  try {
    // Create recordings directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECORDINGS_DIRECTORY, { intermediates: true });
    }
  } catch (error) {
    console.error('Error initializing audio service:', error);
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
 * Stop the current recording and save it
 * @param recording The recording to stop
 * @returns URI of the saved recording or null if failed
 */
export const stopRecording = async (recording: Audio.Recording): Promise<string | null> => {
  try {
    await recording.stopAndUnloadAsync();
    
    // Get recording URI
    const uri = recording.getURI();
    if (!uri) {
      console.error('Recording URI is null');
      return null;
    }
    
    // Generate a unique filename
    const filename = `recording-${Date.now()}.m4a`;
    const fileUri = RECORDINGS_DIRECTORY + filename;
    
    // Save recording to our app directory
    await FileSystem.copyAsync({
      from: uri,
      to: fileUri
    });
    
    return fileUri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
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
 * Delete an audio recording
 * @param uri URI of the recording to delete
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
 * Analyze audio recording for emotional content
 * This is a placeholder that would normally use speech-to-text and then analyze the text
 * @param uri URI of the recording to analyze
 * @returns Analysis result
 */
export const analyzeAudioRecording = async (uri: string): Promise<EmotionAnalysisResult> => {
  try {
    // In a real app, this would use a speech-to-text service
    // For now, we'll use a placeholder emotion data
    const emotions: EmotionData = {
      joy: Math.random() * 0.3,
      sadness: Math.random() * 0.2,
      anger: Math.random() * 0.1,
      fear: Math.random() * 0.1,
      surprise: Math.random() * 0.1,
      disgust: Math.random() * 0.05,
      contentment: Math.random() * 0.3,
      neutral: Math.random() * 0.2,
      energy: Math.random() * 100,
      calmness: Math.random() * 100,
      tension: Math.random() * 100
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