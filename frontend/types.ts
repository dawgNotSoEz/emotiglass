// Types for emotion data
export interface EmotionData {
  energy: number;
  calmness: number;
  tension: number;
  drawing: string | null;
  voiceNote: string | null;
  notes: string;
  faceEmotion?: string;
  faceEmotionScores?: Record<string, number>;
}

// Types for mood entries
export interface MoodEntry {
  id: string;
  createdAt: number;
  emotionData: EmotionData;
  analysis: EmotionAnalysisResult;
}

// Types for emotion analysis results
export interface EmotionAnalysisResult {
  dominantEmotion: string;
  emotionScores: Record<string, number>;
  intensity: number;
  description: string;
}

// Types for drawing paths
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  width: number;
} 