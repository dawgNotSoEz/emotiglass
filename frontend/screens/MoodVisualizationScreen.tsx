import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolateColor,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { EmotionData, RootStackParamList } from '../types';
import theme from '../constants/theme';
import { Card } from '../components/ui/Card';

type MoodVisualizationRouteProp = RouteProp<RootStackParamList, 'MoodVisualization'>;
type MoodVisualizationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MoodVisualization'>;

const { width: screenWidth } = Dimensions.get('window');

export const MoodVisualizationScreen: React.FC = () => {
  const navigation = useNavigation<MoodVisualizationScreenNavigationProp>();
  const route = useRoute<MoodVisualizationRouteProp>();
  const { emotionData } = route.params;
  
  const [dominantEmotion, setDominantEmotion] = useState<string>('neutral');
  const [intensity, setIntensity] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const backgroundColorValue = useSharedValue(0);
  const translateY = useSharedValue(50);
  
  // Get dominant emotion
  useEffect(() => {
    const emotions = { ...emotionData };
    delete emotions.energy;
    delete emotions.calmness;
    delete emotions.tension;
    
    // Find the dominant emotion
    let maxEmotion = 'neutral';
    let maxValue = 0;
    
    Object.entries(emotions).forEach(([emotion, value]) => {
      if (value > maxValue) {
        maxValue = value as number;
        maxEmotion = emotion;
      }
    });
    
    setDominantEmotion(maxEmotion);
    setIntensity(maxValue);
    
    // Start animations
    startAnimations(maxEmotion, maxValue);
  }, [emotionData]);
  
  // Start different animations based on the dominant emotion
  const startAnimations = (emotion: string, intensity: number) => {
    // Base animation duration
    const duration = 1000;
    
    // Common animations
    opacity.value = withTiming(1, { duration });
    translateY.value = withTiming(0, { duration });
    scale.value = withSequence(
      withTiming(1.2, { duration: duration * 0.6 }),
      withTiming(1, { duration: duration * 0.4 })
    );
    
    // Emotion-specific animations
    switch (emotion) {
      case 'joy':
        // Joyful rotation and bouncy movement
        rotation.value = withRepeat(
          withTiming(0.05, { duration: 500 }),
          -1,
          true
        );
        backgroundColorValue.value = withTiming(1, { duration });
        break;
        
      case 'sadness':
        // Slow, gentle movement
        rotation.value = withSequence(
          withTiming(-0.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.02, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        );
        backgroundColorValue.value = withTiming(2, { duration: duration * 1.5 });
        break;
        
      case 'anger':
        // Sharp, intense movements
        rotation.value = withRepeat(
          withSequence(
            withTiming(-0.05, { duration: 150, easing: Easing.bounce }),
            withTiming(0.05, { duration: 150, easing: Easing.bounce })
          ),
          4,
          false
        );
        backgroundColorValue.value = withTiming(3, { duration });
        break;
        
      case 'fear':
        // Trembling effect
        rotation.value = withRepeat(
          withSequence(
            withTiming(-0.03, { duration: 100 }),
            withTiming(0.03, { duration: 100 })
          ),
          6,
          true
        );
        backgroundColorValue.value = withTiming(4, { duration });
        break;
        
      case 'surprise':
        // Quick pop and subtle bounce
        scale.value = withSequence(
          withTiming(1.5, { duration: 300, easing: Easing.elastic(3) }),
          withTiming(1, { duration: 500 })
        );
        backgroundColorValue.value = withTiming(5, { duration });
        break;
        
      case 'contentment':
        // Gentle pulsing
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        backgroundColorValue.value = withTiming(6, { duration });
        break;
        
      case 'neutral':
      default:
        // Minimal animation
        rotation.value = 0;
        backgroundColorValue.value = withTiming(7, { duration });
        break;
    }
    
    // Mark animations as complete after a delay
    setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
  };
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}rad` },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });
  
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      backgroundColorValue.value,
      [0, 1, 2, 3, 4, 5, 6, 7],
      [
        theme.colors.background,
        theme.colors.joy + '40',     // Joy with transparency
        theme.colors.sadness + '40', // Sadness with transparency
        theme.colors.anger + '40',   // Anger with transparency
        theme.colors.fear + '40',    // Fear with transparency
        theme.colors.surprise + '40',// Surprise with transparency
        theme.colors.contentment + '40', // Contentment with transparency
        theme.colors.background,     // Neutral
      ]
    );
    
    return {
      backgroundColor,
    };
  });
  
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });
  
  // Get emotion description based on dominant emotion
  const getEmotionDescription = (): string => {
    switch (dominantEmotion) {
      case 'joy':
        return "Your drawing reflects happiness and positivity. The strokes show energy and enthusiasm.";
      case 'sadness':
        return "Your drawing suggests feelings of melancholy. The strokes appear deliberate and thoughtful.";
      case 'anger':
        return "Your drawing indicates frustration or tension. The strokes are powerful and direct.";
      case 'fear':
        return "Your drawing suggests anxiety or concern. The strokes show hesitation and caution.";
      case 'surprise':
        return "Your drawing reflects wonder or astonishment. The strokes show spontaneity.";
      case 'disgust':
        return "Your drawing indicates aversion or displeasure. The strokes show intensity and restraint.";
      case 'contentment':
        return "Your drawing suggests peace and satisfaction. The strokes are balanced and harmonious.";
      case 'neutral':
      default:
        return "Your drawing appears balanced and measured, without strong emotional indicators.";
    }
  };
  
  // Render emotion bars
  const renderEmotionBars = () => {
    const emotions = { ...emotionData };
    const moodFactors = Object.entries(emotions)
      .filter(([key]) => !['energy', 'calmness', 'tension'].includes(key))
      .sort((a, b) => (b[1] as number) - (a[1] as number));
    
    return (
      <View style={styles.emotionBarsContainer}>
        {moodFactors.map(([emotion, value], index) => (
          <Animated.View 
            key={emotion}
            style={[
              styles.emotionBarRow,
              { opacity: opacity.value },
              useAnimatedStyle(() => ({
                transform: [{ 
                  translateX: withDelay(
                    300 + index * 100, 
                    withTiming(0, { duration: 500 })
                  ) 
                }]
              }))
            ]}
          >
            <Text style={styles.emotionLabel}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </Text>
            <View style={styles.barContainer}>
              <Animated.View 
                style={[
                  styles.bar, 
                  { 
                    backgroundColor: getEmotionColor(emotion),
                    width: `${(value as number) * 100}%` 
                  },
                  useAnimatedStyle(() => ({
                    width: withDelay(
                      300 + index * 100,
                      withTiming(`${(value as number) * 100}%`, { duration: 1000 })
                    )
                  }))
                ]}
              />
            </View>
            <Text style={styles.emotionValue}>{Math.round((value as number) * 100)}%</Text>
          </Animated.View>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, animatedBackgroundStyle]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Mood Analysis</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.visualizationContainer, animatedContainerStyle]}>
            <View style={[styles.emotionCircle, { backgroundColor: getEmotionColor(dominantEmotion) }]}>
              <Ionicons 
                name={getEmotionIcon(dominantEmotion)} 
                size={80} 
                color="#fff" 
              />
            </View>
          </Animated.View>
          
          <Animated.View style={animatedTextStyle}>
            <Text style={styles.dominantEmotionText}>
              {dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)}
            </Text>
            
            <Card style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{getEmotionDescription()}</Text>
            </Card>
          </Animated.View>
          
          <View style={styles.gaugesContainer}>
            <Animated.View 
              style={useAnimatedStyle(() => ({
                opacity: withDelay(500, withTiming(1, { duration: 500 })),
                transform: [{ translateY: withDelay(500, withTiming(0, { duration: 500 })) }]
              }))}
            >
              <Text style={styles.sectionTitle}>Emotion Intensity</Text>
              {renderEmotionBars()}
            </Animated.View>
            
            <View style={styles.moodFactorsContainer}>
              <Animated.View 
                style={useAnimatedStyle(() => ({
                  opacity: withDelay(800, withTiming(1, { duration: 500 })),
                  transform: [{ translateY: withDelay(800, withTiming(0, { duration: 500 })) }]
                }))}
              >
                <Text style={styles.sectionTitle}>Mood Factors</Text>
                
                <View style={styles.moodFactorRow}>
                  <View style={styles.moodFactor}>
                    <Text style={styles.moodFactorLabel}>Energy</Text>
                    <View style={styles.moodFactorBarContainer}>
                      <Animated.View 
                        style={[
                          styles.moodFactorBar,
                          { backgroundColor: theme.colors.primary },
                          useAnimatedStyle(() => ({
                            width: withDelay(
                              1000,
                              withTiming(`${emotionData.energy}%`, { duration: 1000 })
                            )
                          }))
                        ]} 
                      />
                    </View>
                    <Text style={styles.moodFactorValue}>{Math.round(emotionData.energy)}%</Text>
                  </View>
                </View>
                
                <View style={styles.moodFactorRow}>
                  <View style={styles.moodFactor}>
                    <Text style={styles.moodFactorLabel}>Calmness</Text>
                    <View style={styles.moodFactorBarContainer}>
                      <Animated.View 
                        style={[
                          styles.moodFactorBar,
                          { backgroundColor: theme.colors.contentment },
                          useAnimatedStyle(() => ({
                            width: withDelay(
                              1100,
                              withTiming(`${emotionData.calmness}%`, { duration: 1000 })
                            )
                          }))
                        ]} 
                      />
                    </View>
                    <Text style={styles.moodFactorValue}>{Math.round(emotionData.calmness)}%</Text>
                  </View>
                </View>
                
                <View style={styles.moodFactorRow}>
                  <View style={styles.moodFactor}>
                    <Text style={styles.moodFactorLabel}>Tension</Text>
                    <View style={styles.moodFactorBarContainer}>
                      <Animated.View 
                        style={[
                          styles.moodFactorBar,
                          { backgroundColor: theme.colors.anger },
                          useAnimatedStyle(() => ({
                            width: withDelay(
                              1200,
                              withTiming(`${emotionData.tension}%`, { duration: 1000 })
                            )
                          }))
                        ]} 
                      />
                    </View>
                    <Text style={styles.moodFactorValue}>{Math.round(emotionData.tension)}%</Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
          
          <Animated.View 
            style={useAnimatedStyle(() => ({
              opacity: withDelay(1500, withTiming(animationComplete ? 1 : 0, { duration: 500 })),
              transform: [{ 
                translateY: withDelay(
                  1500, 
                  withTiming(animationComplete ? 0 : 20, { duration: 500 })
                ) 
              }]
            }))}
          >
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('MoodDiary')}
              >
                <Text style={styles.actionButtonText}>View Mood History</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => navigation.navigate('EmotionInput')}
              >
                <Text style={styles.primaryButtonText}>New Entry</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// Helper function to get color for emotion
const getEmotionColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    joy: theme.colors.joy,
    sadness: theme.colors.sadness,
    anger: theme.colors.anger,
    fear: theme.colors.fear,
    surprise: theme.colors.surprise,
    disgust: theme.colors.disgust,
    contentment: theme.colors.contentment,
    neutral: theme.colors.neutral,
  };
  
  return emotionColors[emotion] || theme.colors.primary;
};

// Helper function to get icon for emotion
const getEmotionIcon = (emotion: string): string => {
  const emotionIcons: Record<string, string> = {
    joy: 'happy',
    sadness: 'sad',
    anger: 'flame',
    fear: 'warning',
    surprise: 'eye',
    disgust: 'remove-circle',
    contentment: 'heart',
    neutral: 'remove',
  };
  
  return emotionIcons[emotion] || 'help-circle';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  visualizationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emotionCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  dominantEmotionText: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  descriptionCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  descriptionText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  gaugesContainer: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emotionBarsContainer: {
    marginBottom: theme.spacing.xl,
  },
  emotionBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    transform: [{ translateX: -50 }], // Initial position for animation
  },
  emotionLabel: {
    width: 100,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.sm,
  },
  bar: {
    height: '100%',
    width: '0%', // Initial width for animation
    borderRadius: 5,
  },
  emotionValue: {
    width: 40,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    textAlign: 'right',
  },
  moodFactorsContainer: {
    marginBottom: theme.spacing.xl,
    opacity: 0, // Initial opacity for animation
    transform: [{ translateY: 20 }], // Initial position for animation
  },
  moodFactorRow: {
    marginBottom: theme.spacing.md,
  },
  moodFactor: {
    alignItems: 'center',
  },
  moodFactorLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  moodFactorBarContainer: {
    width: '100%',
    height: 16,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: theme.spacing.xs,
  },
  moodFactorBar: {
    height: '100%',
    width: '0%', // Initial width for animation
  },
  moodFactorValue: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.light,
    flex: 1,
    marginHorizontal: theme.spacing.sm,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
}); 