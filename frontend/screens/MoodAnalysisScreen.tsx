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
import { RootStackParamList } from '../navigation/AppNavigator';
import { getAllMoodEntries } from '../services/storage';
import { analyzeTrends, TrendAnalysisResult } from '../services/trendAnalysis';
import { MoodTrendCharts } from '../components/ui/MoodTrendCharts';

type MoodAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MoodAnalysis'>;

export const MoodAnalysisScreen: React.FC = () => {
  const navigation = useNavigation<MoodAnalysisScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendAnalysisResult | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7); // 7 days, 30 days, or 90 days
  const [entries, setEntries] = useState([]);
  const [noDataMessage, setNoDataMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    loadData();
  }, [timeRange]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const entries = await getAllMoodEntries();
      
      if (entries.length > 0) {
        setEntries(entries);
        const analysis = analyzeTrends(entries);
        setTrendData(analysis);
      } else {
        setNoDataMessage('No mood entries found. Start recording your emotions to see trends.');
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
      setErrorMessage('Failed to load mood data. Please try again later.');
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 7 ? styles.timeRangeButtonActive : null,
          ]}
          onPress={() => setTimeRange(7)}
        >
          <Text 
            style={[
              styles.timeRangeText,
              timeRange === 7 ? styles.timeRangeTextActive : null,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 30 ? styles.timeRangeButtonActive : null,
          ]}
          onPress={() => setTimeRange(30)}
        >
          <Text 
            style={[
              styles.timeRangeText,
              timeRange === 30 ? styles.timeRangeTextActive : null,
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 90 ? styles.timeRangeButtonActive : null,
          ]}
          onPress={() => setTimeRange(90)}
        >
          <Text 
            style={[
              styles.timeRangeText,
              timeRange === 90 ? styles.timeRangeTextActive : null,
            ]}
          >
            3 Months
          </Text>
        </TouchableOpacity>
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
    padding: spacing.md,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeRangeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: 20,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  timeRangeTextActive: {
    color: '#fff',
    fontWeight: typography.fontWeights.medium,
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
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.textLight,
    textAlign: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
}); 