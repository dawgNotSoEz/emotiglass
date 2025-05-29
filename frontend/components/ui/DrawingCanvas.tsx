import React, { useState, useRef } from 'react';
import { StyleSheet, View, PanResponder, Dimensions, TouchableOpacity, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { Point, Path as DrawingPath } from '../../types';

interface DrawingCanvasProps {
  onDrawingComplete: (drawingData: string) => void;
  width?: number;
  height?: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onDrawingComplete,
  width = Dimensions.get('window').width - 32,
  height = 300,
}) => {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(3);
  
  // Available colors
  const colors = [
    '#000000', // Black
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f1c40f', // Yellow
    '#9b59b6', // Purple
    '#e67e22', // Orange
  ];
  
  // Available stroke widths
  const strokeWidths = [2, 3, 5, 8];
  
  // Pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        
        // Start a new path
        const newPath: DrawingPath = {
          points: [{ x: locationX, y: locationY }],
          color: currentColor,
          width: currentWidth,
        };
        
        setCurrentPath(newPath);
      },
      onPanResponderMove: (event) => {
        if (!currentPath) return;
        
        const { locationX, locationY } = event.nativeEvent;
        
        // Add point to the current path
        setCurrentPath({
          ...currentPath,
          points: [...currentPath.points, { x: locationX, y: locationY }],
        });
      },
      onPanResponderRelease: () => {
        if (!currentPath) return;
        
        // Add the completed path to the paths array
        setPaths([...paths, currentPath]);
        setCurrentPath(null);
        
        // Notify parent component
        const drawingData = JSON.stringify([...paths, currentPath]);
        onDrawingComplete(drawingData);
      },
    })
  ).current;
  
  // Clear the canvas
  const handleClear = () => {
    setPaths([]);
    setCurrentPath(null);
    onDrawingComplete('[]');
  };
  
  // Undo the last path
  const handleUndo = () => {
    if (paths.length === 0) return;
    
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);
    
    // Notify parent component
    const drawingData = JSON.stringify(newPaths);
    onDrawingComplete(drawingData);
  };
  
  // Create SVG path data from points
  const createSvgPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    
    // Start at the first point
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Add line to each subsequent point
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.toolbarTop}>
        <TouchableOpacity onPress={handleUndo} style={styles.toolButton}>
          <Ionicons name="arrow-undo" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.toolButton}>
          <Ionicons name="trash-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View
        style={[
          styles.canvasContainer,
          { width, height },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height="100%" style={styles.svg}>
          <G>
            {/* Render completed paths */}
            {paths.map((path, index) => (
              <Path
                key={index}
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
      </View>
      
      <View style={styles.toolbarBottom}>
        <View style={styles.colorPicker}>
          {colors.map((color) => (
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
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvasContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  toolbarTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    padding: spacing.sm,
  },
  toolbarBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: spacing.sm,
  },
  toolButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  colorPicker: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#333',
  },
  widthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widthButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedWidth: {
    borderColor: '#333',
    backgroundColor: '#f0f0f0',
  },
  widthIndicator: {
    width: 20,
    borderRadius: 4,
  },
}); 