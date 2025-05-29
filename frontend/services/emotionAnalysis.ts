import { EmotionData, EmotionAnalysisResult } from '../types';

// Analyze emotion data and return analysis result
export const analyzeEmotion = async (data: EmotionData): Promise<EmotionAnalysisResult> => {
  // This is a simplified emotion analysis algorithm
  // In a real app, this could be more sophisticated or use a machine learning model
  
  // Calculate emotion scores based on the input parameters
  const emotionScores = calculateEmotionScores(data);
  
  // Find the dominant emotion (highest score)
  const dominantEmotion = Object.entries(emotionScores)
    .reduce((max, [emotion, score]) => score > max.score ? { emotion, score } : max, { emotion: 'neutral', score: 0 })
    .emotion;
  
  // Calculate overall emotional intensity (0-100)
  const intensity = calculateIntensity(data);
  
  // Generate a description of the emotional state
  const description = generateDescription(dominantEmotion, intensity);
  
  return {
    dominantEmotion,
    emotionScores,
    intensity,
    description,
  };
};

// Calculate emotion scores based on the input parameters
const calculateEmotionScores = (data: EmotionData): Record<string, number> => {
  const { energy, calmness, tension } = data;
  
  // Convert slider values to emotion scores
  // This is a simplified mapping - a real implementation could be more nuanced
  return {
    joy: normalizeScore((energy * 0.7) + (calmness * 0.3) - (tension * 0.5)),
    contentment: normalizeScore((calmness * 0.8) - (energy * 0.2) - (tension * 0.6)),
    anger: normalizeScore((tension * 0.8) + (energy * 0.4) - (calmness * 0.8)),
    sadness: normalizeScore((tension * 0.4) - (energy * 0.8) + (calmness * 0.1)),
    fear: normalizeScore((tension * 0.7) - (calmness * 0.7) + (energy * 0.1)),
    surprise: normalizeScore((energy * 0.6) + (tension * 0.3) - (calmness * 0.2)),
    disgust: normalizeScore((tension * 0.5) - (calmness * 0.5) - (energy * 0.2)),
    neutral: normalizeScore(100 - Math.max(energy, calmness, tension)),
  };
};

// Calculate overall emotional intensity
const calculateIntensity = (data: EmotionData): number => {
  const { energy, tension } = data;
  return Math.min(100, Math.max(0, (energy * 0.6) + (tension * 0.4)));
};

// Generate a description of the emotional state
const generateDescription = (emotion: string, intensity: number): string => {
  const intensityLevel = intensity < 30 ? 'mild' : intensity < 70 ? 'moderate' : 'strong';
  
  const descriptions: Record<string, Record<string, string>> = {
    joy: {
      mild: 'You seem to be feeling a bit of happiness.',
      moderate: 'You appear to be in a good mood.',
      strong: 'You seem to be experiencing intense joy!',
    },
    contentment: {
      mild: 'You seem to be feeling slightly at ease.',
      moderate: 'You appear to be feeling content and peaceful.',
      strong: 'You seem to be experiencing deep contentment and serenity.',
    },
    anger: {
      mild: 'You seem to be feeling a bit irritated.',
      moderate: 'You appear to be feeling frustrated or annoyed.',
      strong: 'You seem to be experiencing strong anger.',
    },
    sadness: {
      mild: 'You seem to be feeling a touch of sadness.',
      moderate: 'You appear to be feeling down or blue.',
      strong: 'You seem to be experiencing deep sadness.',
    },
    fear: {
      mild: 'You seem to be feeling slightly anxious.',
      moderate: 'You appear to be feeling worried or nervous.',
      strong: 'You seem to be experiencing significant fear or anxiety.',
    },
    surprise: {
      mild: 'You seem to be feeling a bit surprised.',
      moderate: 'You appear to be feeling astonished.',
      strong: 'You seem to be experiencing shock or amazement.',
    },
    disgust: {
      mild: 'You seem to be feeling slightly put off.',
      moderate: 'You appear to be feeling disgusted.',
      strong: 'You seem to be experiencing strong revulsion.',
    },
    neutral: {
      mild: 'Your emotions seem balanced.',
      moderate: 'You appear to be in a neutral state.',
      strong: 'You seem to be in a very balanced emotional state.',
    },
  };
  
  return descriptions[emotion]?.[intensityLevel] || 'Your emotional state is unclear.';
};

// Normalize a score to be between 0 and 1
const normalizeScore = (value: number): number => {
  return Math.max(0, Math.min(1, value / 100));
}; 