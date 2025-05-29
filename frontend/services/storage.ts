import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types';

const MOOD_ENTRIES_KEY = 'emotiglass_mood_entries';
const MOOD_ENTRIES_DIR = FileSystem.documentDirectory + 'mood_entries/';

export { MoodEntry };

// Initialize storage
export const initStorage = async (): Promise<boolean> => {
  try {
    // Create directory for mood entries if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(MOOD_ENTRIES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MOOD_ENTRIES_DIR, { intermediates: true });
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    return false;
  }
};

// Save a mood entry
export const saveMoodEntry = async (entry: MoodEntry): Promise<boolean> => {
  try {
    // Get existing entries
    const entries = await getAllMoodEntries();
    
    // Add new entry
    entries.push(entry);
    
    // Save entries index
    const entryIds = entries.map(e => e.id);
    await SecureStore.setItemAsync(MOOD_ENTRIES_KEY, JSON.stringify(entryIds));
    
    // Save entry data to file
    const filePath = MOOD_ENTRIES_DIR + entry.id + '.json';
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(entry));
    
    return true;
  } catch (error) {
    console.error('Failed to save mood entry:', error);
    return false;
  }
};

// Get all mood entries
export const getAllMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    // Get entry IDs
    const entryIdsJson = await SecureStore.getItemAsync(MOOD_ENTRIES_KEY);
    if (!entryIdsJson) {
      return [];
    }
    
    const entryIds = JSON.parse(entryIdsJson) as string[];
    
    // Load each entry
    const entries: MoodEntry[] = [];
    for (const id of entryIds) {
      const entry = await getMoodEntry(id);
      if (entry) {
        entries.push(entry);
      }
    }
    
    // Sort by date (newest first)
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get mood entries:', error);
    return [];
  }
};

// Get a single mood entry
export const getMoodEntry = async (id: string): Promise<MoodEntry | null> => {
  try {
    const filePath = MOOD_ENTRIES_DIR + id + '.json';
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (!fileInfo.exists) {
      return null;
    }
    
    const entryJson = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(entryJson) as MoodEntry;
  } catch (error) {
    console.error(`Failed to get mood entry ${id}:`, error);
    return null;
  }
};

// Delete a mood entry
export const deleteMoodEntry = async (id: string): Promise<boolean> => {
  try {
    // Get existing entries
    const entries = await getAllMoodEntries();
    
    // Remove entry
    const updatedEntries = entries.filter(e => e.id !== id);
    
    // Update entries index
    const entryIds = updatedEntries.map(e => e.id);
    await SecureStore.setItemAsync(MOOD_ENTRIES_KEY, JSON.stringify(entryIds));
    
    // Delete entry file
    const filePath = MOOD_ENTRIES_DIR + id + '.json';
    await FileSystem.deleteAsync(filePath);
    
    return true;
  } catch (error) {
    console.error(`Failed to delete mood entry ${id}:`, error);
    return false;
  }
}; 