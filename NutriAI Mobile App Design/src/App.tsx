import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { LogScreen } from './components/screens/LogScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { InsightsScreen } from './components/screens/InsightsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { PageTransition } from './components/ui/PageTransition';
// Additional screens
import { MealDetailScreen } from './components/screens/MealDetailScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { PaymentMethodScreen } from './components/screens/PaymentMethodScreen';
import { PersonalInfoScreen } from './components/screens/PersonalInfoScreen';
import { GoalsProgressScreen } from './components/screens/GoalsProgressScreen';
import { HealthDataScreen } from './components/screens/HealthDataScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { HelpSupportScreen } from './components/screens/HelpSupportScreen';
import { PrivacyScreen } from './components/screens/PrivacyScreen';
// Subscription screens
import { UpgradeScreen } from './components/subscription/UpgradeScreen';
import { BillingScreen } from './components/subscription/BillingScreen';
import { SubscriptionManagementScreen } from './components/subscription/SubscriptionManagementScreen';
// Food input flows
import { CameraInputScreen } from './components/food-input/CameraInputScreen';
import { VoiceInputScreen } from './components/food-input/VoiceInputScreen';
import { BarcodeInputScreen } from './components/food-input/BarcodeInputScreen';
import { TextInputScreen } from './components/food-input/TextInputScreen';
import { AnalyzingScreen } from './components/food-input/AnalyzingScreen';
import { FoodResultsScreen } from './components/food-input/FoodResultsScreen';
import { AIDescriptionScreen } from './components/food-input/AIDescriptionScreen';
import { FoodDetailScreen } from './components/food-input/FoodDetailScreen';
import { SearchResultsScreen } from './components/food-input/SearchResultsScreen';
import { AnalyzingResultsScreen } from './components/food-input/AnalyzingResultsScreen';
import { RefineWithAIScreen } from './components/food-input/RefineWithAIScreen';
import { AddMoreScreen } from './components/food-input/AddMoreScreen';
// Account management
import { LoginScreen } from './components/auth/LoginScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { DeleteAccountScreen } from './components/auth/DeleteAccountScreen';
// Recipe management
import { RecipeListScreen } from './components/recipe/RecipeListScreen';
import { RecipeDetailScreen } from './components/recipe/RecipeDetailScreen';
import { CreateRecipeScreen } from './components/recipe/CreateRecipeScreen';
// Additional screens
import { DetailedInsightScreen } from './components/insights/DetailedInsightScreen';
import { TutorialScreen } from './components/tutorial/TutorialScreen';
import { TrialExpiredScreen } from './components/screens/TrialExpiredScreen';
// New Premium screens
import { PaywallScreen } from './components/premium/PaywallScreen';
import { SubscriptionSuccessScreen } from './components/premium/SubscriptionSuccessScreen';
import { LockedFeatureOverlay } from './components/premium/LockedFeatureOverlay';
import { TrialCountdownSheet } from './components/premium/TrialCountdownSheet';
// Body Metrics screens
import { WeightLogSheet } from './components/metrics/WeightLogSheet';
import { WeightCheckInScreen } from './components/metrics/WeightCheckInScreen';
import { GoalProgressCelebrationScreen } from './components/metrics/GoalProgressCelebrationScreen';
// Food logging components
import { AddFoodScreen } from './components/screens/AddFoodScreen';
import { CreateFoodScreen } from './components/screens/CreateFoodScreen';
import { FoodDetailsScreen } from './components/screens/FoodDetailsScreen';
import { DailyLogScreen } from './components/screens/DailyLogScreen';
// New screens
import { EditMealScreen } from './components/screens/EditMealScreen';
import { FavoritesScreen } from './components/screens/FavoritesScreen';
import { MealSavedScreen } from './components/screens/MealSavedScreen';
export function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [previousScreen, setPreviousScreen] = useState('');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMealSaved, setShowMealSaved] = useState(false);
  const [showOverlay, setShowOverlay] = useState<{
    type: 'locked-feature' | 'trial-countdown' | 'weight-log' | null;
    params?: any;
  }>({
    type: null
  });
  const mainContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Simulate splash screen loading
    const timer = setTimeout(() => {
      setCurrentScreen('welcome');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  // Scroll to top when screen changes
  useEffect(() => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo(0, 0);
    }
  }, [currentScreen]);
  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const handleGetStarted = () => {
    setCurrentScreen('onboarding');
  };
  const handleLoginFromWelcome = () => {
    setCurrentScreen('login');
  };
  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };
  const handleNavigation = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };
  const navigateWithParams = (screen: string, params: any) => {
    setPreviousScreen(currentScreen);
    setScreenParams(params);
    setCurrentScreen(screen);
  };
  const handleBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen('');
      setScreenParams(null);
    }
  };
  const handleLogin = () => {
    setIsLoggedIn(true);
    setOnboardingComplete(true); // Set onboarding complete when logging in
    setCurrentScreen('home');
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('welcome');
  };
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const handleShowLockedFeatureOverlay = (featureName: string) => {
    setShowOverlay({
      type: 'locked-feature',
      params: {
        featureName
      }
    });
  };
  const handleShowTrialCountdown = (daysLeft: number) => {
    setShowOverlay({
      type: 'trial-countdown',
      params: {
        daysLeft
      }
    });
  };
  const handleShowWeightLog = () => {
    setShowOverlay({
      type: 'weight-log',
      params: {
        currentWeight: 165
      }
    });
  };
  const handleCloseOverlay = () => {
    setShowOverlay({
      type: null
    });
  };
  const handleSaveMeal = (meal: any) => {
    setShowMealSaved(true);
    // Hide the meal saved screen after 3 seconds
    setTimeout(() => {
      setShowMealSaved(false);
      setCurrentScreen('home');
    }, 3000);
  };
  const getScreenDirection = () => {
    // Define navigation directions for smooth transitions
    const mainScreens = ['home', 'log', 'history', 'insights', 'profile'];
    if (mainScreens.includes(currentScreen) && mainScreens.includes(previousScreen)) {
      const currentIndex = mainScreens.indexOf(currentScreen);
      const prevIndex = mainScreens.indexOf(previousScreen);
      return currentIndex > prevIndex ? 'left' : 'right';
    }
    return 'fade';
  };
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} onLogin={handleLoginFromWelcome} />;
      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
      case 'login':
        return <LoginScreen onBack={() => setCurrentScreen('welcome')} onLogin={handleLogin} onForgotPassword={() => setCurrentScreen('forgot-password')} onSignUp={() => setCurrentScreen('onboarding')} />;
      case 'forgot-password':
        return <ForgotPasswordScreen onBack={() => setCurrentScreen('login')} onComplete={() => setCurrentScreen('login')} />;
      case 'delete-account':
        return <DeleteAccountScreen onBack={handleBack} onAccountDeleted={() => {
          setIsLoggedIn(false);
          setCurrentScreen('welcome');
        }} />;
      case 'home':
        return <HomeScreen onNavigate={navigateWithParams} />;
      case 'log':
        return <LogScreen onNavigate={navigateWithParams} />;
      case 'history':
        return <HistoryScreen onViewMeal={meal => navigateWithParams('meal-detail', {
          meal
        })} />;
      case 'insights':
        return <InsightsScreen />;
      case 'detailed-insight':
        return <DetailedInsightScreen insight={screenParams?.insight} onBack={handleBack} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigateWithParams} />;
      case 'meal-detail':
        return <MealDetailScreen meal={screenParams?.meal} onBack={handleBack} onEdit={meal => navigateWithParams('edit-meal', {
          meal
        })} onAddToFavorites={meal => {
          // Handle adding to favorites
          console.log('Added to favorites:', meal);
        }} onNavigate={navigateWithParams} />;
      case 'edit-meal':
        return <EditMealScreen meal={screenParams?.meal} onBack={handleBack} onSave={handleSaveMeal} onAddMore={method => navigateWithParams('add-more', {
          currentMeal: screenParams?.meal,
          method
        })} onRefineWithAI={() => navigateWithParams('refine-with-ai', {
          currentResults: screenParams?.meal
        })} />;
      case 'favorites':
        return <FavoritesScreen onBack={handleBack} onSelectFavorite={item => navigateWithParams('meal-detail', {
          meal: item
        })} />;
      case 'notifications':
        return <NotificationsScreen onBack={handleBack} />;
      case 'payment-method':
        return <PaymentMethodScreen onBack={handleBack} />;
      case 'personal-info':
        return <PersonalInfoScreen onBack={handleBack} />;
      case 'goals-progress':
        return <GoalsProgressScreen onBack={handleBack} />;
      case 'health-data':
        return <HealthDataScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} onNavigate={navigateWithParams} onToggleDarkMode={handleToggleDarkMode} isDarkMode={isDarkMode} onLogout={handleLogout} />;
      case 'help-support':
        return <HelpSupportScreen onBack={handleBack} />;
      case 'privacy':
        return <PrivacyScreen onBack={handleBack} />;
      case 'tutorial':
        return <TutorialScreen onComplete={() => setCurrentScreen('home')} />;
      case 'trial-expired':
        return <TrialExpiredScreen onUpgrade={() => setCurrentScreen('upgrade')} onRestore={() => setCurrentScreen('home')} />;
      // Subscription screens
      case 'upgrade':
        return <PaywallScreen onBack={handleBack} onSubscribe={plan => setCurrentScreen('subscription-success')} onRestore={() => setCurrentScreen('home')} />;
      case 'subscription-success':
        return <SubscriptionSuccessScreen onContinue={() => setCurrentScreen('home')} />;
      case 'billing':
        return <BillingScreen onBack={handleBack} />;
      case 'subscription-management':
        return <SubscriptionManagementScreen onBack={handleBack} />;
      // Weight check-in screens
      case 'weight-check-in':
        return <WeightCheckInScreen onBack={handleBack} onComplete={() => setCurrentScreen('home')} />;
      case 'goal-celebration':
        return <GoalProgressCelebrationScreen onContinue={() => setCurrentScreen('home')} onSetNewGoal={() => navigateWithParams('goals-progress', {})} goalWeight={150} startWeight={170} currentWeight={150} unit="lbs" />;
      // Food input flows
      case 'camera-input':
        return <CameraInputScreen onBack={handleBack} onCapture={data => navigateWithParams('analyzing', {
          inputType: 'camera',
          data
        })} />;
      case 'voice-input':
        return <VoiceInputScreen onBack={handleBack} onCapture={data => navigateWithParams('analyzing', {
          inputType: 'voice',
          data
        })} />;
      case 'barcode-input':
        return <BarcodeInputScreen onBack={handleBack} onCapture={data => navigateWithParams('analyzing', {
          inputType: 'barcode',
          data
        })} />;
      case 'text-input':
        return <TextInputScreen onBack={handleBack} onSubmit={data => navigateWithParams('analyzing', {
          inputType: 'text',
          data
        })} />;
      case 'ai-description':
        return <AIDescriptionScreen onBack={handleBack} onSubmit={data => navigateWithParams('analyzing-results', {
          results: data
        })} />;
      case 'analyzing':
        return <AnalyzingScreen inputType={screenParams?.inputType} data={screenParams?.data} onResults={results => navigateWithParams('food-results', {
          results
        })} />;
      case 'food-results':
        return <FoodResultsScreen results={screenParams?.results} onBack={handleBack} onSave={handleSaveMeal} onAddMore={() => navigateWithParams('add-more', {
          currentMeal: screenParams?.results
        })} onRefine={data => navigateWithParams('refine-with-ai', {
          currentResults: data
        })} />;
      case 'refine-with-ai':
        return <RefineWithAIScreen onBack={handleBack} onSubmit={data => navigateWithParams('food-results', {
          results: data
        })} currentResults={screenParams?.currentResults} />;
      case 'add-more':
        return <AddMoreScreen onBack={handleBack} currentMeal={screenParams?.currentMeal} onCameraCapture={() => navigateWithParams('camera-input', {})} onVoiceCapture={() => navigateWithParams('voice-input', {})} onBarcodeCapture={() => navigateWithParams('barcode-input', {})} onTextInput={() => navigateWithParams('text-input', {})} onFavorites={() => navigateWithParams('favorites', {
          selectMode: true,
          returnTo: 'add-more',
          currentMeal: screenParams?.currentMeal
        })} />;
      case 'food-detail':
        return <FoodDetailsScreen food={screenParams?.food} onBack={handleBack} onAddToLog={(food, quantity, mealType) => {
          // Handle adding to log
          navigateWithParams('home', {});
        }} />;
      case 'search-results':
        return <SearchResultsScreen query={screenParams?.query} onBack={handleBack} onSelectFood={food => navigateWithParams('food-detail', {
          food
        })} />;
      case 'analyzing-results':
        return <AnalyzingResultsScreen results={screenParams?.results} onBack={handleBack} onSave={results => navigateWithParams('home', {})} onEdit={(item, index) => navigateWithParams('food-detail', {
          food: item,
          index
        })} />;
      // Recipe management
      case 'recipe-list':
        return <RecipeListScreen onBack={handleBack} onCreateRecipe={() => setCurrentScreen('create-recipe')} onSelectRecipe={recipe => navigateWithParams('recipe-detail', {
          recipe
        })} />;
      case 'recipe-detail':
        return <RecipeDetailScreen recipe={screenParams?.recipe} onBack={handleBack} onEdit={recipe => navigateWithParams('create-recipe', {
          recipe
        })} onAddToLog={recipe => {
          // Handle adding to log
          navigateWithParams('home', {});
        }} />;
      case 'create-recipe':
        return <CreateRecipeScreen onBack={handleBack} onSave={recipe => navigateWithParams('recipe-detail', {
          recipe
        })} />;
      case 'add-food':
        return <AddFoodScreen onBack={handleBack} onNavigate={navigateWithParams} />;
      case 'create-food':
        return <CreateFoodScreen onBack={handleBack} onSave={foodData => {
          // Handle saving the custom food
          navigateWithParams('food-detail', {
            food: {
              ...foodData,
              id: Date.now().toString(),
              calories: foodData.nutrition.calories,
              protein: foodData.nutrition.protein,
              carbs: foodData.nutrition.carbs,
              fat: foodData.nutrition.fat
            }
          });
        }} />;
      case 'daily-log':
        return <DailyLogScreen onBack={handleBack} onNavigate={navigateWithParams} />;
      default:
        return <HomeScreen onNavigate={navigateWithParams} />;
    }
  };
  const renderOverlay = () => {
    if (showMealSaved) {
      return <MealSavedScreen meal={screenParams?.meal || {
        type: 'Meal'
      }} onContinue={() => setShowMealSaved(false)} />;
    }
    if (!showOverlay.type) return null;
    switch (showOverlay.type) {
      case 'locked-feature':
        return <LockedFeatureOverlay featureName={showOverlay.params?.featureName || 'This feature'} onUpgrade={() => {
          handleCloseOverlay();
          setCurrentScreen('upgrade');
        }} onClose={handleCloseOverlay} />;
      case 'trial-countdown':
        return <TrialCountdownSheet daysLeft={showOverlay.params?.daysLeft || 3} onUpgrade={() => {
          handleCloseOverlay();
          setCurrentScreen('upgrade');
        }} onClose={handleCloseOverlay} />;
      case 'weight-log':
        return <WeightLogSheet currentWeight={showOverlay.params?.currentWeight} onClose={handleCloseOverlay} onSave={(weight, date) => {
          handleCloseOverlay();
          // Handle saving weight logic here
        }} />;
      default:
        return null;
    }
  };
  return <div className={`w-full h-full min-h-screen bg-white dark:bg-gray-900`}>
      <div ref={mainContainerRef} className="max-w-md mx-auto h-full min-h-screen relative bg-white dark:bg-gray-900 overflow-auto">
        <AnimatePresence mode="wait">
          <PageTransition key={currentScreen} direction={getScreenDirection()}>
            {renderCurrentScreen()}
          </PageTransition>
        </AnimatePresence>
        <AnimatePresence>{renderOverlay()}</AnimatePresence>
        {isLoggedIn && onboardingComplete && currentScreen !== 'splash' && currentScreen !== 'welcome' && currentScreen !== 'onboarding' && !currentScreen.includes('-') && <BottomNavigation currentScreen={currentScreen} onNavigate={handleNavigation} />}
      </div>
    </div>;
}