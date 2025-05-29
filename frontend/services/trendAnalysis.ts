import { MoodEntry, EmotionData } from '../types';
import { getDummyTrendData } from './dummyData';

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

/**
 * Analyzes mood entries to find trends over time
 * @param entries Array of mood entries to analyze
 * @returns Analysis of trends in the data
 */
export const analyzeTrends = (entries: MoodEntry[]): TrendAnalysisResult => {
  // For prototype, use dummy data
  const dummyData = getDummyTrendData();
  
  // Generate some insights
  const insights = [
    {
      type: 'positive' as const,
      text: 'Your mood has been improving over the past week.'
    },
    {
      type: 'neutral' as const,
      text: 'You tend to record your emotions most often during the evening.'
    },
    {
      type: 'positive' as const,
      text: 'Your energy levels are highest on weekends.'
    },
    {
      type: 'negative' as const,
      text: 'You experience more tension on Mondays and Tuesdays.'
    }
  ];
  
  // Create trend data from dummy entries
  const sortedEntries = [...dummyData.entries].sort((a, b) => a.timestamp - b.timestamp);
  
  const trends = {
    energy: {
      label: 'Energy',
      data: sortedEntries.map(entry => entry.emotions.energy || 50),
      color: '#3498db'
    },
    calmness: {
      label: 'Calmness',
      data: sortedEntries.map(entry => entry.emotions.calmness || 50),
      color: '#2ecc71'
    },
    tension: {
      label: 'Tension',
      data: sortedEntries.map(entry => entry.emotions.tension || 50),
      color: '#e74c3c'
    }
  };
  
  return {
    trends,
    emotionFrequency: dummyData.emotionFrequency,
    timeOfDay: {
      morning: 5,
      afternoon: 8,
      evening: 12,
      night: 3
    },
    dayOfWeek: {
      Sunday: 4,
      Monday: 5,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 6,
      Friday: 5,
      Saturday: 3
    },
    insights
  };
};

/**
 * Calculate distribution of emotions across entries
 */
const calculateEmotionDistribution = (entries: MoodEntry[]) => {
  const distribution: Record<string, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    contentment: 0,
    neutral: 0
  };
  
  entries.forEach(entry => {
    distribution[entry.dominantEmotion] = (distribution[entry.dominantEmotion] || 0) + 1;
  });
  
  return distribution;
};

/**
 * Calculate distribution of entries by time of day
 */
const calculateTimeOfDayDistribution = (entries: MoodEntry[]) => {
  const distribution: Record<string, number> = {
    morning: 0,   // 5:00 - 11:59
    afternoon: 0, // 12:00 - 16:59
    evening: 0,   // 17:00 - 20:59
    night: 0      // 21:00 - 4:59
  };
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) {
      distribution.morning += 1;
    } else if (hour >= 12 && hour < 17) {
      distribution.afternoon += 1;
    } else if (hour >= 17 && hour < 21) {
      distribution.evening += 1;
    } else {
      distribution.night += 1;
    }
  });
  
  return distribution;
};

/**
 * Calculate distribution of entries by weekday
 */
const calculateWeekdayDistribution = (entries: MoodEntry[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const distribution: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  };
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const day = days[date.getDay()];
    distribution[day] += 1;
  });
  
  return distribution;
};

/**
 * Calculate average emotion parameters
 */
const calculateEmotionParameters = (entries: MoodEntry[]) => {
  const totalEmotions: EmotionData = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    contentment: 0,
    neutral: 0,
    energy: 0,
    calmness: 0,
    tension: 0
  };
  
  entries.forEach(entry => {
    Object.keys(totalEmotions).forEach(key => {
      const emotionKey = key as keyof EmotionData;
      totalEmotions[emotionKey] += entry.emotions[emotionKey];
    });
  });
  
  // Calculate averages
  const averageEmotions: EmotionData = { ...totalEmotions };
  Object.keys(averageEmotions).forEach(key => {
    const emotionKey = key as keyof EmotionData;
    averageEmotions[emotionKey] /= entries.length;
  });
  
  return averageEmotions;
};

/**
 * Generate insights based on the analyzed data
 */
const generateInsights = (
  entries: MoodEntry[],
  emotionDistribution: Record<string, number>,
  timeOfDayDistribution: Record<string, number>,
  weekdayDistribution: Record<string, number>
) => {
  const insights: string[] = [];
  
  // Most common emotion
  const dominantEmotion = Object.entries(emotionDistribution)
    .reduce((max, [emotion, count]) => 
      count > max.count ? { emotion, count } : max, 
      { emotion: '', count: 0 }
    );
  
  if (dominantEmotion.emotion) {
    insights.push(`Your most common emotion is ${dominantEmotion.emotion}.`);
  }
  
  // Time of day patterns
  const mostActiveTime = Object.entries(timeOfDayDistribution)
    .reduce((max, [time, count]) => 
      count > max.count ? { time, count } : max, 
      { time: '', count: 0 }
    );
  
  if (mostActiveTime.time) {
    insights.push(`You tend to record your emotions most often during the ${mostActiveTime.time}.`);
  }
  
  // Weekday patterns
  const mostActiveDay = Object.entries(weekdayDistribution)
    .reduce((max, [day, count]) => 
      count > max.count ? { day, count } : max, 
      { day: '', count: 0 }
    );
  
  if (mostActiveDay.day) {
    insights.push(`${mostActiveDay.day} is when you record your emotions most frequently.`);
  }
  
  // Emotion trends over time
  if (entries.length >= 3) {
    const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
    const secondHalf = entries.slice(Math.floor(entries.length / 2));
    
    const firstHalfPositive = firstHalf.filter(e => 
      e.dominantEmotion === 'joy' || e.dominantEmotion === 'contentment'
    ).length / firstHalf.length;
    
    const secondHalfPositive = secondHalf.filter(e => 
      e.dominantEmotion === 'joy' || e.dominantEmotion === 'contentment'
    ).length / secondHalf.length;
    
    const difference = secondHalfPositive - firstHalfPositive;
    
    if (difference > 0.2) {
      insights.push('Your emotions have been becoming more positive over time.');
    } else if (difference < -0.2) {
      insights.push('Your emotions have been becoming less positive over time.');
    }
  }
  
  return insights;
};

/**
 * Determine the type of insight based on its content
 */
const determineInsightType = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['positive', 'improving', 'better', 'joy', 'contentment', 'happy'];
  const negativeWords = ['negative', 'declining', 'worse', 'sad', 'anger', 'fear', 'disgust'];
  
  const lowerText = text.toLowerCase();
  
  if (positiveWords.some(word => lowerText.includes(word))) {
    return 'positive';
  } else if (negativeWords.some(word => lowerText.includes(word))) {
    return 'negative';
  }
  
  return 'neutral';
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}; 