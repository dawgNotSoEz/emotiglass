import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { EmotionInputScreen } from '../screens/EmotionInputScreen';
import { MoodVisualizationScreen } from '../screens/MoodVisualizationScreen';
import { MoodDiaryScreen } from '../screens/MoodDiaryScreen';
import { MoodAnalysisScreen } from '../screens/MoodAnalysisScreen';
import { EmotionData } from '../types';

export type RootStackParamList = {
  Home: undefined;
  EmotionInput: undefined;
  MoodVisualization: { emotionData: EmotionData };
  MoodDiary: undefined;
  MoodAnalysis: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmotionInput" component={EmotionInputScreen} />
        <Stack.Screen name="MoodVisualization" component={MoodVisualizationScreen} />
        <Stack.Screen name="MoodDiary" component={MoodDiaryScreen} />
        <Stack.Screen name="MoodAnalysis" component={MoodAnalysisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 