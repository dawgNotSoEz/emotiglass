import { MoodEntry, EmotionData } from '../types';

/**
 * Result of trend analysis containing data for visualization
 */
export interface TrendAnalysisResult {
  // Data for emotion frequency pie chart
  emotionFrequency: Record<string, number>;
  
  // Data for emotion changes over time (line chart)
  emotionTimeline: {
    dates: string[];
    emotions: Record<string, number[]>;
  };
  
  // Data for input method usage (pie chart)
  inputMethodUsage: Record<string, number>;
  
  // Data for energy/calmness/tension timeline (line chart)
  moodFactorsTimeline: {
    dates: string[];
    energy: number[];
    calmness: number[];
    tension: number[];
  };
  
  // Overall stats
  stats: {
    dominantEmotion: string;
    averageEnergy: number;
    averageCalmness: number;
    averageTension: number;
    entriesCount: number;
  };
  
  // Weekly summary
  weeklySummary: {
    thisWeek: {
      dominantEmotion: string;
      entriesCount: number;
      averageEnergy: number;
    };
    previousWeek: {
      dominantEmotion: string;
      entriesCount: number;
      averageEnergy: number;
    };
    changePercentage: number;
  };
}

/**
 * Analyze mood entries for trends and generate visualization data
 * @param entries Array of mood entries
 * @returns Analysis result with visualization-ready data
 */
export const analyzeTrends = (entries: MoodEntry[]): TrendAnalysisResult => {
  // Sort entries by timestamp (oldest first for timeline data)
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  
  // Initialize result
  const result: TrendAnalysisResult = {
    emotionFrequency: {},
    emotionTimeline: {
      dates: [],
      emotions: {},
    },
    inputMethodUsage: {
      sliders: 0,
      drawing: 0,
      voice: 0,
      face: 0,
    },
    moodFactorsTimeline: {
      dates: [],
      energy: [],
      calmness: [],
      tension: [],
    },
    stats: {
      dominantEmotion: 'neutral',
      averageEnergy: 0,
      averageCalmness: 0,
      averageTension: 0,
      entriesCount: entries.length,
    },
    weeklySummary: {
      thisWeek: {
        dominantEmotion: 'neutral',
        entriesCount: 0,
        averageEnergy: 0,
      },
      previousWeek: {
        dominantEmotion: 'neutral',
        entriesCount: 0,
        averageEnergy: 0,
      },
      changePercentage: 0,
    },
  };
  
  // Initialize emotion types for tracking
  const emotionTypes = [
    'joy', 'sadness', 'anger', 'fear', 
    'surprise', 'disgust', 'contentment', 'neutral'
  ];
  
  // Initialize emotion frequency
  emotionTypes.forEach(emotion => {
    result.emotionFrequency[emotion] = 0;
    result.emotionTimeline.emotions[emotion] = [];
  });
  
  // Process entries for analysis
  let totalEnergy = 0;
  let totalCalmness = 0;
  let totalTension = 0;
  
  // Create map of dates for timeline data
  const dateMap = new Map<string, {
    date: string;
    emotions: Record<string, number>;
    energy: number;
    calmness: number;
    tension: number;
    count: number;
  }>();
  
  // Process each entry
  sortedEntries.forEach(entry => {
    // Count dominant emotions for frequency
    result.emotionFrequency[entry.dominantEmotion] = 
      (result.emotionFrequency[entry.dominantEmotion] || 0) + 1;
    
    // Count input methods
    result.inputMethodUsage[entry.source] = 
      (result.inputMethodUsage[entry.source] || 0) + 1;
    
    // Track mood factors for averages
    totalEnergy += entry.emotions.energy;
    totalCalmness += entry.emotions.calmness;
    totalTension += entry.emotions.tension;
    
    // Group by date for timeline data
    const date = new Date(entry.timestamp);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dateMap.has(dateString)) {
      const dateData = {
        date: dateString,
        emotions: {} as Record<string, number>,
        energy: 0,
        calmness: 0,
        tension: 0,
        count: 0,
      };
      
      // Initialize emotions count for this date
      emotionTypes.forEach(emotion => {
        dateData.emotions[emotion] = 0;
      });
      
      dateMap.set(dateString, dateData);
    }
    
    // Update date data
    const dateData = dateMap.get(dateString)!;
    dateData.emotions[entry.dominantEmotion] += 1;
    dateData.energy += entry.emotions.energy;
    dateData.calmness += entry.emotions.calmness;
    dateData.tension += entry.emotions.tension;
    dateData.count += 1;
  });
  
  // Calculate averages for the stats
  if (entries.length > 0) {
    result.stats.averageEnergy = totalEnergy / entries.length;
    result.stats.averageCalmness = totalCalmness / entries.length;
    result.stats.averageTension = totalTension / entries.length;
    
    // Find dominant emotion overall
    let maxCount = 0;
    Object.entries(result.emotionFrequency).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        result.stats.dominantEmotion = emotion;
      }
    });
  }
  
  // Convert date map to timeline data
  const sortedDates = Array.from(dateMap.keys()).sort();
  result.emotionTimeline.dates = sortedDates;
  
  // Calculate emotion percentages for each date
  sortedDates.forEach(dateString => {
    const dateData = dateMap.get(dateString)!;
    
    // Average mood factors for this date
    result.moodFactorsTimeline.dates.push(dateString);
    result.moodFactorsTimeline.energy.push(dateData.energy / dateData.count);
    result.moodFactorsTimeline.calmness.push(dateData.calmness / dateData.count);
    result.moodFactorsTimeline.tension.push(dateData.tension / dateData.count);
    
    // Emotion values for each date (as percentages)
    emotionTypes.forEach(emotion => {
      const percentage = (dateData.emotions[emotion] / dateData.count) * 100;
      result.emotionTimeline.emotions[emotion].push(percentage);
    });
  });
  
  // Calculate weekly summary
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
  
  const thisWeekEntries = entries.filter(entry => entry.timestamp >= oneWeekAgo);
  const prevWeekEntries = entries.filter(entry => 
    entry.timestamp >= twoWeeksAgo && entry.timestamp < oneWeekAgo
  );
  
  // This week stats
  if (thisWeekEntries.length > 0) {
    const thisWeekEmotions: Record<string, number> = {};
    let thisWeekEnergy = 0;
    
    thisWeekEntries.forEach(entry => {
      thisWeekEmotions[entry.dominantEmotion] = (thisWeekEmotions[entry.dominantEmotion] || 0) + 1;
      thisWeekEnergy += entry.emotions.energy;
    });
    
    let maxCount = 0;
    Object.entries(thisWeekEmotions).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        result.weeklySummary.thisWeek.dominantEmotion = emotion;
      }
    });
    
    result.weeklySummary.thisWeek.entriesCount = thisWeekEntries.length;
    result.weeklySummary.thisWeek.averageEnergy = thisWeekEnergy / thisWeekEntries.length;
  }
  
  // Previous week stats
  if (prevWeekEntries.length > 0) {
    const prevWeekEmotions: Record<string, number> = {};
    let prevWeekEnergy = 0;
    
    prevWeekEntries.forEach(entry => {
      prevWeekEmotions[entry.dominantEmotion] = (prevWeekEmotions[entry.dominantEmotion] || 0) + 1;
      prevWeekEnergy += entry.emotions.energy;
    });
    
    let maxCount = 0;
    Object.entries(prevWeekEmotions).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        result.weeklySummary.previousWeek.dominantEmotion = emotion;
      }
    });
    
    result.weeklySummary.previousWeek.entriesCount = prevWeekEntries.length;
    result.weeklySummary.previousWeek.averageEnergy = prevWeekEnergy / prevWeekEntries.length;
  }
  
  // Calculate change percentage in energy level
  if (result.weeklySummary.previousWeek.averageEnergy > 0 && result.weeklySummary.thisWeek.averageEnergy > 0) {
    const change = ((result.weeklySummary.thisWeek.averageEnergy - result.weeklySummary.previousWeek.averageEnergy) / 
      result.weeklySummary.previousWeek.averageEnergy) * 100;
    
    result.weeklySummary.changePercentage = Number(change.toFixed(1));
  }
  
  return result;
};

/**
 * Generate formatted data for charts from trend analysis
 * @param trendData Trend analysis result
 * @returns Formatted data ready for charts
 */
export const prepareChartData = (trendData: TrendAnalysisResult) => {
  // Prepare pie chart data for emotion frequency
  const emotionFrequencyData = Object.entries(trendData.emotionFrequency).map(([name, value]) => ({
    name,
    value,
  })).filter(item => item.value > 0);
  
  // Prepare pie chart data for input method usage
  const inputMethodData = Object.entries(trendData.inputMethodUsage).map(([name, value]) => ({
    name,
    value,
  })).filter(item => item.value > 0);
  
  // Prepare line chart data for mood factors
  const moodFactorsData = trendData.moodFactorsTimeline.dates.map((date, index) => ({
    date,
    energy: trendData.moodFactorsTimeline.energy[index],
    calmness: trendData.moodFactorsTimeline.calmness[index],
    tension: trendData.moodFactorsTimeline.tension[index],
  }));
  
  // Prepare line chart data for emotions over time
  const emotionTimelineData = trendData.emotionTimeline.dates.map((date, index) => {
    const entry: any = { date };
    
    Object.entries(trendData.emotionTimeline.emotions).forEach(([emotion, values]) => {
      entry[emotion] = values[index];
    });
    
    return entry;
  });
  
  return {
    emotionFrequencyData,
    inputMethodData,
    moodFactorsData,
    emotionTimelineData,
  };
}; 