import { Path } from '../components/ui/DrawingCanvas';

export interface EmotionData {
  drawing: Path[];
  energy: number;
  calmness: number;
  tension: number;
  voiceUri?: string;
  timestamp: number;
}

export interface MoodAnalysis {
  dominantEmotion: string;
  emotionVector: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    contentment: number;
  };
  intensity: number;
  visualTheme: string;
  audioTheme: string;
}

// This is a simple local emotion analysis algorithm
// In a production app, you might want to use a more sophisticated ML model
// or send the data to a backend for processing
export const analyzeEmotion = (data: EmotionData): MoodAnalysis => {
  // Calculate intensity from energy and tension
  const intensity = (data.energy + data.tension) / 2;
  
  // Calculate emotional balance
  const emotionalBalance = data.calmness - data.tension;
  
  // Determine dominant emotion based on parameters
  let dominantEmotion = 'neutral';
  let emotionVector = {
    joy: 0.1,
    sadness: 0.1,
    anger: 0.1,
    fear: 0.1,
    surprise: 0.1,
    disgust: 0.1,
    contentment: 0.1,
  };
  
  // High energy, high calmness = joy
  if (data.energy > 70 && data.calmness > 70) {
    dominantEmotion = 'joy';
    emotionVector.joy = 0.8;
    emotionVector.contentment = 0.6;
  } 
  // Low energy, high calmness = contentment
  else if (data.energy < 30 && data.calmness > 70) {
    dominantEmotion = 'contentment';
    emotionVector.contentment = 0.8;
    emotionVector.joy = 0.3;
  }
  // High energy, low calmness, high tension = anger
  else if (data.energy > 70 && data.calmness < 30 && data.tension > 70) {
    dominantEmotion = 'anger';
    emotionVector.anger = 0.8;
    emotionVector.disgust = 0.4;
  }
  // Low energy, low calmness, high tension = sadness
  else if (data.energy < 30 && data.calmness < 50 && data.tension > 50) {
    dominantEmotion = 'sadness';
    emotionVector.sadness = 0.8;
    emotionVector.fear = 0.3;
  }
  // High tension, moderate energy = fear/anxiety
  else if (data.tension > 70 && data.energy > 40 && data.energy < 60) {
    dominantEmotion = 'fear';
    emotionVector.fear = 0.8;
    emotionVector.surprise = 0.4;
  }
  // High energy, moderate tension, moderate calmness = surprise
  else if (data.energy > 70 && data.tension > 40 && data.tension < 60 && data.calmness > 40 && data.calmness < 60) {
    dominantEmotion = 'surprise';
    emotionVector.surprise = 0.8;
    emotionVector.joy = 0.3;
  }
  // Low calmness, moderate tension, moderate energy = disgust
  else if (data.calmness < 30 && data.tension > 40 && data.tension < 60 && data.energy > 40 && data.energy < 60) {
    dominantEmotion = 'disgust';
    emotionVector.disgust = 0.8;
    emotionVector.anger = 0.3;
  }
  
  // Determine visual and audio themes based on dominant emotion
  const visualThemes: Record<string, string> = {
    joy: 'sunny_sky',
    contentment: 'gentle_waves',
    anger: 'stormy_clouds',
    sadness: 'rainy_window',
    fear: 'dark_forest',
    surprise: 'aurora_borealis',
    disgust: 'murky_swamp',
    neutral: 'calm_meadow',
  };
  
  const audioThemes: Record<string, string> = {
    joy: 'upbeat_melody',
    contentment: 'gentle_ambient',
    anger: 'intense_drums',
    sadness: 'slow_piano',
    fear: 'tense_strings',
    surprise: 'sudden_chimes',
    disgust: 'discordant_tones',
    neutral: 'soft_ambient',
  };
  
  return {
    dominantEmotion,
    emotionVector,
    intensity,
    visualTheme: visualThemes[dominantEmotion],
    audioTheme: audioThemes[dominantEmotion],
  };
}; 