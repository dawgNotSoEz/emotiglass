import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { colors, spacing, typography } from '../constants/theme';

export const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmotiGlass</Text>
      <Text style={styles.subtitle}>Emotional Reflection App</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Get Started" 
          onPress={() => console.log('Get Started pressed')} 
          style={styles.button}
        />
        <Button 
          title="Learn More" 
          variant="outline" 
          onPress={() => console.log('Learn More pressed')} 
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