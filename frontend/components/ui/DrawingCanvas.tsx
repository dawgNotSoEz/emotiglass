import React, { useRef, useState } from 'react';
import { StyleSheet, View, PanResponder, Animated, ColorValue } from 'react-native';
import { colors } from '../../constants/theme';

interface DrawingCanvasProps {
  onDrawingUpdate?: (paths: Path[]) => void;
  height: number;
  width: number;
  strokeColor?: ColorValue;
  strokeWidth?: number;
  backgroundColor?: ColorValue;
}

export interface Path {
  segments: { x: number; y: number }[];
  color: ColorValue;
  width: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onDrawingUpdate,
  height,
  width,
  strokeColor = colors.primary,
  strokeWidth = 5,
  backgroundColor = colors.background,
}) => {
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const newPath: Path = {
          segments: [{ x: gestureState.x0, y: gestureState.y0 }],
          color: strokeColor,
          width: strokeWidth,
        };
        setCurrentPath(newPath);
      },
      onPanResponderMove: (_, gestureState) => {
        if (currentPath) {
          const newSegment = { x: gestureState.moveX, y: gestureState.moveY };
          setCurrentPath({
            ...currentPath,
            segments: [...currentPath.segments, newSegment],
          });
        }
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          const updatedPaths = [...paths, currentPath];
          setPaths(updatedPaths);
          setCurrentPath(null);
          
          if (onDrawingUpdate) {
            onDrawingUpdate(updatedPaths);
          }
        }
      },
    })
  ).current;

  const renderPaths = () => {
    return (
      <>
        {paths.map((path, index) => (
          <View key={`path-${index}`} style={styles.pathContainer}>
            {path.segments.map((segment, segmentIndex) => {
              if (segmentIndex === 0) return null;
              const previousSegment = path.segments[segmentIndex - 1];
              return (
                <View
                  key={`segment-${segmentIndex}`}
                  style={[
                    styles.segment,
                    {
                      left: previousSegment.x,
                      top: previousSegment.y,
                      width: Math.sqrt(
                        Math.pow(segment.x - previousSegment.x, 2) +
                          Math.pow(segment.y - previousSegment.y, 2)
                      ),
                      height: path.width,
                      backgroundColor: path.color as string,
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            segment.y - previousSegment.y,
                            segment.x - previousSegment.x
                          )}rad`,
                        },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
        {currentPath && (
          <View style={styles.pathContainer}>
            {currentPath.segments.map((segment, segmentIndex) => {
              if (segmentIndex === 0) return null;
              const previousSegment = currentPath.segments[segmentIndex - 1];
              return (
                <View
                  key={`current-segment-${segmentIndex}`}
                  style={[
                    styles.segment,
                    {
                      left: previousSegment.x,
                      top: previousSegment.y,
                      width: Math.sqrt(
                        Math.pow(segment.x - previousSegment.x, 2) +
                          Math.pow(segment.y - previousSegment.y, 2)
                      ),
                      height: currentPath.width,
                      backgroundColor: currentPath.color as string,
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            segment.y - previousSegment.y,
                            segment.x - previousSegment.x
                          )}rad`,
                        },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </>
    );
  };

  const clearCanvas = () => {
    setPaths([]);
    if (onDrawingUpdate) {
      onDrawingUpdate([]);
    }
  };

  return (
    <View
      style={[
        styles.canvas,
        {
          height,
          width,
          backgroundColor,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {renderPaths()}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pathContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  segment: {
    position: 'absolute',
    transformOrigin: 'left',
  },
});

DrawingCanvas.defaultProps = {
  height: 300,
  width: 300,
}; 