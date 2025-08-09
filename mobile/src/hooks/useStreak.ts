import { useState, useEffect, useCallback } from 'react';
import {
  StreakService,
  StreakDisplayData,
  UserStreak,
} from '../services/streakService';
import { useAuth } from './useAuth';

/**
 * Hook response interface
 */
interface UseStreakReturn {
  streakData: StreakDisplayData | null;
  rawStreak: UserStreak | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  motivationalMessage: string;
}

/**
 * Custom hook for managing user streak data
 *
 * @example
 * ```tsx
 * const { streakData, loading, motivationalMessage } = useStreak();
 *
 * if (loading) return < />;
 *
 * return (
 *   <View>
 *     <Text>{streakData?.displayText}</Text>
 *     <Text>{motivationalMessage}</Text>
 *   </View>
 * );
 * ```
 */
export function useStreak(): UseStreakReturn {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakDisplayData | null>(null);
  const [rawStreak, setRawStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  const fetchStreak = useCallback(async () => {
    if (!user?.id) {
      setStreakData(StreakService.getStreakDisplayData(null));
      setRawStreak(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const streak = await StreakService.getUserStreak(user.id);
      const displayData = StreakService.getStreakDisplayData(streak);
      const message = StreakService.getMotivationalMessage(displayData);

      setRawStreak(streak);
      setStreakData(displayData);
      setMotivationalMessage(message);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError(err instanceof Error ? err.message : 'Failed to load streak');

      // Set default data on error
      setStreakData(StreakService.getStreakDisplayData(null));
      setMotivationalMessage(
        StreakService.getMotivationalMessage(
          StreakService.getStreakDisplayData(null)
        )
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streakData,
    rawStreak,
    loading,
    error,
    refresh: fetchStreak,
    motivationalMessage,
  };
}

/**
 * Hook for milestone celebrations
 *
 * @example
 * ```tsx
 * const { shouldCelebrate, celebration, dismissCelebration } = useStreakCelebration();
 *
 * if (shouldCelebrate && celebration) {
 *   return (
 *     <CelebrationModal
 *       milestone={celebration.milestone}
 *       message={celebration.message}
 *       onDismiss={dismissCelebration}
 *     />
 *   );
 * }
 * ```
 */
export function useStreakCelebration() {
  const { streakData } = useStreak();
  const [celebrated, setCelebrated] = useState<Set<number>>(new Set());
  const [shouldCelebrate, setShouldCelebrate] = useState(false);

  useEffect(() => {
    if (
      streakData?.celebrationData &&
      !celebrated.has(streakData.celebrationData.milestone)
    ) {
      setShouldCelebrate(true);
    }
  }, [streakData, celebrated]);

  const dismissCelebration = useCallback(() => {
    if (streakData?.celebrationData) {
      setCelebrated(
        prev => new Set([...prev, streakData.celebrationData!.milestone])
      );
      setShouldCelebrate(false);
    }
  }, [streakData]);

  return {
    shouldCelebrate,
    celebration: streakData?.celebrationData,
    dismissCelebration,
  };
}
