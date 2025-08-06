import { supabase } from '../config/supabase';

/**
 * Milestone definitions for streak celebrations
 */
export const STREAK_MILESTONES = [
  7, 14, 21, 30, 50, 100, 150, 200, 365,
] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/**
 * User streak data structure matching the database schema
 */
export interface UserStreak {
  id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  total_days_logged: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Streak status for health/quality indicators
 */
export type StreakStatus = 'active' | 'at_risk' | 'broken' | 'inactive';

/**
 * Milestone celebration data
 */
export interface MilestoneCelebration {
  milestone: number;
  message: string;
  emoji: string;
  isPersonalBest: boolean;
}

/**
 * Streak display data for UI components
 */
export interface StreakDisplayData {
  currentStreak: number;
  longestStreak: number;
  status: StreakStatus;
  displayText: string;
  shortDisplayText: string;
  daysUntilNextMilestone: number | null;
  nextMilestone: number | null;
  isOnFire: boolean;
  celebrationData?: MilestoneCelebration;
}

/**
 * Service class for managing user streaks
 */
export class StreakService {
  /**
   * Check if a given streak count is a milestone
   */
  static isMilestone(streakCount: number): boolean {
    return STREAK_MILESTONES.includes(streakCount as StreakMilestone);
  }

  /**
   * Get the next milestone for a given streak count
   */
  static getNextMilestone(currentStreak: number): number | null {
    const nextMilestone = STREAK_MILESTONES.find(m => m > currentStreak);
    return nextMilestone || null;
  }

  /**
   * Calculate days until the next milestone
   */
  static getDaysUntilNextMilestone(currentStreak: number): number | null {
    const nextMilestone = this.getNextMilestone(currentStreak);
    return nextMilestone ? nextMilestone - currentStreak : null;
  }

  /**
   * Get celebration message for a milestone
   */
  static getCelebrationMessage(
    milestone: number,
    isPersonalBest: boolean
  ): MilestoneCelebration {
    const baseMessages: Record<number, { message: string; emoji: string }> = {
      7: {
        message: "One week strong! You're building a great habit! 🎯",
        emoji: '🔥',
      },
      14: {
        message: "Two weeks of consistency! You're on fire! 🔥",
        emoji: '💪',
      },
      21: {
        message:
          'Three weeks! Experts say it takes 21 days to form a habit! 🏆',
        emoji: '🌟',
      },
      30: {
        message:
          "One month milestone! You're a nutrition tracking champion! 🏅",
        emoji: '🎉',
      },
      50: { message: '50 days! Your dedication is inspiring! ⭐', emoji: '🚀' },
      100: {
        message: "100 DAYS! You've reached legendary status! 👑",
        emoji: '💯',
      },
      150: {
        message: "150 days of excellence! You're unstoppable! 💫",
        emoji: '🏆',
      },
      200: {
        message: "200 days! You're a true wellness warrior! ⚡",
        emoji: '🎊',
      },
      365: {
        message: "ONE FULL YEAR! You've achieved the ultimate milestone! 🎆",
        emoji: '👑',
      },
    };

    const defaultMessage = {
      message: `${milestone} day streak! Keep up the amazing work!`,
      emoji: '🎯',
    };

    const { message, emoji } = baseMessages[milestone] || defaultMessage;

    // Add personal best suffix if applicable
    const finalMessage =
      isPersonalBest && milestone > 7
        ? `${message} This is your longest streak ever!`
        : message;

    return {
      milestone,
      message: finalMessage,
      emoji,
      isPersonalBest,
    };
  }

  /**
   * Calculate streak health/status based on last log date
   */
  static calculateStreakStatus(
    lastLogDate: string | null,
    currentStreak: number
  ): StreakStatus {
    if (!lastLogDate || currentStreak === 0) {
      return 'inactive';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLog = new Date(lastLogDate);
    lastLog.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      return 'active'; // Logged today
    } else if (daysDiff === 1) {
      return 'at_risk'; // Haven't logged today yet
    } else {
      return 'broken'; // Missed one or more days
    }
  }

  /**
   * Check if user has already logged today
   */
  static hasLoggedToday(lastLogDate: string | null): boolean {
    if (!lastLogDate) return false;

    const today = new Date().toISOString().split('T')[0];
    const lastLog = new Date(lastLogDate).toISOString().split('T')[0];

    return today === lastLog;
  }

  /**
   * Format streak display text
   */
  static formatStreakDisplay(
    currentStreak: number,
    status: StreakStatus
  ): string {
    if (currentStreak === 0) {
      return 'Start your streak today!';
    }

    const statusSuffix = {
      active: ' 🔥',
      at_risk: ' ⚠️ Log today to continue!',
      broken: ' ❌ Streak ended',
      inactive: '',
    };

    return `${currentStreak} day streak${statusSuffix[status]}`;
  }

  /**
   * Format short streak display text (for compact UI)
   */
  static formatShortStreakDisplay(
    currentStreak: number,
    status: StreakStatus
  ): string {
    if (currentStreak === 0) return 'No streak';

    const emoji = {
      active: '🔥',
      at_risk: '⚠️',
      broken: '❌',
      inactive: '',
    };

    return `${currentStreak}d ${emoji[status]}`;
  }

  /**
   * Check if streak is "on fire" (active and >= 3 days)
   */
  static isOnFire(currentStreak: number, status: StreakStatus): boolean {
    return status === 'active' && currentStreak >= 3;
  }

  /**
   * Get comprehensive streak display data
   */
  static getStreakDisplayData(streak: UserStreak | null): StreakDisplayData {
    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        status: 'inactive',
        displayText: 'Start your streak today!',
        shortDisplayText: 'No streak',
        daysUntilNextMilestone: 7,
        nextMilestone: 7,
        isOnFire: false,
      };
    }

    const status = this.calculateStreakStatus(
      streak.last_log_date,
      streak.current_streak
    );
    const displayText = this.formatStreakDisplay(streak.current_streak, status);
    const shortDisplayText = this.formatShortStreakDisplay(
      streak.current_streak,
      status
    );
    const nextMilestone = this.getNextMilestone(streak.current_streak);
    const daysUntilNextMilestone = this.getDaysUntilNextMilestone(
      streak.current_streak
    );
    const isOnFire = this.isOnFire(streak.current_streak, status);

    // Check if today is a milestone day and user already logged
    let celebrationData: MilestoneCelebration | undefined;
    if (
      this.hasLoggedToday(streak.last_log_date) &&
      this.isMilestone(streak.current_streak)
    ) {
      const isPersonalBest = streak.current_streak >= streak.longest_streak;
      celebrationData = this.getCelebrationMessage(
        streak.current_streak,
        isPersonalBest
      );
    }

    return {
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
      status,
      displayText,
      shortDisplayText,
      daysUntilNextMilestone,
      nextMilestone,
      isOnFire,
      celebrationData,
    };
  }

  /**
   * Fetch user streak from database
   */
  static async getUserStreak(userId: string): Promise<UserStreak | null> {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        console.error('Error fetching user streak:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStreak:', error);
      return null;
    }
  }

  /**
   * Get streak with display data
   */
  static async getStreakWithDisplayData(
    userId: string
  ): Promise<StreakDisplayData> {
    const streak = await this.getUserStreak(userId);
    return this.getStreakDisplayData(streak);
  }

  /**
   * Calculate streak statistics
   */
  static getStreakStats(streak: UserStreak | null) {
    if (!streak) {
      return {
        averageStreakLength: 0,
        completionRate: 0,
        isImproving: false,
      };
    }

    // Calculate average streak length (total days / number of streaks)
    // This is a rough estimate assuming each broken streak was at least 1 day
    const estimatedNumberOfStreaks = Math.max(
      1,
      streak.total_days_logged > 0
        ? Math.ceil(
            streak.total_days_logged / Math.max(1, streak.longest_streak)
          )
        : 1
    );
    const averageStreakLength = Math.round(
      streak.total_days_logged / estimatedNumberOfStreaks
    );

    // Calculate completion rate (current streak vs longest)
    const completionRate =
      streak.longest_streak > 0
        ? Math.round((streak.current_streak / streak.longest_streak) * 100)
        : 0;

    // Check if improving (current streak > average)
    const isImproving = streak.current_streak > averageStreakLength;

    return {
      averageStreakLength,
      completionRate,
      isImproving,
    };
  }

  /**
   * Get motivational message based on streak status
   */
  static getMotivationalMessage(displayData: StreakDisplayData): string {
    const { currentStreak, status, daysUntilNextMilestone } = displayData;

    if (status === 'inactive' || currentStreak === 0) {
      return 'Start logging today to begin your wellness journey! 💪';
    }

    if (status === 'broken') {
      return "Don't worry! Every day is a fresh start. Log your meal to begin a new streak! 🌟";
    }

    if (status === 'at_risk') {
      return "Keep your streak alive! Log today's meals before midnight! ⏰";
    }

    if (daysUntilNextMilestone && daysUntilNextMilestone <= 3) {
      return `Just ${daysUntilNextMilestone} more days until your next milestone! Keep going! 🎯`;
    }

    if (currentStreak >= 30) {
      return "You're a nutrition tracking master! Keep up the incredible work! 👑";
    }

    if (currentStreak >= 7) {
      return "You're doing amazing! Consistency is the key to success! 🔥";
    }

    return 'Great job staying consistent! Every day counts! ⭐';
  }
}

export default StreakService;
