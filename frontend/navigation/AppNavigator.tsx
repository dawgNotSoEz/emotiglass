import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MoodDiaryScreen from '../screens/MoodDiaryScreen';
import EmotionCaptureScreen from '../screens/EmotionCaptureScreen';
import EntryDetailsScreen from '../screens/EntryDetailsScreen';
import AmbientModeScreen from '../screens/AmbientModeScreen';
import theme from '../constants/theme';

// Define the param lists for our navigators
export type RootStackParamList = {
  Main: undefined;
  EntryDetails: { entryId: string };
  AmbientMode: undefined;
  EmotionCapture: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MoodDiary: undefined;
  Settings: undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MoodDiary') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.cardBackground,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.cardBackground,
        },
        headerTintColor: theme.colors.text,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'EmotiGlass' }}
      />
      <Tab.Screen 
        name="MoodDiary" 
        component={MoodDiaryScreen} 
        options={{ title: 'Mood Diary' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.cardBackground,
          },
          headerTintColor: theme.colors.text,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EntryDetails" 
          component={EntryDetailsScreen} 
          options={{ title: 'Mood Entry Details' }}
        />
        <Stack.Screen 
          name="AmbientMode" 
          component={AmbientModeScreen} 
          options={{ 
            title: 'Ambient Mode',
            headerTransparent: true,
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="EmotionCapture" 
          component={EmotionCaptureScreen} 
          options={{ 
            title: 'Capture Emotions',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 