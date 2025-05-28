import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';

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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 16,
  },
}); 