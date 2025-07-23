import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStreak } from '../contexts/StreakContext';

const CELEBRATED_MILESTONES_KEY = '@celebrated_milestones';
const MILESTONES = [7, 14, 21, 30, 50, 100, 365];

export function useStreakCelebration() {
  const { currentStreak, longestStreak, loading } = useStreak();
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load celebrated milestones from storage
  useEffect(() => {
    loadCelebratedMilestones();
  }, []);

  // Check for new milestones when streak updates
  useEffect(() => {
    if (!loading && !isLoading && currentStreak > 0) {
      checkForNewMilestone();
    }
  }, [currentStreak, loading, isLoading, celebratedMilestones]);

  const loadCelebratedMilestones = async () => {
    try {
      const stored = await AsyncStorage.getItem(CELEBRATED_MILESTONES_KEY);
      if (stored) {
        setCelebratedMilestones(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading celebrated milestones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCelebratedMilestones = async (milestones: number[]) => {
    try {
      await AsyncStorage.setItem(
        CELEBRATED_MILESTONES_KEY,
        JSON.stringify(milestones)
      );
      setCelebratedMilestones(milestones);
    } catch (error) {
      console.error('Error saving celebrated milestones:', error);
    }
  };

  const checkForNewMilestone = () => {
    // Find milestones that have been reached but not celebrated
    const uncelebratedMilestones = MILESTONES.filter(
      (milestone) => 
        currentStreak >= milestone && 
        !celebratedMilestones.includes(milestone)
    );

    if (uncelebratedMilestones.length > 0) {
      // Celebrate the highest uncelebrated milestone
      const milestoneToСelebrate = Math.max(...uncelebratedMilestones);
      setCurrentCelebration(milestoneToСelebrate);
    }
  };

  const dismissCelebration = async () => {
    if (currentCelebration) {
      const updatedMilestones = [...celebratedMilestones, currentCelebration];
      await saveCelebratedMilestones(updatedMilestones);
      setCurrentCelebration(null);
    }
  };

  const resetCelebrations = async () => {
    try {
      await AsyncStorage.removeItem(CELEBRATED_MILESTONES_KEY);
      setCelebratedMilestones([]);
    } catch (error) {
      console.error('Error resetting celebrations:', error);
    }
  };

  return {
    shouldCelebrate: currentCelebration !== null,
    celebrationMilestone: currentCelebration,
    isPersonalBest: currentStreak === longestStreak && currentStreak > 0,
    dismissCelebration,
    resetCelebrations,
  };
}