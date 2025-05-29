import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { EmotionAnalysisResult } from './emotionAnalysis';

// Sound theme types
export type SoundTheme = 'nature' | 'urban' | 'ambient' | 'meditation';

// Sound layers for complex audio
interface SoundLayer {
  name: string;
  uri: string;
  volume: number;
  loop: boolean;
  sound?: Audio.Sound;
  isPlaying: boolean;
}

// Sound configuration for different emotions
interface EmotionSoundConfig {
  baseSounds: Record<SoundTheme, string[]>;
  layerVolumes: Record<string, number>;
  tempo: number;
}

// Sound mapping for different emotions
const emotionSoundConfigs: Record<string, EmotionSoundConfig> = {
  joy: {
    baseSounds: {
      nature: ['birds_chirping.mp3', 'stream_flowing.mp3'],
      urban: ['cafe_ambience.mp3', 'children_playing.mp3'],
      ambient: ['light_synth.mp3', 'warm_pad.mp3'],
      meditation: ['singing_bowls.mp3', 'gentle_chimes.mp3'],
    },
    layerVolumes: {
      background: 0.6,
      mid: 0.8,
      foreground: 1.0,
    },
    tempo: 1.0,
  },
  contentment: {
    baseSounds: {
      nature: ['gentle_waves.mp3', 'light_rain.mp3'],
      urban: ['distant_traffic.mp3', 'park_ambience.mp3'],
      ambient: ['soft_drone.mp3', 'warm_pad.mp3'],
      meditation: ['low_singing_bowl.mp3', 'gentle_bells.mp3'],
    },
    layerVolumes: {
      background: 0.7,
      mid: 0.6,
      foreground: 0.5,
    },
    tempo: 0.8,
  },
  sadness: {
    baseSounds: {
      nature: ['rain_on_window.mp3', 'distant_thunder.mp3'],
      urban: ['empty_room.mp3', 'night_city.mp3'],
      ambient: ['low_drone.mp3', 'dark_pad.mp3'],
      meditation: ['deep_bowl.mp3', 'slow_gong.mp3'],
    },
    layerVolumes: {
      background: 0.8,
      mid: 0.6,
      foreground: 0.4,
    },
    tempo: 0.6,
  },
  anger: {
    baseSounds: {
      nature: ['thunder_storm.mp3', 'strong_wind.mp3'],
      urban: ['construction.mp3', 'subway_train.mp3'],
      ambient: ['distorted_synth.mp3', 'tense_drone.mp3'],
      meditation: ['deep_gong.mp3', 'resonant_metal.mp3'],
    },
    layerVolumes: {
      background: 0.5,
      mid: 0.9,
      foreground: 1.0,
    },
    tempo: 1.2,
  },
  fear: {
    baseSounds: {
      nature: ['howling_wind.mp3', 'distant_wolves.mp3'],
      urban: ['alley_ambience.mp3', 'distant_siren.mp3'],
      ambient: ['dark_texture.mp3', 'eerie_pad.mp3'],
      meditation: ['dissonant_bowl.mp3', 'minor_bells.mp3'],
    },
    layerVolumes: {
      background: 0.7,
      mid: 0.8,
      foreground: 0.6,
    },
    tempo: 0.9,
  },
};

// Current active sound layers
let activeSoundLayers: SoundLayer[] = [];
let currentTheme: SoundTheme = 'ambient';

// Initialize audio system
export const initAudio = async (): Promise<boolean> => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
};

// Get sound file path
const getSoundFilePath = (filename: string): string => {
  // In a real app, you would have actual sound files
  // For now, we'll return a mock path
  return `${FileSystem.documentDirectory}sounds/${filename}`;
};

// Create layered sound based on emotion analysis
export const createEmotionSound = async (
  analysis: EmotionAnalysisResult,
  theme: SoundTheme = 'ambient',
  volume: number = 0.8
): Promise<boolean> => {
  try {
    // Stop any currently playing sounds
    await stopAllSounds();
    
    // Reset active layers
    activeSoundLayers = [];
    currentTheme = theme;
    
    // Get the sound configuration for the dominant emotion
    const emotion = analysis.dominantEmotion;
    const soundConfig = emotionSoundConfigs[emotion] || emotionSoundConfigs.contentment;
    
    // Get base sounds for the selected theme
    const baseSounds = soundConfig.baseSounds[theme] || soundConfig.baseSounds.ambient;
    
    // Create layers
    if (baseSounds.length > 0) {
      // Background layer
      const backgroundLayer: SoundLayer = {
        name: 'background',
        uri: getSoundFilePath(baseSounds[0]),
        volume: soundConfig.layerVolumes.background * volume,
        loop: true,
        isPlaying: false,
      };
      
      // Create and load the sound
      backgroundLayer.sound = new Audio.Sound();
      await backgroundLayer.sound.loadAsync({ uri: backgroundLayer.uri });
      
      // Add to active layers
      activeSoundLayers.push(backgroundLayer);
      
      // If we have a second sound, add it as a mid layer
      if (baseSounds.length > 1) {
        const midLayer: SoundLayer = {
          name: 'mid',
          uri: getSoundFilePath(baseSounds[1]),
          volume: soundConfig.layerVolumes.mid * volume,
          loop: true,
          isPlaying: false,
        };
        
        // Create and load the sound
        midLayer.sound = new Audio.Sound();
        await midLayer.sound.loadAsync({ uri: midLayer.uri });
        
        // Add to active layers
        activeSoundLayers.push(midLayer);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to create emotion sound:', error);
    return false;
  }
};

// Play all active sound layers
export const playEmotionSound = async (): Promise<boolean> => {
  try {
    for (const layer of activeSoundLayers) {
      if (layer.sound && !layer.isPlaying) {
        await layer.sound.setVolumeAsync(layer.volume);
        await layer.sound.setIsLoopingAsync(layer.loop);
        await layer.sound.playAsync();
        layer.isPlaying = true;
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to play emotion sound:', error);
    return false;
  }
};

// Stop all sound layers
export const stopAllSounds = async (): Promise<boolean> => {
  try {
    for (const layer of activeSoundLayers) {
      if (layer.sound && layer.isPlaying) {
        await layer.sound.stopAsync();
        await layer.sound.unloadAsync();
        layer.isPlaying = false;
      }
    }
    activeSoundLayers = [];
    return true;
  } catch (error) {
    console.error('Failed to stop sounds:', error);
    return false;
  }
};

// Change the volume of all active sound layers
export const changeVolume = async (volume: number): Promise<boolean> => {
  try {
    for (const layer of activeSoundLayers) {
      if (layer.sound && layer.isPlaying) {
        const configuredVolume = volume * (
          layer.name === 'background' ? 0.7 :
          layer.name === 'mid' ? 0.8 : 1.0
        );
        await layer.sound.setVolumeAsync(configuredVolume);
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to change volume:', error);
    return false;
  }
};

// Change the current sound theme
export const changeSoundTheme = async (
  theme: SoundTheme,
  analysis: EmotionAnalysisResult,
  volume: number = 0.8
): Promise<boolean> => {
  if (theme === currentTheme) return true;
  
  try {
    // Create new sounds with the selected theme
    return await createEmotionSound(analysis, theme, volume);
  } catch (error) {
    console.error('Failed to change sound theme:', error);
    return false;
  }
}; 