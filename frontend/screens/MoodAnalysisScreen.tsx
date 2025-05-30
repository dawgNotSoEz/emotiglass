import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../types';
import { getAllMoodEntries } from '../services/storage';
import { analyzeTrends, TrendAnalysisResult } from '../services/trendAnalysis';
import { MoodTrendCharts } from '../components/ui/MoodTrendCharts';
import { MoodEntry } from '../types';

type MoodAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MoodAnalysis'>;

export const MoodAnalysisScreen: React.FC = () => {
  const navigation = useNavigation<MoodAnalysisScreenNavigationProp>();
  const [trendData, setTrendData] = useState<TrendAnalysisResult | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // Default to 7 days
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);
  
  useEffect(() => {
    loadData();
  }, [timeRange]);
  
  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    setNoDataMessage(null);
    
    try {
      // Load mood entries
      const moodEntries = await getAllMoodEntries();
      setEntries(moodEntries);
      
      if (moodEntries.length === 0) {
        setNoDataMessage('No mood entries found. Start by adding some mood entries to see your trends.');
        setLoading(false);
        return;
      }
      
      // Filter entries by time range
      const now = Date.now();
      const rangeStart = now - (timeRange * 24 * 60 * 60 * 1000);
      const filteredEntries = moodEntries.filter(entry => entry.timestamp >= rangeStart);
      
      if (filteredEntries.length === 0) {
        setNoDataMessage(`No mood entries found within the last ${timeRange} days.`);
        setLoading(false);
        return;
      }
      
      // Analyze trends
      const analysisResult = analyzeTrends(filteredEntries);
      setTrendData(analysisResult);
    } catch (error) {
      console.error('Failed to load mood analysis data:', error);
      setErrorMessage('An error occurred while loading your mood data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const changeTimeRange = (days: number) => {
    setTimeRange(days);
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
        <Text style={styles.headerTitle}>Mood Analysis</Text>
      </View>
      
      <View style={styles.timeRangeSelector}>
        <Text style={styles.timeRangeLabel}>Time range:</Text>
        <View style={styles.timeRangeButtons}>
          {[7, 14, 30, 90].map(days => (
            <TouchableOpacity
              key={days}
              style={[
                styles.timeRangeButton,
                timeRange === days && styles.activeTimeRangeButton
              ]}
              onPress={() => changeTimeRange(days)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  timeRange === days && styles.activeTimeRangeButtonText
                ]}
              >
                {days === 7 ? '1W' : days === 14 ? '2W' : days === 30 ? '1M' : '3M'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing your mood data...</Text>
        </View>
      ) : !trendData || Object.values(trendData.emotionFrequency).every(count => count === 0) ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>
            {noDataMessage || errorMessage}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('EmotionInput')}
          >
            <Text style={styles.createButtonText}>Create New Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <MoodTrendCharts trendData={trendData} days={timeRange} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
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
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeRangeLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    marginRight: spacing.sm,
  },
  timeRangeButtons: {
    flexDirection: 'row',
  },
  timeRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
  },
  activeTimeRangeButton: {
    backgroundColor: colors.primary,
  },
  timeRangeButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  activeTimeRangeButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
}); 