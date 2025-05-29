import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors, spacing, typography } from '../../constants/theme';
import { TrendAnalysisResult, MoodTrend } from '../../services/trendAnalysis';

interface MoodTrendChartsProps {
  trendData: TrendAnalysisResult;
  days: number;
}

export const MoodTrendCharts: React.FC<MoodTrendChartsProps> = ({ 
  trendData, 
  days 
}) => {
  const { width } = Dimensions.get('window');
  const chartWidth = width - spacing.lg * 2;
  
  // Generate labels for the line chart (last N days)
  const generateDateLabels = () => {
    const labels = [];
    const today = new Date();
    
    // If we have fewer entries than days, adjust the number of labels
    const numLabels = Math.min(days, trendData.trends.energy.data.length);
    
    for (let i = 0; i < numLabels; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (numLabels - 1 - i));
      labels.push(date.getDate().toString());
    }
    
    return labels;
  };
  
  // Prepare emotion frequency data for pie chart
  const prepareEmotionData = () => {
    const emotionColors = {
      joy: '#FFD700',
      contentment: '#4682B4',
      anger: '#B22222',
      sadness: '#4169E1',
      fear: '#556B2F',
      surprise: '#9932CC',
      disgust: '#228B22',
      neutral: '#A9A9A9',
    };
    
    return Object.entries(trendData.emotionFrequency).map(([name, count]) => ({
      name,
      count,
      color: emotionColors[name as keyof typeof emotionColors] || '#A9A9A9',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };
  
  // Prepare time of day data for bar chart
  const prepareTimeOfDayData = () => {
    return {
      labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
      datasets: [
        {
          data: [
            trendData.timeOfDay.morning,
            trendData.timeOfDay.afternoon,
            trendData.timeOfDay.evening,
            trendData.timeOfDay.night,
          ],
        },
      ],
    };
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Mood Trends</Text>
      
      {/* Line chart for energy, calmness, tension */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Emotion Parameters</Text>
        <LineChart
          data={{
            labels: generateDateLabels(),
            datasets: [
              {
                data: trendData.trends.energy.data.length > 0 
                  ? trendData.trends.energy.data 
                  : [0],
                color: () => trendData.trends.energy.color,
                strokeWidth: 2,
              },
              {
                data: trendData.trends.calmness.data.length > 0 
                  ? trendData.trends.calmness.data 
                  : [0],
                color: () => trendData.trends.calmness.color,
                strokeWidth: 2,
              },
              {
                data: trendData.trends.tension.data.length > 0 
                  ? trendData.trends.tension.data 
                  : [0],
                color: () => trendData.trends.tension.color,
                strokeWidth: 2,
              },
            ],
            legend: ['Energy', 'Calmness', 'Tension'],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '1',
              stroke: '#fafafa',
            },
          }}
          style={styles.chart}
          bezier
        />
      </View>
      
      {/* Pie chart for emotion frequency */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Emotion Distribution</Text>
        <PieChart
          data={prepareEmotionData()}
          width={chartWidth}
          height={200}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      
      {/* Bar chart for time of day */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Time of Day</Text>
        <BarChart
          data={prepareTimeOfDayData()}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>
      
      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.chartTitle}>Insights</Text>
        {trendData.insights.map((insight, index) => (
          <View 
            key={index} 
            style={[
              styles.insightItem, 
              { 
                backgroundColor: insight.type === 'positive' 
                  ? 'rgba(46, 204, 113, 0.1)' 
                  : insight.type === 'negative' 
                    ? 'rgba(231, 76, 60, 0.1)' 
                    : 'rgba(52, 152, 219, 0.1)' 
              }
            ]}
          >
            <Text style={styles.insightText}>{insight.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: spacing.xl,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 8,
  },
  insightsContainer: {
    marginBottom: spacing.xl,
  },
  insightItem: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  insightText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
}); 