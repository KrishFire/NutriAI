import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailyLog {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
}

interface Insight {
  id: string
  type: 'TREND' | 'CONSISTENCY'
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  metric: 'calories' | 'protein' | 'carbs' | 'fat'
  title: string
  description: string
  changeValue?: number
  coefficientVariation?: number
  relevanceScore: number
  data: {
    changePercent?: number
    coefficientVariation?: number
    dailyValues: number[]
    periodDays: number
  }
}

// Calculate standard deviation
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

// Calculate coefficient of variation for consistency
function calculateCoefficient(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  if (mean === 0) return 0
  const stdDev = calculateStandardDeviation(values)
  return stdDev / mean
}

// Calculate trend using simple comparison method
function calculateTrend(values: number[]): number {
  if (values.length !== 7) return 0
  
  const firstHalf = values.slice(0, 3)
  const secondHalf = values.slice(4, 7)
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  if (firstAvg === 0) return 0
  return ((secondAvg - firstAvg) / firstAvg) * 100
}

// Generate insight templates
function getInsightTemplate(
  type: 'TREND' | 'CONSISTENCY',
  metric: string,
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
  value: number
): { title: string; description: string } {
  const metricName = metric.charAt(0).toUpperCase() + metric.slice(1)
  
  if (type === 'TREND') {
    const changeText = Math.abs(Math.round(value))
    if (sentiment === 'POSITIVE') {
      if (metric === 'calories') {
        return {
          title: 'Calorie Reduction',
          description: `Great job! Your calorie intake decreased by ${changeText}% this week.`
        }
      }
      return {
        title: `${metricName} Increase`,
        description: `Your ${metric} intake increased by ${changeText}% this week. Keep it up!`
      }
    } else if (sentiment === 'NEGATIVE') {
      if (metric === 'calories') {
        return {
          title: 'Calorie Increase',
          description: `Your calorie intake increased by ${changeText}% this week. Consider portion control.`
        }
      }
      return {
        title: `${metricName} Decrease`,
        description: `Your ${metric} intake decreased by ${changeText}% this week. Try to maintain your goals.`
      }
    }
  } else if (type === 'CONSISTENCY') {
    if (sentiment === 'POSITIVE') {
      return {
        title: `Consistent ${metricName}`,
        description: `Excellent! You've been very consistent with your ${metric} intake this week.`
      }
    } else if (sentiment === 'NEGATIVE') {
      return {
        title: `Inconsistent ${metricName}`,
        description: `Your ${metric} intake has been inconsistent. Try to maintain steadier daily amounts.`
      }
    }
  }
  
  return {
    title: `${metricName} Insight`,
    description: `Your ${metric} patterns this week.`
  }
}

// Calculate relevance score for prioritization
function calculateRelevanceScore(
  type: 'TREND' | 'CONSISTENCY',
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
  metric: string,
  magnitude: number
): number {
  // Type weights
  let typeWeight = 1.0
  if (sentiment === 'NEGATIVE') {
    typeWeight = 1.5 // Negative trends are more urgent
  } else if (type === 'CONSISTENCY' && sentiment === 'NEGATIVE') {
    typeWeight = 1.2 // Inconsistency is important
  }
  
  // Metric weights
  const metricWeight = metric === 'calories' ? 1.1 : 1.0
  
  // Calculate final score
  return Math.abs(magnitude) * typeWeight * metricWeight
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create client with user's token for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('User not authenticated')
    }

    // Calculate date range for last 7 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    // Fetch user's daily logs for last 7 days using admin client
    const { data: dailyLogs, error } = await supabaseAdmin
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', formatDate(startDate))
      .lte('date', formatDate(endDate))
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    // Check if user has enough data
    if (!dailyLogs || dailyLogs.length < 7) {
      return new Response(
        JSON.stringify({
          status: 'INSUFFICIENT_DATA',
          message: 'Keep logging for more days to unlock your personal insights!',
          daysLogged: dailyLogs?.length || 0,
          daysRemaining: 7 - (dailyLogs?.length || 0)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Extract values for each metric
    const metrics = {
      calories: dailyLogs.map(log => log.total_calories),
      protein: dailyLogs.map(log => log.total_protein),
      carbs: dailyLogs.map(log => log.total_carbs),
      fat: dailyLogs.map(log => log.total_fat)
    }

    // Generate all possible insights
    const allInsights: Insight[] = []
    
    // Generate trend insights
    Object.entries(metrics).forEach(([metric, values]) => {
      const trend = calculateTrend(values)
      
      if (Math.abs(trend) > 5) { // Only show if change is significant (>5%)
        let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL'
        
        if (metric === 'calories') {
          sentiment = trend > 0 ? 'NEGATIVE' : 'POSITIVE'
        } else {
          sentiment = trend > 0 ? 'POSITIVE' : 'NEGATIVE'
        }
        
        const template = getInsightTemplate('TREND', metric, sentiment, trend)
        
        allInsights.push({
          id: `${metric}_trend_${sentiment}`.toLowerCase(),
          type: 'TREND',
          sentiment,
          metric: metric as 'calories' | 'protein' | 'carbs' | 'fat',
          title: template.title,
          description: template.description,
          changeValue: trend,
          relevanceScore: calculateRelevanceScore('TREND', sentiment, metric, trend),
          data: {
            changePercent: trend,
            dailyValues: values,
            periodDays: 7
          }
        })
      }
    })
    
    // Generate consistency insights
    Object.entries(metrics).forEach(([metric, values]) => {
      const cv = calculateCoefficient(values)
      let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL'
      
      if (cv < 0.15) {
        sentiment = 'POSITIVE'
      } else if (cv > 0.35) {
        sentiment = 'NEGATIVE'
      }
      
      if (sentiment !== 'NEUTRAL') {
        const template = getInsightTemplate('CONSISTENCY', metric, sentiment, cv)
        
        allInsights.push({
          id: `${metric}_consistency_${sentiment}`.toLowerCase(),
          type: 'CONSISTENCY',
          sentiment,
          metric: metric as 'calories' | 'protein' | 'carbs' | 'fat',
          title: template.title,
          description: template.description,
          coefficientVariation: cv,
          relevanceScore: calculateRelevanceScore('CONSISTENCY', sentiment, metric, cv * 100),
          data: {
            coefficientVariation: cv,
            dailyValues: values,
            periodDays: 7
          }
        })
      }
    })
    
    // Sort by relevance score and take top 3
    allInsights.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const topInsights = allInsights.slice(0, 3)
    
    return new Response(
      JSON.stringify({
        status: 'SUCCESS',
        insights: topInsights,
        weeklyData: {
          calories: metrics.calories,
          protein: metrics.protein,
          carbs: metrics.carbs,
          fat: metrics.fat
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        status: 'ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})