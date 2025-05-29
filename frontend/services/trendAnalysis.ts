import { MoodEntry } from './storage';

export interface MoodTrend {
  label: string;
  data: number[];
  color: string;
}

export interface MoodInsight {
  type: 'positive' | 'neutral' | 'negative';
  text: string;
}

export interface TrendAnalysisResult {
  trends: {
    energy: MoodTrend;
    calmness: MoodTrend;
    tension: MoodTrend;
  };
  emotionFrequency: Record<string, number>;
  timeOfDay: Record<string, number>;
  dayOfWeek: Record<string, number>;
  insights: MoodInsight[];
}

// Analyze mood entries for trends
export const analyzeTrends = (entries: MoodEntry[], days: number = 7): TrendAnalysisResult => {
  // Filter entries to the specified time period
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  const recentEntries = entries.filter(entry => entry.createdAt >= cutoffTime);
  
  // Sort entries by date (oldest first)
  const sortedEntries = [...recentEntries].sort((a, b) => a.createdAt - b.createdAt);
  
  // Generate trend data
  const energyData = sortedEntries.map(entry => entry.emotionData.energy);
  const calmnessData = sortedEntries.map(entry => entry.emotionData.calmness);
  const tensionData = sortedEntries.map(entry => entry.emotionData.tension);
  
  // Calculate emotion frequency
  const emotionFrequency: Record<string, number> = {};
  sortedEntries.forEach(entry => {
    const emotion = entry.analysis.dominantEmotion;
    emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
  });
  
  // Calculate time of day distribution
  const timeOfDay: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };
  
  sortedEntries.forEach(entry => {
    const hour = new Date(entry.createdAt).getHours();
    if (hour >= 5 && hour < 12) timeOfDay.morning++;
    else if (hour >= 12 && hour < 17) timeOfDay.afternoon++;
    else if (hour >= 17 && hour < 22) timeOfDay.evening++;
    else timeOfDay.night++;
  });
  
  // Calculate day of week distribution
  const dayOfWeek: Record<string, number> = {
    sunday: 0,
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
  };
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  sortedEntries.forEach(entry => {
    const day = new Date(entry.createdAt).getDay();
    dayOfWeek[dayNames[day]]++;
  });
  
  // Generate insights
  const insights = generateInsights(sortedEntries, emotionFrequency, timeOfDay, dayOfWeek);
  
  return {
    trends: {
      energy: {
        label: 'Energy',
        data: energyData,
        color: '#3498db',
      },
      calmness: {
        label: 'Calmness',
        data: calmnessData,
        color: '#2ecc71',
      },
      tension: {
        label: 'Tension',
        data: tensionData,
        color: '#e74c3c',
      },
    },
    emotionFrequency,
    timeOfDay,
    dayOfWeek,
    insights,
  };
};

// Generate insights based on the data
const generateInsights = (
  entries: MoodEntry[],
  emotionFrequency: Record<string, number>,
  timeOfDay: Record<string, number>,
  dayOfWeek: Record<string, number>
): MoodInsight[] => {
  const insights: MoodInsight[] = [];
  
  // Most frequent emotion
  const mostFrequentEmotion = Object.entries(emotionFrequency)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (mostFrequentEmotion) {
    const [emotion, count] = mostFrequentEmotion;
    const isPositive = ['joy', 'contentment'].includes(emotion);
    const isNegative = ['sadness', 'anger', 'fear', 'disgust'].includes(emotion);
    
    insights.push({
      type: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral',
      text: `Your most frequent emotion was ${emotion} (${count} times).`,
    });
  }
  
  // Favorite time of day
  const favoriteTime = Object.entries(timeOfDay)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (favoriteTime && favoriteTime[1] > 0) {
    insights.push({
      type: 'neutral',
      text: `You recorded emotions most often during the ${favoriteTime[0]} (${favoriteTime[1]} times).`,
    });
  }
  
  // Favorite day of week
  const favoriteDay = Object.entries(dayOfWeek)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (favoriteDay && favoriteDay[1] > 0) {
    insights.push({
      type: 'neutral',
      text: `You recorded emotions most often on ${capitalizeFirstLetter(favoriteDay[0])}s.`,
    });
  }
  
  // Calmness trend
  if (entries.length >= 3) {
    const calmnessValues = entries.map(e => e.emotionData.calmness);
    const averageCalmness = calmnessValues.reduce((sum, val) => sum + val, 0) / calmnessValues.length;
    
    // Check if calmness is increasing or decreasing
    const firstHalf = calmnessValues.slice(0, Math.floor(calmnessValues.length / 2));
    const secondHalf = calmnessValues.slice(Math.floor(calmnessValues.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const calmnessChange = secondHalfAvg - firstHalfAvg;
    
    if (Math.abs(calmnessChange) > 5) {
      insights.push({
        type: calmnessChange > 0 ? 'positive' : 'negative',
        text: calmnessChange > 0
          ? 'Your calmness levels have been increasing recently.'
          : 'Your calmness levels have been decreasing recently.',
      });
    }
  }
  
  return insights;
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}; 