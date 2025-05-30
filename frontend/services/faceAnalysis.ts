import * as FileSystem from 'expo-file-system';
import { EmotionData } from '../types';

// Emotion mapping constants
const EMOTION_CLASSES = ['neutral', 'happy', 'sad', 'surprise', 'fear', 'disgust', 'anger'];

// Model paths
const FACE_MODEL_PATH = FileSystem.documentDirectory + 'models/face_expression_model/';

export interface FaceAnalysisResult {
  dominantEmotion: string;
  emotionScores: Record<string, number>;
  faceDetected: boolean;
}

// Constants for face image storage
const FACE_IMAGES_DIR = FileSystem.documentDirectory + 'face_images/';

// Initialize face detection and storage
export const initFaceDetection = async (): Promise<boolean> => {
  try {
    // Create face images directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(FACE_IMAGES_DIR);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(FACE_IMAGES_DIR, { intermediates: true });
    }
    
    // In a real implementation, this would initialize TensorFlow.js and load models
    return true;
  } catch (error) {
    console.error('Failed to initialize face detection:', error);
    return false;
  }
};

/**
 * Save face image to file system
 * @param imageUri URI of the image to save
 * @returns URI of saved image
 */
export const saveFaceImage = async (imageUri: string): Promise<string | null> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `face_${timestamp}.jpg`;
    const fileUri = FACE_IMAGES_DIR + fileName;
    
    // Create directory if it doesn't exist
    await initFaceDetection();
    
    // Copy image to storage directory
    await FileSystem.copyAsync({
      from: imageUri,
      to: fileUri
    });
    
    return fileUri;
  } catch (error) {
    console.error('Failed to save face image:', error);
    return null;
  }
};

/**
 * Delete a face image
 * @param uri URI of image to delete
 * @returns Whether deletion was successful
 */
export const deleteFaceImage = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri);
    return true;
  } catch (error) {
    console.error('Failed to delete face image:', error);
    return false;
  }
};

/**
 * Get all saved face images
 * @returns Array of image URIs
 */
export const getAllFaceImages = async (): Promise<string[]> => {
  try {
    // Create directory if it doesn't exist
    await initFaceDetection();
    
    // Get all files in face images directory
    const files = await FileSystem.readDirectoryAsync(FACE_IMAGES_DIR);
    
    // Filter for image files
    const imageFiles = files.filter(file => file.endsWith('.jpg'));
    
    // Convert to full URIs
    const imageUris = imageFiles.map(file => FACE_IMAGES_DIR + file);
    
    return imageUris;
  } catch (error) {
    console.error('Failed to get face images:', error);
    return [];
  }
};

// Process image from camera and detect emotions
export const analyzeImage = async (imageData: { uri: string; base64?: string }): Promise<FaceAnalysisResult | null> => {
  try {
    // Save the image first
    let savedUri = imageData.uri;
    if (imageData.uri.startsWith('file://')) {
      const savedImage = await saveFaceImage(imageData.uri);
      if (savedImage) {
        savedUri = savedImage;
      }
    }
    
    // Get image file info for analysis
    const fileInfo = await FileSystem.getInfoAsync(savedUri);
    
    // In a real app, this would use a ML model to analyze the face
    // For now, we'll use file characteristics to generate somewhat consistent emotion scores
    const fileSize = fileInfo.exists ? (fileInfo.size || 0) : 0;
    const modificationTime = fileInfo.exists && 'modificationTime' in fileInfo ? fileInfo.modificationTime : Date.now();
    
    // Generate pseudo-random but somewhat consistent emotion scores based on file characteristics
    const randomSeed = (fileSize + modificationTime) % 1000 / 1000;
    
    const mockEmotionScores = {
      neutral: Math.min(0.1 + (1 - randomSeed) * 0.2, 1),
      happy: Math.min(0.2 + randomSeed * 0.7, 1),
      sad: Math.min(0.1 + (1 - randomSeed) * 0.4, 1),
      surprise: Math.min(0.1 + randomSeed * 0.5, 1),
      fear: Math.min(0.05 + (1 - randomSeed) * 0.2, 1),
      disgust: Math.min(0.05 + randomSeed * 0.15, 1),
      anger: Math.min(0.05 + randomSeed * 0.3, 1),
      contentment: Math.min(0.15 + randomSeed * 0.4, 1),
    };
    
    // Normalize to ensure values sum to 1
    const total = Object.values(mockEmotionScores).reduce((sum, score) => sum + score, 0);
    
    const normalizedScores: Record<string, number> = {};
    
    for (const [emotion, score] of Object.entries(mockEmotionScores)) {
      normalizedScores[emotion] = score / total;
    }
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(normalizedScores)
      .reduce((max, [emotion, score]) => score > max.score ? { emotion, score } : max, { emotion: 'neutral', score: 0 })
      .emotion;
    
    return {
      dominantEmotion,
      emotionScores: normalizedScores,
      faceDetected: true
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return null;
  }
};

/**
 * Convert face analysis to EmotionData format
 * @param faceAnalysis Result from face analysis
 * @returns EmotionData object
 */
export const faceAnalysisToEmotionData = (faceAnalysis: FaceAnalysisResult): EmotionData => {
  // Map face analysis emotions to EmotionData format
  const emotionData: EmotionData = {
    joy: faceAnalysis.emotionScores.happy || 0,
    sadness: faceAnalysis.emotionScores.sad || 0,
    anger: faceAnalysis.emotionScores.anger || 0,
    fear: faceAnalysis.emotionScores.fear || 0,
    surprise: faceAnalysis.emotionScores.surprise || 0,
    disgust: faceAnalysis.emotionScores.disgust || 0,
    contentment: faceAnalysis.emotionScores.contentment || 0,
    neutral: faceAnalysis.emotionScores.neutral || 0,
    
    // Generate additional parameters based on emotion scores
    energy: Math.min(50 + 
      (faceAnalysis.emotionScores.happy || 0) * 30 + 
      (faceAnalysis.emotionScores.surprise || 0) * 30 + 
      (faceAnalysis.emotionScores.anger || 0) * 40, 100),
    
    calmness: Math.min(50 + 
      (faceAnalysis.emotionScores.neutral || 0) * 40 + 
      (faceAnalysis.emotionScores.contentment || 0) * 40 - 
      (faceAnalysis.emotionScores.anger || 0) * 30, 100),
    
    tension: Math.min(30 + 
      (faceAnalysis.emotionScores.fear || 0) * 40 + 
      (faceAnalysis.emotionScores.anger || 0) * 40 + 
      (faceAnalysis.emotionScores.sad || 0) * 20, 100)
  };
  
  return emotionData;
};

// Integrate face analysis with existing emotion data
export const integrateEmotionData = (
  emotionData: EmotionData,
  faceAnalysis: FaceAnalysisResult | null
): EmotionData => {
  if (!faceAnalysis || !faceAnalysis.faceDetected) {
    return emotionData;
  }
  
  // Create a weighted integration of face emotions with slider values
  // This is a simple example - you might want a more sophisticated algorithm
  const faceEmotionWeight = 0.3; // How much weight to give facial expressions
  
  // Map facial emotions to our emotion parameters
  let energyModifier = 0;
  let calmnessModifier = 0;
  let tensionModifier = 0;
  
  // Apply modifiers based on detected facial emotion
  switch (faceAnalysis.dominantEmotion) {
    case 'happy':
      energyModifier = 20;
      calmnessModifier = 10;
      tensionModifier = -15;
      break;
    case 'sad':
      energyModifier = -20;
      calmnessModifier = -10;
      tensionModifier = 10;
      break;
    case 'anger':
      energyModifier = 15;
      calmnessModifier = -20;
      tensionModifier = 25;
      break;
    case 'fear':
      energyModifier = 10;
      calmnessModifier = -15;
      tensionModifier = 20;
      break;
    case 'surprise':
      energyModifier = 15;
      calmnessModifier = 0;
      tensionModifier = 10;
      break;
    case 'disgust':
      energyModifier = 5;
      calmnessModifier = -15;
      tensionModifier = 15;
      break;
  }
  
  // Apply weighted modifications
  const updatedEmotionData = {
    ...emotionData,
    energy: clamp(emotionData.energy + (energyModifier * faceEmotionWeight), 0, 100),
    calmness: clamp(emotionData.calmness + (calmnessModifier * faceEmotionWeight), 0, 100),
    tension: clamp(emotionData.tension + (tensionModifier * faceEmotionWeight), 0, 100),
    faceEmotion: faceAnalysis.dominantEmotion,
    faceEmotionScores: faceAnalysis.emotionScores
  };
  
  return updatedEmotionData;
};

// Helper function to clamp values
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
