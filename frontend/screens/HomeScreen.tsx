import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { colors, spacing, typography } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmotiGlass</Text>
      <Text style={styles.subtitle}>Emotional Reflection App</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Get Started" 
          onPress={() => navigation.navigate('EmotionInput')} 
          style={styles.button}
        />
        <Button 
          title="View Mood Diary" 
          variant="outline" 
          onPress={() => navigation.navigate('MoodDiary')} 
          style={styles.button}
        />
        <Button 
          title="Mood Analysis" 
          variant="outline" 
          onPress={() => navigation.navigate('MoodAnalysis')} 
          style={styles.button}
        />
        <Button 
          title="Ambient Mode" 
          variant="outline"
          color="secondary"
          onPress={() => navigation.navigate('AmbientMode')} 
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.textLight,
    marginBottom: spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: spacing.md,
  },
}); 