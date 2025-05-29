import { EmotionData, EmotionAnalysisResult } from '../types';

/**
 * Analyzes emotion data and returns an analysis result
 * @param emotions The emotion data to analyze
 * @returns An analysis result with the dominant emotion and confidence
 */
export const analyzeEmotions = (emotions: EmotionData): EmotionAnalysisResult => {
  // Find the dominant emotion (highest score)
  let dominantEmotion: keyof EmotionData = 'neutral';
  let highestScore = 0;
  
  // Check each emotion
  Object.entries(emotions).forEach(([emotion, score]) => {
    if (score > highestScore) {
      highestScore = score;
      dominantEmotion = emotion as keyof EmotionData;
    }
  });
  
  // Calculate confidence (normalized score of dominant emotion)
  const totalScore = Object.values(emotions).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? highestScore / totalScore : 0;
  
  return {
    emotions,
    dominantEmotion,
    confidence,
    timestamp: Date.now()
  };
};

/**
 * Analyzes text for emotional content
 * @param text The text to analyze
 * @returns Emotion data based on the text
 */
export const analyzeText = (text: string): EmotionData => {
  // This is a placeholder implementation
  // In a real app, this would use NLP or an emotion analysis API
  
  const emotions: EmotionData = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    contentment: 0,
    neutral: 1 // Default to neutral
  };
  
  // Simple keyword matching
  const keywords = {
    joy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'love', 'pleased'],
    sadness: ['sad', 'unhappy', 'depressed', 'down', 'miserable', 'upset'],
    anger: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated'],
    fear: ['afraid', 'scared', 'fearful', 'terrified', 'anxious', 'worried'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected'],
    disgust: ['disgusted', 'gross', 'revolting', 'awful', 'horrible'],
    contentment: ['content', 'satisfied', 'peaceful', 'calm', 'relaxed']
  };
  
  const lowercaseText = text.toLowerCase();
  
  // Count keyword matches for each emotion
  let totalMatches = 0;
  Object.entries(keywords).forEach(([emotion, words]) => {
    const emotionKey = emotion as keyof typeof keywords;
    const matches = words.filter(word => lowercaseText.includes(word)).length;
    
    if (matches > 0) {
      emotions[emotionKey] = matches;
      totalMatches += matches;
      emotions.neutral = 0; // If we found any emotion, reduce neutral
    }
  });
  
  // Normalize scores
  if (totalMatches > 0) {
    Object.keys(emotions).forEach(key => {
      const emotionKey = key as keyof EmotionData;
      emotions[emotionKey] = emotions[emotionKey] / totalMatches;
    });
  }
  
  return emotions;
};

/**
 * Creates a description of the emotional state
 * @param result The emotion analysis result
 * @returns A text description of the emotional state
 */
export const createEmotionDescription = (result: EmotionAnalysisResult): string => {
  const { dominantEmotion, confidence } = result;
  
  // Confidence level descriptions
  let intensityDesc = 'slightly';
  if (confidence > 0.7) {
    intensityDesc = 'extremely';
  } else if (confidence > 0.5) {
    intensityDesc = 'very';
  } else if (confidence > 0.3) {
    intensityDesc = 'moderately';
  }
  
  // Generate description based on dominant emotion
  switch (dominantEmotion) {
    case 'joy':
      return `You are feeling ${intensityDesc} happy and joyful.`;
    case 'sadness':
      return `You are feeling ${intensityDesc} sad.`;
    case 'anger':
      return `You are feeling ${intensityDesc} angry.`;
    case 'fear':
      return `You are feeling ${intensityDesc} afraid or anxious.`;
    case 'surprise':
      return `You are feeling ${intensityDesc} surprised.`;
    case 'disgust':
      return `You are feeling ${intensityDesc} disgusted.`;
    case 'contentment':
      return `You are feeling ${intensityDesc} content and at ease.`;
    case 'neutral':
    default:
      return 'Your emotional state appears to be neutral.';
  }
}; 