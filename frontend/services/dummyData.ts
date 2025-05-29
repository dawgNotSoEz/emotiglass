import { EmotionData, MoodEntry, EmotionAnalysisResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Generate random emotion data
export const generateRandomEmotionData = (): EmotionData => {
  return {
    joy: Math.random() * 0.8,
    sadness: Math.random() * 0.6,
    anger: Math.random() * 0.4,
    fear: Math.random() * 0.3,
    surprise: Math.random() * 0.5,
    disgust: Math.random() * 0.3,
    contentment: Math.random() * 0.7,
    neutral: Math.random() * 0.4,
    energy: Math.random() * 100,
    calmness: Math.random() * 100,
    tension: Math.random() * 100
  };
};

// Find the dominant emotion
export const findDominantEmotion = (emotions: EmotionData): keyof EmotionData => {
  const emotionEntries = Object.entries(emotions).filter(
    ([key]) => !['energy', 'calmness', 'tension'].includes(key)
  );
  
  let maxEmotion = emotionEntries[0][0] as keyof EmotionData;
  let maxValue = emotionEntries[0][1] as number;
  
  for (const [emotion, value] of emotionEntries) {
    if (value > maxValue) {
      maxValue = value;
      maxEmotion = emotion as keyof EmotionData;
    }
  }
  
  return maxEmotion;
};

// Generate a random mood entry
export const generateMoodEntry = (daysAgo = 0): MoodEntry => {
  const emotions = generateRandomEmotionData();
  const dominantEmotion = findDominantEmotion(emotions);
  
  const date = new Date();
  if (daysAgo > 0) {
    date.setDate(date.getDate() - daysAgo);
  }
  
  return {
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    timestamp: date.getTime(),
    createdAt: date.getTime(),
    date: date.toISOString().split('T')[0],
    emotions,
    dominantEmotion,
    confidence: 0.7 + Math.random() * 0.3,
    notes: '',
    source: ['sliders', 'drawing', 'voice', 'face'][Math.floor(Math.random() * 4)] as 'sliders' | 'drawing' | 'voice' | 'face'
  };
};

// Generate multiple mood entries for the past n days
export const generateMoodEntries = (days: number): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  
  for (let i = 0; i < days; i++) {
    // Some days might have multiple entries
    const entriesPerDay = Math.random() > 0.7 ? 2 : 1;
    
    for (let j = 0; j < entriesPerDay; j++) {
      entries.push(generateMoodEntry(i));
    }
  }
  
  return entries;
};

// Generate emotion analysis result
export const generateEmotionAnalysis = (emotionData: EmotionData): EmotionAnalysisResult => {
  const dominantEmotion = findDominantEmotion(emotionData);
  
  return {
    emotions: emotionData,
    dominantEmotion,
    confidence: 0.7 + Math.random() * 0.3,
    timestamp: Date.now(),
    intensity: 0.5 + Math.random() * 0.5
  };
};

// Get dummy trend data
export const getDummyTrendData = () => {
  const entries = generateMoodEntries(30);
  
  const emotionFrequency: Record<string, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    contentment: 0,
    neutral: 0
  };
  
  // Count occurrences of each emotion
  entries.forEach(entry => {
    emotionFrequency[entry.dominantEmotion] = 
      (emotionFrequency[entry.dominantEmotion] || 0) + 1;
  });
  
  // Generate daily mood data
  const dailyMood: Record<string, number> = {};
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Calculate average mood score (0-1)
    dailyMood[dateString] = 0.3 + Math.random() * 0.7;
  }
  
  return {
    entries,
    emotionFrequency,
    dailyMood,
    averageEnergy: 60 + Math.random() * 40,
    averageCalmness: 50 + Math.random() * 50,
    averageTension: 30 + Math.random() * 70
  };
}; 