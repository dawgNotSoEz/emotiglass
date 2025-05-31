import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Dummy sound data
const ambientSounds = [
  { 
    name: 'Calm', 
    soundFile: null,  // Removed asset import
    color: theme.colors.primary as string,
    icon: 'cloud' as const
  },
  { 
    name: 'Focus', 
    soundFile: null,  // Removed asset import
    color: theme.colors.secondary as string,
    icon: 'book' as const
  },
  { 
    name: 'Relax', 
    soundFile: null,  // Removed asset import
    color: theme.colors.accent as string,
    icon: 'leaf' as const
  },
  { 
    name: 'Energize', 
    soundFile: null,  // Removed asset import
    color: theme.colors.success as string,
    icon: 'flash' as const
  },
];

const AmbientModeScreen: React.FC = () => {
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showControls, setShowControls] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bubbles = useRef(
    Array.from({ length: 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 20 + Math.random() * 60,
      speed: 0.3 + Math.random() * 0.6,
      opacity: 0.1 + Math.random() * 0.3,
      animation: new Animated.Value(Math.random()),
    }))
  ).current;
  
  // Control visibility timeout
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dummy play sound function
  const playSoundDummy = async (soundName: string) => {
    // Simulate sound playing
    console.log(`Playing ${soundName} ambient sound`);
    setCurrentSound(soundName);
  };

  // Dummy stop sound function
  const stopSoundDummy = async () => {
    console.log('Stopping ambient sound');
    setCurrentSound(null);
  };
  
  // Effect to handle playing the selected theme
  useEffect(() => {
    const loadAndPlaySound = async () => {
      try {
        // Unload any previous sound
        if (sound) {
          await sound.unloadAsync();
        }
        
        // Dummy sound loading
        if (currentSound) {
          console.log(`Simulating sound loading for ${currentSound}`);
          // Use the dummy sound file
          const dummySound = await Audio.Sound.createAsync(
            require('../assets/sounds/calm-ambient.mp3'), 
            { isLooping: true, volume: 0.7 }
          );
          
          setSound(dummySound.sound);
          await dummySound.sound.playAsync();
        }
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };
    
    loadAndPlaySound();
  }, [currentSound]);
  
  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (currentSound) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    
    setCurrentSound(currentSound ? null : 'Calm');
    resetControlsTimeout();
  };
  
  // Reset the timeout for hiding controls
  const resetControlsTimeout = () => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Show controls
    setShowControls(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Set new timeout to hide controls after 5 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });
    }, 5000);
  };
  
  // Show controls when the screen is tapped
  const handleScreenTap = () => {
    resetControlsTimeout();
  };
  
  // Start bubble animations
  useEffect(() => {
    bubbles.forEach((bubble, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.animation, {
            toValue: 1,
            duration: (10000 / bubble.speed),
            useNativeDriver: true,
          }),
          Animated.timing(bubble.animation, {
            toValue: 0,
            duration: (10000 / bubble.speed),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
    
    // Initial timeout to hide controls
    resetControlsTimeout();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Get background color based on current sound
  const getBackgroundColor = () => {
    if (currentSound) {
      const soundData = ambientSounds.find(s => s.name === currentSound);
      return soundData ? soundData.color : '#4568DC';
    }
    return '#4568DC';
  };

  return React.createElement(
    React.Fragment,
    null,
    [
      React.createElement(
        StatusBar,
        { 
          key: 'status-bar',
          translucent: true, 
          backgroundColor: 'transparent', 
          barStyle: 'light-content' 
        }
      ),
      React.createElement(
        View,
        { 
          key: 'container',
          style: [
            styles.container,
            { backgroundColor: getBackgroundColor() }
          ]
        },
        React.createElement(
          TouchableOpacity,
          {
            style: styles.fullScreenTouchable,
            activeOpacity: 1,
            onPress: handleScreenTap
          },
          [
            // Animated bubbles
            ...bubbles.map((bubble, index) => 
              React.createElement(
                Animated.View,
                {
                  key: `bubble-${index}`,
                  style: [
                    styles.bubble,
                    {
                      width: bubble.size,
                      height: bubble.size,
                      borderRadius: bubble.size / 2,
                      left: bubble.x,
                      opacity: bubble.opacity,
                      transform: [
                        {
                          translateY: bubble.animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [bubble.y, bubble.y - 200],
                          }),
                        },
                      ],
                    },
                  ]
                }
              )
            ),
            
            // Controls overlay
            showControls && React.createElement(
              Animated.View,
              {
                key: 'controls',
                style: [
                  styles.controlsContainer,
                  {
                    opacity: fadeAnim,
                  },
                ]
              },
              React.createElement(
                SafeAreaView,
                { style: styles.safeArea },
                [
                  // Header - Theme name
                  React.createElement(
                    View,
                    { key: 'header', style: styles.header },
                    React.createElement(
                      Text,
                      { style: styles.themeName },
                      [
                        React.createElement(
                          Ionicons,
                          { 
                            key: 'header-icon',
                            name: ambientSounds.find(s => s.name === currentSound)?.icon || 'cloud',
                            size: 24 
                          }
                        ),
                        ` ${currentSound ? currentSound : 'Calm'} Mode`
                      ]
                    )
                  ),
                  
                  // Theme selection
                  React.createElement(
                    View,
                    { key: 'themes', style: styles.themesContainer },
                    ambientSounds.map((sound) => 
                      React.createElement(
                        TouchableOpacity,
                        {
                          key: sound.name,
                          style: [
                            styles.themeButton,
                            currentSound === sound.name && styles.selectedThemeButton,
                          ],
                          onPress: () => playSoundDummy(sound.name)
                        },
                        React.createElement(
                          Text,
                          {
                            style: [
                              styles.themeButtonText,
                              currentSound === sound.name && styles.selectedThemeText,
                            ]
                          },
                          sound.name
                        )
                      )
                    )
                  ),
                  
                  // Playback controls
                  React.createElement(
                    View,
                    { key: 'playback', style: styles.playbackControls },
                    React.createElement(
                      TouchableOpacity,
                      {
                        style: styles.playPauseButton,
                        onPress: togglePlayPause
                      },
                      React.createElement(
                        Ionicons,
                        {
                          name: currentSound ? 'pause' : 'play',
                          size: 36,
                          color: '#fff'
                        }
                      )
                    )
                  ),
                  
                  // Message
                  React.createElement(
                    Text,
                    { key: 'message', style: styles.messageText },
                    `Tap anywhere to ${showControls ? 'hide' : 'show'} controls`
                  )
                ]
              )
            )
          ]
        )
      )
    ]
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  themeName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700' as const,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  themesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: theme.spacing.lg,
  },
  themeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.sm,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedThemeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: '#fff',
  },
  themeButtonText: {
    color: '#ffffff80',
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
  },
  selectedThemeText: {
    color: '#fff',
    fontWeight: '500' as const,
  },
  playbackControls: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  messageText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});

export default AmbientModeScreen; 