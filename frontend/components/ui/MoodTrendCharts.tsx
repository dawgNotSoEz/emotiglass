import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph } from 'react-native-chart-kit';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
  
  // Chart types
  const chartTypes = ['line', 'pie', 'bar', 'radar', 'heatmap'] as const;
  type ChartType = typeof chartTypes[number];
  
  // Active chart state
  const [activeChart, setActiveChart] = useState<ChartType>('line');
  
  // Animation values for chart switching
  const chartOpacity = useSharedValue(1);
  const chartTranslateY = useSharedValue(0);
  
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
  
  // Prepare radar chart data for emotion parameters
  const prepareRadarData = () => {
    // For ProgressChart, data needs to be between 0-1
    const data = {
      data: [
        trendData.trends.energy.data.length > 0 
          ? trendData.trends.energy.data[trendData.trends.energy.data.length - 1] / 100 
          : 0,
        trendData.trends.calmness.data.length > 0 
          ? trendData.trends.calmness.data[trendData.trends.calmness.data.length - 1] / 100 
          : 0,
        trendData.trends.tension.data.length > 0 
          ? trendData.trends.tension.data[trendData.trends.tension.data.length - 1] / 100 
          : 0,
        // Get the latest values for the basic emotions (normalized to 0-1)
        Object.entries(trendData.emotionFrequency).find(([emotion]) => emotion === 'joy')?.[1] || 0,
        Object.entries(trendData.emotionFrequency).find(([emotion]) => emotion === 'sadness')?.[1] || 0,
        Object.entries(trendData.emotionFrequency).find(([emotion]) => emotion === 'anger')?.[1] || 0,
      ]
    };
    
    return data;
  };
  
  // Prepare mood heatmap data
  const prepareMoodHeatmapData = () => {
    // Mock contribution data (in a real app, this would be generated from actual mood entries)
    const mockData = [];
    const today = new Date();
    
    // Generate mock data for the last 3 months
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format date as YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate count based on day of week (higher on weekends)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const count = isWeekend ? 
        Math.floor(Math.random() * 5) + 1 : 
        Math.floor(Math.random() * 3);
      
      if (count > 0) {
        mockData.push({
          date: dateStr,
          count,
        });
      }
    }
    
    return mockData;
  };
  
  // Change chart type with animation
  const changeChartType = (type: ChartType) => {
    // Animate out
    chartOpacity.value = withTiming(0, { 
      duration: 300,
      easing: Easing.out(Easing.ease)
    });
    
    chartTranslateY.value = withTiming(50, { 
      duration: 300,
      easing: Easing.out(Easing.ease)
    }, () => {
      // Change chart type
      setActiveChart(type);
      
      // Animate in
      chartOpacity.value = withTiming(1, { 
        duration: 300,
        easing: Easing.in(Easing.ease)
      });
      
      chartTranslateY.value = withTiming(0, { 
        duration: 300,
        easing: Easing.in(Easing.ease)
      });
    });
  };
  
  // Animated chart container style
  const animatedChartStyle = useAnimatedStyle(() => {
    return {
      opacity: chartOpacity.value,
      transform: [
        { translateY: chartTranslateY.value }
      ]
    };
  });
  
  // Render current chart based on active type
  const renderCurrentChart = () => {
    switch (activeChart) {
      case 'line':
        return (
          <>
            <Text style={styles.chartTitle}>Emotion Parameters Over Time</Text>
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
          </>
        );
        
      case 'pie':
        return (
          <>
            <Text style={styles.chartTitle}>Emotion Distribution</Text>
            <PieChart
              data={prepareEmotionData()}
              width={chartWidth}
              height={220}
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
          </>
        );
        
      case 'bar':
        return (
          <>
            <Text style={styles.chartTitle}>Time of Day Distribution</Text>
            <BarChart
              data={prepareTimeOfDayData()}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
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
          </>
        );
        
      case 'radar':
        return (
          <>
            <Text style={styles.chartTitle}>Current Emotional Profile</Text>
            <ProgressChart
              data={prepareRadarData()}
              width={chartWidth}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
              strokeWidth={5}
              radius={32}
              hideLegend={false}
            />
          </>
        );
        
      case 'heatmap':
        return (
          <>
            <Text style={styles.chartTitle}>Mood Activity Calendar</Text>
            <ContributionGraph
              values={prepareMoodHeatmapData()}
              endDate={new Date()}
              numDays={90}
              width={chartWidth}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
              tooltipDataAttrs={(value) => ({
                fill: 'rgba(0, 0, 0, 0.7)',
                fontSize: 10,
                fontWeight: 'bold',
                // Add other valid SVG rect attributes as needed
              })}
            />
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Mood Trends</Text>
      
      {/* Chart type selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartTypesContainer}
      >
        {chartTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chartTypeButton,
              activeChart === type && styles.activeChartTypeButton
            ]}
            onPress={() => changeChartType(type)}
          >
            <Ionicons
              name={
                type === 'line' ? 'analytics' :
                type === 'pie' ? 'pie-chart' :
                type === 'bar' ? 'stats-chart' :
                type === 'radar' ? 'radio' :
                'calendar'
              }
              size={20}
              color={activeChart === type ? '#fff' : colors.text}
            />
            <Text
              style={[
                styles.chartTypeText,
                activeChart === type && styles.activeChartTypeText
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Current chart */}
      <Animated.View style={[styles.chartContainer, animatedChartStyle]}>
        {renderCurrentChart()}
      </Animated.View>
      
      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Insights</Text>
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
            <Ionicons 
              name={
                insight.type === 'positive' ? 'trending-up' :
                insight.type === 'negative' ? 'trending-down' : 'information-circle'
              }
              size={20}
              color={
                insight.type === 'positive' ? '#2ecc71' :
                insight.type === 'negative' ? '#e74c3c' : '#3498db'
              }
              style={styles.insightIcon}
            />
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
  chartTypesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChartTypeButton: {
    backgroundColor: colors.primary,
  },
  chartTypeText: {
    color: colors.text,
    fontSize: typography.fontSizes.sm,
    marginLeft: spacing.xs,
  },
  activeChartTypeText: {
    color: '#fff',
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
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 8,
  },
  insightsContainer: {
    marginBottom: spacing.xl,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  insightIcon: {
    marginRight: spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
}); 