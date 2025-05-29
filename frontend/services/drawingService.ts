import * as FileSystem from 'expo-file-system';
import { Path } from '../types';

// Constants
const DRAWINGS_DIR = FileSystem.documentDirectory + 'drawings/';

// Helper function to ensure directory exists
const ensureDirectoryExists = async (directory: string): Promise<boolean> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(directory);
    
    if (!dirInfo.exists) {
      console.log(`Creating directory: ${directory}`);
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      
      // Verify directory was created
      const verifyInfo = await FileSystem.getInfoAsync(directory);
      if (!verifyInfo.exists) {
        console.error(`Failed to create directory: ${directory}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring directory exists: ${directory}`, error);
    return false;
  }
};

// Create drawings directory if it doesn't exist
export const initDrawingStorage = async (): Promise<boolean> => {
  try {
    return await ensureDirectoryExists(DRAWINGS_DIR);
  } catch (error) {
    console.error('Failed to initialize drawing storage:', error);
    return false;
  }
};

/**
 * Save drawing to file system
 * @param drawingData JSON string of drawing paths
 * @returns URI of saved drawing
 */
export const saveDrawing = async (drawingData: string): Promise<string | null> => {
  try {
    // Ensure directory exists
    const dirCreated = await ensureDirectoryExists(DRAWINGS_DIR);
    if (!dirCreated) {
      console.error('Failed to create drawings directory');
      return null;
    }
    
    // Generate unique filename based on timestamp
    const timestamp = Date.now();
    const fileName = `drawing_${timestamp}.json`;
    const fileUri = DRAWINGS_DIR + fileName;
    
    // Write drawing data to file
    await FileSystem.writeAsStringAsync(fileUri, drawingData);
    console.log(`Drawing saved to: ${fileUri}`);
    
    return fileUri;
  } catch (error) {
    console.error('Failed to save drawing:', error);
    return null;
  }
};

/**
 * Load drawing from file system
 * @param uri URI of drawing to load
 * @returns Drawing paths array
 */
export const loadDrawing = async (uri: string): Promise<Path[] | null> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.error(`Drawing file does not exist: ${uri}`);
      return null;
    }
    
    const drawingData = await FileSystem.readAsStringAsync(uri);
    return JSON.parse(drawingData) as Path[];
  } catch (error) {
    console.error('Failed to load drawing:', error);
    return null;
  }
};

/**
 * Convert drawing to base64 image
 * This would typically use a library to render SVG to an image
 * For now, we'll just return the JSON data since this is a simulation
 * @param drawingData Drawing paths as JSON string
 * @returns Base64 encoded image data
 */
export const drawingToBase64 = async (drawingData: string): Promise<string | null> => {
  try {
    // In a real implementation, we would:
    // 1. Create an SVG from the drawing data
    // 2. Convert SVG to image (canvas or native module)
    // 3. Convert image to base64
    
    // For now, we'll return a placeholder base64 string
    // that starts with the drawing data but looks like base64
    const base64Prefix = 'data:image/png;base64,';
    // React Native doesn't have btoa, so use a workaround
    const mockBase64 = base64Prefix + `MockDrawing_${Date.now()}`;
    
    return mockBase64;
  } catch (error) {
    console.error('Failed to convert drawing to base64:', error);
    return null;
  }
};

/**
 * Get all saved drawings
 * @returns Array of drawing URIs
 */
export const getAllDrawings = async (): Promise<string[]> => {
  try {
    // Create directory if it doesn't exist
    const dirCreated = await ensureDirectoryExists(DRAWINGS_DIR);
    if (!dirCreated) {
      console.error('Failed to ensure drawings directory exists');
      return [];
    }
    
    // Get all files in drawings directory
    const files = await FileSystem.readDirectoryAsync(DRAWINGS_DIR);
    console.log(`Found ${files.length} drawing files`);
    
    // Filter for drawing files
    const drawingFiles = files.filter(file => file.endsWith('.json'));
    
    // Convert to full URIs
    const drawingUris = drawingFiles.map(file => DRAWINGS_DIR + file);
    
    return drawingUris;
  } catch (error) {
    console.error('Failed to get drawings:', error);
    return [];
  }
};

/**
 * Delete a drawing
 * @param uri URI of drawing to delete
 * @returns Whether deletion was successful
 */
export const deleteDrawing = async (uri: string): Promise<boolean> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.error(`Drawing file does not exist: ${uri}`);
      return false;
    }
    
    await FileSystem.deleteAsync(uri);
    console.log(`Deleted drawing: ${uri}`);
    return true;
  } catch (error) {
    console.error('Failed to delete drawing:', error);
    return false;
  }
};

/**
 * Analyze drawing for emotional content
 * This is a placeholder that would normally use a ML model
 * @param drawingData Drawing paths as JSON string
 * @returns Emotion data based on the drawing
 */
export const analyzeDrawing = async (drawingData: string): Promise<Record<string, number>> => {
  try {
    // Parse drawing data
    const paths = JSON.parse(drawingData) as Path[];
    
    // In a real app, this would use a machine learning model to analyze the drawing
    // For now, we'll generate random emotion scores based on drawing characteristics
    
    // Simple heuristics (just for demonstration):
    // - More strokes might indicate higher energy
    // - More colors might indicate higher emotional complexity
    // - Thicker lines might indicate stronger emotions
    
    const strokeCount = paths.length;
    const uniqueColors = new Set(paths.map(path => path.color)).size;
    const avgLineWidth = paths.reduce((sum, path) => sum + path.width, 0) / Math.max(1, paths.length);
    
    console.log(`Analyzing drawing: ${strokeCount} strokes, ${uniqueColors} colors, avg width: ${avgLineWidth}`);
    
    // Generate pseudo-random but somewhat consistent emotion scores
    const emotions = {
      joy: Math.min(0.1 + (uniqueColors * 0.15) + Math.random() * 0.2, 1),
      sadness: Math.min(0.1 + (avgLineWidth * 0.03) + Math.random() * 0.2, 1),
      anger: Math.min(0.1 + (strokeCount * 0.02) + Math.random() * 0.1, 1),
      fear: Math.min(0.05 + Math.random() * 0.15, 1),
      surprise: Math.min(0.1 + (uniqueColors * 0.1) + Math.random() * 0.2, 1),
      disgust: Math.min(0.05 + Math.random() * 0.1, 1),
      contentment: Math.min(0.1 + (1 / avgLineWidth) * 0.2 + Math.random() * 0.2, 1),
      neutral: Math.min(0.1 + Math.random() * 0.2, 1),
      energy: Math.min(30 + (strokeCount * 3) + (uniqueColors * 5) + Math.random() * 20, 100),
      calmness: Math.min(30 + (1 / avgLineWidth) * 20 + Math.random() * 20, 100),
      tension: Math.min(20 + (strokeCount * 2) + (avgLineWidth * 5) + Math.random() * 20, 100)
    };
    
    return emotions;
  } catch (error) {
    console.error('Failed to analyze drawing:', error);
    
    // Return neutral emotions if analysis fails
    return {
      joy: 0.1,
      sadness: 0.1,
      anger: 0.1,
      fear: 0.1,
      surprise: 0.1,
      disgust: 0.1,
      contentment: 0.1,
      neutral: 0.3,
      energy: 50,
      calmness: 50,
      tension: 50
    };
  }
}; 