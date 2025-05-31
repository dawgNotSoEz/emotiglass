import * as FileSystem from 'expo-file-system';
import { Path } from '../types';
import { 
  DRAWINGS_DIR, 
  createDirectoryIfNeeded, 
  safeWriteToFile, 
  safeReadFromFile, 
  safeDeleteFile,
  exportToMediaLibrary,
  requestFileSystemPermissions
} from '../utils/fileSystemUtils';

/**
 * Initialize drawing storage
 * @returns Whether initialization was successful
 */
export const initDrawingStorage = async (): Promise<boolean> => {
  console.log('[drawingService] Initializing drawing storage...');
  try {
    // Create drawings directory if it doesn't exist
    const dirCreated = await createDirectoryIfNeeded(DRAWINGS_DIR);
    
    if (dirCreated) {
      console.log('[drawingService] Drawing storage initialized successfully');
    } else {
      console.error('[drawingService] Failed to initialize drawing storage');
    }
    
    return dirCreated;
  } catch (error) {
    console.error('[drawingService] Failed to initialize drawing storage:', error);
    return false;
  }
};

/**
 * Save drawing to file system
 * @param drawingData JSON string of drawing paths
 * @returns URI of saved drawing
 */
export const saveDrawing = async (drawingData: string): Promise<string | null> => {
  console.log('[drawingService] Saving drawing...');
  
  // Parse drawing data to verify it's valid
  try {
    JSON.parse(drawingData);
  } catch (parseError) {
    console.error('[drawingService] Invalid drawing data:', parseError);
    return null;
  }
  
  try {
    // Generate unique filename based on timestamp
    const timestamp = Date.now();
    const fileName = `drawing_${timestamp}.json`;
    const fileUri = DRAWINGS_DIR + fileName;
    
    console.log(`[drawingService] Writing drawing to: ${fileUri}`);
    
    // Write drawing data to file using safe write utility
    const writeSuccess = await safeWriteToFile(fileUri, drawingData);
    
    if (!writeSuccess) {
      console.error(`[drawingService] Failed to write drawing to: ${fileUri}`);
      return null;
    }
    
    // Verify file was written
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.error(`[drawingService] File not created despite no errors: ${fileUri}`);
      return null;
    }
    
    console.log(`[drawingService] Drawing saved to: ${fileUri}`);
    return fileUri;
  } catch (error) {
    console.error('[drawingService] Failed to save drawing:', error);
    return null;
  }
};

/**
 * Load a drawing from storage
 * @param uri URI of the drawing file
 * @returns Drawing paths or null if not found
 */
export const loadDrawing = async (uri: string): Promise<Path[] | null> => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.warn(`[drawingService] Drawing file does not exist: ${uri}`);
      return null;
    }
    
    try {
      // Read file content
      const content = await FileSystem.readAsStringAsync(uri);
      return JSON.parse(content);
    } catch (readError) {
      console.error(`[drawingService] Error reading drawing file ${uri}:`, readError);
      // Delete corrupted file
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return null;
    }
  } catch (error) {
    console.error(`[drawingService] Failed to load drawing from ${uri}:`, error);
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
    console.error('[drawingService] Failed to convert drawing to base64:', error);
    return null;
  }
};

/**
 * Get all saved drawings
 * @returns Array of drawing URIs
 */
export const getAllDrawings = async (): Promise<string[]> => {
  try {
    // Ensure directory exists
    const dirCreated = await createDirectoryIfNeeded(DRAWINGS_DIR);
    if (!dirCreated) {
      console.error('[drawingService] Failed to ensure drawings directory exists');
      return [];
    }
    
    // Get all files in drawings directory
    const files = await FileSystem.readDirectoryAsync(DRAWINGS_DIR);
    console.log(`[drawingService] Found ${files.length} drawing files`);
    
    // Filter for drawing files
    const drawingFiles = files.filter(file => file.endsWith('.json'));
    
    // Convert to full URIs
    const drawingUris = drawingFiles.map(file => DRAWINGS_DIR + file);
    
    return drawingUris;
  } catch (error) {
    console.error('[drawingService] Failed to get drawings:', error);
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
    const result = await safeDeleteFile(uri);
    if (result) {
      console.log(`[drawingService] Deleted drawing: ${uri}`);
    } else {
      console.error(`[drawingService] Failed to delete drawing: ${uri}`);
    }
    return result;
  } catch (error) {
    console.error('[drawingService] Failed to delete drawing:', error);
    return false;
  }
};

/**
 * Export drawing to media library
 * @param uri URI of drawing file
 * @returns Whether export was successful
 */
export const exportDrawingToMediaLibrary = async (uri: string): Promise<boolean> => {
  try {
    // Request permissions if needed
    const permissions = await requestFileSystemPermissions();
    
    if (!permissions.mediaLibrary) {
      console.error('[drawingService] Media library permission denied');
      return false;
    }
    
    // For a real implementation, we would:
    // 1. Convert the drawing to an image file
    // 2. Save the image to the media library
    
    // For now, this is a placeholder that would use the exportToMediaLibrary utility
    console.log('[drawingService] Exporting drawing to media library is not fully implemented');
    
    return false;
  } catch (error) {
    console.error('[drawingService] Failed to export drawing to media library:', error);
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
    
    console.log(`[drawingService] Analyzing drawing: ${strokeCount} strokes, ${uniqueColors} colors, avg width: ${avgLineWidth}`);
    
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
    console.error('[drawingService] Failed to analyze drawing:', error);
    
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