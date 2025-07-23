import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { getUserStats } from '../services/meals';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  totalDaysLogged: number;
  isActive: boolean;
  loading: boolean;
  error: string | null;
}

interface StreakContextType extends StreakData {
  refreshStreak: () => Promise<void>;
  checkMilestone: () => MilestoneInfo | null;
}

interface MilestoneInfo {
  milestone: number;
  message: string;
  emoji: string;
}

const MILESTONES = [
  { days: 7, message: "One week strong!", emoji: "🔥" },
  { days: 14, message: "Two weeks of consistency!", emoji: "💪" },
  { days: 21, message: "21 days - a new habit!", emoji: "🌟" },
  { days: 30, message: "30 day champion!", emoji: "🎯" },
  { days: 50, message: "50 days of dedication!", emoji: "🏆" },
  { days: 100, message: "Century streak!", emoji: "💯" },
  { days: 365, message: "One year warrior!", emoji: "👑" },
];

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: null,
    totalDaysLogged: 0,
    isActive: false,
    loading: true,
    error: null,
  });

  const loadStreakData = useCallback(async () => {
    if (!user) {
      setStreakData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStreakData(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await getUserStats(user.id);
      
      if (result.success) {
        const { currentStreak, longestStreak, totalDaysLogged } = result.data;
        
        // Check if streak is active (logged today)
        const today = new Date().toISOString().split('T')[0];
        const isActive = result.data.totalDaysLogged > 0; // This is a simplified check
        
        setStreakData({
          currentStreak,
          longestStreak,
          lastLogDate: today, // We'll need to get this from the API
          totalDaysLogged,
          isActive,
          loading: false,
          error: null,
        });
      } else {
        setStreakData(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to load streak data',
        }));
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
      setStreakData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load streak data',
      }));
    }
  }, [user]);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  const checkMilestone = useCallback((): MilestoneInfo | null => {
    const { currentStreak } = streakData;
    
    // Check if current streak matches any milestone
    const milestone = MILESTONES.find(m => m.days === currentStreak);
    
    if (milestone) {
      return {
        milestone: milestone.days,
        message: milestone.message,
        emoji: milestone.emoji,
      };
    }
    
    return null;
  }, [streakData.currentStreak]);

  const contextValue: StreakContextType = {
    ...streakData,
    refreshStreak: loadStreakData,
    checkMilestone,
  };

  return (
    <StreakContext.Provider value={contextValue}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}