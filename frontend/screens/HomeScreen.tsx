import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import theme from '../constants/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Navigation handlers
  const goToEmotionCapture = () => {
    navigation.navigate('EmotionCapture');
  };

  const goToMoodDiary = () => {
    navigation.navigate('Main', { screen: 'MoodDiary' });
  };

  const goToAmbientMode = () => {
    navigation.navigate('AmbientMode');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.title}>EmotiGlass</Text>
          <Text style={styles.subtitle}>Track, understand, and improve your emotional well-being</Text>
        </View>

        {/* Logo/Image section */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>EmotiGlass</Text>
        </View>

        {/* Main action buttons */}
        <View style={styles.actionContainer}>
          <Text style={styles.sectionTitle}>Capture Your Emotions</Text>
          
          {/* Emotion Capture button - NEW */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={goToEmotionCapture}
          >
            <View style={styles.actionContent}>
              <Ionicons name="camera" size={28} color="#fff" />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Real-Time Emotion Capture</Text>
                <Text style={styles.actionDescription}>
                  Use your camera and microphone to detect emotions
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Mood Diary button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToMoodDiary}
          >
            <View style={styles.actionContent}>
              <Ionicons name="journal" size={28} color={theme.colors.primary} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Mood Diary</Text>
                <Text style={styles.actionDescription}>
                  View your emotion history and insights
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {/* Ambient Mode button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToAmbientMode}
          >
            <View style={styles.actionContent}>
              <Ionicons name="color-palette" size={28} color={theme.colors.primary} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Ambient Mode</Text>
                <Text style={styles.actionDescription}>
                  Relaxing visual and audio experience
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Tips section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Emotional Wellness Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={theme.colors.primary} />
            <Text style={styles.tipText}>
              Regular emotional check-ins can help improve self-awareness and mental wellbeing.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
            <Text style={styles.tipText}>
              Practice mindfulness when recording your emotions for more accurate insights.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: theme.colors.primary,
  },
  logoText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as '700',
    color: theme.colors.text,
  },
  actionContainer: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  tipsContainer: {
    padding: theme.spacing.md,
  },
  tipCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.shadows.light,
  },
  tipText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});

export default HomeScreen; 