import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types';
import { generateMoodEntries } from './dummyData';

const MOOD_ENTRIES_KEY = 'emotiglass_mood_entries';
const MOOD_ENTRIES_DIR = FileSystem.documentDirectory + 'mood_entries/';

export type { MoodEntry };

// In-memory storage for prototype
let dummyEntries: MoodEntry[] = [];

// Initialize storage
export const initStorage = async (): Promise<boolean> => {
  try {
    // For prototype, generate some dummy entries
    if (dummyEntries.length === 0) {
      dummyEntries = generateMoodEntries(30);
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
    // For prototype, just add to in-memory array
    dummyEntries.push(entry);
    return true;
  } catch (error) {
    console.error('Failed to save mood entry:', error);
    return false;
  }
};

// Get all mood entries
export const getAllMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    // Initialize if needed
    if (dummyEntries.length === 0) {
      await initStorage();
    }
    
    // Sort by date (newest first)
    return [...dummyEntries].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get mood entries:', error);
    return [];
  }
};

// Get a single mood entry
export const getMoodEntry = async (id: string): Promise<MoodEntry | null> => {
  try {
    return dummyEntries.find(entry => entry.id === id) || null;
  } catch (error) {
    console.error(`Failed to get mood entry ${id}:`, error);
    return null;
  }
};

// Delete a mood entry
export const deleteMoodEntry = async (id: string): Promise<boolean> => {
  try {
    const initialLength = dummyEntries.length;
    dummyEntries = dummyEntries.filter(entry => entry.id !== id);
    return dummyEntries.length < initialLength;
  } catch (error) {
    console.error(`Failed to delete mood entry ${id}:`, error);
    return false;
  }
}; 