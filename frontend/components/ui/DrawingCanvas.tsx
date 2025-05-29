import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors as themeColors, spacing, typography } from '../../constants/theme';
import { Point, Path as DrawingPath } from '../../types';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';

interface DrawingCanvasProps {
  onDrawingComplete: (drawingData: string) => void;
  width?: number;
  height?: number;
}

// Set up the drawings directory
const DRAWINGS_DIR = FileSystem.documentDirectory + 'drawings/';

// Ensure directory exists
const ensureDirectoryExists = async (directory: string): Promise<boolean> => {
  try {
    console.log(`Checking if directory exists: ${directory}`);
    const dirInfo = await FileSystem.getInfoAsync(directory);
    
    if (!dirInfo.exists) {
      console.log(`Creating directory: ${directory}`);
      try {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      } catch (dirError) {
        console.error(`Error creating directory: ${directory}`, dirError);
        return false;
      }
      
      // Verify directory was created
      const verifyInfo = await FileSystem.getInfoAsync(directory);
      if (!verifyInfo.exists) {
        console.error(`Failed to create directory: ${directory}`);
        return false;
      }
      console.log(`Directory created successfully: ${directory}`);
    } else {
      console.log(`Directory already exists: ${directory}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring directory exists: ${directory}`, error);
    return false;
  }
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onDrawingComplete,
  width = Dimensions.get('window').width - 32,
  height = 300,
}) => {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [previewMode, setPreviewMode] = useState(false);
  const [directoryReady, setDirectoryReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<any>(null);
  
  // Available colors
  const colorOptions = [
    '#000000', // Black
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f1c40f', // Yellow
    '#9b59b6', // Purple
    '#e67e22', // Orange
    '#1abc9c', // Turquoise
    '#d35400', // Burnt Orange
    '#8e44ad', // Violet
    '#2980b9', // Ocean Blue
    '#c0392b', // Dark Red
  ];
  
  // Available stroke widths
  const strokeWidths = [1, 2, 4, 6, 8, 12];
  
  // Initialize directory
  useEffect(() => {
    const initDirectory = async () => {
      try {
        console.log('Initializing drawing directory...');
        const success = await ensureDirectoryExists(DRAWINGS_DIR);
        if (success) {
          console.log('Drawing directory initialized successfully');
          setDirectoryReady(true);
        } else {
          console.error('Failed to initialize drawing directory');
          Alert.alert(
            'Storage Error',
            'Unable to access storage for saving drawings. Drawing functionality may be limited.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Failed to initialize drawing directory:', error);
        Alert.alert(
          'Storage Error',
          'Unable to access storage for saving drawings. Drawing functionality may be limited.',
          [{ text: 'OK' }]
        );
      }
    };
    
    initDirectory();
  }, []);

  // Debug log path data
  useEffect(() => {
    if (paths.length > 0) {
      console.log(`Drawing updated - ${paths.length} paths`);
      console.log(`Latest path has ${paths[paths.length-1].points.length} points and color ${paths[paths.length-1].color}`);
      const drawingData = JSON.stringify(paths);
      onDrawingComplete(drawingData);
    }
  }, [paths]);
  
  // Pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log(`onStartShouldSetPanResponder - previewMode: ${previewMode}`);
        return !previewMode;
      },
      onMoveShouldSetPanResponder: () => {
        return !previewMode;
      },
      onPanResponderGrant: (event, gestureState) => {
        if (previewMode) return;
        
        const { locationX, locationY } = event.nativeEvent;
        console.log(`Starting drawing at: ${locationX}, ${locationY}`);
        setIsDrawing(true);
        
        // Start a new path
        const newPath: DrawingPath = {
          points: [{ x: locationX, y: locationY }],
          color: currentColor,
          width: currentWidth,
        };
        
        setCurrentPath(newPath);
      },
      onPanResponderMove: (event, gestureState) => {
        if (!currentPath || previewMode) return;
        
        const { locationX, locationY } = event.nativeEvent;
        
        // Add point to the current path
        setCurrentPath(prevPath => {
          if (!prevPath) return null;
          
          return {
            ...prevPath,
            points: [...prevPath.points, { x: locationX, y: locationY }],
          };
        });
      },
      onPanResponderRelease: () => {
        if (!currentPath || previewMode) return;
        
        console.log(`Finished drawing path with ${currentPath.points.length} points`);
        setIsDrawing(false);
        
        // Only add the path if it has more than one point
        if (currentPath.points.length > 1) {
          setPaths(prevPaths => [...prevPaths, currentPath]);
          console.log(`Added path with color ${currentPath.color} and width ${currentPath.width}`);
        } else {
          console.log('Path too short, not adding');
        }
        
        setCurrentPath(null);
      },
    })
  ).current;
  
  // Clear the canvas
  const handleClear = () => {
    if (paths.length === 0) return;
    
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to clear your drawing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setPaths([]);
            setCurrentPath(null);
            onDrawingComplete('[]');
            console.log('Canvas cleared');
          }
        }
      ]
    );
  };
  
  // Undo the last path
  const handleUndo = () => {
    if (paths.length === 0) return;
    
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);
    console.log(`Undid last path, ${newPaths.length} paths remaining`);
  };
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    console.log(`Preview mode: ${!previewMode}`);
  };
  
  // Save drawing to file
  const saveDrawing = async () => {
    if (paths.length === 0) {
      Alert.alert('Nothing to save', 'Please draw something first');
      return;
    }
    
    if (!directoryReady) {
      Alert.alert('Storage not ready', 'Please try again in a moment');
      return;
    }
    
    try {
      // Create a unique filename
      const fileName = `drawing_${Date.now()}.json`;
      const fileUri = `${DRAWINGS_DIR}${fileName}`;
      
      console.log(`Attempting to save drawing to: ${fileUri}`);
      
      // Ensure directory exists again just to be safe
      const dirExists = await ensureDirectoryExists(DRAWINGS_DIR);
      if (!dirExists) {
        console.error('Could not ensure drawings directory exists');
        Alert.alert('Error', 'Failed to access storage for saving. Please try again.');
        return;
      }
      
      // Save the drawing data
      const drawingData = JSON.stringify(paths);
      await FileSystem.writeAsStringAsync(fileUri, drawingData);
      
      console.log(`Drawing saved successfully to: ${fileUri}`);
      Alert.alert('Success', 'Drawing saved successfully');
    } catch (error) {
      console.error('Error saving drawing:', error);
      Alert.alert('Error', 'Failed to save drawing. Please try again.');
    }
  };
  
  // Create SVG path data from points
  const createSvgPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      // For a single point, create a small circle
      const { x, y } = points[0];
      return `M ${x-1} ${y} a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0`;
    }
    
    // Start at the first point
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Add line to each subsequent point
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };
  
  // Add test paths for debugging
  const addTestPaths = () => {
    const testPaths: DrawingPath[] = [
      {
        points: [
          { x: 50, y: 50 },
          { x: 100, y: 100 },
          { x: 150, y: 50 },
          { x: 200, y: 100 }
        ],
        color: '#FF0000',
        width: 5
      },
      {
        points: [
          { x: 50, y: 150 },
          { x: 200, y: 150 }
        ],
        color: '#0000FF',
        width: 10
      }
    ];
    
    setPaths([...paths, ...testPaths]);
    console.log('Added test paths');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.toolbarTop}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity 
            onPress={togglePreviewMode} 
            style={[styles.toolButton, previewMode && styles.activeToolButton]}
          >
            <Ionicons 
              name={previewMode ? "eye" : "eye-outline"} 
              size={24} 
              color={previewMode ? "#fff" : "#333"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={saveDrawing} style={styles.toolButton}>
            <Ionicons name="save-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={addTestPaths} style={styles.toolButton}>
            <Ionicons name="add-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.toolbarRight}>
          <TouchableOpacity onPress={handleUndo} style={styles.toolButton} disabled={paths.length === 0}>
            <Ionicons name="arrow-undo" size={24} color={paths.length === 0 ? "#ccc" : "#333"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.toolButton} disabled={paths.length === 0}>
            <Ionicons name="trash-outline" size={24} color={paths.length === 0 ? "#ccc" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View
        style={[
          styles.canvasContainer,
          { width, height },
          previewMode && styles.previewCanvas
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height="100%" style={styles.svg} ref={svgRef}>
          <G>
            {/* Render completed paths */}
            {paths.map((path, index) => (
              <Path
                key={`path-${index}`}
                d={createSvgPath(path.points)}
                stroke={path.color}
                strokeWidth={path.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {/* Render current path */}
            {currentPath && (
              <Path
                d={createSvgPath(currentPath.points)}
                stroke={currentPath.color}
                strokeWidth={currentPath.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </G>
        </Svg>
        
        {/* Preview mode overlay */}
        {previewMode && (
          <View style={styles.previewOverlay}>
            <Text style={styles.previewText}>Preview Mode</Text>
            <TouchableOpacity 
              onPress={togglePreviewMode} 
              style={styles.exitPreviewButton}
            >
              <Text style={styles.exitPreviewText}>Exit Preview</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!directoryReady && (
          <View style={styles.initializingOverlay}>
            <Text style={styles.initializingText}>Initializing drawing tools...</Text>
          </View>
        )}
        
        {isDrawing && (
          <View style={styles.drawingIndicator}>
            <Text style={styles.drawingIndicatorText}>Drawing...</Text>
          </View>
        )}
      </View>
      
      {!previewMode && (
        <View style={styles.toolbarBottom}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.toolbarLabel}>Colors:</Text>
            <View style={styles.colorPicker}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    currentColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setCurrentColor(color)}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.widthPickerContainer}>
            <Text style={styles.toolbarLabel}>Brush Size:</Text>
            <View style={styles.widthPicker}>
              {strokeWidths.map((width) => (
                <TouchableOpacity
                  key={width}
                  style={[
                    styles.widthButton,
                    currentWidth === width && styles.selectedWidth,
                  ]}
                  onPress={() => setCurrentWidth(width)}
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
      )}
      
      {paths.length === 0 && !currentPath && (
        <View style={styles.emptyCanvasOverlay}>
          <Text style={styles.emptyCanvasText}>Draw here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: themeColors.border,
    position: 'relative',
  },
  canvasContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewCanvas: {
    borderColor: themeColors.primary,
    borderWidth: 2,
  },
  svg: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  toolbarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  toolbarLeft: {
    flexDirection: 'row',
  },
  toolbarRight: {
    flexDirection: 'row',
  },
  toolbarBottom: {
    width: '100%',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
  },
  toolButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderRadius: 20,
  },
  activeToolButton: {
    backgroundColor: themeColors.primary,
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
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
    transform: [{ scale: 1.2 }]
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
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: '#fff',
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.md,
  },
  exitPreviewButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  exitPreviewText: {
    color: '#fff',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  initializingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initializingText: {
    color: themeColors.textLight,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  drawingIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  drawingIndicatorText: {
    color: '#fff',
    fontSize: typography.fontSizes.sm,
  },
  emptyCanvasOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  emptyCanvasText: {
    color: 'rgba(0, 0, 0, 0.2)',
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  }
}); 