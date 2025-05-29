import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { EmotionData } from './emotionAnalysis';
import { MoodAnalysis } from './emotionAnalysis';

export interface MoodEntry {
  id: string;
  emotionData: EmotionData;
  analysis: MoodAnalysis;
  createdAt: number;
}

const MOOD_ENTRIES_KEY = 'emotiglass_mood_entries';
const VOICE_RECORDINGS_DIR = `${FileSystem.documentDirectory}voice_recordings/`;

// Ensure the voice recordings directory exists
const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(VOICE_RECORDINGS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VOICE_RECORDINGS_DIR, { intermediates: true });
  }
};

// Save a voice recording to the file system
export const saveVoiceRecording = async (uri: string): Promise<string> => {
  await ensureDirectoryExists();
  
  // Create a unique filename
  const filename = `recording_${Date.now()}.m4a`;
  const destination = `${VOICE_RECORDINGS_DIR}${filename}`;
  
  // Copy the file from temp location to our app's documents
  await FileSystem.copyAsync({
    from: uri,
    to: destination,
  });
  
  return destination;
};

// Delete a voice recording
export const deleteVoiceRecording = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Failed to delete voice recording:', error);
  }
};

// Save a mood entry
export const saveMoodEntry = async (emotionData: EmotionData, analysis: MoodAnalysis): Promise<MoodEntry> => {
  // First, save the voice recording if it exists
  let voiceUri = emotionData.voiceUri;
  if (voiceUri) {
    voiceUri = await saveVoiceRecording(voiceUri);
    emotionData = { ...emotionData, voiceUri };
  }
  
  // Create a new mood entry
  const newEntry: MoodEntry = {
    id: `entry_${Date.now()}`,
    emotionData,
    analysis,
    createdAt: Date.now(),
  };
  
  // Get existing entries
  const existingEntriesJson = await SecureStore.getItemAsync(MOOD_ENTRIES_KEY);
  let entries: MoodEntry[] = [];
  
  if (existingEntriesJson) {
    try {
      entries = JSON.parse(existingEntriesJson);
    } catch (error) {
      console.error('Failed to parse existing entries:', error);
    }
  }
  
  // Add the new entry
  entries.push(newEntry);
  
  // Save the updated entries
  await SecureStore.setItemAsync(MOOD_ENTRIES_KEY, JSON.stringify(entries));
  
  return newEntry;
};

// Get all mood entries
export const getAllMoodEntries = async (): Promise<MoodEntry[]> => {
  const entriesJson = await SecureStore.getItemAsync(MOOD_ENTRIES_KEY);
  
  if (!entriesJson) {
    return [];
  }
  
  try {
    return JSON.parse(entriesJson);
  } catch (error) {
    console.error('Failed to parse mood entries:', error);
    return [];
  }
};

// Get a single mood entry by ID
export const getMoodEntryById = async (id: string): Promise<MoodEntry | null> => {
  const entries = await getAllMoodEntries();
  return entries.find(entry => entry.id === id) || null;
};

// Delete a mood entry
export const deleteMoodEntry = async (id: string): Promise<boolean> => {
  const entries = await getAllMoodEntries();
  const entryToDelete = entries.find(entry => entry.id === id);
  
  if (!entryToDelete) {
    return false;
  }
  
  // Delete the voice recording if it exists
  if (entryToDelete.emotionData.voiceUri) {
    await deleteVoiceRecording(entryToDelete.emotionData.voiceUri);
  }
  
  // Remove the entry from the list
  const updatedEntries = entries.filter(entry => entry.id !== id);
  
  // Save the updated list
  await SecureStore.setItemAsync(MOOD_ENTRIES_KEY, JSON.stringify(updatedEntries));
  
  return true;
}; 