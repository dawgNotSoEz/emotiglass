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
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getAllMoodEntries, MoodEntry, deleteMoodEntry } from '../services/storage';

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
    const date = new Date(item.createdAt);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Get a color based on the dominant emotion
    const emotionColor = getEmotionColor(item.analysis.dominantEmotion);
    
    return (
      <View style={styles.entryCard}>
        <View style={[styles.emotionIndicator, { backgroundColor: emotionColor }]} />
        <View style={styles.entryContent}>
          <Text style={styles.emotionText}>{item.analysis.dominantEmotion.toUpperCase()}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
          
          <View style={styles.entryStats}>
            <Text style={styles.statText}>Energy: {Math.round(item.emotionData.energy)}%</Text>
            <Text style={styles.statText}>Calmness: {Math.round(item.emotionData.calmness)}%</Text>
            <Text style={styles.statText}>Tension: {Math.round(item.emotionData.tension)}%</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEntry(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Diary</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal-outline" size={64} color={colors.textLight} />
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
    joy: '#FFD700',
    sadness: '#4169E1',
    anger: '#B22222',
    fear: '#556B2F',
    surprise: '#9932CC',
    disgust: '#228B22',
    contentment: '#4682B4',
    neutral: '#A9A9A9',
  };
  
  return emotionColors[emotion] || colors.primary;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  emotionIndicator: {
    width: 8,
    height: '100%',
  },
  entryContent: {
    flex: 1,
    padding: spacing.md,
  },
  emotionText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  entryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textLight,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
}); 