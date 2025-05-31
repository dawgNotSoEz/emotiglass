import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import { getAllMoodEntries, deleteMoodEntry } from '../services/storage';
import { MoodEntry, RootStackParamList } from '../types';
import { DrawingThumbnail } from '../components/ui/DrawingThumbnail';
import { Card } from '../components/ui/Card';

type MoodDiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MoodDiary'>;

export const MoodDiaryScreen: React.FC = () => {
  const navigation = useNavigation<MoodDiaryScreenNavigationProp>();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const moodEntries = await getAllMoodEntries();
      // Sort by date, newest first
      moodEntries.sort((a, b) => b.createdAt - a.createdAt);
      setEntries(moodEntries);
    } catch (error) {
      console.error('Failed to load mood entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteMoodEntry(id);
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const renderItem = ({ item }: { item: MoodEntry }) => {
    const date = new Date(item.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Get a color based on the dominant emotion
    const emotionColor = getEmotionColor(item.dominantEmotion);
    
    return (
      <Card style={styles.entryCard} elevation="medium" padding="none" borderRadius="medium">
        <View style={[styles.emotionIndicator, { backgroundColor: emotionColor }]} />
        <View style={styles.entryContent}>
          <Text style={styles.emotionText}>{item.dominantEmotion.toUpperCase()}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
          
          <View style={styles.entryDetails}>
            <View style={styles.entryStats}>
              <Text style={styles.statText}>Energy: {Math.round(item.emotions.energy)}%</Text>
              <Text style={styles.statText}>Calmness: {Math.round(item.emotions.calmness)}%</Text>
              <Text style={styles.statText}>Tension: {Math.round(item.emotions.tension)}%</Text>
            </View>
            
            {/* Show drawing thumbnail if drawing data is available */}
            {item.source === 'drawing' && item.drawingData && (
              <View style={styles.drawingContainer}>
                <DrawingThumbnail 
                  drawingData={item.drawingData} 
                  width={80} 
                  height={80} 
                />
              </View>
            )}
          </View>
          
          {/* Source indicator */}
          <View style={styles.sourceContainer}>
            <Ionicons 
              name={getSourceIcon(item.source)} 
              size={16} 
              color={theme.colors.textLight} 
            />
            <Text style={styles.sourceText}>{item.source}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEntry(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Diary</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No mood entries yet</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('EmotionInput')}
          >
            <Text style={styles.createButtonText}>Create New Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

// Helper function to get a color for each emotion
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

// Helper function to get icon for entry source
const getSourceIcon = (source: string): string => {
  const sourceIcons: Record<string, string> = {
    sliders: 'options',
    drawing: 'brush',
    voice: 'mic',
    face: 'camera',
  };
  
  return sourceIcons[source] || 'help-circle';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  entryCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  emotionIndicator: {
    width: 8,
    height: '100%',
  },
  entryContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  emotionText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  entryStats: {
    flex: 1,
  },
  statText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  drawingContainer: {
    marginLeft: theme.spacing.sm,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  sourceText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    ...theme.shadows.medium,
  },
  createButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
}); 