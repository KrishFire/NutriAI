import { supabase } from '../config/supabase';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
} from 'lucide-react-native';

export interface Insight {
  id: string;
  type: 'TREND' | 'CONSISTENCY';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  metric: 'calories' | 'protein' | 'carbs' | 'fat';
  title: string;
  description: string;
  icon: any;
  color: string;
  data: {
    changePercent?: number;
    coefficientVariation?: number;
    dailyValues: number[];
    periodDays: number;
  };
}

export interface WeeklyData {
  calories: {
    dailyData: number[];
    target: number;
    average: number;
    percentage: number;
    trend: number;
  };
  protein: {
    dailyData: number[];
    target: number;
    average: number;
    percentage: number;
    trend: number;
  };
  carbs: {
    dailyData: number[];
    target: number;
    average: number;
    percentage: number;
    trend: number;
  };
  fat: {
    dailyData: number[];
    target: number;
    average: number;
    percentage: number;
    trend: number;
  };
}

// Metric colors matching the UI
const METRIC_COLORS = {
  calories: '#320DFF',
  protein: '#42A5F5',
  carbs: '#FFA726',
  fat: '#66BB6A',
};

// Get icon based on insight type and sentiment
function getInsightIcon(type: string, sentiment: string) {
  if (type === 'TREND') {
    return sentiment === 'POSITIVE' ? TrendingUp : TrendingDown;
  } else if (type === 'CONSISTENCY') {
    return sentiment === 'POSITIVE' ? BarChart3 : AlertCircle;
  }
  return BarChart3;
}

// Calculate standard deviation
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

// Calculate coefficient of variation for consistency
function calculateCoefficient(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  if (mean === 0) return 0;
  const stdDev = calculateStandardDeviation(values);
  return stdDev / mean;
}

// Calculate trend using simple comparison method
function calculateTrend(values: number[]): number {
  if (values.length !== 7) return 0;
  
  const firstHalf = values.slice(0, 3);
  const secondHalf = values.slice(4, 7);
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  if (firstAvg === 0) return 0;
  return ((secondAvg - firstAvg) / firstAvg) * 100;
}

// Generate insight templates
function getInsightTemplate(
  type: 'TREND' | 'CONSISTENCY',
  metric: string,
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
  value: number
): { title: string; description: string } {
  const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);
  
  if (type === 'TREND') {
    const changeText = Math.abs(Math.round(value));
    if (sentiment === 'POSITIVE') {
      if (metric === 'calories') {
        return {
          title: 'Calorie Reduction',
          description: `Great job! Your calorie intake decreased by ${changeText}% this week.`
        };
      }
      return {
        title: `${metricName} Increase`,
        description: `Your ${metric} intake increased by ${changeText}% this week. Keep it up!`
      };
    } else if (sentiment === 'NEGATIVE') {
      if (metric === 'calories') {
        return {
          title: 'Calorie Increase',
          description: `Your calorie intake increased by ${changeText}% this week. Consider portion control.`
        };
      }
      return {
        title: `${metricName} Decrease`,
        description: `Your ${metric} intake decreased by ${changeText}% this week. Try to maintain your goals.`
      };
    }
  } else if (type === 'CONSISTENCY') {
    if (sentiment === 'POSITIVE') {
      return {
        title: `Consistent ${metricName}`,
        description: `Excellent! You've been very consistent with your ${metric} intake this week.`
      };
    } else if (sentiment === 'NEGATIVE') {
      return {
        title: `Inconsistent ${metricName}`,
        description: `Your ${metric} intake has been inconsistent. Try to maintain steadier daily amounts.`
      };
    }
  }
  
  return {
    title: `${metricName} Insight`,
    description: `Your ${metric} patterns this week.`
  };
}

// Calculate relevance score for prioritization
function calculateRelevanceScore(
  type: 'TREND' | 'CONSISTENCY',
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
  metric: string,
  magnitude: number
): number {
  // Type weights
  let typeWeight = 1.0;
  if (sentiment === 'NEGATIVE') {
    typeWeight = 1.5; // Negative trends are more urgent
  } else if (type === 'CONSISTENCY' && sentiment === 'NEGATIVE') {
    typeWeight = 1.2; // Inconsistency is important
  }
  
  // Metric weights
  const metricWeight = metric === 'calories' ? 1.1 : 1.0;
  
  // Calculate final score
  return Math.abs(magnitude) * typeWeight * metricWeight;
}

/**
 * Fetch user insights using client-side calculation
 */
export async function fetchUserInsights(): Promise<{
  insights: Insight[];
  weeklyData: WeeklyData | null;
  status: 'SUCCESS' | 'INSUFFICIENT_DATA' | 'ERROR';
  daysRemaining?: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Calculate date range for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    // Fetch user's daily logs for last 7 days
    const { data: dailyLogs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formatDate(startDate))
      .lte('date', formatDate(endDate))
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching daily logs:', error);
      throw error;
    }

    // Check if user has enough data
    if (!dailyLogs || dailyLogs.length < 7) {
      return {
        insights: [],
        weeklyData: null,
        status: 'INSUFFICIENT_DATA',
        daysRemaining: 7 - (dailyLogs?.length || 0)
      };
    }

    // Extract values for each metric
    const metrics = {
      calories: dailyLogs.map(log => log.total_calories || 0),
      protein: dailyLogs.map(log => log.total_protein || 0),
      carbs: dailyLogs.map(log => log.total_carbs || 0),
      fat: dailyLogs.map(log => log.total_fat || 0)
    };

    // Generate all possible insights
    const allInsights: Insight[] = [];
    
    // Generate trend insights
    Object.entries(metrics).forEach(([metric, values]) => {
      const trend = calculateTrend(values);
      
      if (Math.abs(trend) > 5) { // Only show if change is significant (>5%)
        let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
        
        if (metric === 'calories') {
          sentiment = trend > 0 ? 'NEGATIVE' : 'POSITIVE';
        } else {
          sentiment = trend > 0 ? 'POSITIVE' : 'NEGATIVE';
        }
        
        const template = getInsightTemplate('TREND', metric, sentiment, trend);
        
        allInsights.push({
          id: `${metric}_trend_${sentiment}`.toLowerCase(),
          type: 'TREND',
          sentiment,
          metric: metric as 'calories' | 'protein' | 'carbs' | 'fat',
          title: template.title,
          description: template.description,
          icon: getInsightIcon('TREND', sentiment),
          color: METRIC_COLORS[metric as keyof typeof METRIC_COLORS],
          data: {
            changePercent: trend,
            dailyValues: values,
            periodDays: 7
          }
        });
      }
    });
    
    // Generate consistency insights
    Object.entries(metrics).forEach(([metric, values]) => {
      const cv = calculateCoefficient(values);
      let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
      
      if (cv < 0.15) {
        sentiment = 'POSITIVE';
      } else if (cv > 0.35) {
        sentiment = 'NEGATIVE';
      }
      
      if (sentiment !== 'NEUTRAL') {
        const template = getInsightTemplate('CONSISTENCY', metric, sentiment, cv);
        
        allInsights.push({
          id: `${metric}_consistency_${sentiment}`.toLowerCase(),
          type: 'CONSISTENCY',
          sentiment,
          metric: metric as 'calories' | 'protein' | 'carbs' | 'fat',
          title: template.title,
          description: template.description,
          icon: getInsightIcon('CONSISTENCY', sentiment),
          color: METRIC_COLORS[metric as keyof typeof METRIC_COLORS],
          data: {
            coefficientVariation: cv,
            dailyValues: values,
            periodDays: 7
          }
        });
      }
    });
    
    // Sort by relevance score and take top 3
    allInsights.sort((a, b) => {
      const scoreA = calculateRelevanceScore(
        a.type, 
        a.sentiment, 
        a.metric, 
        a.data.changePercent || (a.data.coefficientVariation || 0) * 100
      );
      const scoreB = calculateRelevanceScore(
        b.type, 
        b.sentiment, 
        b.metric, 
        b.data.changePercent || (b.data.coefficientVariation || 0) * 100
      );
      return scoreB - scoreA;
    });
    
    const topInsights = allInsights.slice(0, 3);
    
    // Get user targets
    const targets = await getUserTargets(user.id);
    
    // Process weekly data
    const weeklyData = processWeeklyData(metrics, targets);
    
    return {
      insights: topInsights,
      weeklyData,
      status: 'SUCCESS'
    };
  } catch (error) {
    console.error('Error fetching insights (fallback):', error);
    return {
      insights: [],
      weeklyData: null,
      status: 'ERROR'
    };
  }
}

/**
 * Process weekly data to match the format expected by the UI
 */
function processWeeklyData(metrics: any, targets: any): WeeklyData {
  const calculateMetrics = (values: number[], target: number) => {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const percentage = Math.round((average / target) * 100);
    
    // Calculate trend (comparing last 3 days to first 3 days)
    const firstHalf = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const secondHalf = values.slice(4, 7).reduce((sum, val) => sum + val, 0) / 3;
    const trend = firstHalf === 0 ? 0 : Math.round(((secondHalf - firstHalf) / firstHalf) * 100);

    return {
      dailyData: values,
      target,
      average: Math.round(average),
      percentage,
      trend,
    };
  };

  return {
    calories: calculateMetrics(metrics.calories, targets.calories),
    protein: calculateMetrics(metrics.protein, targets.protein),
    carbs: calculateMetrics(metrics.carbs, targets.carbs),
    fat: calculateMetrics(metrics.fat, targets.fat),
  };
}

/**
 * Get user's nutrition targets
 */
async function getUserTargets(userId: string) {
  try {
    // First try to get from user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
      .eq('user_id', userId)
      .single();

    if (!error && preferences) {
      return {
        calories: preferences.daily_calorie_goal || 2000,
        protein: preferences.daily_protein_goal || 150,
        carbs: preferences.daily_carbs_goal || 250,
        fat: preferences.daily_fat_goal || 65,
      };
    }

    // Return defaults if no preferences found
    return {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
    };
  } catch (error) {
    console.error('Error fetching user targets:', error);
    return {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
    };
  }
}