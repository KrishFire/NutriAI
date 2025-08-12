import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Berry } from '../../components/ui/Berry';
import { RootStackParamList } from '../../types/navigation';
import mealAIService, { aiMealToMealAnalysis } from '../../services/mealAI';
import { useAuth } from '../../hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

// Helper function to merge analysis data when adding more items
const mergeAnalysisData = (existingData: any, newData: any): any => {
  if (!existingData || !newData) return existingData || newData;
  
  // Combine foods arrays
  const combinedFoods = [
    ...(existingData.foods || []),
    ...(newData.foods || [])
  ];
  
  // Recalculate totals
  const totalCalories = combinedFoods.reduce((sum: number, food: any) => 
    sum + (food.nutrition?.calories || food.calories || 0), 0);
  const totalProtein = combinedFoods.reduce((sum: number, food: any) => 
    sum + (food.nutrition?.protein || food.protein || 0), 0);
  const totalCarbs = combinedFoods.reduce((sum: number, food: any) => 
    sum + (food.nutrition?.carbs || food.carbs || 0), 0);
  const totalFat = combinedFoods.reduce((sum: number, food: any) => 
    sum + (food.nutrition?.fat || food.fat || 0), 0);
  
  return {
    ...existingData,
    foods: combinedFoods,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    // Preserve existing title if non-generic, otherwise use new
    title: existingData.title && existingData.title !== 'Meal' 
      ? existingData.title 
      : (newData.title || existingData.title || 'Meal'),
  };
};

// Helper function to combine descriptions
const combineDescriptions = (existing: string | undefined, newDesc: string | undefined): string => {
  if (!existing) return newDesc || '';
  if (!newDesc) return existing;
  // Don't duplicate if already contains
  if (existing.toLowerCase().includes(newDesc.toLowerCase())) return existing;
  return `${existing}, ${newDesc}`;
};

type AnalyzingScreenRouteProp = RouteProp<RootStackParamList, 'AnalyzingScreen'>;
type AnalyzingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AnalyzingScreen'
>;

interface RouteParams {
  inputType: 'text' | 'voice' | 'camera' | 'barcode';
  inputData: string | { imageUri?: string; barcode?: string };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  returnToAddMore?: boolean;
  existingMealData?: any;
  description?: string;
  mealId?: string;
}

export default function AnalyzingScreen() {
  const navigation = useNavigation<AnalyzingScreenNavigationProp>();
  const route = useRoute<AnalyzingScreenRouteProp>();
  const { user, session } = useAuth();
  
  const { 
    inputType, 
    inputData, 
    mealType = 'snack',
    returnToAddMore,
    existingMealData,
    description: existingDescription,
    mealId
  } = route.params as RouteParams;
  
  const [progress, setProgress] = useState(0);
  const [apiComplete, setApiComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if component is still mounted
  const isMountedRef = useRef(true);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Effect 1: Handle API call
  useEffect(() => {
    const performAnalysis = async () => {
      if (!user || !session) {
        if (isMountedRef.current) {
          setError('Please log in to analyze meals');
          setApiComplete(true);
        }
        return;
      }

      try {
        let result;
        
        // Handle different input types
        if (inputType === 'text' && typeof inputData === 'string') {
          console.log('[AnalyzingScreen] Analyzing text input:', inputData);
          
          // Analyze the meal (don't save yet)
          const analysis = await mealAIService.analyzeMeal(inputData);
          const analysisData = aiMealToMealAnalysis(analysis);
          
          result = {
            analysisData,
            description: inputData, // Pass the description for later saving
            mealType,
          };
        } else if (inputType === 'voice' && typeof inputData === 'string') {
          // Similar handling for voice input
          console.log('[AnalyzingScreen] Analyzing voice input:', inputData);
          
          const analysis = await mealAIService.analyzeMeal(inputData);
          const analysisData = aiMealToMealAnalysis(analysis);
          
          result = {
            analysisData,
            description: inputData, // Pass the description for later saving
            mealType,
          };
        } else if (inputType === 'barcode' && route.params.analysisData) {
          // Handle barcode input - data is already analyzed
          console.log('[AnalyzingScreen] Processing barcode input');
          
          result = {
            analysisData: route.params.analysisData,
            description: route.params.existingDescription || `Scanned product: ${route.params.productData?.name || 'Unknown'}`,
            mealType,
          };
        } else if (imageUri) {
          // Handle camera input
          console.log('[AnalyzingScreen] Processing camera input');
          
          result = {
            analysisData: route.params.analysisData,
            description: route.params.description || 'Photo-based meal analysis',
            mealType,
            imageUri,
            uploadedImageUrl,
          };
        } else {
          throw new Error(`Input type ${inputType} not yet implemented`);
        }
        
        if (isMountedRef.current) {
          setAnalysisResult(result);
          setApiComplete(true);
        }
      } catch (err) {
        console.error('[AnalyzingScreen] Analysis error:', err);
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to analyze meal');
          setApiComplete(true);
        }
      }
    };

    // Small delay to allow screen animation
    const timer = setTimeout(() => performAnalysis(), 300);
    return () => clearTimeout(timer);
  }, [inputType, inputData, mealType, user, session]);

  // Effect 2: Manage progress animation
  useEffect(() => {
    if (apiComplete) {
      // Rapidly animate to 100% when API completes
      const rapidInterval = setInterval(() => {
        setProgress(currentProgress => {
          if (currentProgress >= 100) {
            clearInterval(rapidInterval);
            return 100;
          }
          return Math.min(currentProgress + 5, 100); // Fast increment to 100
        });
      }, 20); // Very fast interval for completion
      return () => clearInterval(rapidInterval);
    }

    // More realistic progress animation that slows down over time
    const interval = setInterval(() => {
      setProgress(currentProgress => {
        // Slow down as we progress
        if (currentProgress >= 90) {
          return Math.min(currentProgress + 0.1, 95); // Very slow after 90%
        } else if (currentProgress >= 70) {
          return Math.min(currentProgress + 0.5, 90); // Slow after 70%
        } else if (currentProgress >= 40) {
          return Math.min(currentProgress + 1, 70); // Medium speed
        }
        return Math.min(currentProgress + 2, 40); // Fast at start
      });
    }, 100); // Consistent interval, varying increment

    progressIntervalRef.current = interval;
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [apiComplete]);

  // Effect 3: Handle navigation when complete
  useEffect(() => {
    // Navigate when we have results and progress is 100%
    if (progress === 100 && analysisResult && !error) {
      // Haptic feedback on completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Use InteractionManager for smooth transition
      InteractionManager.runAfterInteractions(() => {
        if (isMountedRef.current) {
          // Handle "Add More" flow - merge new items with existing meal
          if (returnToAddMore && existingMealData) {
            console.log('[AnalyzingScreen] Merging with existing meal data');
            
            // Merge the new analysis with existing meal data
            const mergedData = mergeAnalysisData(existingMealData, analysisResult.analysisData);
            
            // Reset navigation to clear intermediate screens
            // Keep only the main screen and FoodResultsScreen in stack
            navigation.reset({
              index: 1,
              routes: [
                { name: 'Main' as any }, // Keep Main in stack so back button works
                {
                  name: 'FoodResultsScreen' as any,
                  params: {
                    analysisData: mergedData,
                    description: combineDescriptions(existingDescription, analysisResult.description),
                    mealId,
                  },
                },
              ],
            });
          } else {
            // Normal flow - reset navigation to clear intermediate screens
            console.log('[AnalyzingScreen] Navigating to FoodResultsScreen with:', analysisResult);
            navigation.reset({
              index: 1,
              routes: [
                { name: 'Main' as any }, // Keep Main in stack so back button works
                {
                  name: 'FoodResultsScreen' as any,
                  params: analysisResult,
                },
              ],
            });
          }
        }
      });
    } else if (progress === 100 && error) {
      // Navigate back on error after brief pause
      setTimeout(() => {
        if (isMountedRef.current) {
          navigation.goBack();
        }
      }, 1000);
    }
  }, [progress, analysisResult, error, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Berry Image with Animation */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={styles.berryContainer}
        >
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
          >
            <Berry variant="search" size="large" animate={false} />
          </MotiView>
        </MotiView>

        {/* Title and Subtitle */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={styles.textContainer}
        >
          <Text style={styles.title}>Analyzing Your Food</Text>
          <Text style={styles.subtitle}>
            Berry is using AI to identify your meal{'\n'}and calculate nutrition information
          </Text>
        </MotiView>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          {/* Large Percentage Number with Gradient */}
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            style={styles.percentageContainer}
          >
            <Text style={styles.percentageText}>{Math.floor(progress)}%</Text>
          </MotiView>

          {/* Gradient Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 50 }}
                style={styles.progressBarWrapper}
              >
                <LinearGradient
                  colors={['#320DFF', '#5E3FFF', '#320DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBar}
                />
              </MotiView>
            </View>
          </View>
        </View>

        {/* Status Text */}
        <MotiView
          animate={{ opacity: progress > 80 ? 1 : 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.statusContainer}
        >
          <Text style={styles.statusText}>
            {progress >= 100 
              ? 'Analysis complete!' 
              : 'Almost there...'}
          </Text>
        </MotiView>

        {/* Error Message */}
        {error && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.errorContainer}
          >
            <Text style={styles.errorText}>{error}</Text>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  berryContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSection: {
    alignItems: 'center',
    width: '100%',
  },
  percentageContainer: {
    width: 240,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  percentageText: {
    fontSize: 72,
    lineHeight: 90,
    fontWeight: '700',
    color: '#320DFF',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarWrapper: {
    height: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    borderRadius: 6,
  },
  statusContainer: {
    marginTop: 32,
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
});
