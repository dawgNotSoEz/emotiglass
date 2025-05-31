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
 * This is a simulation of emotion inference based on drawing patterns
 * @param drawingData Drawing paths as JSON string
 * @returns Emotion data based on the drawing
 */
export const analyzeDrawing = async (drawingData: string): Promise<Record<string, number>> => {
  try {
    // Parse drawing data
    const paths = JSON.parse(drawingData) as Path[];
    
    // Calculate drawing metrics for emotional inference
    const drawingMetrics = calculateDrawingMetrics(paths);
    console.log('[drawingService] Drawing metrics:', drawingMetrics);
    
    // Generate emotion values based on drawing metrics
    const emotions = inferEmotionsFromMetrics(drawingMetrics);
    
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

/**
 * Calculate metrics from drawing paths for emotional analysis
 */
interface DrawingMetrics {
  strokeCount: number;         // Number of strokes
  uniqueColors: number;        // Number of unique colors used
  avgStrokeWidth: number;      // Average stroke width
  avgStrokeLength: number;     // Average length of strokes
  totalLength: number;         // Total length of all strokes
  avgSpeed: number;            // Average drawing speed (estimated)
  strokeDensity: number;       // Density of strokes in the drawing area
  usedArea: number;            // Percentage of canvas area used
  complexity: number;          // Complexity score based on turns and direction changes
  curvature: number;           // Amount of curvature in the strokes
  pressure: number;            // Estimated pressure (based on width variation)
  dominantColors: string[];    // Most used colors
}

/**
 * Calculate drawing metrics from paths
 */
const calculateDrawingMetrics = (paths: Path[]): DrawingMetrics => {
  if (paths.length === 0) {
    return {
      strokeCount: 0,
      uniqueColors: 0,
      avgStrokeWidth: 0,
      avgStrokeLength: 0,
      totalLength: 0,
      avgSpeed: 0,
      strokeDensity: 0,
      usedArea: 0,
      complexity: 0,
      curvature: 0,
      pressure: 0,
      dominantColors: []
    };
  }
  
  // Basic metrics
  const strokeCount = paths.length;
  const colors = paths.map(p => p.color);
  const uniqueColors = new Set(colors).size;
  const avgStrokeWidth = paths.reduce((sum, p) => sum + p.width, 0) / strokeCount;
  
  // Color frequency
  const colorFrequency: Record<string, number> = {};
  colors.forEach(color => {
    colorFrequency[color] = (colorFrequency[color] || 0) + 1;
  });
  
  const dominantColors = Object.entries(colorFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color);
  
  // Calculate stroke lengths and bounding box
  let totalLength = 0;
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;
  let maxY = Number.MIN_VALUE;
  let totalDirectionChanges = 0;
  let totalCurvature = 0;
  
  paths.forEach(path => {
    // Stroke length
    let pathLength = 0;
    let directionChanges = 0;
    
    // Update bounding box
    path.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    // Calculate path length and complexity
    for (let i = 1; i < path.points.length; i++) {
      const p1 = path.points[i - 1];
      const p2 = path.points[i];
      
      // Distance between points
      const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      pathLength += segmentLength;
      
      // Detect direction changes (for complexity)
      if (i > 1) {
        const p0 = path.points[i - 2];
        const angle1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const angle2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angleDiff = Math.abs(angle2 - angle1);
        
        // If angle difference is significant, count as direction change
        if (angleDiff > 0.3) { // ~17 degrees
          directionChanges++;
          totalCurvature += angleDiff;
        }
      }
    }
    
    totalLength += pathLength;
    totalDirectionChanges += directionChanges;
  });
  
  const avgStrokeLength = totalLength / strokeCount;
  const canvasArea = (maxX - minX) * (maxY - minY);
  const usedArea = canvasArea > 0 ? (canvasArea / (1000 * 1000)) * 100 : 0; // Normalized to percentage of 1000x1000 canvas
  
  // More advanced metrics
  const avgSpeed = avgStrokeLength / 5; // Simulated speed (lower = slower drawing)
  const strokeDensity = totalLength / (canvasArea > 0 ? canvasArea : 1);
  const complexity = totalDirectionChanges / strokeCount;
  const curvature = totalCurvature / strokeCount;
  
  // Estimate pressure from width variation and stroke density
  const widthVariation = Math.max(...paths.map(p => p.width)) - Math.min(...paths.map(p => p.width));
  const pressure = Math.min(1, (avgStrokeWidth * widthVariation) / 10);
  
  return {
    strokeCount,
    uniqueColors,
    avgStrokeWidth,
    avgStrokeLength,
    totalLength,
    avgSpeed,
    strokeDensity,
    usedArea,
    complexity,
    curvature,
    pressure,
    dominantColors
  };
};

/**
 * Infer emotions from drawing metrics
 */
const inferEmotionsFromMetrics = (metrics: DrawingMetrics): Record<string, number> => {
  // Initialize base emotions with neutral values
  const emotions = {
    joy: 0.1,
    sadness: 0.1,
    anger: 0.1,
    fear: 0.1,
    surprise: 0.1,
    disgust: 0.1,
    contentment: 0.1,
    neutral: 0.5,
    energy: 50,
    calmness: 50,
    tension: 50
  };
  
  // No metrics = neutral emotions
  if (metrics.strokeCount === 0) return emotions;
  
  // ----- Energy level inference -----
  // High energy: fast strokes, many strokes, high pressure, high complexity
  emotions.energy = Math.min(100, 
    40 + 
    (metrics.avgSpeed * 2) + 
    Math.min(30, metrics.strokeCount * 2) + 
    (metrics.pressure * 20) + 
    (metrics.complexity * 10)
  );
  
  // ----- Calmness level inference -----
  // Calmness: inversely related to complexity, pressure, speed
  emotions.calmness = Math.min(100, 
    80 - 
    (metrics.complexity * 15) - 
    (metrics.pressure * 20) - 
    (metrics.avgSpeed * 1.5) + 
    (metrics.avgStrokeLength / 100 * 10)
  );
  
  // ----- Tension level inference -----
  // Tension: short strokes, high pressure, high complexity, high stroke density
  emotions.tension = Math.min(100, 
    30 + 
    (metrics.strokeDensity * 10) + 
    (100 - Math.min(100, metrics.avgStrokeLength)) * 0.3 + 
    (metrics.pressure * 30) + 
    (metrics.complexity * 10)
  );
  
  // ----- Specific emotions inference -----
  
  // Joy: colorful, fluid strokes, medium-high energy
  emotions.joy = Math.min(1.0, 
    0.1 + 
    (metrics.uniqueColors / 5 * 0.4) + 
    (metrics.curvature * 0.2) + 
    (emotions.energy / 100 * 0.3) - 
    (emotions.tension / 100 * 0.2)
  );
  
  // Anger: high pressure, sharp turns, high tension, less colorful
  emotions.anger = Math.min(1.0, 
    0.1 + 
    (metrics.pressure * 0.4) + 
    (metrics.complexity * 0.3) + 
    (emotions.tension / 100 * 0.3) - 
    (emotions.calmness / 100 * 0.2)
  );
  
  // Sadness: slow, long strokes, low energy, low complexity
  emotions.sadness = Math.min(1.0, 
    0.1 + 
    ((10 - Math.min(10, metrics.avgSpeed)) * 0.05) + 
    ((100 - emotions.energy) / 100 * 0.3) + 
    ((100 - Math.min(100, metrics.complexity * 50)) / 100 * 0.3)
  );
  
  // Fear: erratic strokes, high pressure, high complexity
  emotions.fear = Math.min(1.0, 
    0.1 + 
    (metrics.pressure * 0.3) + 
    (metrics.complexity * 0.4) + 
    (emotions.tension / 100 * 0.3) - 
    (emotions.calmness / 100 * 0.2)
  );
  
  // Contentment: balanced, medium stroke length, medium-low energy
  emotions.contentment = Math.min(1.0, 
    0.1 + 
    (emotions.calmness / 100 * 0.5) + 
    ((100 - emotions.tension) / 100 * 0.3) + 
    ((metrics.avgStrokeLength > 50 && metrics.avgStrokeLength < 200) ? 0.3 : 0)
  );
  
  // Surprise: unique colors, varied strokes, high energy
  emotions.surprise = Math.min(1.0, 
    0.1 + 
    (metrics.uniqueColors / 5 * 0.3) + 
    (emotions.energy / 100 * 0.4) + 
    (metrics.complexity * 0.2)
  );
  
  // Disgust: sharp turns, high pressure, varied stroke width
  emotions.disgust = Math.min(1.0, 
    0.1 + 
    (metrics.complexity * 0.3) + 
    (metrics.pressure * 0.3) + 
    ((metrics.avgStrokeWidth > 5) ? 0.2 : 0)
  );
  
  // Reduce neutral based on strength of other emotions
  const emotionSum = 
    emotions.joy + 
    emotions.sadness + 
    emotions.anger + 
    emotions.fear + 
    emotions.surprise + 
    emotions.disgust + 
    emotions.contentment;
  
  emotions.neutral = Math.max(0.1, 1 - (emotionSum / 7));
  
  // Return the inferred emotions
  return emotions;
}; 