import React, { useState, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  Text, 
  Alert, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors as themeColors, spacing, typography } from '../../constants/theme';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as ImageManipulator from 'expo-image-manipulator';
import { Canvas, Path as SkiaPath, Skia, PaintStyle, CanvasRef } from '@shopify/react-native-skia';

/**
 * Type definitions for Drawing Canvas component
 */
type Point = {
  x: number;
  y: number;
};

// SkPath type from Skia
type SkPath = ReturnType<typeof Skia.Path.Make>;

// SkiaPath is a component, but Skia.Path.Make() returns SkPath (the path object)
type DrawingPath = {
  id: string;
  points: Point[];
  color: string;
  width: number;
  skiaPath: SkPath;
};

type ColorOption = string; // Hex color value

type StrokeWidthOption = number; // Stroke width in pixels

interface DrawingCanvasProps {
  /** Width of the canvas */
  width?: number | string;
  /** Height of the canvas */
  height?: number | string;
  /** Initial stroke color (hex) */
  initialColor?: string;
  /** Initial stroke width */
  initialStrokeWidth?: number;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
  /** Callback when drawing is complete */
  onDrawingComplete?: (drawingData: string) => void;
  /** Callback when drawing starts */
  onDrawingStart?: () => void;
  /** Callback when drawing ends */
  onDrawingEnd?: () => void;
  /** Callback when drawing is saved */
  onSave?: (uri: string) => void;
  /** Error handler */
  onError?: (error: Error) => void;
  }

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onDrawingComplete,
  onDrawingStart,
  onDrawingEnd,
  onSave,
  onError,
  width = Dimensions.get('window').width - 32,
  height = 300,
  initialColor = '#000000',
  initialStrokeWidth = 3,
}) => {
  // State
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [currentColor, setCurrentColor] = useState<string>(initialColor);
  const [currentWidth, setCurrentWidth] = useState<number>(initialStrokeWidth);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Refs
  const viewShotRef = useRef<ViewShot>(null);
  const canvasRef = useRef<CanvasRef>(null);
  
  // Color and width options
  const colorOptions: ColorOption[] = [
    '#000000', // Black
    '#FF3B30', // Red
    '#34C759', // Green
    '#007AFF', // Blue
    '#FFCC00', // Yellow
  ];
  
  const strokeWidths: StrokeWidthOption[] = [1, 2, 4, 6, 8];
  
  // Helper: Create Skia Path from points with smoothing
  const createSkiaPath = (points: Point[]): SkPath => {
    const skiaPath = Skia.Path.Make();
    if (points.length === 0) return skiaPath;
    
    // For a single point, draw a dot
    if (points.length === 1) {
      const p = points[0];
      skiaPath.addCircle(p.x, p.y, currentWidth / 2);
      return skiaPath;
    }
    
    // For multiple points, create a smooth path
    skiaPath.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      
      // For two points, just draw a line
      if (points.length === 2) {
        skiaPath.lineTo(p2.x, p2.y);
      } else {
        // For more points, use quadratic curves for smoothing
        // Calculate control point (midpoint)
        const cpX = (p1.x + p2.x) / 2;
        const cpY = (p1.y + p2.y) / 2;
        
        // Draw quadratic curve
        if (i === 1) {
          // First segment
          skiaPath.lineTo(cpX, cpY);
        } else {
          // Middle segments
          skiaPath.quadTo(p1.x, p1.y, cpX, cpY);
        }
        
        // Last segment
        if (i === points.length - 1) {
          skiaPath.lineTo(p2.x, p2.y);
        }
      }
    }
    
    return skiaPath;
  };
  
  // Pan gesture for drawing with improved sensitivity
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0) // Respond to the smallest movements
    .maxPointers(1) // Only track a single touch
    .simultaneousWithExternalGesture() // Allow simultaneous gestures
    .onStart((e) => {
      console.log('Drawing started at:', e.x, e.y);
      const newPoint = { x: e.x, y: e.y };
      setCurrentPoints([newPoint]);
      setIsDrawing(true);
      if (onDrawingStart) onDrawingStart();
    })
    .onUpdate((e) => {
      if (!isDrawing) return;
      console.log('Drawing update at:', e.x, e.y);
      // Add point with throttling to prevent too many points
      const lastPoint = currentPoints[currentPoints.length - 1];
      const newPoint = { x: e.x, y: e.y };
      
      // Only add point if it's far enough from the last point (reduces unnecessary points)
      const distance = Math.sqrt(
        Math.pow(newPoint.x - lastPoint.x, 2) + 
        Math.pow(newPoint.y - lastPoint.y, 2)
      );
      
      // Minimum distance between points based on stroke width
      const minDistance = Math.max(1, currentWidth / 4);
      
      if (distance >= minDistance) {
        setCurrentPoints(prev => [...prev, newPoint]);
      }
    })
    .onEnd(() => {
      console.log('Drawing ended with points:', currentPoints.length);
      if (currentPoints.length === 0) {
        setIsDrawing(false);
        return;
      }
      
      // Create a new path with current settings
      const skiaPath = createSkiaPath(currentPoints);
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        points: currentPoints,
        color: currentColor,
        width: currentWidth,
        skiaPath,
      };
      
      setPaths(prev => {
        const updated = [...prev, newPath];
        if (onDrawingComplete) onDrawingComplete(JSON.stringify(updated));
        return updated;
      });
      
      // Reset current points and drawing state
      setCurrentPoints([]);
      setIsDrawing(false);
      if (onDrawingEnd) onDrawingEnd();
    })
    .onFinalize(() => {
      // Ensure we clean up if the gesture is interrupted
      if (isDrawing) {
        setIsDrawing(false);
        setCurrentPoints([]);
        if (onDrawingEnd) onDrawingEnd();
      }
    });
  
  // Undo the last path
  const handleUndo = useCallback(() => {
    setPaths((prev) => {
      const updated = prev.slice(0, -1);
      if (onDrawingComplete) onDrawingComplete(JSON.stringify(updated));
      return updated;
    });
  }, [onDrawingComplete]);
  
  // Clear the canvas
  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPoints([]);
    if (onDrawingComplete) onDrawingComplete(JSON.stringify([]));
  }, [onDrawingComplete]);
  
  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    console.log('Color changed to:', color);
    setCurrentColor(color);
  }, []);
  
  // Handle stroke width change
  const handleWidthChange = useCallback((width: number) => {
    console.log('Width changed to:', width);
    setCurrentWidth(width);
  }, []);
  
  // Export drawing as base64
  const exportAsBase64 = async (): Promise<string | null> => {
    if (!viewShotRef.current) {
      console.warn('ViewShot ref is not available');
      return null;
    }
    
    try {
      setIsExporting(true);
      const uri = await viewShotRef.current?.capture?.();
      
      if (!uri) {
        setIsExporting(false);
        return null;
      }
      
      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(uri as string, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      setIsExporting(false);
      return base64;
    } catch (error) {
      console.error('Error exporting drawing:', error);
      setIsExporting(false);
      Alert.alert('Export Failed', 'Could not export the drawing. Please try again.');
      return null;
    }
  };
  
  // Save drawing to media library
  const saveToMediaLibrary = async () => {
    if (!viewShotRef.current) return;
    
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required to save drawings.');
        return;
      }
      
      setIsExporting(true);
      
      // Capture the view
      if (!viewShotRef.current) {
        console.error('ViewShot ref is not available');
        return;
      }
      const uri = await viewShotRef.current?.capture?.();
      
      // Optimize the image
      const optimizedImage = await ImageManipulator.manipulateAsync(
        uri as string,
        [],
        { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
      );
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(optimizedImage.uri);
      await MediaLibrary.createAlbumAsync('EmotiGlass Drawings', asset, false);
      
      setIsExporting(false);
      Alert.alert('Success', 'Drawing saved to your media library.');
    } catch (error) {
      console.error('Error saving drawing:', error);
      setIsExporting(false);
      Alert.alert('Error', 'Failed to save drawing.');
    }
  };
  
  // Render current path as SkiaPath with preview effect
  const renderCurrentSkiaPath = () => {
    if (currentPoints.length === 0) return null;
    
    const skiaPath = createSkiaPath(currentPoints);
    
    // Return both the main path and the preview effect
    return (
      <>
        {/* Main stroke */}
        <SkiaPath
          path={skiaPath}
          color={currentColor}
          strokeWidth={currentWidth}
          style="stroke"
          strokeCap="round"
          strokeJoin="round"
        />
        
        {/* Glow effect for better visual feedback */}
        <SkiaPath
          path={skiaPath}
          color={currentColor}
          style="stroke"
          strokeWidth={currentWidth + 4}
          strokeCap="round"
          strokeJoin="round"
          opacity={0.2}
        />
        
        {/* Brush position indicator */}
        {isDrawing && currentPoints.length > 0 && (() => {
          const lastPoint = currentPoints[currentPoints.length - 1];
          const path = Skia.Path.Make();
          path.addCircle(lastPoint.x, lastPoint.y, currentWidth + 2);
          
          return (
            <SkiaPath
              path={path}
              color={currentColor}
              style="stroke"
              strokeWidth={2}
            />
          );
        })()}
      </>
    );
  };
  
  // Add a function to render grid lines
  const renderGridLines = () => {
    const gridSize = 20;
    const canvasWidth = typeof width === 'number' ? width : Dimensions.get('window').width - 32;
    const canvasHeight = typeof height === 'number' ? height : 300;
    
    const horizontalLines = [];
    const verticalLines = [];
    
    // Create horizontal grid lines
    for (let y = gridSize; y < canvasHeight; y += gridSize) {
      const path = Skia.Path.Make();
      path.moveTo(0, y);
      path.lineTo(canvasWidth, y);
      
      horizontalLines.push(
        <SkiaPath
          key={`h-${y}`}
          path={path}
          color="rgba(0, 0, 0, 0.05)"
          style="stroke"
          strokeWidth={1}
        />
      );
    }
    
    // Create vertical grid lines
    for (let x = gridSize; x < canvasWidth; x += gridSize) {
      const path = Skia.Path.Make();
      path.moveTo(x, 0);
      path.lineTo(x, canvasHeight);
      
      verticalLines.push(
        <SkiaPath
          key={`v-${x}`}
          path={path}
          color="rgba(0, 0, 0, 0.05)"
          style="stroke"
          strokeWidth={1}
        />
      );
    }
    
    return [...horizontalLines, ...verticalLines];
  };
  
  return (
    <View style={styles.container}>
      {/* Drawing Canvas */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 0.9 }}
        style={[
          styles.canvasContainer,
          { 
            width: typeof width === 'number' ? width : Dimensions.get('window').width - 32, 
            height: typeof height === 'number' ? height : 300 
          }
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Canvas 
            ref={canvasRef}
            style={[
              styles.canvas,
              { 
                width: typeof width === 'number' ? width : Dimensions.get('window').width - 32, 
                height: typeof height === 'number' ? height : 300 
              },
              isDrawing && styles.activeCanvas // Add highlighted border when drawing
            ]}
          >
            {/* Grid lines for better spatial reference */}
            {renderGridLines()}
            
            {/* Render completed paths */}
            {paths.map((path) => (
              <SkiaPath
                key={path.id}
                path={path.skiaPath}
                color={path.color}
                strokeWidth={path.width}
                style="stroke"
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
            
            {/* Render current path with effects */}
            {renderCurrentSkiaPath()}
          </Canvas>
        </GestureDetector>
      </ViewShot>
      
      {/* Empty State Overlay */}
      {paths.length === 0 && !isDrawing && (
        <View style={styles.emptyCanvasOverlay}>
          <Text style={styles.emptyCanvasText}>Draw your emotions here</Text>
          <Ionicons name="pencil-outline" size={32} color="rgba(0, 0, 0, 0.2)" />
        </View>
      )}
      
      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Drawing Tools */}
        <View style={styles.toolSection}>
          <TouchableOpacity
            style={styles.toolButton}
            onPress={handleUndo}
            disabled={paths.length === 0}
          >
            <Ionicons
              name="arrow-undo"
              size={24}
              color={paths.length === 0 ? themeColors.textLight : themeColors.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolButton}
            onPress={handleClear}
            disabled={paths.length === 0}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={paths.length === 0 ? themeColors.textLight : themeColors.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={saveToMediaLibrary}
            disabled={paths.length === 0 || isExporting}
          >
            <Ionicons
              name="save-outline"
              size={24}
              color={paths.length === 0 ? themeColors.textLight : themeColors.primary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Add Clear Button */}
        <TouchableOpacity
          style={[styles.clearButton, paths.length === 0 && styles.disabledButton]}
          onPress={handleClear}
          disabled={paths.length === 0}
        >
          <Text style={[styles.clearButtonText, paths.length === 0 && styles.disabledText]}>
            Clear Drawing
          </Text>
        </TouchableOpacity>
        
        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, paths.length === 0 && styles.disabledButton]}
          onPress={async () => {
            setIsExporting(true);
            try {
              const base64 = await exportAsBase64();
              if (base64 && onDrawingComplete) {
                onDrawingComplete(JSON.stringify(paths));
              }
            } catch (error) {
              console.error('Failed to export drawing:', error);
              if (onError) onError(error as Error);
            } finally {
              setIsExporting(false);
            }
          }}
          disabled={paths.length === 0 || isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.exportButtonText}>Done</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Color Picker */}
      <View style={styles.colorPickerContainer}>
        <Text style={styles.toolbarLabel}>Color</Text>
        <View style={styles.colorPicker}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                currentColor === color && styles.selectedColor,
              ]}
              onPress={() => handleColorChange(color)}
            />
          ))}
        </View>
      </View>
      
      {/* Stroke Width Picker */}
      <View style={styles.widthPickerContainer}>
        <Text style={styles.toolbarLabel}>Stroke Width</Text>
        <View style={styles.widthPicker}>
          {strokeWidths.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                styles.widthButton,
                currentWidth === width && styles.selectedWidth,
              ]}
              onPress={() => handleWidthChange(width)}
            >
              <View
                style={[
                  styles.widthIndicator,
                  { height: width, backgroundColor: currentColor },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
    flex: 1, // Take up available space
  },
  canvasContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1, // Take up available space
  },
  canvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flex: 1, // Take up available space
  },
  activeCanvas: {
    borderWidth: 2,
    borderColor: themeColors.primary,
    borderStyle: 'dashed',
  },
  toolbar: {
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    width: '100%', // Ensure toolbar takes full width
  },
  toolSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  toolButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  colorPickerContainer: {
    marginBottom: spacing.sm,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
    transform: [{ scale: 1.2 }],
  },
  widthPickerContainer: {
    marginTop: spacing.sm,
  },
  widthPicker: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  widthButton: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    elevation: 2,
  },
  selectedWidth: {
    borderColor: themeColors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  widthIndicator: {
    width: '80%',
    borderRadius: 4,
  },
  toolbarLabel: {
    fontSize: typography.fontSizes.sm,
    color: themeColors.textLight,
    fontWeight: typography.fontWeights.medium,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: themeColors.primary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  emptyCanvasOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 100, // Leave space for toolbar
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // Allow touch events to pass through
  },
  emptyCanvasText: {
    color: 'rgba(0, 0, 0, 0.2)',
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.sm,
  },
  clearButton: {
    backgroundColor: themeColors.lightGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
  },
  clearButtonText: {
    color: themeColors.text,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: themeColors.textLight,
  },
  exportButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
  },
  exportButtonText: {
    color: themeColors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
}); 