```index.tsx
import './index.css'
import React from "react";
import { render } from "react-dom";
import { App } from "./App";

render(<App />, document.getElementById("root"));

```
```App.tsx
import React, { useEffect, useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SplashScreen } from './components/screens/SplashScreen'
import { WelcomeScreen } from './components/screens/WelcomeScreen'
import { HomeScreen } from './components/screens/HomeScreen'
import { LogScreen } from './components/screens/LogScreen'
import { HistoryScreen } from './components/screens/HistoryScreen'
import { InsightsScreen } from './components/screens/InsightsScreen'
import { ProfileScreen } from './components/screens/ProfileScreen'
import { BottomNavigation } from './components/layout/BottomNavigation'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { PageTransition } from './components/ui/PageTransition'
// Additional screens
import { MealDetailScreen } from './components/screens/MealDetailScreen'
import { NotificationsScreen } from './components/screens/NotificationsScreen'
import { PaymentMethodScreen } from './components/screens/PaymentMethodScreen'
import { PersonalInfoScreen } from './components/screens/PersonalInfoScreen'
import { GoalsProgressScreen } from './components/screens/GoalsProgressScreen'
import { HealthDataScreen } from './components/screens/HealthDataScreen'
import { SettingsScreen } from './components/screens/SettingsScreen'
import { HelpSupportScreen } from './components/screens/HelpSupportScreen'
import { PrivacyScreen } from './components/screens/PrivacyScreen'
// Subscription screens
import { UpgradeScreen } from './components/subscription/UpgradeScreen'
import { BillingScreen } from './components/subscription/BillingScreen'
import { SubscriptionManagementScreen } from './components/subscription/SubscriptionManagementScreen'
// Food input flows
import { CameraInputScreen } from './components/food-input/CameraInputScreen'
import { VoiceInputScreen } from './components/food-input/VoiceInputScreen'
import { BarcodeInputScreen } from './components/food-input/BarcodeInputScreen'
import { TextInputScreen } from './components/food-input/TextInputScreen'
import { AnalyzingScreen } from './components/food-input/AnalyzingScreen'
import { FoodResultsScreen } from './components/food-input/FoodResultsScreen'
import { AIDescriptionScreen } from './components/food-input/AIDescriptionScreen'
import { FoodDetailScreen } from './components/food-input/FoodDetailScreen'
import { SearchResultsScreen } from './components/food-input/SearchResultsScreen'
import { AnalyzingResultsScreen } from './components/food-input/AnalyzingResultsScreen'
import { RefineWithAIScreen } from './components/food-input/RefineWithAIScreen'
import { AddMoreScreen } from './components/food-input/AddMoreScreen'
// Account management
import { LoginScreen } from './components/auth/LoginScreen'
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen'
import { DeleteAccountScreen } from './components/auth/DeleteAccountScreen'
// Recipe management
import { RecipeListScreen } from './components/recipe/RecipeListScreen'
import { RecipeDetailScreen } from './components/recipe/RecipeDetailScreen'
import { CreateRecipeScreen } from './components/recipe/CreateRecipeScreen'
// Additional screens
import { DetailedInsightScreen } from './components/insights/DetailedInsightScreen'
import { TutorialScreen } from './components/tutorial/TutorialScreen'
import { TrialExpiredScreen } from './components/screens/TrialExpiredScreen'
// New Premium screens
import { PaywallScreen } from './components/premium/PaywallScreen'
import { SubscriptionSuccessScreen } from './components/premium/SubscriptionSuccessScreen'
import { LockedFeatureOverlay } from './components/premium/LockedFeatureOverlay'
import { TrialCountdownSheet } from './components/premium/TrialCountdownSheet'
// Body Metrics screens
import { WeightLogSheet } from './components/metrics/WeightLogSheet'
import { WeightCheckInScreen } from './components/metrics/WeightCheckInScreen'
import { GoalProgressCelebrationScreen } from './components/metrics/GoalProgressCelebrationScreen'
// Food logging components
import { AddFoodScreen } from './components/screens/AddFoodScreen'
import { CreateFoodScreen } from './components/screens/CreateFoodScreen'
import { FoodDetailsScreen } from './components/screens/FoodDetailsScreen'
import { DailyLogScreen } from './components/screens/DailyLogScreen'
// New screens
import { EditMealScreen } from './components/screens/EditMealScreen'
import { FavoritesScreen } from './components/screens/FavoritesScreen'
import { MealSavedScreen } from './components/screens/MealSavedScreen'
export function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [previousScreen, setPreviousScreen] = useState('')
  const [screenParams, setScreenParams] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showMealSaved, setShowMealSaved] = useState(false)
  const [showOverlay, setShowOverlay] = useState<{
    type: 'locked-feature' | 'trial-countdown' | 'weight-log' | null
    params?: any
  }>({
    type: null,
  })
  const mainContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Simulate splash screen loading
    const timer = setTimeout(() => {
      setCurrentScreen('welcome')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])
  // Scroll to top when screen changes
  useEffect(() => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo(0, 0)
    }
  }, [currentScreen])
  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])
  const handleGetStarted = () => {
    setCurrentScreen('onboarding')
  }
  const handleLoginFromWelcome = () => {
    setCurrentScreen('login')
  }
  const handleOnboardingComplete = () => {
    setOnboardingComplete(true)
    setIsLoggedIn(true)
    setCurrentScreen('home')
  }
  const handleNavigation = (screen: string) => {
    setPreviousScreen(currentScreen)
    setCurrentScreen(screen)
  }
  const navigateWithParams = (screen: string, params: any) => {
    setPreviousScreen(currentScreen)
    setScreenParams(params)
    setCurrentScreen(screen)
  }
  const handleBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen)
      setPreviousScreen('')
      setScreenParams(null)
    }
  }
  const handleLogin = () => {
    setIsLoggedIn(true)
    setOnboardingComplete(true) // Set onboarding complete when logging in
    setCurrentScreen('home')
  }
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentScreen('welcome')
  }
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }
  const handleShowLockedFeatureOverlay = (featureName: string) => {
    setShowOverlay({
      type: 'locked-feature',
      params: {
        featureName,
      },
    })
  }
  const handleShowTrialCountdown = (daysLeft: number) => {
    setShowOverlay({
      type: 'trial-countdown',
      params: {
        daysLeft,
      },
    })
  }
  const handleShowWeightLog = () => {
    setShowOverlay({
      type: 'weight-log',
      params: {
        currentWeight: 165,
      },
    })
  }
  const handleCloseOverlay = () => {
    setShowOverlay({
      type: null,
    })
  }
  const handleSaveMeal = (meal: any) => {
    setShowMealSaved(true)
    // Hide the meal saved screen after 3 seconds
    setTimeout(() => {
      setShowMealSaved(false)
      setCurrentScreen('home')
    }, 3000)
  }
  const getScreenDirection = () => {
    // Define navigation directions for smooth transitions
    const mainScreens = ['home', 'log', 'history', 'insights', 'profile']
    if (
      mainScreens.includes(currentScreen) &&
      mainScreens.includes(previousScreen)
    ) {
      const currentIndex = mainScreens.indexOf(currentScreen)
      const prevIndex = mainScreens.indexOf(previousScreen)
      return currentIndex > prevIndex ? 'left' : 'right'
    }
    return 'fade'
  }
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />
      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={handleGetStarted}
            onLogin={handleLoginFromWelcome}
          />
        )
      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />
      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('welcome')}
            onLogin={handleLogin}
            onForgotPassword={() => setCurrentScreen('forgot-password')}
            onSignUp={() => setCurrentScreen('onboarding')}
          />
        )
      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onBack={() => setCurrentScreen('login')}
            onComplete={() => setCurrentScreen('login')}
          />
        )
      case 'delete-account':
        return (
          <DeleteAccountScreen
            onBack={handleBack}
            onAccountDeleted={() => {
              setIsLoggedIn(false)
              setCurrentScreen('welcome')
            }}
          />
        )
      case 'home':
        return <HomeScreen onNavigate={navigateWithParams} />
      case 'log':
        return <LogScreen onNavigate={navigateWithParams} />
      case 'history':
        return (
          <HistoryScreen
            onViewMeal={(meal) =>
              navigateWithParams('meal-detail', {
                meal,
              })
            }
          />
        )
      case 'insights':
        return <InsightsScreen />
      case 'detailed-insight':
        return (
          <DetailedInsightScreen
            insight={screenParams?.insight}
            onBack={handleBack}
          />
        )
      case 'profile':
        return <ProfileScreen onNavigate={navigateWithParams} />
      case 'meal-detail':
        return (
          <MealDetailScreen
            meal={screenParams?.meal}
            onBack={handleBack}
            onEdit={(meal) =>
              navigateWithParams('edit-meal', {
                meal,
              })
            }
            onAddToFavorites={(meal) => {
              // Handle adding to favorites
              console.log('Added to favorites:', meal)
            }}
            onNavigate={navigateWithParams}
          />
        )
      case 'edit-meal':
        return (
          <EditMealScreen
            meal={screenParams?.meal}
            onBack={handleBack}
            onSave={handleSaveMeal}
            onAddMore={(method) =>
              navigateWithParams('add-more', {
                currentMeal: screenParams?.meal,
                method,
              })
            }
            onRefineWithAI={() =>
              navigateWithParams('refine-with-ai', {
                currentResults: screenParams?.meal,
              })
            }
          />
        )
      case 'favorites':
        return (
          <FavoritesScreen
            onBack={handleBack}
            onSelectFavorite={(item) =>
              navigateWithParams('meal-detail', {
                meal: item,
              })
            }
          />
        )
      case 'notifications':
        return <NotificationsScreen onBack={handleBack} />
      case 'payment-method':
        return <PaymentMethodScreen onBack={handleBack} />
      case 'personal-info':
        return <PersonalInfoScreen onBack={handleBack} />
      case 'goals-progress':
        return <GoalsProgressScreen onBack={handleBack} />
      case 'health-data':
        return <HealthDataScreen onBack={handleBack} />
      case 'settings':
        return (
          <SettingsScreen
            onBack={handleBack}
            onNavigate={navigateWithParams}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
            onLogout={handleLogout}
          />
        )
      case 'help-support':
        return <HelpSupportScreen onBack={handleBack} />
      case 'privacy':
        return <PrivacyScreen onBack={handleBack} />
      case 'tutorial':
        return <TutorialScreen onComplete={() => setCurrentScreen('home')} />
      case 'trial-expired':
        return (
          <TrialExpiredScreen
            onUpgrade={() => setCurrentScreen('upgrade')}
            onRestore={() => setCurrentScreen('home')}
          />
        )
      // Subscription screens
      case 'upgrade':
        return (
          <PaywallScreen
            onBack={handleBack}
            onSubscribe={(plan) => setCurrentScreen('subscription-success')}
            onRestore={() => setCurrentScreen('home')}
          />
        )
      case 'subscription-success':
        return (
          <SubscriptionSuccessScreen
            onContinue={() => setCurrentScreen('home')}
          />
        )
      case 'billing':
        return <BillingScreen onBack={handleBack} />
      case 'subscription-management':
        return <SubscriptionManagementScreen onBack={handleBack} />
      // Weight check-in screens
      case 'weight-check-in':
        return (
          <WeightCheckInScreen
            onBack={handleBack}
            onComplete={() => setCurrentScreen('home')}
          />
        )
      case 'goal-celebration':
        return (
          <GoalProgressCelebrationScreen
            onContinue={() => setCurrentScreen('home')}
            onSetNewGoal={() => navigateWithParams('goals-progress', {})}
            goalWeight={150}
            startWeight={170}
            currentWeight={150}
            unit="lbs"
          />
        )
      // Food input flows
      case 'camera-input':
        return (
          <CameraInputScreen
            onBack={handleBack}
            onCapture={(data) =>
              navigateWithParams('analyzing', {
                inputType: 'camera',
                data,
              })
            }
          />
        )
      case 'voice-input':
        return (
          <VoiceInputScreen
            onBack={handleBack}
            onCapture={(data) =>
              navigateWithParams('analyzing', {
                inputType: 'voice',
                data,
              })
            }
          />
        )
      case 'barcode-input':
        return (
          <BarcodeInputScreen
            onBack={handleBack}
            onCapture={(data) =>
              navigateWithParams('analyzing', {
                inputType: 'barcode',
                data,
              })
            }
          />
        )
      case 'text-input':
        return (
          <TextInputScreen
            onBack={handleBack}
            onSubmit={(data) =>
              navigateWithParams('analyzing', {
                inputType: 'text',
                data,
              })
            }
          />
        )
      case 'ai-description':
        return (
          <AIDescriptionScreen
            onBack={handleBack}
            onSubmit={(data) =>
              navigateWithParams('analyzing-results', {
                results: data,
              })
            }
          />
        )
      case 'analyzing':
        return (
          <AnalyzingScreen
            inputType={screenParams?.inputType}
            data={screenParams?.data}
            onResults={(results) =>
              navigateWithParams('food-results', {
                results,
              })
            }
          />
        )
      case 'food-results':
        return (
          <FoodResultsScreen
            results={screenParams?.results}
            onBack={handleBack}
            onSave={handleSaveMeal}
            onAddMore={() =>
              navigateWithParams('add-more', {
                currentMeal: screenParams?.results,
              })
            }
            onRefine={(data) =>
              navigateWithParams('refine-with-ai', {
                currentResults: data,
              })
            }
          />
        )
      case 'refine-with-ai':
        return (
          <RefineWithAIScreen
            onBack={handleBack}
            onSubmit={(data) =>
              navigateWithParams('food-results', {
                results: data,
              })
            }
            currentResults={screenParams?.currentResults}
          />
        )
      case 'add-more':
        return (
          <AddMoreScreen
            onBack={handleBack}
            currentMeal={screenParams?.currentMeal}
            onCameraCapture={() => navigateWithParams('camera-input', {})}
            onVoiceCapture={() => navigateWithParams('voice-input', {})}
            onBarcodeCapture={() => navigateWithParams('barcode-input', {})}
            onTextInput={() => navigateWithParams('text-input', {})}
            onFavorites={() =>
              navigateWithParams('favorites', {
                selectMode: true,
                returnTo: 'add-more',
                currentMeal: screenParams?.currentMeal,
              })
            }
          />
        )
      case 'food-detail':
        return (
          <FoodDetailsScreen
            food={screenParams?.food}
            onBack={handleBack}
            onAddToLog={(food, quantity, mealType) => {
              // Handle adding to log
              navigateWithParams('home', {})
            }}
          />
        )
      case 'search-results':
        return (
          <SearchResultsScreen
            query={screenParams?.query}
            onBack={handleBack}
            onSelectFood={(food) =>
              navigateWithParams('food-detail', {
                food,
              })
            }
          />
        )
      case 'analyzing-results':
        return (
          <AnalyzingResultsScreen
            results={screenParams?.results}
            onBack={handleBack}
            onSave={(results) => navigateWithParams('home', {})}
            onEdit={(item, index) =>
              navigateWithParams('food-detail', {
                food: item,
                index,
              })
            }
          />
        )
      // Recipe management
      case 'recipe-list':
        return (
          <RecipeListScreen
            onBack={handleBack}
            onCreateRecipe={() => setCurrentScreen('create-recipe')}
            onSelectRecipe={(recipe) =>
              navigateWithParams('recipe-detail', {
                recipe,
              })
            }
          />
        )
      case 'recipe-detail':
        return (
          <RecipeDetailScreen
            recipe={screenParams?.recipe}
            onBack={handleBack}
            onEdit={(recipe) =>
              navigateWithParams('create-recipe', {
                recipe,
              })
            }
            onAddToLog={(recipe) => {
              // Handle adding to log
              navigateWithParams('home', {})
            }}
          />
        )
      case 'create-recipe':
        return (
          <CreateRecipeScreen
            onBack={handleBack}
            onSave={(recipe) =>
              navigateWithParams('recipe-detail', {
                recipe,
              })
            }
          />
        )
      case 'add-food':
        return (
          <AddFoodScreen onBack={handleBack} onNavigate={navigateWithParams} />
        )
      case 'create-food':
        return (
          <CreateFoodScreen
            onBack={handleBack}
            onSave={(foodData) => {
              // Handle saving the custom food
              navigateWithParams('food-detail', {
                food: {
                  ...foodData,
                  id: Date.now().toString(),
                  calories: foodData.nutrition.calories,
                  protein: foodData.nutrition.protein,
                  carbs: foodData.nutrition.carbs,
                  fat: foodData.nutrition.fat,
                },
              })
            }}
          />
        )
      case 'daily-log':
        return (
          <DailyLogScreen onBack={handleBack} onNavigate={navigateWithParams} />
        )
      default:
        return <HomeScreen onNavigate={navigateWithParams} />
    }
  }
  const renderOverlay = () => {
    if (showMealSaved) {
      return (
        <MealSavedScreen
          meal={
            screenParams?.meal || {
              type: 'Meal',
            }
          }
          onContinue={() => setShowMealSaved(false)}
        />
      )
    }
    if (!showOverlay.type) return null
    switch (showOverlay.type) {
      case 'locked-feature':
        return (
          <LockedFeatureOverlay
            featureName={showOverlay.params?.featureName || 'This feature'}
            onUpgrade={() => {
              handleCloseOverlay()
              setCurrentScreen('upgrade')
            }}
            onClose={handleCloseOverlay}
          />
        )
      case 'trial-countdown':
        return (
          <TrialCountdownSheet
            daysLeft={showOverlay.params?.daysLeft || 3}
            onUpgrade={() => {
              handleCloseOverlay()
              setCurrentScreen('upgrade')
            }}
            onClose={handleCloseOverlay}
          />
        )
      case 'weight-log':
        return (
          <WeightLogSheet
            currentWeight={showOverlay.params?.currentWeight}
            onClose={handleCloseOverlay}
            onSave={(weight, date) => {
              handleCloseOverlay()
              // Handle saving weight logic here
            }}
          />
        )
      default:
        return null
    }
  }
  return (
    <div className={`w-full h-full min-h-screen bg-white dark:bg-gray-900`}>
      <div
        ref={mainContainerRef}
        className="max-w-md mx-auto h-full min-h-screen relative bg-white dark:bg-gray-900 overflow-auto"
      >
        <AnimatePresence mode="wait">
          <PageTransition key={currentScreen} direction={getScreenDirection()}>
            {renderCurrentScreen()}
          </PageTransition>
        </AnimatePresence>
        <AnimatePresence>{renderOverlay()}</AnimatePresence>
        {isLoggedIn &&
          onboardingComplete &&
          currentScreen !== 'splash' &&
          currentScreen !== 'welcome' &&
          currentScreen !== 'onboarding' &&
          !currentScreen.includes('-') && (
            <BottomNavigation
              currentScreen={currentScreen}
              onNavigate={handleNavigation}
            />
          )}
      </div>
    </div>
  )
}

```
```tailwind.config.js
export default {}
```
```index.css
/* PLEASE NOTE: THESE TAILWIND IMPORTS SHOULD NEVER BE DELETED */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
/* DO NOT DELETE THESE TAILWIND IMPORTS, OTHERWISE THE STYLING WILL NOT RENDER AT ALL */
/* Import Plus Jakarta Sans font */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
/* Apply Plus Jakarta Sans font to all elements */
body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
/* Hide scrollbar for webkit browsers */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge, and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
/* Custom picker styles */
.picker-container {
  position: relative;
  height: 120px;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f3f4f6;
}
.picker-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(to bottom, 
    rgba(255,255,255,0.9) 0%, 
    rgba(255,255,255,0) 20%, 
    rgba(255,255,255,0) 80%, 
    rgba(255,255,255,0.9) 100%);
  z-index: 10;
}
.picker-highlight {
  position: absolute;
  left: 0;
  right: 0;
  height: 40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(50, 13, 255, 0.05);
  border-top: 1px solid rgba(50, 13, 255, 0.2);
  border-bottom: 1px solid rgba(50, 13, 255, 0.2);
  pointer-events: none;
  z-index: 5;
}
.picker-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
}
.picker-item.selected {
  color: #320DFF;
  font-weight: 600;
  font-size: 18px;
}
```
```components/layout/BottomNavigation.tsx
import React from 'react'
import {
  HomeIcon,
  PlusIcon,
  CalendarIcon,
  LineChartIcon,
  UserIcon,
} from 'lucide-react'
interface BottomNavigationProps {
  currentScreen: string
  onNavigate: (screen: string) => void
}
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const navItems = [
    {
      id: 'home',
      icon: HomeIcon,
      label: 'Home',
    },
    {
      id: 'history',
      icon: CalendarIcon,
      label: 'History',
    },
    {
      id: 'log',
      icon: PlusIcon,
      label: 'Log',
      primary: true,
    },
    {
      id: 'insights',
      icon: LineChartIcon,
      label: 'Insights',
    },
    {
      id: 'profile',
      icon: UserIcon,
      label: 'Profile',
    },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-2 z-50">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id
        const isPrimary = item.primary
        if (isPrimary) {
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center justify-center p-2 w-16 h-16 -mt-6 rounded-full bg-[#320DFF] text-white shadow-lg`}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon size={24} strokeWidth={2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          )
        }
        return (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center p-2 w-16 h-full ${isActive ? 'text-[#320DFF]' : 'text-gray-500'}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

```
```components/screens/SplashScreen.tsx
import React, { useEffect, useState } from 'react'
export const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-white">
      <div className="w-24 h-24 mb-8 flex items-center justify-center">
        <img
          src="https://uploadthingy.s3.us-west-1.amazonaws.com/jkYsqEAAFPrN4WGKjXkhAb/app_icon.png"
          alt="NutriAI logo"
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-2xl font-bold mb-8 text-gray-900">NutriAI</h1>
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#320DFF] rounded-full transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <p className="mt-4 text-gray-500 text-sm">Smart nutrition tracking</p>
    </div>
  )
}

```
```components/screens/WelcomeScreen.tsx
import React from 'react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
import { Berry } from '../ui/Berry'
interface WelcomeScreenProps {
  onGetStarted: () => void
  onLogin?: () => void
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onLogin,
}) => {
  const handleGetStarted = () => {
    hapticFeedback.impact()
    onGetStarted()
  }
  const handleLogin = () => {
    hapticFeedback.selection()
    if (onLogin) {
      onLogin()
    }
  }
  return (
    <div className="flex flex-col h-full min-h-screen bg-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="mb-8"
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            duration: 0.8,
          }}
        >
          <Berry variant="wave" size="large" />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold mb-4 text-center text-gray-900"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
        >
          Nutrition Tracking Made Easy
        </motion.h1>
        <motion.p
          className="text-center text-gray-600 text-lg mb-10 max-w-xs"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
            duration: 0.5,
          }}
        >
          The smartest way to track your nutrition with AI-powered food
          recognition
        </motion.p>
        <motion.div
          className="w-full max-w-xs space-y-5 mb-10"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
            duration: 0.5,
          }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">AI-powered food recognition</p>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">
              Effortless nutrition tracking
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">Personalized insights</p>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="mb-8 w-full"
        initial={{
          y: 20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.6,
          duration: 0.5,
        }}
      >
        <Button onClick={handleGetStarted} variant="primary" fullWidth>
          Get Started
        </Button>
        <motion.button
          className="w-full text-center mt-5 text-gray-600 py-2"
          onClick={handleLogin}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          I already have an account
        </motion.button>
      </motion.div>
    </div>
  )
}

```
```components/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  BellIcon,
  CameraIcon,
  MicIcon,
  BarcodeIcon,
  SearchIcon,
  MessageSquareIcon,
} from 'lucide-react'
import { ProgressRing } from '../ui/ProgressRing'
import { MealCard } from '../ui/MealCard'
import { PremiumBanner } from '../premium/PremiumBanner'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassMorphism } from '../ui/GlassMorphism'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { KineticTypography } from '../ui/KineticTypography'
import { ParticleEffect } from '../ui/ParticleEffect'
import { Berry } from '../ui/Berry'
import { hapticFeedback } from '../../utils/haptics'
import { FeedbackForm } from '../feedback/FeedbackForm'
interface HomeScreenProps {
  onNavigate?: (screen: string, params: any) => void
}
export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  // Sample data
  const userData = {
    name: 'Alex',
    streak: 7,
    dailyGoal: 2000,
    consumed: 1450,
    remaining: 550,
    notifications: 3,
    macros: {
      carbs: {
        goal: 250,
        consumed: 180,
        color: '#FFC078', // More muted orange
      },
      protein: {
        goal: 150,
        consumed: 95,
        color: '#74C0FC', // More muted blue
      },
      fat: {
        goal: 65,
        consumed: 48,
        color: '#8CE99A', // More muted green
      },
    },
  }
  const meals = [
    {
      id: 1,
      type: 'Breakfast',
      time: '8:30 AM',
      calories: 420,
      image:
        'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 65,
        protein: 15,
        fat: 12,
      },
    },
    {
      id: 2,
      type: 'Lunch',
      time: '12:45 PM',
      calories: 650,
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 75,
        protein: 45,
        fat: 22,
      },
    },
    {
      id: 3,
      type: 'Snack',
      time: '3:30 PM',
      calories: 180,
      image:
        'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 25,
        protein: 5,
        fat: 8,
      },
    },
  ]
  const [showParticles, setShowParticles] = useState(false)
  const [animateCalories, setAnimateCalories] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const caloriePercentage = Math.round(
    (userData.consumed / userData.dailyGoal) * 100,
  )
  useEffect(() => {
    // Simulate loading calories for animation
    setTimeout(() => {
      setAnimateCalories(true)
    }, 500)
    // Show particles when calories reach a milestone
    if (caloriePercentage >= 50 && !showParticles) {
      setTimeout(() => {
        setShowParticles(true)
      }, 2000)
    }
  }, [caloriePercentage])
  const handleUpgrade = () => {
    // Handle upgrade to premium
    console.log('Upgrade to premium')
  }
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }
  const handleNotificationsClick = () => {
    hapticFeedback.selection()
    if (onNavigate) {
      onNavigate('notifications', {})
    }
  }
  const handleOpenFeedback = () => {
    hapticFeedback.selection()
    setShowFeedbackForm(true)
  }
  const handleCloseFeedback = () => {
    setShowFeedbackForm(false)
  }
  const handleSubmitFeedback = (feedback: {
    rating: number
    comment: string
    contactInfo?: string
  }) => {
    console.log('Feedback submitted:', feedback)
    setShowFeedbackForm(false)
    setShowThankYou(true)
    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false)
    }, 3000)
  }
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <motion.div
        className="px-4 pt-12 pb-4 flex justify-between items-center"
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        <div>
          <motion.p
            className="text-gray-600"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            {getGreeting()},
          </motion.p>
          <motion.h1
            className="text-2xl font-bold"
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.3,
              type: 'spring',
            }}
          >
            {userData.name}
          </motion.h1>
        </div>
        <div className="flex items-center">
          <motion.div
            className="mr-4 flex items-center bg-[#320DFF]/10 px-2 py-1 rounded-full"
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
              type: 'spring',
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <Berry variant="streak" size="tiny" className="mr-1" />
            <span className="text-xs font-medium text-[#320DFF]">
              {userData.streak}
            </span>
          </motion.div>
          <motion.button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 relative"
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
              type: 'spring',
            }}
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
            onClick={handleNotificationsClick}
          >
            <BellIcon size={20} className="text-gray-700" />
            {userData.notifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {userData.notifications}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Banner - Only shown occasionally */}
      <motion.div
        className="px-4 mb-2"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.6,
          duration: 0.5,
        }}
      >
        <PremiumBanner onUpgrade={handleUpgrade} />
      </motion.div>

      {/* Daily Progress */}
      <motion.div
        className="px-4 py-6 bg-white"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.7,
          duration: 0.5,
        }}
      >
        <GlassMorphism
          className="rounded-3xl p-6 flex flex-col items-center"
          intensity="light"
        >
          <div className="flex justify-between w-full mb-4">
            <p className="text-gray-500 text-sm">Daily Progress</p>
            <p className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="w-48 h-48 mb-6 relative">
            <ProgressRing
              percentage={caloriePercentage}
              color="#320DFF"
              size={192}
              strokeWidth={12}
              animate={animateCalories}
              duration={2}
            >
              <div className="flex flex-col items-center justify-center">
                <AnimatedNumber
                  value={userData.consumed}
                  className="text-2xl font-bold"
                  duration={2}
                />
                <p className="text-xs text-gray-500">
                  of {userData.dailyGoal} cal
                </p>
              </div>
            </ProgressRing>
            {showParticles && (
              <ParticleEffect
                type="sparkle"
                intensity="medium"
                colors={['#320DFF', '#4F46E5', '#818CF8']}
                duration={2}
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 w-full">
            {Object.entries(userData.macros).map(([key, macro], index) => {
              const percentage = Math.round((macro.consumed / macro.goal) * 100)
              return (
                <motion.div
                  key={key}
                  className="flex flex-col items-center"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.8 + index * 0.1,
                  }}
                >
                  <div className="w-12 h-12 mb-1">
                    <ProgressRing
                      percentage={percentage}
                      color={macro.color}
                      size={48}
                      strokeWidth={4}
                      animate={animateCalories}
                      duration={1.5}
                    >
                      <p className="text-xs font-medium">{percentage}%</p>
                    </ProgressRing>
                  </div>
                  <p className="text-xs text-gray-600 capitalize">{key}</p>
                  <p className="text-xs font-medium">
                    <AnimatedNumber value={macro.consumed} duration={1.5} />/
                    {macro.goal}g
                  </p>
                </motion.div>
              )
            })}
          </div>
        </GlassMorphism>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        className="px-4 py-4"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.9,
          duration: 0.5,
        }}
      >
        <motion.h2
          className="text-lg font-semibold mb-4"
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1,
            duration: 0.5,
          }}
        >
          Today's Meals
        </motion.h2>
        <div className="space-y-3">
          <AnimatePresence>
            {meals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                transition={{
                  delay: 1.1 + index * 0.1,
                  duration: 0.5,
                }}
              >
                <MealCard meal={meal} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="px-4 py-6"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1.4,
          duration: 0.5,
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: CameraIcon,
              label: 'Camera',
            },
            {
              icon: MicIcon,
              label: 'Voice',
            },
            {
              icon: BarcodeIcon,
              label: 'Barcode',
            },
            {
              icon: SearchIcon,
              label: 'Search',
            },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 1.5 + index * 0.1,
                type: 'spring',
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(50, 13, 255, 0.05)',
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <action.icon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Feedback button - small and aligned with other content */}
      <motion.div
        className="px-4 mb-8 flex justify-center"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1.8,
        }}
      >
        <button
          onClick={handleOpenFeedback}
          className="flex items-center justify-center text-xs text-gray-500 hover:text-[#320DFF] transition-colors"
        >
          <MessageSquareIcon size={14} className="mr-1" />
          Share feedback
        </button>
      </motion.div>

      {/* Feedback Form */}
      <AnimatePresence>
        {showFeedbackForm && (
          <FeedbackForm
            onClose={handleCloseFeedback}
            onSubmit={handleSubmitFeedback}
          />
        )}
      </AnimatePresence>

      {/* Thank you notification */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-[#320DFF] dark:bg-[#6D56FF] text-white px-4 py-3 rounded-xl shadow-lg z-50"
            initial={{
              y: 50,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 50,
              opacity: 0,
            }}
          >
            Thank you for your feedback! We appreciate your input.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

```
```components/ui/Button.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
  className?: string
}
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#320DFF] dark:bg-[#6D56FF] text-white border-transparent hover:bg-[#2A0BD5] dark:hover:bg-[#5A46D5]'
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
      case 'outline':
        return 'bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
      case 'danger':
        return 'bg-red-500 dark:bg-red-600 text-white border-transparent hover:bg-red-600 dark:hover:bg-red-700'
      default:
        return 'bg-[#320DFF] dark:bg-[#6D56FF] text-white border-transparent hover:bg-[#2A0BD5] dark:hover:bg-[#5A46D5]'
    }
  }
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      hapticFeedback.selection()
      onClick()
    }
  }
  return (
    <motion.button
      type={type}
      className={`flex items-center justify-center px-6 py-4 rounded-full font-medium border transition-colors ${fullWidth ? 'w-full' : ''} ${getVariantStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={
        !disabled && !loading
          ? {
              scale: 1.02,
            }
          : {}
      }
      whileTap={
        !disabled && !loading
          ? {
              scale: 0.98,
            }
          : {}
      }
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  )
}

```
```components/ui/ProgressRing.tsx
import React from 'react'
import { motion } from 'framer-motion'
interface ProgressRingProps {
  percentage: number
  color: string
  size: number
  strokeWidth: number
  children?: React.ReactNode
  animate?: boolean
  duration?: number
}
export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  color,
  size,
  strokeWidth,
  children,
  animate = true,
  duration = 1.5,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const initialOffset = circumference
  const animatedOffset = circumference - (percentage / 100) * circumference
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Background Circle */}
      <svg width={size} height={size} className="absolute top-0 left-0">
        <circle
          stroke="#E0E0E0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Progress Circle */}
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0 -rotate-90 transform"
      >
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: animate ? initialOffset : animatedOffset,
          }}
          animate={{
            strokeDashoffset: animatedOffset,
          }}
          transition={{
            duration: animate ? duration : 0,
            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
          }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

```
```components/ui/MealCard.tsx
import React from 'react'
interface Meal {
  id: number
  type: string
  time: string
  calories: number
  image: string
  macros: {
    carbs: number
    protein: number
    fat: number
  }
  isFavorite?: boolean
}
interface MealCardProps {
  meal: Meal
}
export const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const { type, time, calories, image, macros, isFavorite } = meal
  const totalMacros = macros.carbs + macros.protein + macros.fat
  const carbsPercentage = Math.round((macros.carbs / totalMacros) * 100)
  const proteinPercentage = Math.round((macros.protein / totalMacros) * 100)
  const fatPercentage = Math.round((macros.fat / totalMacros) * 100)
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 bg-gray-100">
          <img src={image} alt={type} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-medium text-gray-900">{type}</h3>
              <p className="text-xs text-gray-500">{time}</p>
            </div>
            <span className="font-medium text-gray-900">{calories} cal</span>
          </div>
          <div className="h-2 flex rounded-full overflow-hidden bg-gray-100 mt-2">
            <div
              className="bg-[#FFA726]"
              style={{
                width: `${carbsPercentage}%`,
              }}
            ></div>
            <div
              className="bg-[#42A5F5]"
              style={{
                width: `${proteinPercentage}%`,
              }}
            ></div>
            <div
              className="bg-[#66BB6A]"
              style={{
                width: `${fatPercentage}%`,
              }}
            ></div>
          </div>
          <div className="flex text-xs mt-1 text-gray-500">
            <span className="mr-2">C: {macros.carbs}g</span>
            <span className="mr-2">P: {macros.protein}g</span>
            <span>F: {macros.fat}g</span>
          </div>
        </div>
      </div>
    </div>
  )
}

```
```components/screens/LogScreen.tsx
import React, { Children } from 'react'
import {
  SearchIcon,
  CameraIcon,
  MicIcon,
  BarcodeIcon,
  StarIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
interface LogScreenProps {
  onNavigate?: (screen: string, params: any) => void
}
export const LogScreen: React.FC<LogScreenProps> = ({ onNavigate }) => {
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  const handleInputMethod = (method: string) => {
    if (onNavigate) {
      switch (method) {
        case 'camera':
          onNavigate('camera-input', {})
          break
        case 'voice':
          onNavigate('voice-input', {})
          break
        case 'barcode':
          onNavigate('barcode-input', {})
          break
        case 'text':
          onNavigate('text-input', {})
          break
        case 'favorites':
          onNavigate('favorites', {})
          break
        default:
          break
      }
    }
  }
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <motion.h1
            className="text-2xl font-bold"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            Log Food
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 0.1,
            }}
          >
            Add what you ate today
          </motion.p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 pb-36">
            {/* Text Input */}
            <motion.div
              className="mb-6"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
            >
              <button
                onClick={() => handleInputMethod('text')}
                className="w-full bg-gray-100 rounded-full py-3 px-5 pl-12 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 relative text-left"
              >
                <SearchIcon
                  className="absolute left-4 top-3.5 text-gray-500"
                  size={18}
                />
                <span>Describe your meal...</span>
              </button>
            </motion.div>

            {/* Quick Add Methods */}
            <motion.div
              className="mb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex justify-between">
                <motion.button
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]"
                  onClick={() => handleInputMethod('camera')}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <CameraIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Camera</span>
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]"
                  onClick={() => handleInputMethod('voice')}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <MicIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Voice</span>
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]"
                  onClick={() => handleInputMethod('barcode')}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <BarcodeIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Barcode</span>
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]"
                  onClick={() => handleInputMethod('favorites')}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <StarIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Favorites</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Add Meals */}
            <motion.div
              className="mb-6"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.4,
              }}
            >
              <h2 className="font-semibold mb-3">Quick Add</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {mealOptions.map((meal, index) => (
                  <motion.button
                    key={index}
                    className="flex-shrink-0 bg-[#320DFF]/10 px-5 py-2.5 rounded-full"
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 0.5 + index * 0.1,
                    }}
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    <span className="text-sm text-[#320DFF] font-medium">
                      {meal}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Logs Placeholder */}
            <motion.div
              className="mb-6"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.6,
              }}
            >
              <h2 className="font-semibold mb-3">Recent Logs</h2>
              <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <CameraIcon size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-center mb-2">No recent logs</p>
                <p className="text-sm text-gray-400 text-center">
                  Your recently logged meals will appear here
                </p>
              </div>
            </motion.div>

            {/* Suggested Items */}
            <motion.div
              className="mb-6"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.8,
              }}
            >
              <h2 className="font-semibold mb-3">Suggested for You</h2>
              <div className="bg-[#320DFF]/5 p-4 rounded-xl">
                <p className="text-sm font-medium text-[#320DFF] mb-2">
                  Try our AI Assistant
                </p>
                <p className="text-sm text-gray-700">
                  Describe your meal in natural language and our AI will analyze
                  the nutrition for you.
                </p>
                <motion.button
                  className="mt-3 bg-[#320DFF] text-white px-4 py-2 rounded-full text-sm font-medium"
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => handleInputMethod('text')}
                >
                  Try Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/HistoryScreen.tsx
import React, { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react'
import { MealCard } from '../ui/MealCard'
import { PageTransition } from '../ui/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface HistoryScreenProps {
  onViewMeal?: (meal: any) => void
}
export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewMeal }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type?: 'success' | 'error' | 'info'
  }>({
    show: false,
    message: '',
  })
  // Sample data
  const dailySummary = {
    date: selectedDate,
    totalCalories: 1850,
    goalCalories: 2000,
    macros: {
      carbs: {
        consumed: 210,
        goal: 250,
        percentage: 84,
      },
      protein: {
        consumed: 120,
        goal: 150,
        percentage: 80,
      },
      fat: {
        consumed: 55,
        goal: 65,
        percentage: 85,
      },
    },
  }
  const [meals, setMeals] = useState([
    {
      id: 1,
      type: 'Breakfast',
      time: '8:30 AM',
      calories: 420,
      image:
        'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 65,
        protein: 15,
        fat: 12,
      },
      isFavorite: false,
      items: [
        {
          id: 'eggs',
          name: 'Scrambled Eggs',
          quantity: '2 large',
          calories: 180,
          protein: 12,
          carbs: 1,
          fat: 10,
          isFavorite: false,
        },
        {
          id: 'toast',
          name: 'Whole Wheat Toast',
          quantity: '2 slices',
          calories: 140,
          protein: 6,
          carbs: 24,
          fat: 2,
          isFavorite: false,
        },
        {
          id: 'fruit',
          name: 'Mixed Berries',
          quantity: '1 cup',
          calories: 100,
          protein: 1,
          carbs: 25,
          fat: 0,
          isFavorite: false,
        },
      ],
    },
    {
      id: 2,
      type: 'Lunch',
      time: '12:45 PM',
      calories: 650,
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 75,
        protein: 45,
        fat: 22,
      },
      isFavorite: false,
      items: [
        {
          id: 'salad',
          name: 'Chicken Salad',
          quantity: '1 bowl',
          calories: 350,
          protein: 35,
          carbs: 15,
          fat: 15,
          isFavorite: false,
        },
        {
          id: 'bread',
          name: 'Baguette',
          quantity: '1 small',
          calories: 200,
          protein: 6,
          carbs: 40,
          fat: 2,
          isFavorite: false,
        },
        {
          id: 'dressing',
          name: 'Olive Oil Dressing',
          quantity: '1 tbsp',
          calories: 100,
          protein: 0,
          carbs: 0,
          fat: 11,
          isFavorite: false,
        },
      ],
    },
    {
      id: 3,
      type: 'Snack',
      time: '3:30 PM',
      calories: 180,
      image:
        'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 25,
        protein: 5,
        fat: 8,
      },
      isFavorite: false,
      items: [
        {
          id: 'yogurt',
          name: 'Greek Yogurt',
          quantity: '1 cup',
          calories: 130,
          protein: 15,
          carbs: 8,
          fat: 4,
          isFavorite: false,
        },
        {
          id: 'honey',
          name: 'Honey',
          quantity: '1 tsp',
          calories: 20,
          protein: 0,
          carbs: 5,
          fat: 0,
          isFavorite: false,
        },
        {
          id: 'almonds',
          name: 'Almonds',
          quantity: '10 pieces',
          calories: 70,
          protein: 3,
          carbs: 2,
          fat: 6,
          isFavorite: false,
        },
      ],
    },
    {
      id: 4,
      type: 'Dinner',
      time: '7:15 PM',
      calories: 600,
      image:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 45,
        protein: 55,
        fat: 13,
      },
      isFavorite: false,
      items: [
        {
          id: 'salmon',
          name: 'Grilled Salmon',
          quantity: '6 oz',
          calories: 350,
          protein: 40,
          carbs: 0,
          fat: 18,
          isFavorite: false,
        },
        {
          id: 'rice',
          name: 'Brown Rice',
          quantity: '1 cup',
          calories: 220,
          protein: 5,
          carbs: 45,
          fat: 2,
          isFavorite: false,
        },
        {
          id: 'broccoli',
          name: 'Steamed Broccoli',
          quantity: '1 cup',
          calories: 30,
          protein: 2.5,
          carbs: 6,
          fat: 0,
          isFavorite: false,
        },
      ],
    },
  ])
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: '',
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])
  // Generate week days for the calendar
  const getWeekDays = () => {
    const days = []
    const day = new Date(currentDate)
    day.setDate(day.getDate() - 3) // Start 3 days before
    for (let i = 0; i < 7; i++) {
      days.push(new Date(day))
      day.setDate(day.getDate() + 1)
    }
    return days
  }
  const weekDays = getWeekDays()
  const formatDay = (date: Date) => {
    return date
      .toLocaleDateString('en-US', {
        weekday: 'short',
      })
      .charAt(0)
  }
  const formatDate = (date: Date) => {
    return date.getDate().toString()
  }
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7 * direction)
    setCurrentDate(newDate)
  }
  const handleDateSelect = (day: Date) => {
    setIsLoading(true)
    setSelectedDate(day)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-20">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-50"
              initial={{
                y: 50,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 50,
                opacity: 0,
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-gray-600">Track your nutrition journey</p>
        </div>

        {/* Calendar Navigation */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={() => navigateWeek(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              whileTap={{
                scale: 0.9,
              }}
            >
              <ChevronLeftIcon size={20} className="text-gray-700" />
            </motion.button>
            <div className="flex items-center">
              <CalendarIcon size={16} className="text-[#320DFF] mr-2" />
              <span className="font-medium">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <motion.button
              onClick={() => navigateWeek(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              whileTap={{
                scale: 0.9,
              }}
            >
              <ChevronRightIcon size={20} className="text-gray-700" />
            </motion.button>
          </div>

          {/* Week Day Selector */}
          <div className="flex justify-between">
            {weekDays.map((day, index) => (
              <motion.button
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`flex flex-col items-center w-10 py-2 rounded-full ${isSelected(day) ? 'bg-[#320DFF] text-white' : isToday(day) ? 'bg-[#320DFF]/10 text-[#320DFF]' : 'text-gray-700'}`}
                whileHover={
                  !isSelected(day)
                    ? {
                        scale: 1.05,
                      }
                    : {}
                }
                whileTap={{
                  scale: 0.95,
                }}
              >
                <span className="text-xs font-medium">{formatDay(day)}</span>
                <span className="text-sm font-semibold mt-1">
                  {formatDate(day)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Daily Summary */}
        <motion.div
          className="px-4 mb-6"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: isLoading ? 0.5 : 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">Daily Summary</h2>
              <span className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Calories Consumed</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">
                    {dailySummary.totalCalories}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    / {dailySummary.goalCalories}
                  </span>
                </div>
              </div>
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-[#320DFF] flex items-center justify-center"
                initial={{
                  rotate: -90,
                }}
                animate={{
                  rotate: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              >
                <span className="font-bold text-lg">
                  {Math.round(
                    (dailySummary.totalCalories / dailySummary.goalCalories) *
                      100,
                  )}
                  %
                </span>
              </motion.div>
            </div>
            {/* Macros */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(dailySummary.macros).map(
                ([key, macro], index) => (
                  <div
                    key={key}
                    className="bg-white rounded-lg p-2 text-center"
                  >
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="font-medium">{macro.consumed}g</p>
                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className={`h-full ${key === 'carbs' ? 'bg-[#FFA726]' : key === 'protein' ? 'bg-[#42A5F5]' : 'bg-[#66BB6A]'}`}
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${macro.percentage}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + index * 0.1,
                        }}
                      ></motion.div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </motion.div>

        {/* Meals List */}
        <div className="px-4">
          <h2 className="font-semibold mb-3">Meals</h2>
          <div className="space-y-3">
            {isLoading
              ? // Skeleton loading
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 animate-pulse h-20 rounded-xl"
                    ></div>
                  ))
              : meals.map((meal, index) => (
                  <motion.div
                    key={meal.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1,
                    }}
                  >
                    <div
                      onClick={() =>
                        onViewMeal &&
                        onViewMeal({
                          ...meal,
                          isFavorite: meal.isFavorite,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <MealCard meal={meal} />
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/InsightsScreen.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import {
  LineChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertCircleIcon,
  BarChart3Icon,
  ChevronRightIcon,
} from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface InsightsScreenProps {
  onViewInsight?: (insight: any) => void
}
export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  onViewInsight,
}) => {
  // Sample insights data
  const insights = [
    {
      id: 1,
      title: 'Protein Intake Trend',
      description:
        'Your protein intake has been consistently above your goal this week. Great job maintaining your muscle mass!',
      type: 'positive',
      icon: TrendingUpIcon,
      color: '#66BB6A',
      date: '1 day ago',
      chart: 'line',
      data: [65, 75, 80, 95, 85, 90, 95],
    },
    {
      id: 2,
      title: 'Carbs Below Target',
      description:
        'Your carbohydrate intake has been below your target for 3 days. This might affect your energy levels during workouts.',
      type: 'warning',
      icon: TrendingDownIcon,
      color: '#FFA726',
      date: '2 days ago',
      chart: 'line',
      data: [120, 110, 90, 85, 80, 75, 70],
    },
    {
      id: 3,
      title: 'Calorie Consistency',
      description:
        'You have maintained a consistent calorie intake within 10% of your goal for the past week, which is ideal for steady progress.',
      icon: BarChart3Icon,
      color: '#42A5F5',
      date: '3 days ago',
      chart: 'bar',
      data: [1850, 1950, 2050, 1900, 2000, 1950, 2100],
    },
  ]
  // Weekly summary data with trends
  const weeklyData = {
    calories: {
      average: 1950,
      target: 2000,
      percentage: 98,
      trend: -2,
      dailyData: [1850, 1950, 2050, 1900, 2000, 1950, 2100],
      previousWeekData: [1900, 2000, 2100, 1950, 2050, 2000, 2150],
    },
    protein: {
      average: 145,
      target: 150,
      percentage: 97,
      trend: 5,
      dailyData: [135, 142, 150, 148, 140, 152, 148],
      previousWeekData: [130, 135, 142, 140, 135, 145, 140],
    },
    carbs: {
      average: 210,
      target: 250,
      percentage: 84,
      trend: -8,
      dailyData: [230, 220, 200, 190, 210, 205, 215],
      previousWeekData: [250, 240, 220, 210, 225, 220, 230],
    },
    fat: {
      average: 60,
      target: 65,
      percentage: 92,
      trend: 3,
      dailyData: [58, 62, 65, 59, 57, 62, 57],
      previousWeekData: [55, 60, 63, 58, 55, 60, 55],
    },
  }
  // Days of the week for the charts
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  // Placeholder for simple line chart - fixed to remove blank white space
  const SimpleLineChart = ({
    data,
    color,
  }: {
    data: number[]
    color: string
  }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min
    // Return a more compact visualization that doesn't take up unnecessary space
    return (
      <div className="flex items-end h-5 mt-1">
        {data.map((value, index) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50
          return (
            <div key={index} className="flex-1 flex justify-center">
              <div
                className="w-3/4 rounded-sm"
                style={{
                  height: `${Math.max(5, height)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          )
        })}
      </div>
    )
  }
  // Placeholder for simple bar chart
  const SimpleBarChart = ({
    data,
    previousData,
    color,
    labels,
    showComparison = false,
  }: {
    data: number[]
    previousData?: number[]
    color: string
    labels?: string[]
    showComparison?: boolean
  }) => {
    const allData = [...data]
    if (previousData) {
      allData.push(...previousData)
    }
    const max = Math.max(...allData)
    const min = 0 // Starting from zero for bar charts
    const range = max - min
    return (
      <div className="h-32 w-full flex flex-col">
        <div className="flex-1 flex items-end">
          {data.map((value, index) => {
            const height = range > 0 ? ((value - min) / range) * 100 : 0
            const prevValue = previousData ? previousData[index] : 0
            const prevHeight = range > 0 ? ((prevValue - min) / range) * 100 : 0
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="h-full flex items-end w-full justify-center relative">
                  {/* Current week bar */}
                  <motion.div
                    className="w-5/6 rounded-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(5, height)}%`,
                      backgroundColor: color,
                    }}
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: `${Math.max(5, height)}%`,
                    }}
                    transition={{
                      duration: 1,
                      delay: index * 0.1,
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                      {value}
                    </div>
                  </motion.div>
                  {/* Previous week bar (semi-transparent) */}
                  {showComparison && previousData && (
                    <motion.div
                      className="w-5/6 rounded-sm absolute opacity-30"
                      style={{
                        height: `${Math.max(5, prevHeight)}%`,
                        backgroundColor: color,
                        right: 0,
                      }}
                      initial={{
                        height: 0,
                      }}
                      animate={{
                        height: `${Math.max(5, prevHeight)}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: index * 0.1 + 0.5,
                      }}
                    />
                  )}
                </div>
                {labels && (
                  <div className="text-xs text-gray-500 mt-1">
                    {labels[index]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  // Calories Weekly Overview
  const CaloriesWeeklyOverview = () => {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Calories This Week</h2>
          <div className="flex items-center">
            <div
              className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${weeklyData.calories.trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {weeklyData.calories.trend >= 0 ? (
                <TrendingUpIcon size={12} className="mr-0.5" />
              ) : (
                <TrendingDownIcon size={12} className="mr-0.5" />
              )}
              <span>{Math.abs(weeklyData.calories.trend)}% from last week</span>
            </div>
          </div>
        </div>
        <SimpleBarChart
          data={weeklyData.calories.dailyData}
          previousData={weeklyData.calories.previousWeekData}
          color="#320DFF"
          labels={daysOfWeek}
          showComparison={true}
        />
        <div className="flex justify-center mt-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 mr-1 bg-[#320DFF]"></div>
            <span className="text-xs text-gray-700">This Week</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-[#320DFF] opacity-30"></div>
            <span className="text-xs text-gray-700">Last Week</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="font-medium">{weeklyData.calories.average} cal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Target</p>
            <p className="font-medium">{weeklyData.calories.target} cal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion</p>
            <p className="font-medium">{weeklyData.calories.percentage}%</p>
          </div>
        </div>
      </div>
    )
  }
  // Macronutrient Bar
  const MacronutrientBar = ({
    name,
    data,
    color,
    percentage,
  }: {
    name: string
    data: number[]
    color: string
    percentage: number
  }) => {
    const trend =
      name === 'Protein'
        ? weeklyData.protein.trend
        : name === 'Carbs'
          ? weeklyData.carbs.trend
          : weeklyData.fat.trend
    return (
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-1">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">{name}</span>
            <div
              className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {trend >= 0 ? (
                <TrendingUpIcon size={12} className="mr-0.5" />
              ) : (
                <TrendingDownIcon size={12} className="mr-0.5" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          </div>
          <span className="font-medium">
            {name === 'Protein'
              ? `${weeklyData.protein.average} / ${weeklyData.protein.target}g`
              : name === 'Carbs'
                ? `${weeklyData.carbs.average} / ${weeklyData.carbs.target}g`
                : `${weeklyData.fat.average} / ${weeklyData.fat.target}g`}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full"
            style={{
              backgroundColor: color,
            }}
            initial={{
              width: 0,
            }}
            animate={{
              width: `${percentage}%`,
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
            }}
          ></motion.div>
        </div>
        <div className="h-20 w-full flex items-end">
          {data.map((value, index) => {
            const max = Math.max(...data)
            const barHeight = (value / max) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center mb-1">
                  <motion.div
                    className="w-5/6 rounded-sm"
                    style={{
                      height: `${Math.max(5, barHeight)}%`,
                      backgroundColor: color,
                    }}
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: `${Math.max(5, barHeight)}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2 + index * 0.05,
                    }}
                  ></motion.div>
                </div>
                <div className="text-xs text-gray-500">{daysOfWeek[index]}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-gray-600">Your nutrition trends and patterns</p>
        </div>
        {/* Calories Weekly Overview */}
        <div className="px-4 mb-6">
          <CaloriesWeeklyOverview />
        </div>
        {/* Weekly Macronutrients Summary */}
        <div className="px-4 mb-6">
          <motion.div
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Macronutrients</h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            {/* Protein */}
            <MacronutrientBar
              name="Protein"
              data={weeklyData.protein.dailyData}
              color="#42A5F5"
              percentage={weeklyData.protein.percentage}
            />
            {/* Carbs */}
            <MacronutrientBar
              name="Carbs"
              data={weeklyData.carbs.dailyData}
              color="#FFA726"
              percentage={weeklyData.carbs.percentage}
            />
            {/* Fat */}
            <MacronutrientBar
              name="Fat"
              data={weeklyData.fat.dailyData}
              color="#66BB6A"
              percentage={weeklyData.fat.percentage}
            />
          </motion.div>
        </div>
        {/* Insights */}
        <div className="px-4 pb-28">
          <h2 className="font-semibold mb-3">Personal Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                }}
                onClick={() => onViewInsight && onViewInsight(insight)}
              >
                <div className="flex items-start">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                    style={{
                      backgroundColor: `${insight.color}15`,
                    }}
                  >
                    <insight.icon
                      size={20}
                      style={{
                        color: insight.color,
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <span className="text-xs text-gray-500">
                        {insight.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/ProfileScreen.tsx
import React from 'react'
import {
  User2Icon,
  LogOutIcon,
  CreditCardIcon,
  SettingsIcon,
  HelpCircleIcon,
  BellIcon,
  HeartIcon,
  TargetIcon,
  CalendarIcon,
  LockIcon,
  ChevronRightIcon,
  StarIcon,
  ZapIcon,
  TrophyIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Avatar } from '../ui/Avatar'
import { hapticFeedback } from '../../utils/haptics'
import { Berry } from '../ui/Berry'
interface ProfileScreenProps {
  onNavigate?: (screen: string, params: any) => void
}
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const handleNavigate = (screen: string) => {
    hapticFeedback.selection()
    if (onNavigate) {
      onNavigate(screen, {})
    }
  }
  // Sample streak data
  const streakData = {
    current: 7,
    max: 21,
  }
  const menuItems = [
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          icon: User2Icon,
          screen: 'personal-info',
        },
        {
          id: 'payment-method',
          title: 'Payment Methods',
          icon: CreditCardIcon,
          screen: 'payment-method',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: BellIcon,
          screen: 'notifications',
          badge: 3,
        },
        {
          id: 'favorites',
          title: 'Favorites',
          icon: HeartIcon,
          screen: 'favorites',
        },
      ],
    },
    {
      id: 'goals',
      title: 'Goals & Progress',
      items: [
        {
          id: 'goals-progress',
          title: 'Goals & Progress',
          icon: TargetIcon,
          screen: 'goals-progress',
        },
        {
          id: 'history',
          title: 'History',
          icon: CalendarIcon,
          screen: 'history',
        },
      ],
    },
    {
      id: 'app',
      title: 'App Settings',
      items: [
        {
          id: 'subscription',
          title: 'Subscription',
          icon: StarIcon,
          screen: 'subscription-management',
          badge: 'PRO',
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: SettingsIcon,
          screen: 'settings',
        },
        {
          id: 'help-support',
          title: 'Help & Support',
          icon: HelpCircleIcon,
          screen: 'help-support',
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          icon: LockIcon,
          screen: 'privacy',
        },
      ],
    },
  ]
  const handleUpgrade = () => {
    hapticFeedback.selection()
    if (onNavigate) {
      onNavigate('upgrade', {})
    }
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-20">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center mb-6">
            <Avatar
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              size="large"
            />
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Alex Johnson
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                alex.johnson@example.com
              </p>
            </div>
            <motion.button
              className="px-3 py-1 bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 rounded-full text-[#320DFF] dark:text-[#6D56FF] text-xs font-medium flex items-center"
              onClick={handleUpgrade}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <StarIcon size={12} className="mr-1" />
              Upgrade
            </motion.button>
          </div>

          {/* Streak indicators */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Berry variant="streak" size="tiny" className="mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Your Streaks
                </h3>
              </div>
              <motion.button
                className="text-xs text-[#320DFF] dark:text-[#6D56FF]"
                onClick={() => handleNavigate('goals-progress')}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                View Details
              </motion.button>
            </div>
            <div className="flex mt-3 space-x-4">
              <div className="flex-1 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <ZapIcon
                    size={14}
                    className="text-[#320DFF] dark:text-[#6D56FF] mr-1"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Current Streak
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {streakData.current}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                    days
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <TrophyIcon
                    size={14}
                    className="text-[#320DFF] dark:text-[#6D56FF] mr-1"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Max Streak
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {streakData.max}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {menuItems.map((section) => (
              <div key={section.id}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {section.title}
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {section.items.map((item) => (
                    <motion.button
                      key={item.id}
                      className="flex items-center justify-between w-full p-4 text-left"
                      onClick={() => handleNavigate(item.screen)}
                      whileHover={{
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <item.icon
                            size={18}
                            className="text-gray-600 dark:text-gray-400"
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {item.badge && (
                          <div
                            className={`mr-2 px-2 py-0.5 rounded-full text-xs font-medium ${typeof item.badge === 'number' ? 'bg-red-500 text-white' : 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 text-[#320DFF] dark:text-[#6D56FF]'}`}
                          >
                            {item.badge}
                          </div>
                        )}
                        <ChevronRightIcon
                          size={18}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <motion.button
            className="flex items-center justify-center w-full mt-8 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400"
            onClick={() => handleNavigate('delete-account')}
            whileHover={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <LogOutIcon size={18} className="mr-2" />
            <span className="font-medium">Log Out</span>
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/onboarding/OnboardingCarousel.tsx
import React, { useState } from 'react'
import { ChevronRightIcon, ChevronLeftIcon, XIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface OnboardingCarouselProps {
  onComplete: () => void
  onSkip: () => void
}
export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      title: 'Just Take a Photo',
      description:
        'Our AI instantly identifies your meals and calculates nutrition',
      illustration: (
        <div className="w-full h-72 flex items-center justify-center bg-[#320DFF]/5 rounded-3xl mb-8">
          <img
            src="https://uploadthingy.s3.us-west-1.amazonaws.com/5agjJKyAgw4Y2iaehW8JW7/berry_taking_picture.png"
            alt="Camera food logging"
            className="h-full w-full rounded-2xl object-contain shadow-lg"
          />
        </div>
      ),
    },
    {
      title: 'Log Your Way',
      description: 'Snap, speak, scan, or search - whatever works for you',
      illustration: (
        <div className="w-full h-72 flex items-center justify-center bg-[#320DFF]/5 rounded-3xl mb-8">
          <img
            src="https://uploadthingy.s3.us-west-1.amazonaws.com/wkhLe6s8ayzoyvYbskVfnc/berry_using_voicetext.png"
            alt="Multiple logging methods"
            className="h-full w-full rounded-2xl object-contain shadow-lg"
          />
        </div>
      ),
    },
    {
      title: 'Reach Your Goals',
      description: 'Get personalized insights and celebrate your progress',
      illustration: (
        <div className="w-full h-72 flex items-center justify-center bg-[#320DFF]/5 rounded-3xl mb-8">
          <img
            src="https://uploadthingy.s3.us-west-1.amazonaws.com/nRZ7prdLnEv1TvqoNesFQP/Download_berry_goals_whiteeyes.png"
            alt="Progress tracking"
            className="h-full w-full rounded-2xl object-contain shadow-lg"
          />
        </div>
      ),
    },
  ]
  const handleNext = () => {
    hapticFeedback.selection()
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      hapticFeedback.impact()
      onComplete()
    }
  }
  const handlePrev = () => {
    hapticFeedback.selection()
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }
  const handleSkip = () => {
    hapticFeedback.selection()
    onSkip()
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        {currentSlide > 0 ? (
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={handlePrev}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ChevronLeftIcon size={20} />
          </motion.button>
        ) : (
          <div className="w-10"></div>
        )}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full ${index === currentSlide ? 'bg-[#320DFF]' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
        <motion.button
          className="text-sm text-gray-500 font-medium px-3 py-1 rounded-full hover:bg-gray-100"
          onClick={handleSkip}
          whileTap={{
            scale: 0.95,
          }}
        >
          Skip
        </motion.button>
      </div>
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
            transition={{
              duration: 0.3,
            }}
            className="flex-1 flex flex-col"
          >
            {slides[currentSlide].illustration}
            <h1 className="text-3xl font-bold mb-3 text-center">
              {slides[currentSlide].title}
            </h1>
            <p className="text-center text-gray-600 text-lg mb-12">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center items-center">
        <motion.button
          className="w-16 h-16 rounded-full bg-[#320DFF] flex items-center justify-center shadow-lg"
          onClick={handleNext}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ChevronRightIcon size={28} color="white" />
        </motion.button>
      </div>
    </div>
  )
}

```
```components/onboarding/AuthScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface AuthScreenProps {
  mode: 'signup' | 'signin'
  onBack: () => void
  onComplete: () => void
  onToggleMode: () => void
}
export const AuthScreen: React.FC<AuthScreenProps> = ({
  mode,
  onBack,
  onComplete,
  onToggleMode,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSignUp = mode === 'signup'
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      hapticFeedback.success()
      onComplete()
    }, 1500)
  }
  const handleSocialSignIn = (provider: string) => {
    hapticFeedback.selection()
    // Simulate social sign in
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onComplete()
    }, 1000)
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-8">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
        {isSignUp && (
          <div className="ml-4 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-[#320DFF]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>
        )}
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600 text-lg">
          {isSignUp ? 'Start your nutrition journey' : 'Sign in to continue'}
        </p>
      </div>
      <div className="space-y-4 mb-6">
        <motion.button
          className="w-full h-14 border border-gray-300 rounded-full flex items-center justify-center space-x-2 bg-black text-white"
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() => handleSocialSignIn('apple')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.5 12.5C17.5 8.5 14 5.5 9.5 5.5C5 5.5 1 8.5 1 13C1 17 4 20.5 8.5 20.5C10.5 20.5 12 20 13.5 19C14.5 20 16 21.5 17.5 22C17 20.5 17 19.5 17 18.5C17.5 17 17.5 15 17.5 12.5Z"
              fill="white"
            />
          </svg>
          <span>Continue with Apple</span>
        </motion.button>
        <motion.button
          className="w-full h-14 border border-gray-300 rounded-full flex items-center justify-center space-x-2"
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() => handleSocialSignIn('google')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
              fill="#FFC107"
            />
            <path
              d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z"
              fill="#FF3D00"
            />
            <path
              d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
              fill="#4CAF50"
            />
            <path
              d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
              fill="#1976D2"
            />
          </svg>
          <span className="text-gray-800">Continue with Google</span>
        </motion.button>
      </div>
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="px-4 text-sm text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 mb-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MailIcon size={18} className="text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
              required
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            {!isSignUp && (
              <button
                type="button"
                className="text-sm text-[#320DFF]"
                onClick={() => {
                  hapticFeedback.selection()
                  // Handle forgot password
                }}
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockIcon size={18} className="text-gray-500" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                isSignUp ? 'Create a password' : 'Enter your password'
              }
              className="w-full h-14 pl-12 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => {
                hapticFeedback.selection()
                setShowPassword(!showPassword)
              }}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          {isSignUp && (
            <div className="mt-2 text-xs text-gray-500">
              Password must be at least 8 characters
            </div>
          )}
        </div>
        {isSignUp && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon size={18} className="text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                required
              />
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          loading={loading}
        >
          {loading
            ? isSignUp
              ? 'Creating Account...'
              : 'Signing In...'
            : isSignUp
              ? 'Create Account'
              : 'Sign In'}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <motion.button
            className="ml-1 text-[#320DFF] font-medium"
            onClick={() => {
              hapticFeedback.selection()
              onToggleMode()
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </p>
      </div>
      {isSignUp && (
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-[#320DFF]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#320DFF]">
            Privacy Policy
          </a>
        </p>
      )}
    </div>
  )
}

```
```components/onboarding/PersonalInfoScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
interface PersonalInfoScreenProps {
  onBack: () => void
  onNext: () => void
  onSkip: () => void
}
export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  onBack,
  onNext,
  onSkip,
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | ''>('')
  const [height, setHeight] = useState({
    feet: '',
    inches: '',
  })
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
        >
          <ArrowLeftIcon size={20} />
        </button>
        <button className="text-sm text-gray-500" onClick={onSkip}>
          Skip
        </button>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: '20%',
          }}
        ></div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Let's Get to Know You</h1>
        <p className="text-gray-600">
          This helps us personalize your experience
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name (optional)"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birthday
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Helps calculate your calorie needs
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biological Sex
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`flex-1 h-12 rounded-lg border ${sex === 'male' ? 'border-[#320DFF] bg-[#320DFF]/5 text-[#320DFF]' : 'border-gray-300 text-gray-700'}`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`flex-1 h-12 rounded-lg border ${sex === 'female' ? 'border-[#320DFF] bg-[#320DFF]/5 text-[#320DFF]' : 'border-gray-300 text-gray-700'}`}
            >
              Female
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Used for metabolic calculations
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                value={height.feet}
                onChange={(e) =>
                  setHeight({
                    ...height,
                    feet: e.target.value,
                  })
                }
                placeholder="Feet"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                required
              />
            </div>
            <div>
              <input
                type="number"
                value={height.inches}
                onChange={(e) =>
                  setHeight({
                    ...height,
                    inches: e.target.value,
                  })
                }
                placeholder="Inches"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                required
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Weight
          </label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                required
              />
            </div>
            <div className="w-24">
              <div className="flex h-12 rounded-lg overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => setWeightUnit('lbs')}
                  className={`flex-1 flex items-center justify-center ${weightUnit === 'lbs' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}
                >
                  lbs
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`flex-1 flex items-center justify-center ${weightUnit === 'kg' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Button onClick={onNext} variant="primary" fullWidth>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

```
```components/onboarding/ActivityLevelScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface ActivityLevelScreenProps {
  onBack: () => void
  onNext: (activityLevel: string) => void
  progress: number
}
export const ActivityLevelScreen: React.FC<ActivityLevelScreenProps> = ({
  onBack,
  onNext,
  progress,
}) => {
  const [selectedLevel, setSelectedLevel] = useState('')
  const activityLevels = [
    {
      id: 'sedentary',
      label: 'Sedentary',
      description: 'Little to no exercise',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: 'light',
      label: 'Lightly Active',
      description: 'Exercise 1-3 days/week',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 16L19 19M18 12H22M16 8L19 5M12 6V2M8 8L5 5M6 12H2M8 16L5 19M12 18V22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'moderate',
      label: 'Moderately Active',
      description: 'Exercise 3-5 days/week',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5 4.5C14.5 5.88071 13.3807 7 12 7C10.6193 7 9.5 5.88071 9.5 4.5C9.5 3.11929 10.6193 2 12 2C13.3807 2 14.5 3.11929 14.5 4.5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 8L4 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19.5 11.5L4.5 11.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19 15L5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18 18.5L6 18.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 22L8 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: 'active',
      label: 'Very Active',
      description: 'Exercise 6-7 days/week',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 14.5C7.5 14.5 8.33333 13 10 13C11.6667 13 12.5 14.5 12.5 14.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 7L12 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 20C18.7614 20 21 17.7614 21 15C21 12.2386 18.7614 10 16 10C15.9666 10 15.9334 10.0003 15.9002 10.0009C15.4373 7.7605 13.4193 6 11 6C9.11389 6 7.51485 7.06741 6.73929 8.66458C6.49618 8.6224 6.24949 8.6 6 8.6C3.79086 8.6 2 10.3909 2 12.6C2 14.8091 3.79086 16.6 6 16.6C6.37485 16.6 6.73999 16.5482 7.08826 16.4518"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: 'very-active',
      label: 'Extremely Active',
      description: 'Very intense exercise daily',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5355 8.46447L17.6569 6.34315M8.46447 15.5355L6.34315 17.6569M12 5V2M5 12H2M19 12H22M12 19V22M17.6569 17.6569L15.5355 15.5355M6.34315 6.34315L8.46447 8.46447"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
  ]
  const handleSelect = (level: string) => {
    hapticFeedback.selection()
    setSelectedLevel(level)
  }
  const handleContinue = () => {
    if (selectedLevel) {
      onNext(selectedLevel)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">How active are you?</h1>
        <p className="text-gray-600 text-lg">
          This helps us calculate your daily calorie needs
        </p>
      </div>
      <div className="space-y-4 mb-8">
        {activityLevels.map((level) => (
          <motion.button
            key={level.id}
            className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedLevel === level.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
            onClick={() => handleSelect(level.id)}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedLevel === level.id ? 'bg-[#320DFF]/20' : 'bg-gray-100'}`}
            >
              <div
                className={
                  selectedLevel === level.id
                    ? 'text-[#320DFF]'
                    : 'text-gray-500'
                }
              >
                {level.icon}
              </div>
            </div>
            <div className="text-left">
              <div className="text-lg font-medium">{level.label}</div>
              <div className="text-sm text-gray-600">{level.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          variant="primary"
          fullWidth
          disabled={!selectedLevel}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/GoalsScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  TrendingDownIcon,
  ScaleIcon,
  ActivityIcon,
} from 'lucide-react'
import { Button } from '../ui/Button'
interface GoalsScreenProps {
  onBack: () => void
  onNext: () => void
}
export const GoalsScreen: React.FC<GoalsScreenProps> = ({ onBack, onNext }) => {
  const [goal, setGoal] = useState<string | null>(null)
  const [targetWeight, setTargetWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const [rate, setRate] = useState<'slow' | 'moderate' | 'fast'>('moderate')
  const goals = [
    {
      id: 'lose',
      name: 'Lose Weight',
      description: 'Create a calorie deficit',
      icon: TrendingDownIcon,
      color: '#FF5252',
    },
    {
      id: 'maintain',
      name: 'Maintain Weight',
      description: 'Stay at current weight',
      icon: ScaleIcon,
      color: '#FFC107',
    },
    {
      id: 'gain',
      name: 'Gain Muscle',
      description: 'Build lean mass',
      icon: ActivityIcon,
      color: '#4CAF50',
    },
  ]
  const rateOptions = {
    slow: {
      label: 'Gradual',
      value: '0.5 lb/week',
      description: 'Slower but sustainable',
    },
    moderate: {
      label: 'Moderate',
      value: '1 lb/week',
      description: 'Balanced approach',
    },
    fast: {
      label: 'Ambitious',
      value: '2 lbs/week',
      description: 'Faster results, more effort',
    },
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-4">
        <button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
        >
          <ArrowLeftIcon size={20} />
        </button>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: '60%',
          }}
        ></div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">What's Your Goal?</h1>
        <p className="text-gray-600">We'll help you get there</p>
      </div>
      <div className="space-y-4 mb-6">
        {goals.map((item) => (
          <button
            key={item.id}
            onClick={() => setGoal(item.id)}
            className={`w-full flex items-center p-4 rounded-xl border ${goal === item.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{
                backgroundColor: `${item.color}20`,
              }}
            >
              <item.icon size={24} color={item.color} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
      {goal === 'lose' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weight
            </label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="Target weight"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                />
              </div>
              <div className="w-24">
                <div className="flex h-12 rounded-lg overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`flex-1 flex items-center justify-center ${weightUnit === 'lbs' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}
                  >
                    lbs
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`flex-1 flex items-center justify-center ${weightUnit === 'kg' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}
                  >
                    kg
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Rate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'moderate', 'fast'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRate(option)}
                  className={`p-3 rounded-lg border ${rate === option ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
                >
                  <div className="text-center">
                    <p className="font-medium text-sm">
                      {rateOptions[option].label}
                    </p>
                    <p className="text-xs text-[#320DFF] font-medium">
                      {rateOptions[option].value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {rateOptions[option].description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#320DFF]/5 p-3 rounded-lg">
            <p className="text-sm">
              At this rate, you'll reach your goal in approximately{' '}
              <span className="font-medium">12 weeks</span>.
            </p>
          </div>
        </div>
      )}
      <div className="mt-auto pt-4">
        <Button
          onClick={onNext}
          variant="primary"
          fullWidth
          disabled={!goal || (goal === 'lose' && !targetWeight)}
        >
          {goal ? 'Set My Goal' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/DietaryPreferencesScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  Salad,
  Fish,
  Leaf,
  Drumstick,
  Apple,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface DietaryPreferencesScreenProps {
  onBack: () => void
  onNext: (diet: string) => void
  progress: number
}
export const DietaryPreferencesScreen: React.FC<
  DietaryPreferencesScreenProps
> = ({ onBack, onNext, progress }) => {
  const [selectedDiet, setSelectedDiet] = useState('')
  const diets = [
    {
      id: 'no-restrictions',
      label: 'No Restrictions',
      description: 'Standard balanced diet',
      icon: <Apple size={24} />,
    },
    {
      id: 'vegetarian',
      label: 'Vegetarian',
      description: 'No meat, fish allowed',
      icon: <Salad size={24} />,
    },
    {
      id: 'vegan',
      label: 'Vegan',
      description: 'No animal products',
      icon: <Leaf size={24} />,
    },
    {
      id: 'pescatarian',
      label: 'Pescatarian',
      description: 'Vegetarian + seafood',
      icon: <Fish size={24} />,
    },
    {
      id: 'keto',
      label: 'Keto',
      description: 'Low carb, high fat',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.06 4.75L17.31 3.97C17.21 3.87 17.09 3.8 16.96 3.77L15.53 3.45C15.4 3.42 15.28 3.43 15.16 3.47L13.82 3.92C13.7 3.96 13.59 4.03 13.51 4.12L12.94 4.74C12.86 4.83 12.8 4.93 12.77 5.05L12.51 6.13C12.48 6.24 12.48 6.36 12.51 6.48L12.77 7.57C12.8 7.68 12.86 7.79 12.94 7.87L13.51 8.5C13.59 8.59 13.7 8.66 13.82 8.7L15.16 9.15C15.28 9.19 15.4 9.2 15.53 9.17L16.96 8.85C17.09 8.82 17.21 8.75 17.31 8.65L18.06 7.87C18.15 7.77 18.22 7.65 18.25 7.51L18.5 6.31C18.53 6.18 18.53 6.04 18.5 5.91L18.25 4.71C18.22 4.57 18.15 4.45 18.06 4.35V4.75Z"
            fill="currentColor"
          />
          <path
            d="M11.94 11.76L11.19 10.98C11.09 10.88 10.97 10.81 10.84 10.78L9.41 10.46C9.28 10.43 9.16 10.44 9.04 10.48L7.7 10.93C7.58 10.97 7.47 11.04 7.39 11.13L6.82 11.75C6.74 11.84 6.68 11.94 6.65 12.06L6.39 13.14C6.36 13.25 6.36 13.37 6.39 13.49L6.65 14.58C6.68 14.69 6.74 14.8 6.82 14.88L7.39 15.51C7.47 15.6 7.58 15.67 7.7 15.71L9.04 16.16C9.16 16.2 9.28 16.21 9.41 16.18L10.84 15.86C10.97 15.83 11.09 15.76 11.19 15.66L11.94 14.88C12.03 14.78 12.1 14.66 12.13 14.52L12.38 13.32C12.41 13.19 12.41 13.05 12.38 12.92L12.13 11.72C12.1 11.58 12.03 11.46 11.94 11.36V11.76Z"
            fill="currentColor"
          />
          <path
            d="M18.06 11.76L17.31 10.98C17.21 10.88 17.09 10.81 16.96 10.78L15.53 10.46C15.4 10.43 15.28 10.44 15.16 10.48L13.82 10.93C13.7 10.97 13.59 11.04 13.51 11.13L12.94 11.75C12.86 11.84 12.8 11.94 12.77 12.06L12.51 13.14C12.48 13.25 12.48 13.37 12.51 13.49L12.77 14.58C12.8 14.69 12.86 14.8 12.94 14.88L13.51 15.51C13.59 15.6 13.7 15.67 13.82 15.71L15.16 16.16C15.28 16.2 15.4 16.21 15.53 16.18L16.96 15.86C17.09 15.83 17.21 15.76 17.31 15.66L18.06 14.88C18.15 14.78 18.22 14.66 18.25 14.52L18.5 13.32C18.53 13.19 18.53 13.05 18.5 12.92L18.25 11.72C18.22 11.58 18.15 11.46 18.06 11.36V11.76Z"
            fill="currentColor"
          />
          <path
            d="M11.94 18.77L11.19 17.99C11.09 17.89 10.97 17.82 10.84 17.79L9.41 17.47C9.28 17.44 9.16 17.45 9.04 17.49L7.7 17.94C7.58 17.98 7.47 18.05 7.39 18.14L6.82 18.76C6.74 18.85 6.68 18.95 6.65 19.07L6.39 20.15C6.36 20.26 6.36 20.38 6.39 20.5L6.65 21.59C6.68 21.7 6.74 21.81 6.82 21.89L7.39 22.52C7.47 22.61 7.58 22.68 7.7 22.72L9.04 23.17C9.16 23.21 9.28 23.22 9.41 23.19L10.84 22.87C10.97 22.84 11.09 22.77 11.19 22.67L11.94 21.89C12.03 21.79 12.1 21.67 12.13 21.53L12.38 20.33C12.41 20.2 12.41 20.06 12.38 19.93L12.13 18.73C12.1 18.59 12.03 18.47 11.94 18.37V18.77Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: 'paleo',
      label: 'Paleo',
      description: 'Whole foods based diet',
      icon: <Drumstick size={24} />,
    },
  ]
  const handleSelect = (diet: string) => {
    hapticFeedback.selection()
    setSelectedDiet(diet)
  }
  const handleContinue = () => {
    if (selectedDiet) {
      onNext(selectedDiet)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Do you follow a specific diet?
        </h1>
        <p className="text-gray-600 text-lg">
          We'll customize your meal recommendations
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {diets.map((diet) => (
          <motion.button
            key={diet.id}
            className={`flex flex-col items-center p-5 rounded-2xl border-2 ${selectedDiet === diet.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
            onClick={() => handleSelect(diet.id)}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div
              className={`mb-2 ${selectedDiet === diet.id ? 'text-[#320DFF]' : 'text-gray-500'}`}
            >
              {diet.icon}
            </div>
            <div className="text-lg font-medium">{diet.label}</div>
            <div className="text-xs text-gray-600 text-center">
              {diet.description}
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          variant="primary"
          fullWidth
          disabled={!selectedDiet}
        >
          Continue
        </Button>
        <p className="text-center text-gray-500 text-sm mt-2">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  )
}

```
```components/onboarding/MacroTargetsScreen.tsx
import React, { useEffect, useState } from 'react'
import { ArrowLeftIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
interface MacroTargetsScreenProps {
  onBack: () => void
  onComplete: () => void
  userData?: any
  progress: number
}
export const MacroTargetsScreen: React.FC<MacroTargetsScreenProps> = ({
  onBack,
  onComplete,
  userData,
  progress,
}) => {
  const [calories, setCalories] = useState(2000)
  const [macros, setMacros] = useState({
    carbs: 50,
    protein: 30,
    fat: 20,
  })
  const [originalMacros, setOriginalMacros] = useState({
    carbs: 50,
    protein: 30,
    fat: 20,
  })
  const [originalCalories, setOriginalCalories] = useState(2000)
  const [isEditing, setIsEditing] = useState(false)
  useEffect(() => {
    // Calculate calories based on user data if available
    if (userData) {
      // This is a simplified calculation
      let baseCalories = 0
      // Base metabolic rate calculation (simplified)
      if (userData.gender === 'male') {
        baseCalories = 1800
      } else {
        baseCalories = 1600
      }
      // Adjust for activity level
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
      }
      const activityLevel = userData.activityLevel || 'moderate'
      baseCalories *=
        activityMultipliers[activityLevel as keyof typeof activityMultipliers]
      // Adjust for goal
      if (userData.goal === 'lose') {
        baseCalories *= 0.8 // 20% deficit
      } else if (userData.goal === 'gain') {
        baseCalories *= 1.15 // 15% surplus
      }
      // Round to nearest 50
      const calculatedCalories = Math.round(baseCalories / 50) * 50
      setCalories(calculatedCalories)
      setOriginalCalories(calculatedCalories)
      // Adjust macros based on goal
      let calculatedMacros = {
        carbs: 45,
        protein: 30,
        fat: 25,
      }
      if (userData.goal === 'lose') {
        calculatedMacros = {
          carbs: 40,
          protein: 40,
          fat: 20,
        }
      } else if (userData.goal === 'gain') {
        calculatedMacros = {
          carbs: 50,
          protein: 30,
          fat: 20,
        }
      }
      setMacros(calculatedMacros)
      setOriginalMacros(calculatedMacros)
    }
  }, [userData])
  const handleMacroChange = (macro: string, value: number) => {
    hapticFeedback.selection()
    // Calculate the other macros to ensure they sum to 100%
    const remaining = 100 - value
    const others = Object.keys(macros).filter((m) => m !== macro)
    const currentOthersTotal = others.reduce(
      (sum, m) => sum + macros[m as keyof typeof macros],
      0,
    )
    const newMacros = {
      ...macros,
      [macro]: value,
    }
    others.forEach((m, index) => {
      if (index === others.length - 1) {
        // Last one gets whatever is left to ensure 100%
        newMacros[m as keyof typeof macros] = Math.max(
          0,
          100 -
            (newMacros[macro] + newMacros[others[0] as keyof typeof macros]),
        )
      } else {
        // Distribute proportionally
        const proportion = macros[m as keyof typeof macros] / currentOthersTotal
        newMacros[m as keyof typeof macros] = Math.round(remaining * proportion)
      }
    })
    setMacros(newMacros)
  }
  const handleCaloriesChange = (newCalories: number) => {
    hapticFeedback.selection()
    setCalories(newCalories)
  }
  const handleContinue = () => {
    onComplete()
  }
  const toggleEditing = () => {
    hapticFeedback.selection()
    setIsEditing(!isEditing)
  }
  const handleRevertChanges = () => {
    hapticFeedback.selection()
    setCalories(originalCalories)
    setMacros(originalMacros)
  }
  // Prepare data for pie chart
  const pieChartData = [
    {
      name: 'Carbs',
      value: macros.carbs,
      color: '#FFC078', // More muted orange
    },
    {
      name: 'Protein',
      value: macros.protein,
      color: '#74C0FC', // More muted blue
    },
    {
      name: 'Fat',
      value: macros.fat,
      color: '#8CE99A', // More muted green
    },
  ]
  // Check if values have been changed from original
  const hasChanges =
    calories !== originalCalories ||
    macros.carbs !== originalMacros.carbs ||
    macros.protein !== originalMacros.protein ||
    macros.fat !== originalMacros.fat
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">
          Your nutrition plan is ready!
        </h1>
        <p className="text-gray-600 text-lg">
          Here's your personalized daily targets
        </p>
      </div>
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Daily Calories</h2>
            <div className="flex items-center">
              {hasChanges && (
                <motion.button
                  className="text-sm text-gray-500 font-medium mr-3 flex items-center"
                  onClick={handleRevertChanges}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                >
                  <RotateCcwIcon size={14} className="mr-1" />
                  Reset
                </motion.button>
              )}
              {isEditing ? (
                <button
                  className="text-sm text-[#320DFF] font-medium"
                  onClick={toggleEditing}
                >
                  Done
                </button>
              ) : (
                <button
                  className="text-sm text-[#320DFF] font-medium"
                  onClick={toggleEditing}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="bg-gray-100 p-4 rounded-xl">
              <input
                type="range"
                min="1200"
                max="3000"
                step="50"
                value={calories}
                onChange={(e) => handleCaloriesChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #320DFF ${(calories - 1200) / 18}%, #e5e7eb ${(calories - 1200) / 18}%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">1200</span>
                <span className="text-lg font-bold text-[#320DFF]">
                  {calories}
                </span>
                <span className="text-sm text-gray-600">3000</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#320DFF]/10 p-6 rounded-xl flex justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#320DFF]">{calories}</p>
                <p className="text-sm text-gray-600">calories per day</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-medium mb-4">Macronutrient Balance</h2>
          {/* Pie Chart with more spacing */}
          <div className="h-56 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                margin={{
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: 10,
                }}
              >
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={200}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value, entry, index) => {
                    const item = pieChartData[index]
                    return `${value}: ${item.value}%`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {Object.entries(macros).map(([macro, percentage]) => (
              <div key={macro} className="space-y-1">
                <div className="flex justify-between">
                  <p className="text-gray-700 capitalize">{macro}</p>
                  <p className="font-medium">{percentage}%</p>
                </div>
                {isEditing ? (
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={percentage}
                    onChange={(e) =>
                      handleMacroChange(macro, parseInt(e.target.value))
                    }
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${macro === 'carbs' ? 'bg-[#FFC078]' : macro === 'protein' ? 'bg-[#74C0FC]' : 'bg-[#8CE99A]'}`}
                  />
                ) : (
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${macro === 'carbs' ? 'bg-[#FFC078]' : macro === 'protein' ? 'bg-[#74C0FC]' : 'bg-[#8CE99A]'}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                )}
                <p className="text-xs text-gray-600">
                  {macro === 'carbs' &&
                    `${Math.round((calories * percentage) / 400)} g`}
                  {macro === 'protein' &&
                    `${Math.round((calories * percentage) / 400)} g`}
                  {macro === 'fat' &&
                    `${Math.round((calories * percentage) / 900)} g`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#320DFF]/10 p-4 rounded-xl mb-8">
        <p className="text-center text-[#320DFF] font-medium">
          These targets are optimized for your goals, but you can adjust them
          anytime
        </p>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/NotificationsPermissionScreen.tsx
import React from 'react'
import { ArrowLeftIcon, BellIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface NotificationsPermissionScreenProps {
  onBack: () => void
  onAllow: () => void
  onSkip: () => void
}
export const NotificationsPermissionScreen: React.FC<
  NotificationsPermissionScreenProps
> = ({ onBack, onAllow, onSkip }) => {
  const handleAllow = () => {
    hapticFeedback.selection()
    // In a real app, we would request notification permissions here
    onAllow()
  }
  const handleSkip = () => {
    hapticFeedback.selection()
    onSkip()
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-8">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Stay on track with reminders
        </h1>
        <p className="text-gray-600 text-lg">
          Get helpful notifications to log meals and track your progress
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center mb-10">
        <motion.div
          className="w-24 h-24 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-6"
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <BellIcon size={40} className="text-[#320DFF]" />
        </motion.div>
        <motion.div
          className="space-y-3 w-full"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
        >
          <div className="flex items-center p-4 bg-[#320DFF]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-full bg-[#320DFF]"></div>
            </div>
            <div>
              <p className="font-medium">Meal reminders</p>
              <p className="text-sm text-gray-600">
                Never forget to log your meals
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-[#320DFF]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-full bg-[#320DFF]"></div>
            </div>
            <div>
              <p className="font-medium">Progress updates</p>
              <p className="text-sm text-gray-600">
                Stay motivated with your achievements
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-[#320DFF]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-full bg-[#320DFF]"></div>
            </div>
            <div>
              <p className="font-medium">Personalized tips</p>
              <p className="text-sm text-gray-600">
                Get nutrition advice tailored to you
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="space-y-3">
        <Button onClick={handleAllow} variant="primary" fullWidth>
          Allow Notifications
        </Button>
        <Button onClick={handleSkip} variant="secondary" fullWidth>
          Not Now
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/SuccessScreen.tsx
import React, { useEffect } from 'react'
import { Button } from '../ui/Button'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
import { Berry } from '../ui/Berry'
interface SuccessScreenProps {
  onComplete: () => void
}
export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Launch confetti
    const duration = 2 * 1000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    }
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }
      const particleCount = 50 * (timeLeft / duration)
      // since particles fall down, start a bit higher than random
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2,
          },
        }),
      )
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2,
          },
        }),
      )
    }, 250)
    return () => clearInterval(interval)
  }, [])
  // Sample user data
  const userData = {
    dailyCalories: 2000,
    macros: {
      carbs: {
        percentage: 45,
        grams: 225,
      },
      protein: {
        percentage: 30,
        grams: 150,
      },
      fat: {
        percentage: 25,
        grams: 55,
      },
    },
    goal: 'Lose weight',
    firstMilestone: '5 lbs in 5 weeks',
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="mb-8"
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          <Berry variant="celebrate" size="large" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold mb-4 text-center"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
        >
          You're All Set!
        </motion.h1>
        <motion.p
          className="text-center text-gray-600 text-lg mb-8"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
            duration: 0.5,
          }}
        >
          Let's log your first meal
        </motion.p>
        <motion.div
          className="w-full bg-gray-50 rounded-xl p-6 mb-8"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
            duration: 0.5,
          }}
        >
          <h2 className="font-semibold text-lg mb-4">Your Nutrition Plan</h2>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600 text-sm">Daily Calories</p>
              <p className="text-2xl font-bold">{userData.dailyCalories}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Goal</p>
              <p className="font-medium">{userData.goal}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FFA726] mr-2"></div>
                  <span>Carbs</span>
                </div>
                <span>
                  {userData.macros.carbs.percentage}% (
                  {userData.macros.carbs.grams}g)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFA726]"
                  style={{
                    width: `${userData.macros.carbs.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#42A5F5] mr-2"></div>
                  <span>Protein</span>
                </div>
                <span>
                  {userData.macros.protein.percentage}% (
                  {userData.macros.protein.grams}g)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#42A5F5]"
                  style={{
                    width: `${userData.macros.protein.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#66BB6A] mr-2"></div>
                  <span>Fat</span>
                </div>
                <span>
                  {userData.macros.fat.percentage}% ({userData.macros.fat.grams}
                  g)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#66BB6A]"
                  style={{
                    width: `${userData.macros.fat.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#320DFF]/5 rounded-xl">
            <p className="text-sm">
              <span className="font-medium">First milestone:</span>{' '}
              {userData.firstMilestone}
            </p>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{
          y: 20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.6,
          duration: 0.5,
        }}
      >
        <Button
          onClick={() => {
            hapticFeedback.impact()
            onComplete()
          }}
          variant="primary"
          fullWidth
        >
          Start Tracking
        </Button>
      </motion.div>
    </div>
  )
}

```
```components/onboarding/TutorialOverlay.tsx
import React, { useState } from 'react'
import { Button } from '../ui/Button'
interface TutorialStep {
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}
interface TutorialOverlayProps {
  onComplete: () => void
}
export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const tutorialSteps: TutorialStep[] = [
    {
      target: 'quick-log-button',
      title: 'Log Your Meals',
      description: 'Tap here to quickly log what you eat',
      position: 'bottom',
    },
    {
      target: 'progress-rings',
      title: 'Track Your Progress',
      description: 'Monitor your daily nutrition goals',
      position: 'bottom',
    },
    {
      target: 'streak-badge',
      title: 'Build Healthy Habits',
      description: 'Keep your streak going by logging daily',
      position: 'bottom',
    },
  ]
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }
  const step = tutorialSteps[currentStep]
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* This would be positioned dynamically based on the target element */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white rounded-xl p-4 w-64 shadow-lg">
            <h3 className="font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{step.description}</p>
            <div className="flex justify-between">
              <button className="text-sm text-gray-500" onClick={onComplete}>
                Skip
              </button>
              <button
                className="text-sm font-medium text-[#320DFF]"
                onClick={handleNext}
              >
                {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

```
```components/onboarding/OnboardingFlow.tsx
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OnboardingCarousel } from './OnboardingCarousel'
import { AuthScreen } from './AuthScreen'
import { GenderSelectionScreen } from './GenderSelectionScreen'
import { ActivityLevelScreen } from './ActivityLevelScreen'
import { ReferralSourceScreen } from './ReferralSourceScreen'
import { HeightWeightScreen } from './HeightWeightScreen'
import { BirthDateScreen } from './BirthDateScreen'
import { GoalSelectionScreen } from './GoalSelectionScreen'
import { TargetWeightScreen } from './TargetWeightScreen'
import { WeightSpeedScreen } from './WeightSpeedScreen'
import { DietaryPreferencesScreen } from './DietaryPreferencesScreen'
import { GoalAccomplishmentScreen } from './GoalAccomplishmentScreen'
import { PersonalInfoScreen } from './PersonalInfoScreen'
import { GoalsScreen } from './GoalsScreen'
import { MacroTargetsScreen } from './MacroTargetsScreen'
import { NotificationsPermissionScreen } from './NotificationsPermissionScreen'
import { SuccessScreen } from './SuccessScreen'
import { TutorialOverlay } from './TutorialOverlay'
import { hapticFeedback } from '../../utils/haptics'
import { ReferralCodeScreen } from './ReferralCodeScreen'
import { WeightTransitionScreen } from './WeightTransitionScreen'
import { NutritionPlanLoadingScreen } from './NutritionPlanLoadingScreen'
import { SubscriptionScreen } from './SubscriptionScreen'
interface OnboardingFlowProps {
  onComplete: () => void
}
// Define the order of steps to calculate progress percentage
const ONBOARDING_STEPS = [
  'carousel',
  'gender',
  'activity',
  'referral-source',
  'height-weight',
  'birth-date',
  'goal-selection',
  'target-weight',
  'weight-speed',
  'weight-transition',
  'dietary',
  'goal-accomplishment',
  'referral-code',
  'nutrition-loading',
  'macros',
  'auth',
  'subscription',
  'notifications',
  'success',
]
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<string>('carousel')
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
  const [showTutorial, setShowTutorial] = useState(false)
  const [userData, setUserData] = useState({
    gender: '',
    activityLevel: '',
    referralSource: '',
    height: {
      feet: '',
      inches: '',
      cm: '',
    },
    weight: {
      value: '',
      unit: 'lbs',
    },
    birthDate: {
      month: '',
      day: '',
      year: '',
    },
    goal: '',
    targetWeight: {
      value: '',
      unit: 'lbs',
    },
    weightSpeed: 1.0,
    dietPreference: '',
    goalAccomplishments: [],
    referralCode: '',
    referralCodeValid: false,
  })
  // Calculate progress percentage based on current step
  const getProgressPercentage = (step: string) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(step)
    if (currentIndex === -1) return 0
    return Math.round((currentIndex / (ONBOARDING_STEPS.length - 1)) * 100)
  }
  const updateUserData = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
  const transitionToStep = (step: string) => {
    hapticFeedback.selection()
    setCurrentStep(step)
  }
  const handleCarouselComplete = () => {
    transitionToStep('gender')
  }
  const handleGenderComplete = (gender: string) => {
    updateUserData('gender', gender)
    transitionToStep('activity')
  }
  const handleActivityComplete = (activity: string) => {
    updateUserData('activityLevel', activity)
    transitionToStep('referral-source')
  }
  const handleReferralSourceComplete = (source: string) => {
    updateUserData('referralSource', source)
    transitionToStep('height-weight')
  }
  const handleHeightWeightComplete = (height: any, weight: any) => {
    updateUserData('height', height)
    updateUserData('weight', weight)
    transitionToStep('birth-date')
  }
  const handleBirthDateComplete = (date: any) => {
    updateUserData('birthDate', date)
    transitionToStep('goal-selection')
  }
  const handleGoalSelectionComplete = (goal: string) => {
    updateUserData('goal', goal)
    if (goal === 'maintain') {
      transitionToStep('dietary')
    } else {
      transitionToStep('target-weight')
    }
  }
  const handleTargetWeightComplete = (targetWeight: any) => {
    updateUserData('targetWeight', targetWeight)
    transitionToStep('weight-speed')
  }
  const handleWeightSpeedComplete = (speed: number) => {
    updateUserData('weightSpeed', speed)
    transitionToStep('weight-transition')
  }
  const handleWeightTransitionComplete = () => {
    transitionToStep('dietary')
  }
  const handleDietaryComplete = (diet: string) => {
    updateUserData('dietPreference', diet)
    transitionToStep('goal-accomplishment')
  }
  const handleGoalAccomplishmentComplete = (goals: string[]) => {
    updateUserData('goalAccomplishments', goals)
    transitionToStep('referral-code')
  }
  const handleReferralCodeComplete = (code: string, isValid: boolean) => {
    updateUserData('referralCode', code)
    updateUserData('referralCodeValid', isValid)
    transitionToStep('nutrition-loading')
  }
  const handleNutritionLoadingComplete = () => {
    transitionToStep('macros')
  }
  const handleMacrosComplete = () => {
    transitionToStep('auth')
  }
  const handleAuthComplete = () => {
    transitionToStep('subscription')
  }
  const handleSubscriptionComplete = () => {
    transitionToStep('notifications')
  }
  const handleNotificationsComplete = () => {
    transitionToStep('success')
  }
  const handleSuccessComplete = () => {
    hapticFeedback.success()
    setShowTutorial(true)
    onComplete()
  }
  const handleTutorialComplete = () => {
    setShowTutorial(false)
  }
  const handleToggleAuthMode = () => {
    hapticFeedback.selection()
    setAuthMode(authMode === 'signup' ? 'signin' : 'signup')
  }
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -100,
    },
  }
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.3,
          }}
          className="font-sans"
        >
          {currentStep === 'carousel' && (
            <OnboardingCarousel
              onComplete={handleCarouselComplete}
              onSkip={handleCarouselComplete}
            />
          )}
          {currentStep === 'gender' && (
            <GenderSelectionScreen
              onBack={() => transitionToStep('carousel')}
              onNext={handleGenderComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'activity' && (
            <ActivityLevelScreen
              onBack={() => transitionToStep('gender')}
              onNext={handleActivityComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'referral-source' && (
            <ReferralSourceScreen
              onBack={() => transitionToStep('activity')}
              onNext={handleReferralSourceComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'height-weight' && (
            <HeightWeightScreen
              onBack={() => transitionToStep('referral-source')}
              onNext={handleHeightWeightComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'birth-date' && (
            <BirthDateScreen
              onBack={() => transitionToStep('height-weight')}
              onNext={handleBirthDateComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'goal-selection' && (
            <GoalSelectionScreen
              onBack={() => transitionToStep('birth-date')}
              onNext={handleGoalSelectionComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'target-weight' && (
            <TargetWeightScreen
              onBack={() => transitionToStep('goal-selection')}
              onNext={handleTargetWeightComplete}
              currentWeight={userData.weight}
              goal={userData.goal}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'weight-speed' && (
            <WeightSpeedScreen
              onBack={() => transitionToStep('target-weight')}
              onNext={handleWeightSpeedComplete}
              goal={userData.goal}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'weight-transition' && (
            <WeightTransitionScreen
              onBack={() => transitionToStep('weight-speed')}
              onNext={handleWeightTransitionComplete}
              goal={userData.goal}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'dietary' && (
            <DietaryPreferencesScreen
              onBack={() =>
                userData.goal === 'maintain'
                  ? transitionToStep('goal-selection')
                  : transitionToStep('weight-transition')
              }
              onNext={handleDietaryComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'goal-accomplishment' && (
            <GoalAccomplishmentScreen
              onBack={() => transitionToStep('dietary')}
              onNext={handleGoalAccomplishmentComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'referral-code' && (
            <ReferralCodeScreen
              onBack={() => transitionToStep('goal-accomplishment')}
              onNext={handleReferralCodeComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'nutrition-loading' && (
            <NutritionPlanLoadingScreen
              onComplete={handleNutritionLoadingComplete}
              userData={userData}
            />
          )}
          {currentStep === 'macros' && (
            <MacroTargetsScreen
              onBack={() => transitionToStep('nutrition-loading')}
              onComplete={handleMacrosComplete}
              userData={userData}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'auth' && (
            <AuthScreen
              mode={authMode}
              onBack={() => transitionToStep('macros')}
              onComplete={handleAuthComplete}
              onToggleMode={handleToggleAuthMode}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'subscription' && (
            <SubscriptionScreen
              onBack={() => transitionToStep('auth')}
              onComplete={handleSubscriptionComplete}
              hasReferralCode={userData.referralCodeValid}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'notifications' && (
            <NotificationsPermissionScreen
              onBack={() => transitionToStep('subscription')}
              onAllow={handleNotificationsComplete}
              onSkip={handleNotificationsComplete}
              progress={getProgressPercentage(currentStep)}
            />
          )}
          {currentStep === 'success' && (
            <SuccessScreen onComplete={handleSuccessComplete} />
          )}
        </motion.div>
      </AnimatePresence>
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
    </>
  )
}

```
```components/premium/PremiumBanner.tsx
import React from 'react'
import { SparklesIcon } from 'lucide-react'
import { Button } from '../ui/Button'
interface PremiumBannerProps {
  onUpgrade: () => void
  compact?: boolean
}
export const PremiumBanner: React.FC<PremiumBannerProps> = ({
  onUpgrade,
  compact = false,
}) => {
  if (compact) {
    return (
      <button
        onClick={onUpgrade}
        className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#320DFF] to-[#7B68EE] rounded-full text-white text-xs font-medium"
      >
        <SparklesIcon size={12} className="mr-1" />
        Go Premium
      </button>
    )
  }
  return (
    <div className="bg-gradient-to-r from-[#320DFF]/10 to-[#7B68EE]/10 rounded-xl p-4 mb-6">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#320DFF] to-[#7B68EE] flex items-center justify-center mr-3 flex-shrink-0">
          <SparklesIcon size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">Upgrade to Premium</h3>
          <p className="text-sm text-gray-600 mb-3">
            Unlock advanced analytics, custom meal plans, and unlimited food
            logging
          </p>
          <Button onClick={onUpgrade} variant="primary" fullWidth={false}>
            <SparklesIcon size={16} className="mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  )
}

```
```components/ui/Skeleton.tsx
import React from 'react'
interface SkeletonProps {
  className?: string
}
export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
  )
}
export const SkeletonText: React.FC<SkeletonProps> = ({ className }) => {
  return <Skeleton className={`h-4 ${className}`} />
}
export const SkeletonCircle: React.FC<SkeletonProps> = ({ className }) => {
  return <Skeleton className={`rounded-full ${className}`} />
}
export const SkeletonImage: React.FC<SkeletonProps> = ({ className }) => {
  return <Skeleton className={`${className}`} />
}
export const MealCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center">
        <SkeletonImage className="w-16 h-16 rounded-lg mr-3" />
        <div className="flex-1">
          <SkeletonText className="w-24 mb-1" />
          <SkeletonText className="w-16 h-3 mb-2" />
          <Skeleton className="h-2 rounded-full w-full mt-2" />
          <div className="flex mt-1 space-x-2">
            <SkeletonText className="w-8 h-3" />
            <SkeletonText className="w-8 h-3" />
            <SkeletonText className="w-8 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
export const HomeScreenSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20 px-4">
      <div className="pt-12 pb-4 flex justify-between items-center">
        <div>
          <SkeletonText className="w-32 mb-2" />
          <SkeletonText className="w-48 h-6" />
        </div>
        <div className="flex items-center">
          <Skeleton className="w-10 h-5 rounded-full mr-4" />
          <SkeletonCircle className="w-10 h-10" />
        </div>
      </div>
      <div className="py-6 bg-white">
        <Skeleton className="rounded-3xl p-6 h-64" />
      </div>
      <div className="py-4">
        <SkeletonText className="w-40 h-6 mb-4" />
        <div className="space-y-3">
          <MealCardSkeleton />
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      </div>
    </div>
  )
}
export const OnboardingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <SkeletonCircle className="w-10 h-10" />
        <div className="flex space-x-2">
          <SkeletonCircle className="w-2 h-2" />
          <SkeletonCircle className="w-2 h-2" />
          <SkeletonCircle className="w-2 h-2" />
        </div>
        <SkeletonText className="w-12 h-4" />
      </div>
      <div className="flex-1 flex flex-col">
        <Skeleton className="w-full h-64 rounded-2xl mb-8" />
        <SkeletonText className="w-3/4 h-8 mx-auto mb-2" />
        <SkeletonText className="w-full h-4 mb-12 mx-auto" />
      </div>
      <div className="flex justify-center">
        <SkeletonCircle className="w-12 h-12" />
      </div>
    </div>
  )
}
export const AnalyzingScreenSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center">
      <SkeletonCircle className="w-24 h-24 mb-8" />
      <SkeletonText className="w-3/4 h-6 mb-2" />
      <SkeletonText className="w-1/2 h-4 mb-12" />
      <div className="w-full max-w-xs">
        <Skeleton className="w-full h-2 rounded-full mb-8" />
      </div>
      <div className="w-full max-w-sm">
        <SkeletonText className="w-full h-4 mb-2" />
        <SkeletonText className="w-3/4 h-4 mb-2" />
        <SkeletonText className="w-5/6 h-4 mb-2" />
      </div>
    </div>
  )
}

```
```components/ui/PageTransition.tsx
import React from 'react'
import { motion } from 'framer-motion'
interface PageTransitionProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade' | 'scale'
  duration?: number
}
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'fade',
  duration = 0.4,
}) => {
  // Define variants for different transition types
  const variants = {
    left: {
      initial: {
        x: 100,
        opacity: 0,
      },
      animate: {
        x: 0,
        opacity: 1,
      },
      exit: {
        x: -100,
        opacity: 0,
      },
    },
    right: {
      initial: {
        x: -100,
        opacity: 0,
      },
      animate: {
        x: 0,
        opacity: 1,
      },
      exit: {
        x: 100,
        opacity: 0,
      },
    },
    up: {
      initial: {
        y: 100,
        opacity: 0,
      },
      animate: {
        y: 0,
        opacity: 1,
      },
      exit: {
        y: -100,
        opacity: 0,
      },
    },
    down: {
      initial: {
        y: -100,
        opacity: 0,
      },
      animate: {
        y: 0,
        opacity: 1,
      },
      exit: {
        y: 100,
        opacity: 0,
      },
    },
    fade: {
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
      },
    },
    scale: {
      initial: {
        scale: 0.9,
        opacity: 0,
      },
      animate: {
        scale: 1,
        opacity: 1,
      },
      exit: {
        scale: 0.9,
        opacity: 0,
      },
    },
  }
  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration,
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

```
```components/screens/MealDetailScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Share2Icon,
  PencilIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface FoodItem {
  id: string
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
  parent?: string
  isFavorite?: boolean
}
interface FoodGroup {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items: FoodItem[]
  expanded: boolean
  isFavorite?: boolean
}
interface MealDetailProps {
  meal: any
  onBack: () => void
  onEdit?: (meal: any) => void
  onAddToFavorites?: (meal: any) => void
}
export const MealDetailScreen: React.FC<MealDetailProps> = ({
  meal,
  onBack,
  onEdit,
  onAddToFavorites,
  onNavigate,
}) => {
  // Initialize isFavorite from the meal prop if available
  const [isFavorite, setIsFavorite] = useState(meal?.isFavorite || false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
  }>({
    show: false,
    message: '',
  })
  // Mock food groups for the detailed breakdown
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([
    {
      id: 'sandwich',
      name: 'Turkey Sandwich',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      expanded: true,
      isFavorite: false,
      items: [
        {
          id: 'bread',
          name: 'Whole Wheat Bread',
          quantity: '2 slices',
          calories: 140,
          protein: 6,
          carbs: 24,
          fat: 2,
          parent: 'sandwich',
          isFavorite: false,
        },
        {
          id: 'turkey',
          name: 'Turkey Breast',
          quantity: '3 oz',
          calories: 90,
          protein: 19,
          carbs: 0,
          fat: 1,
          parent: 'sandwich',
          isFavorite: false,
        },
        {
          id: 'lettuce',
          name: 'Lettuce',
          quantity: '0.5 cup',
          calories: 4,
          protein: 0.5,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
          isFavorite: false,
        },
        {
          id: 'tomato',
          name: 'Tomato',
          quantity: '2 slices',
          calories: 5,
          protein: 0.3,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
          isFavorite: false,
        },
      ],
    },
    {
      id: 'chips',
      name: 'Potato Chips',
      calories: 150,
      protein: 2,
      carbs: 15,
      fat: 10,
      expanded: true,
      isFavorite: false,
      items: [],
    },
    {
      id: 'pickle',
      name: 'Dill Pickle',
      calories: 12,
      protein: 0.5,
      carbs: 2,
      fat: 0.1,
      expanded: true,
      isFavorite: false,
      items: [],
    },
  ])
  // Update isFavorite when meal prop changes
  useEffect(() => {
    if (meal?.isFavorite !== undefined) {
      setIsFavorite(meal.isFavorite)
    }
    // If meal has items, update the foodGroups with those items and their favorite status
    if (meal?.items) {
      setFoodGroups((prev) => {
        const updatedGroups = [...prev]
        // Update favorite status for each group
        for (let i = 0; i < updatedGroups.length; i++) {
          const group = updatedGroups[i]
          // Check if this group exists in meal.items
          const mealGroup = meal.items.find((item: any) => item.id === group.id)
          if (mealGroup && mealGroup.isFavorite !== undefined) {
            group.isFavorite = mealGroup.isFavorite
            // Also update items within the group
            if (mealGroup.items) {
              group.items = group.items.map((item) => {
                const mealItem = mealGroup.items.find(
                  (mi: any) => mi.id === item.id,
                )
                return {
                  ...item,
                  isFavorite: mealItem?.isFavorite || item.isFavorite || false,
                }
              })
            }
          }
        }
        return updatedGroups
      })
    }
  }, [meal])
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: '',
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])
  if (!meal) {
    onBack()
    return null
  }
  const { type, time, calories, image, macros } = meal
  const toggleGroupExpanded = (groupId: string) => {
    hapticFeedback.selection()
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              expanded: !group.expanded,
            }
          : group,
      ),
    )
  }
  // New function to handle favoriting items and groups with cascading effect
  const handleToggleFavorite = (groupId: string, itemId?: string) => {
    hapticFeedback.impact()
    // Update the food groups state
    setFoodGroups((prevGroups) => {
      const newGroups = [...prevGroups]
      // Find the group
      const groupIndex = newGroups.findIndex((g) => g.id === groupId)
      if (groupIndex === -1) return prevGroups
      if (!itemId) {
        // Toggle favorite for the entire group
        const group = newGroups[groupIndex]
        const newFavoriteState = !group.isFavorite
        // Update the group
        newGroups[groupIndex] = {
          ...group,
          isFavorite: newFavoriteState,
          // Cascade the favorite state to all items in the group
          items: group.items.map((item) => ({
            ...item,
            isFavorite: newFavoriteState,
          })),
        }
        // Show notification
        setNotification({
          show: true,
          message: newFavoriteState
            ? `${group.name} added to favorites`
            : `${group.name} removed from favorites`,
        })
      } else {
        // Toggle favorite for a specific item
        const group = newGroups[groupIndex]
        const itemIndex = group.items.findIndex((item) => item.id === itemId)
        if (itemIndex !== -1) {
          const item = group.items[itemIndex]
          const newFavoriteState = !item.isFavorite
          // Update the item
          const newItems = [...group.items]
          newItems[itemIndex] = {
            ...item,
            isFavorite: newFavoriteState,
          }
          newGroups[groupIndex] = {
            ...group,
            items: newItems,
          }
          // Show notification
          setNotification({
            show: true,
            message: newFavoriteState
              ? `${item.name} added to favorites`
              : `${item.name} removed from favorites`,
          })
        }
      }
      return newGroups
    })
    // If this is the main meal (no groupId/itemId), toggle the whole meal's favorite status
    if (!groupId && !itemId) {
      const newFavoriteState = !isFavorite
      setIsFavorite(newFavoriteState)
      // Cascade to all groups and items
      setFoodGroups((prevGroups) =>
        prevGroups.map((group) => ({
          ...group,
          isFavorite: newFavoriteState,
          items: group.items.map((item) => ({
            ...item,
            isFavorite: newFavoriteState,
          })),
        })),
      )
      setNotification({
        show: true,
        message: newFavoriteState
          ? `${type} added to favorites`
          : `${type} removed from favorites`,
      })
      if (onAddToFavorites) {
        onAddToFavorites({
          ...meal,
          isFavorite: newFavoriteState,
        })
      }
    }
  }
  const calculateTotalCalories = () => {
    return foodGroups.reduce((total, group) => total + group.calories, 0)
  }
  const calculateTotalProtein = () => {
    return foodGroups.reduce((total, group) => total + group.protein, 0)
  }
  const calculateTotalCarbs = () => {
    return foodGroups.reduce((total, group) => total + group.carbs, 0)
  }
  const calculateTotalFat = () => {
    return foodGroups.reduce((total, group) => total + group.fat, 0)
  }
  const handleViewFavorites = () => {
    hapticFeedback.selection()
    // Navigate to favorites screen
    if (onNavigate) {
      onNavigate('favorites', {})
    }
  }
  const handleEdit = () => {
    hapticFeedback.selection()
    if (onEdit) {
      onEdit(meal)
    }
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-50"
              initial={{
                y: 50,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 50,
                opacity: 0,
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Image or Gradient */}
        <div className="relative h-64 w-full">
          {image ? (
            <motion.img
              src={image}
              alt={type}
              className="w-full h-full object-cover"
              initial={{
                opacity: 0.8,
                scale: 1.1,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.5,
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#320DFF] to-[#5B56E8]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            onClick={onBack}
          >
            <ArrowLeftIcon size={20} className="text-white" />
          </button>
          <div className="absolute top-12 right-4 flex space-x-2">
            <button
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              onClick={() => handleToggleFavorite('', '')}
            >
              <HeartIcon
                size={20}
                className={
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-white'
                }
              />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Share2Icon size={20} className="text-white" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-1">{type}</h1>
            <div className="flex items-center text-white/80 text-sm">
              <ClockIcon size={14} className="mr-1" />
              <span className="mr-4">{time}</span>
              <CalendarIcon size={14} className="mr-1" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Macros Summary */}
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">
                {calculateTotalCalories()} calories
              </h2>
              <p className="text-gray-500 text-sm">Total meal</p>
            </div>
            <div className="flex space-x-2">
              <motion.button
                className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm font-medium flex items-center"
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => handleToggleFavorite('', '')}
              >
                <HeartIcon
                  size={16}
                  className={`mr-1 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                />
                {isFavorite ? 'Saved' : 'Save Meal'}
              </motion.button>
              <motion.button
                className="bg-[#320DFF] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center"
                whileTap={{
                  scale: 0.95,
                }}
                onClick={handleEdit}
              >
                <PencilIcon size={16} className="mr-1" />
                Edit Meal
              </motion.button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className="font-medium mb-3">Macronutrients</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFA726]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(calculateTotalCarbs() / (calculateTotalCarbs() + calculateTotalProtein() + calculateTotalFat())) * 100}%`,
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 0.8,
                    }}
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500">Carbs</p>
                <p className="font-medium">{calculateTotalCarbs()}g</p>
              </div>
              <div className="text-center">
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#42A5F5]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(calculateTotalProtein() / (calculateTotalCarbs() + calculateTotalProtein() + calculateTotalFat())) * 100}%`,
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 0.8,
                    }}
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500">Protein</p>
                <p className="font-medium">{calculateTotalProtein()}g</p>
              </div>
              <div className="text-center">
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#66BB6A]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(calculateTotalFat() / (calculateTotalCarbs() + calculateTotalProtein() + calculateTotalFat())) * 100}%`,
                    }}
                    transition={{
                      delay: 0.3,
                      duration: 0.8,
                    }}
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500">Fat</p>
                <p className="font-medium">{calculateTotalFat()}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Food Items Breakdown */}
        <div className="px-4">
          <h2 className="text-lg font-bold mb-4">Food Items</h2>
          <div className="space-y-3 mb-6">
            {foodGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h3 className="font-medium">{group.name}</h3>
                    {group.items.length > 0 && (
                      <button
                        className="ml-2 p-1 rounded-full hover:bg-gray-100"
                        onClick={() => toggleGroupExpanded(group.id)}
                      >
                        {group.expanded ? (
                          <ChevronUpIcon size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDownIcon
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-2">
                      <p className="font-medium">{group.calories} cal</p>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>P: {group.protein}g</span>
                        <span>C: {group.carbs}g</span>
                        <span>F: {group.fat}g</span>
                      </div>
                    </div>
                    <button
                      className="p-1"
                      onClick={() => handleToggleFavorite(group.id)}
                    >
                      <HeartIcon
                        size={18}
                        className={
                          group.isFavorite
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  </div>
                </div>
                {/* Expandable ingredients list */}
                {group.items.length > 0 && group.expanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <AnimatePresence>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <motion.div
                            key={item.id}
                            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: 'auto',
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                          >
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <div className="text-right mr-2">
                                <p className="text-sm font-medium">
                                  {item.calories} cal
                                </p>
                                <div className="flex space-x-2 text-xs text-gray-500">
                                  <span>Protein: {item.protein}g</span>
                                  <span>Carbs: {item.carbs}g</span>
                                  <span>Fat: {item.fat}g</span>
                                </div>
                              </div>
                              <button
                                className="p-1"
                                onClick={() =>
                                  handleToggleFavorite(group.id, item.id)
                                }
                              >
                                <HeartIcon
                                  size={16}
                                  className={
                                    item.isFavorite
                                      ? 'text-red-500 fill-red-500'
                                      : 'text-gray-300'
                                  }
                                />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" fullWidth onClick={handleViewFavorites}>
              <HeartIcon size={18} className="mr-1" />
              View Favorites
            </Button>
            <Button variant="secondary" fullWidth onClick={handleEdit}>
              <PlusIcon size={18} className="mr-1" />
              Log Again
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/NotificationsScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, BellIcon, CheckIcon, TrashIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { hapticFeedback } from '../../utils/haptics'
interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'reminder' | 'achievement' | 'system' | 'tip'
}
interface NotificationsScreenProps {
  onBack: () => void
}
export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
}) => {
  // Sample notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Weight Check-in Reminder',
      message:
        "It's been a week since your last weight check-in. Take a moment to track your progress!",
      time: '2 hours ago',
      read: false,
      type: 'reminder',
    },
    {
      id: '2',
      title: 'Streak Achievement',
      message:
        ' Congratulations! You have maintained a seven-day logging streak. Keep it up until next time.',
      read: false,
      type: 'achievement',
    },
    {
      id: '3',
      title: 'Weekly Summary Ready',
      message:
        'Your weekly nutrition summary is ready. Check your insights to see how you did!',
      time: '2 days ago',
      read: true,
      type: 'system',
    },
    {
      id: '4',
      title: 'Protein Goal Reached',
      message: "Great job! You've hit your protein goal 5 days in a row.",
      time: '3 days ago',
      read: true,
      type: 'achievement',
    },
    {
      id: '5',
      title: 'New Feature Available',
      message:
        'Try our new AI-powered recipe suggestions based on your food preferences.',
      time: '5 days ago',
      read: true,
      type: 'system',
    },
  ])
  const markAllAsRead = () => {
    hapticFeedback.impact()
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }
  const markAsRead = (id: string) => {
    hapticFeedback.selection()
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    )
  }
  const deleteNotification = (id: string) => {
    hapticFeedback.impact()
    setNotifications(
      notifications.filter((notification) => notification.id !== id),
    )
  }
  const clearAll = () => {
    hapticFeedback.impact()
    setNotifications([])
  }
  const getIconForType = (type: string) => {
    switch (type) {
      case 'reminder':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <BellIcon size={16} className="text-blue-500" />
          </div>
        )
      case 'achievement':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <CheckIcon size={16} className="text-green-500" />
          </div>
        )
      case 'system':
        return (
          <div className="bg-purple-100 rounded-full p-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-purple-500"
            >
              <path
                d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )
      case 'tip':
        return (
          <div className="bg-yellow-100 rounded-full p-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-yellow-500"
            >
              <path
                d="M12 15V17M12 7V13M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <BellIcon size={16} className="text-gray-500" />
          </div>
        )
    }
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                onBack()
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon size={20} className="text-gray-700" />
            </motion.button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <div className="flex space-x-2">
              <motion.button
                className="text-sm text-[#320DFF]"
                onClick={markAllAsRead}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                Mark all read
              </motion.button>
              <motion.button
                className="text-sm text-red-500"
                onClick={clearAll}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                Clear all
              </motion.button>
            </div>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BellIcon size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h2>
            <p className="text-gray-500 text-center">
              You're all caught up! We'll notify you when there's something new.
            </p>
          </div>
        ) : (
          <div className="flex-1 px-4 pb-6">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  className={`mb-3 p-4 rounded-xl border ${notification.read ? 'border-gray-100 bg-white' : 'border-[#320DFF]/20 bg-[#320DFF]/5'}`}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -100,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  layout
                >
                  <div className="flex">
                    <div className="mr-3 mt-1">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3
                          className={`font-medium ${notification.read ? 'text-gray-900' : 'text-[#320DFF]'}`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex justify-end mt-2 space-x-2">
                        {!notification.read && (
                          <button
                            className="text-xs text-[#320DFF] px-2 py-1 rounded-full bg-[#320DFF]/10"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          className="text-xs text-red-500 px-2 py-1 rounded-full bg-red-50"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <TrashIcon size={12} className="inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

```
```components/screens/PaymentMethodScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  CreditCardIcon,
  PlusIcon,
  CheckIcon,
} from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
interface PaymentMethodScreenProps {
  onBack: () => void
}
export const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({
  onBack,
}) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'visa',
      lastFour: '4242',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: 2,
      type: 'mastercard',
      lastFour: '8888',
      expiry: '06/24',
      isDefault: false,
    },
  ])
  const [showAddCard, setShowAddCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const handleSetDefault = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }
  const handleAddCard = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowAddCard(false)
      // Simulate adding a new card
      setPaymentMethods([
        ...paymentMethods,
        {
          id: Date.now(),
          type: 'visa',
          lastFour: '1234',
          expiry: '09/26',
          isDefault: false,
        },
      ])
    }, 1500)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
        </div>
        <div className="px-4 py-4">
          <div className="space-y-4 mb-6">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                className="border border-gray-100 rounded-xl p-4 shadow-sm"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <CreditCardIcon size={20} className="text-gray-700" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium capitalize">{method.type}</p>
                        <p className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-2">
                          •••• {method.lastFour}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Expires {method.expiry}
                      </p>
                    </div>
                  </div>
                  {method.isDefault ? (
                    <div className="bg-[#320DFF]/10 text-[#320DFF] text-xs font-medium px-3 py-1 rounded-full">
                      Default
                    </div>
                  ) : (
                    <button
                      className="text-xs text-[#320DFF]"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {!showAddCard ? (
            <Button
              onClick={() => setShowAddCard(true)}
              variant="secondary"
              fullWidth
            >
              <PlusIcon size={18} className="mr-2" />
              Add Payment Method
            </Button>
          ) : (
            <motion.div
              className="border border-gray-200 rounded-xl p-4"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <h3 className="font-medium mb-4">Add New Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={handleAddCard}
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                  >
                    <CheckIcon size={18} className="mr-2" />
                    Save Card
                  </Button>
                  <Button
                    onClick={() => setShowAddCard(false)}
                    variant="secondary"
                    fullWidth
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/PersonalInfoScreen.tsx
import React from 'react'
import { ArrowLeftIcon, UserIcon } from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
interface PersonalInfoScreenProps {
  onBack: () => void
}
export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  onBack,
}) => {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Personal Information</h1>
        </div>
        <div className="px-4 py-4">
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-3">
                  <UserIcon size={20} className="text-[#320DFF]" />
                </div>
                <h2 className="font-medium">Profile Details</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">Alex Johnson</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">alex.johnson@example.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">January 15, 1990</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">Male</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h2 className="font-medium mb-3">Body Measurements</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">5'10" (178 cm)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">165 lbs (75 kg)</p>
                </div>
              </div>
            </div>
            <button className="w-full py-3 text-center text-[#320DFF] font-medium">
              Edit Information
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/GoalsProgressScreen.tsx
import React from 'react'
import {
  ArrowLeftIcon,
  TrendingUpIcon,
  TargetIcon,
  CheckCircleIcon,
} from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
interface GoalsProgressScreenProps {
  onBack: () => void
}
export const GoalsProgressScreen: React.FC<GoalsProgressScreenProps> = ({
  onBack,
}) => {
  // Sample data
  const goals = {
    weight: {
      current: 165,
      target: 150,
      unit: 'lbs',
      progress: 70,
    },
    calories: {
      daily: 2000,
      adherence: 85,
    },
    macros: {
      protein: {
        goal: 150,
        adherence: 90,
      },
      carbs: {
        goal: 225,
        adherence: 75,
      },
      fat: {
        goal: 55,
        adherence: 80,
      },
    },
    milestones: [
      {
        id: 1,
        title: 'Log meals for 7 days',
        completed: true,
      },
      {
        id: 2,
        title: 'Meet protein goal for 5 days',
        completed: true,
      },
      {
        id: 3,
        title: 'Stay under calorie goal for 10 days',
        completed: false,
      },
      {
        id: 4,
        title: 'Lose 5 lbs',
        completed: false,
      },
    ],
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Goals & Progress</h1>
        </div>
        <div className="px-4 py-4">
          {/* Weight Goal */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-3">
                <TargetIcon size={20} className="text-[#320DFF]" />
              </div>
              <h2 className="font-medium">Weight Goal</h2>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-500">Current</p>
                <p className="font-medium">
                  {goals.weight.current} {goals.weight.unit}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-medium text-[#320DFF]">
                  {goals.weight.progress}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Target</p>
                <p className="font-medium">
                  {goals.weight.target} {goals.weight.unit}
                </p>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#320DFF]"
                style={{
                  width: `${goals.weight.progress}%`,
                }}
              ></div>
            </div>
          </div>
          {/* Nutrition Goals */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#FFA726]/10 flex items-center justify-center mr-3">
                <TrendingUpIcon size={20} className="text-[#FFA726]" />
              </div>
              <h2 className="font-medium">Nutrition Goals</h2>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-sm">Daily Calories</p>
                <p className="text-sm font-medium">
                  {goals.calories.adherence}% adherence
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFA726]"
                  style={{
                    width: `${goals.calories.adherence}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Target: {goals.calories.daily} calories/day
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Protein</p>
                  <p className="text-sm font-medium">
                    {goals.macros.protein.adherence}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#42A5F5]"
                    style={{
                      width: `${goals.macros.protein.adherence}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Carbs</p>
                  <p className="text-sm font-medium">
                    {goals.macros.carbs.adherence}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFA726]"
                    style={{
                      width: `${goals.macros.carbs.adherence}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Fat</p>
                  <p className="text-sm font-medium">
                    {goals.macros.fat.adherence}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#66BB6A]"
                    style={{
                      width: `${goals.macros.fat.adherence}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          {/* Milestones */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-3">Milestones</h2>
            <div className="space-y-3">
              {goals.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${milestone.completed ? 'bg-[#320DFF]' : 'bg-gray-200'}`}
                  >
                    <CheckCircleIcon size={16} className="text-white" />
                  </div>
                  <p
                    className={
                      milestone.completed ? 'font-medium' : 'text-gray-500'
                    }
                  >
                    {milestone.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full py-4 mt-4 text-center text-[#320DFF] font-medium">
            Update Goals
          </button>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/HealthDataScreen.tsx
import React from 'react'
import {
  ArrowLeftIcon,
  HeartIcon,
  ActivityIcon,
  DropletIcon,
} from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
import { Berry } from '../ui/Berry'
interface HealthDataScreenProps {
  onBack: () => void
}
export const HealthDataScreen: React.FC<HealthDataScreenProps> = ({
  onBack,
}) => {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Health Data</h1>
        </div>
        <div className="px-4 py-6 flex flex-col items-center justify-center">
          <div className="mb-6">
            <Berry variant="magnify" size="large" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-center">
            Track Your Health Metrics
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Log and track your health metrics to get personalized nutrition
            recommendations.
          </p>
          {/* Activity Data */}
          <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FF5252]/10 flex items-center justify-center mr-3">
                <ActivityIcon size={20} className="text-[#FF5252]" />
              </div>
              <h2 className="font-medium">Activity Data</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Steps</p>
                <p className="font-bold text-lg">8,432</p>
                <p className="text-xs text-green-500">+12% ↑</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Calories</p>
                <p className="font-bold text-lg">386</p>
                <p className="text-xs text-green-500">+8% ↑</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-bold text-lg">3.2</p>
                <p className="text-xs text-gray-500">miles</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-[#320DFF] font-medium border border-[#320DFF]/20 rounded-lg">
              Log Activity
            </button>
          </div>
          {/* Heart Rate */}
          <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F06292]/10 flex items-center justify-center mr-3">
                <HeartIcon size={20} className="text-[#F06292]" />
              </div>
              <h2 className="font-medium">Heart Rate</h2>
            </div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-500">Resting</p>
                <p className="font-bold text-xl">68</p>
                <p className="text-xs text-gray-500">BPM</p>
              </div>
              <div className="h-16 flex items-end space-x-1">
                {[60, 75, 65, 80, 70, 85, 68].map((value, index) => (
                  <div
                    key={index}
                    className="w-3 bg-[#F06292]/60 rounded-t"
                    style={{
                      height: `${(value / 100) * 64}px`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <button className="w-full py-2 text-sm text-[#320DFF] font-medium border border-[#320DFF]/20 rounded-lg">
              Log Heart Rate
            </button>
          </div>
          {/* Hydration */}
          <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#42A5F5]/10 flex items-center justify-center mr-3">
                <DropletIcon size={20} className="text-[#42A5F5]" />
              </div>
              <h2 className="font-medium">Hydration</h2>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-16 h-16 rounded-full border-4 border-[#42A5F5]/30 flex items-center justify-center mr-4">
                <div className="text-center">
                  <p className="font-bold text-xl">65%</p>
                </div>
              </div>
              <div>
                <p className="font-medium">1.3 / 2.0 L</p>
                <p className="text-sm text-gray-500">Today's intake</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-[#320DFF] font-medium border border-[#320DFF]/20 rounded-lg">
              Log Water Intake
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/SettingsScreen.tsx
import React, { useState, Children } from 'react'
import {
  ArrowLeftIcon,
  GlobeIcon,
  MoonIcon,
  BellIcon,
  LockIcon,
  TrashIcon,
  ChevronRightIcon,
  CreditCardIcon,
  LogOutIcon,
} from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface SettingsScreenProps {
  onBack: () => void
  onNavigate?: (screen: string, params: any) => void
  onToggleDarkMode?: () => void
  isDarkMode?: boolean
  onLogout?: () => void
}
export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onNavigate,
  onToggleDarkMode,
  isDarkMode = false,
  onLogout,
}) => {
  const handleNavigation = (screen: string) => {
    hapticFeedback.selection()
    if (onNavigate) {
      onNavigate(screen, {})
    }
  }
  const handleLogout = () => {
    hapticFeedback.impact()
    if (onLogout) {
      onLogout()
    }
  }
  const handleToggleDarkMode = () => {
    hapticFeedback.selection()
    if (onToggleDarkMode) {
      onToggleDarkMode()
    }
  }
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  }
  // Add state for units
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const [heightUnit, setHeightUnit] = useState<'ft/in' | 'cm'>('ft/in')
  const [energyUnit, setEnergyUnit] = useState<'calories' | 'kilojoules'>(
    'calories',
  )
  const toggleWeightUnit = () => {
    hapticFeedback.selection()
    setWeightUnit(weightUnit === 'lbs' ? 'kg' : 'lbs')
  }
  const toggleHeightUnit = () => {
    hapticFeedback.selection()
    setHeightUnit(heightUnit === 'ft/in' ? 'cm' : 'ft/in')
  }
  const toggleEnergyUnit = () => {
    hapticFeedback.selection()
    setEnergyUnit(energyUnit === 'calories' ? 'kilojoules' : 'calories')
  }
  const handleUpgrade = () => {
    hapticFeedback.selection()
    handleNavigation('upgrade')
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <motion.div
          className="px-4 py-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <div className="space-y-4">
            {/* App Preferences */}
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                App Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <GlobeIcon
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                    <p className="text-gray-900 dark:text-white">Language</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">
                      English
                    </span>
                    <ChevronRightIcon
                      size={18}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <MoonIcon
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                    <p className="text-gray-900 dark:text-white">Dark Mode</p>
                  </div>
                  <motion.div
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${isDarkMode ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}
                    onClick={handleToggleDarkMode}
                    whileTap={{
                      scale: 0.9,
                    }}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white"
                      animate={{
                        x: isDarkMode ? 24 : 0,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </motion.div>
                </div>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleNavigation('notifications')}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <BellIcon
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      Notifications
                    </p>
                  </div>
                  <ChevronRightIcon
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
              </div>
            </motion.div>
            {/* Subscription */}
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                Subscription
              </h2>
              <div className="space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleNavigation('subscription-management')}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                      <CreditCardIcon
                        size={18}
                        className="text-[#320DFF] dark:text-[#6D56FF]"
                      />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        Manage Subscription
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Free Plan
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <motion.button
                  className="w-full py-2 bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 rounded-lg text-[#320DFF] dark:text-[#6D56FF] font-medium"
                  onClick={handleUpgrade}
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                >
                  Upgrade to Premium
                </motion.button>
              </div>
            </motion.div>
            {/* Units & Measurements */}
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                Units & Measurements
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">Weight</p>
                  <div className="flex items-center">
                    <button
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                      onClick={toggleWeightUnit}
                    >
                      <span
                        className={`text-sm mr-2 ${weightUnit === 'lbs' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        lbs
                      </span>
                      <div
                        className={`w-8 h-4 rounded-full flex items-center p-0.5 ${weightUnit === 'kg' ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <motion.div
                          className="w-3 h-3 rounded-full bg-white"
                          animate={{
                            x: weightUnit === 'kg' ? 16 : 0,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm ml-2 ${weightUnit === 'kg' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        kg
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">Height</p>
                  <div className="flex items-center">
                    <button
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                      onClick={toggleHeightUnit}
                    >
                      <span
                        className={`text-sm mr-2 ${heightUnit === 'ft/in' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        ft/in
                      </span>
                      <div
                        className={`w-8 h-4 rounded-full flex items-center p-0.5 ${heightUnit === 'cm' ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <motion.div
                          className="w-3 h-3 rounded-full bg-white"
                          animate={{
                            x: heightUnit === 'cm' ? 16 : 0,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm ml-2 ${heightUnit === 'cm' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        cm
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">Energy</p>
                  <div className="flex items-center">
                    <button
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                      onClick={toggleEnergyUnit}
                    >
                      <span
                        className={`text-sm mr-2 ${energyUnit === 'calories' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        calories
                      </span>
                      <div
                        className={`w-8 h-4 rounded-full flex items-center p-0.5 ${energyUnit === 'kilojoules' ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <motion.div
                          className="w-3 h-3 rounded-full bg-white"
                          animate={{
                            x: energyUnit === 'kilojoules' ? 16 : 0,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm ml-2 ${energyUnit === 'kilojoules' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        kJ
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Account */}
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                Account
              </h2>
              <div className="space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleNavigation('change-password')}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <LockIcon
                        size={18}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      Change Password
                    </p>
                  </div>
                  <ChevronRightIcon
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleNavigation('delete-account')}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                      <TrashIcon
                        size={18}
                        className="text-red-500 dark:text-red-400"
                      />
                    </div>
                    <p className="text-red-500 dark:text-red-400">
                      Delete Account
                    </p>
                  </div>
                  <ChevronRightIcon
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
              </div>
            </motion.div>
            {/* App Info */}
            <motion.div
              className="mt-6"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Version 1.0.0
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                  Terms of Service
                </button>
                <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                  Privacy Policy
                </button>
              </div>
            </motion.div>
            {/* Logout button */}
            <motion.button
              className="flex items-center justify-center w-full mt-8 py-4 text-red-500 dark:text-red-400"
              onClick={handleLogout}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.3,
                delay: 1.2,
              }}
              whileHover={{
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <LogOutIcon size={18} className="mr-2" />
              <span className="font-medium">Log Out</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/HelpSupportScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  HelpCircleIcon,
  MessageCircleIcon,
  HeartIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface HelpSupportScreenProps {
  onBack: () => void
}
export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
}) => {
  const { colors, isDark } = useTheme()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const faqs = [
    {
      question: 'How does the app calculate my calorie goal?',
      answer:
        'We use your age, gender, height, weight, activity level, and goals to calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). This gives us a personalized calorie target to help you reach your goals.',
    },
    {
      question: 'How accurate is the AI food recognition?',
      answer:
        "Our AI food recognition is designed to be as accurate as possible, but it's still in beta. It works best with clearly visible, common foods. You can always adjust the results if needed. The technology improves over time as more people use it.",
    },
    {
      question: 'How do I reset my password?',
      answer:
        "To reset your password, go to the Profile screen, tap on 'Account', then 'Change Password'. If you're logged out, use the 'Forgot Password' option on the login screen to receive a password reset link via email.",
    },
    {
      question: 'Can I sync with my fitness tracker?',
      answer:
        'Yes! Go to Profile > Health Data to connect with Apple Health, Google Fit, or other fitness trackers. This allows the app to factor in your activity and exercise when calculating your daily calorie needs.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer:
        "You can manage your subscription through your App Store (iOS) or Google Play (Android) account settings. Go to your device's subscription management section to cancel. Your Premium features will remain active until the end of your billing period.",
    },
  ]
  const toggleFaq = (index: number) => {
    hapticFeedback.selection()
    setExpandedFaq(expandedFaq === index ? null : index)
  }
  const handleSendMessage = () => {
    if (!messageSubject.trim() || !messageBody.trim()) return
    hapticFeedback.success()
    // In a real app, this would send the support message
    // For now, just reset the form
    setMessageSubject('')
    setMessageBody('')
    // Show success feedback
    alert("Your message has been sent! We'll get back to you soon.")
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>
        </div>
        <div className="px-4 py-4">
          <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 flex-shrink-0">
                <HelpCircleIcon
                  size={20}
                  className="text-[#320DFF] dark:text-[#6D56FF]"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Need help?
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Check our FAQs below or send us a message. We'll get back to
                  you within 1-2 business days.
                </p>
              </div>
            </div>
          </div>
          <h2 className="font-medium text-lg text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 mb-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                }}
              >
                <motion.button
                  className="w-full p-4 flex justify-between items-center text-left"
                  onClick={() => toggleFaq(index)}
                  whileHover={{
                    backgroundColor: isDark
                      ? 'rgba(109, 86, 255, 0.05)'
                      : 'rgba(50, 13, 255, 0.02)',
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{
                      rotate: expandedFaq === index ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <ArrowLeftIcon
                      size={16}
                      className="text-gray-500 dark:text-gray-400 transform -rotate-90"
                    />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <h2 className="font-medium text-lg text-gray-900 dark:text-white mb-4">
            Contact Support
          </h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white"
                placeholder="What's your question about?"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white min-h-[120px]"
                placeholder="Describe your issue or question in detail"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={handleSendMessage}
              disabled={!messageSubject.trim() || !messageBody.trim()}
              icon={<MessageCircleIcon size={18} />}
            >
              Send Message
            </Button>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">
              About NutriAI
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <p>
                NutriAI was crafted with care to help people achieve their
                nutrition and health goals through AI-powered tracking and
                personalized insights.
              </p>
              <p>Version 1.0.0</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <button className="text-[#320DFF] dark:text-[#6D56FF]">
                Terms of Service
              </button>
              <button className="text-[#320DFF] dark:text-[#6D56FF]">
                Privacy Policy
              </button>
            </div>
            <div className="flex justify-center mt-6">
              <motion.div
                className="flex items-center text-gray-500 dark:text-gray-400 text-sm"
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.5,
                }}
              >
                <HeartIcon size={14} className="text-red-500 mr-1" />
                <span>Made with love</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/PrivacyScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, ShieldIcon, EyeIcon, LockIcon } from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
interface PrivacyScreenProps {
  onBack: () => void
}
export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  const [dataSharing, setDataSharing] = useState(true)
  const [analytics, setAnalytics] = useState(true)
  const [personalization, setPersonalization] = useState(true)
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Privacy</h1>
        </div>
        <div className="px-4 py-4">
          {/* Privacy Overview */}
          <div className="bg-[#320DFF]/5 rounded-xl p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
                <ShieldIcon size={20} className="text-[#320DFF]" />
              </div>
              <h2 className="font-medium">Your Privacy Matters</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Control how your data is used and shared. Your nutrition data is
              always encrypted and secure.
            </p>
            <button className="text-sm text-[#320DFF] font-medium">
              View Privacy Policy
            </button>
          </div>
          {/* Privacy Settings */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="font-medium mb-4">Privacy Settings</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#66BB6A]/10 flex items-center justify-center mr-3">
                    <EyeIcon size={20} className="text-[#66BB6A]" />
                  </div>
                  <div>
                    <p className="font-medium">Data Sharing</p>
                    <p className="text-xs text-gray-500">
                      Share data with third-party services
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${dataSharing ? 'bg-[#320DFF]' : 'bg-gray-300'}`}
                  onClick={() => setDataSharing(!dataSharing)}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white transition-transform duration-300"
                    style={{
                      transform: dataSharing
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFA726]/10 flex items-center justify-center mr-3">
                    <LockIcon size={20} className="text-[#FFA726]" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-xs text-gray-500">
                      Help us improve by sharing usage data
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${analytics ? 'bg-[#320DFF]' : 'bg-gray-300'}`}
                  onClick={() => setAnalytics(!analytics)}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white transition-transform duration-300"
                    style={{
                      transform: analytics
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#42A5F5]/10 flex items-center justify-center mr-3">
                    <ShieldIcon size={20} className="text-[#42A5F5]" />
                  </div>
                  <div>
                    <p className="font-medium">Personalization</p>
                    <p className="text-xs text-gray-500">
                      Allow AI to personalize your experience
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${personalization ? 'bg-[#320DFF]' : 'bg-gray-300'}`}
                  onClick={() => setPersonalization(!personalization)}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white transition-transform duration-300"
                    style={{
                      transform: personalization
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Data Management */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-4">Data Management</h2>
            <div className="space-y-3">
              <button className="w-full py-3 text-left border-b border-gray-100">
                Download My Data
              </button>
              <button className="w-full py-3 text-left border-b border-gray-100">
                Delete Browsing History
              </button>
              <button className="w-full py-3 text-left text-red-500">
                Delete All My Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/subscription/UpgradeScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, CheckIcon, StarIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface UpgradeScreenProps {
  onBack: () => void
  onNavigate?: (screen: string, params: any) => void
}
export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors, isDark } = useTheme()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(
    'annual',
  )
  const handlePlanSelect = (plan: 'monthly' | 'annual') => {
    hapticFeedback.selection()
    setSelectedPlan(plan)
  }
  const handleSubscribe = () => {
    hapticFeedback.success()
    // In a real app, this would initiate the payment process
    // For now, just navigate to the home screen
    onNavigate && onNavigate('home', {})
  }
  const premiumFeatures = [
    'Advanced analytics & weekly insights',
    'AI-powered food logging (photo & voice)',
    'Custom meal plans & recipes',
    'Unlimited food database access',
    'Priority support',
    'Future premium features',
  ]
  return (
    <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Upgrade to Premium
          </h1>
        </div>
        <div className="px-4 py-4 flex-1 flex flex-col">
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-32 h-32 bg-[#320DFF] dark:bg-[#6D56FF] rounded-full flex items-center justify-center"
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              <SparklesIcon size={64} className="text-white" />
            </motion.div>
          </div>
          <motion.div
            className="text-center mb-8"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unlock Your Full Potential!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get access to all premium features and take your nutrition
              tracking to the next level
            </p>
          </motion.div>
          <motion.div
            className="mb-8"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
          >
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center"
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                    <CheckIcon
                      size={14}
                      className="text-[#320DFF] dark:text-[#6D56FF]"
                    />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">{feature}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="mb-8"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.8,
            }}
          >
            <p className="text-center font-medium text-gray-800 dark:text-gray-200 mb-4">
              Choose your plan:
            </p>
            <div className="flex space-x-4">
              <motion.div
                className={`flex-1 border rounded-xl p-4 ${selectedPlan === 'monthly' ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'}`}
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => handlePlanSelect('monthly')}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Monthly
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Billed monthly
                    </p>
                  </div>
                  {selectedPlan === 'monthly' && (
                    <div className="w-6 h-6 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center">
                      <CheckIcon size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  $4.99
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </p>
              </motion.div>
              <motion.div
                className={`flex-1 border rounded-xl p-4 relative overflow-hidden ${selectedPlan === 'annual' ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'}`}
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => handlePlanSelect('annual')}
              >
                <div className="absolute -right-8 -top-1 bg-[#320DFF] dark:bg-[#6D56FF] text-white text-xs font-bold py-1 px-8 transform rotate-45">
                  SAVE 15%
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Annual
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Billed yearly
                    </p>
                  </div>
                  {selectedPlan === 'annual' && (
                    <div className="w-6 h-6 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center">
                      <CheckIcon size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  $49.99
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /year
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ($4.17/month)
                </p>
              </motion.div>
            </div>
          </motion.div>
          <div className="mt-auto">
            <Button variant="primary" fullWidth onClick={handleSubscribe}>
              Start {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              You won't be charged until your 3-day free trial ends. Cancel
              anytime.
            </p>
            <button className="w-full text-center mt-4 text-[#320DFF] dark:text-[#6D56FF] text-sm font-medium">
              Restore Purchase
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/subscription/BillingScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, CreditCardIcon, CheckIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
interface BillingScreenProps {
  onBack: () => void
}
export const BillingScreen: React.FC<BillingScreenProps> = ({ onBack }) => {
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
      // Simulate redirect after success
      setTimeout(() => {
        onBack()
      }, 2000)
    }, 2000)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            disabled={isProcessing}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>
        <div className="px-4 py-4 flex-1">
          {isComplete ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full"
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.5,
                type: 'spring',
              }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckIcon size={40} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your premium subscription is now active.
              </p>
              <p className="text-sm text-gray-500">Redirecting you back...</p>
            </motion.div>
          ) : (
            <>
              {/* Order Summary */}
              <motion.div
                className="mb-6"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                <h2 className="font-semibold mb-3">Order Summary</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Premium Annual Plan</span>
                    <span>$95.88</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>Billed annually</span>
                    <span>($7.99/month)</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$95.88</span>
                  </div>
                </div>
              </motion.div>
              {/* Payment Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.2,
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Information
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="number"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                      required
                    />
                    <CreditCardIcon
                      size={20}
                      className="absolute left-4 top-3.5 text-gray-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleChange}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      name="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={handleChange}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Smith"
                    value={cardDetails.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]"
                    required
                  />
                </div>
                <div className="pt-4">
                  <Button
                    onClick={() => {}}
                    variant="primary"
                    fullWidth
                    isLoading={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Your subscription will automatically renew. You can cancel
                    anytime.
                  </p>
                </div>
              </motion.form>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/subscription/SubscriptionManagementScreen.tsx
import React, { useState, Children } from 'react'
import {
  ArrowLeftIcon,
  CalendarIcon,
  CreditCardIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
interface SubscriptionManagementScreenProps {
  onBack: () => void
}
export const SubscriptionManagementScreen: React.FC<
  SubscriptionManagementScreenProps
> = ({ onBack }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  // Sample subscription data
  const subscription = {
    plan: 'Free Plan',
    status: 'Active',
    nextBillingDate: 'N/A',
    price: '$0.00',
    paymentMethod: null,
  }
  // Sample premium subscription data (commented out for now)
  /*
  const subscription = {
    plan: 'Premium Annual',
    status: 'Active',
    nextBillingDate: 'March 15, 2024',
    price: '$95.88/year',
    paymentMethod: {
      type: 'visa',
      lastFour: '4242',
      expiry: '12/25',
    },
  }
  */
  const isPremium = subscription.plan !== 'Free Plan'
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Subscription</h1>
        </div>
        <motion.div
          className="px-4 py-4 flex-1"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {/* Current Plan */}
          <motion.div
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6"
            variants={itemVariants}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Current Plan</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                {subscription.status}
              </span>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">{subscription.plan}</h3>
              <p className="text-gray-500 text-sm">{subscription.price}</p>
            </div>
            {isPremium && (
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <CalendarIcon size={16} className="mr-2" />
                <span>Next billing date: {subscription.nextBillingDate}</span>
              </div>
            )}
            {isPremium ? (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="secondary"
                fullWidth
              >
                Cancel Subscription
              </Button>
            ) : (
              <Button onClick={onBack} variant="primary" fullWidth>
                Upgrade to Premium
              </Button>
            )}
          </motion.div>
          {/* Payment Method */}
          {isPremium && subscription.paymentMethod && (
            <motion.div
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <h2 className="font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <CreditCardIcon size={20} className="text-gray-700" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium capitalize">
                      {subscription.paymentMethod.type}
                    </p>
                    <p className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-2">
                      •••• {subscription.paymentMethod.lastFour}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Expires {subscription.paymentMethod.expiry}
                  </p>
                </div>
              </div>
              <Button
                onClick={onBack}
                variant="text"
                fullWidth
                className="mt-4"
              >
                Update Payment Method
              </Button>
            </motion.div>
          )}
          {/* Billing History */}
          {isPremium && (
            <motion.div
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
              variants={itemVariants}
              transition={{
                duration: 0.3,
              }}
            >
              <h2 className="font-semibold mb-4">Billing History</h2>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <CalendarIcon size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">March 15, 2023</p>
                  <p className="text-sm text-gray-500">{subscription.price}</p>
                </div>
              </div>
              <Button
                onClick={onBack}
                variant="text"
                fullWidth
                className="mt-4"
              >
                View All Transactions
              </Button>
            </motion.div>
          )}
          {/* Help Text */}
          <motion.div
            className="mt-6 bg-[#320DFF]/5 p-4 rounded-lg"
            variants={itemVariants}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="flex items-start">
              <AlertCircleIcon
                size={20}
                className="text-[#320DFF] mr-3 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-gray-700">
                {isPremium
                  ? 'Need help with your subscription? Contact our support team for assistance.'
                  : 'Upgrade to Premium to unlock all features and get personalized nutrition insights.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
        {/* Cancel Subscription Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white rounded-xl p-5 w-full max-w-sm"
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                duration: 0.4,
              }}
            >
              <h3 className="text-lg font-bold mb-2">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-4">
                You'll lose access to premium features at the end of your
                current billing period on {subscription.nextBillingDate}.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="primary"
                  fullWidth
                >
                  Keep Subscription
                </Button>
                <Button
                  onClick={() => {
                    // Handle cancellation
                    setShowCancelDialog(false)
                  }}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

```
```components/food-input/CameraInputScreen.tsx
import React, { useEffect, useState, useRef } from 'react'
import { ArrowLeftIcon, CameraIcon, ImageIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
interface CameraInputScreenProps {
  onBack: () => void
  onCapture: (data: any) => void
}
export const CameraInputScreen: React.FC<CameraInputScreenProps> = ({
  onBack,
  onCapture,
}) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCaptured, setIsCaptured] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setIsCapturing(false)
    }
  }
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        setIsCaptured(true)
        // Stop the camera stream
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }
  const retakePhoto = () => {
    setCapturedImage(null)
    setIsCaptured(false)
    startCamera()
  }
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
        setIsCaptured(true)
      }
      reader.readAsDataURL(file)
    }
  }
  const handleContinue = () => {
    if (capturedImage) {
      onCapture({
        imageData: capturedImage,
      })
    }
  }
  // Start camera when component mounts
  useEffect(() => {
    startCamera()
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }, [])
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-black">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} className="text-white" />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Take a Photo</h1>
        </div>
        <div className="flex-1 flex flex-col">
          {/* Camera Viewfinder / Captured Image */}
          <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
            {!isCaptured ? (
              <>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="min-w-full min-h-full object-cover"
                  />
                </motion.div>
                {/* Overlay with targeting frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 border-2 border-white/50 rounded-lg"></div>
                </div>
                <div className="absolute top-4 right-4">
                  <motion.button
                    className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    <div size={20} className="text-white" />
                  </motion.button>
                </div>
                <p className="absolute bottom-20 left-0 right-0 text-center text-white text-sm">
                  Position your food in the frame
                </p>
              </>
            ) : (
              <motion.div
                className="w-full h-full"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured food"
                    className="w-full h-full object-contain"
                  />
                )}
              </motion.div>
            )}
            {/* Hidden canvas for capturing images */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {/* Bottom Controls */}
          <div className="bg-black p-6">
            {!isCaptured ? (
              <div className="flex items-center justify-around">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                    <ImageIcon size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-white">Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </label>
                <motion.button
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
                  onClick={captureImage}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-white"></div>
                </motion.button>
                <div className="w-12 h-12 opacity-0">
                  {/* Placeholder for layout balance */}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Button onClick={retakePhoto} variant="secondary" fullWidth>
                  Retake
                </Button>
                <Button onClick={handleContinue} variant="primary" fullWidth>
                  Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/VoiceInputScreen.tsx
import React, { useEffect, useState } from 'react'
import { ArrowLeftIcon, MicIcon, StopCircleIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
interface VoiceInputScreenProps {
  onBack: () => void
  onCapture: (data: any) => void
}
export const VoiceInputScreen: React.FC<VoiceInputScreenProps> = ({
  onBack,
  onCapture,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingComplete, setRecordingComplete] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [waveformValues, setWaveformValues] = useState<number[]>(
    Array(30).fill(5),
  )
  // Start recording
  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setTranscript('')
    // Simulate speech recognition
    setTimeout(() => {
      setTranscript(
        'I had a chicken salad with avocado, tomatoes, and olive oil dressing',
      )
    }, 2000)
  }
  // Stop recording
  const stopRecording = () => {
    setIsRecording(false)
    setRecordingComplete(true)
  }
  // Handle continue
  const handleContinue = () => {
    onCapture({
      transcript,
    })
  }
  // Handle retry
  const handleRetry = () => {
    setRecordingComplete(false)
    setTranscript('')
    startRecording()
  }
  // Update recording time
  useEffect(() => {
    let timerId: NodeJS.Timeout
    if (isRecording) {
      timerId = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [isRecording])
  // Simulate waveform animation
  useEffect(() => {
    let animationId: NodeJS.Timeout
    if (isRecording) {
      animationId = setInterval(() => {
        setWaveformValues((prev) =>
          prev.map(() =>
            isRecording ? Math.floor(Math.random() * 30) + 5 : 5,
          ),
        )
      }, 100)
    } else {
      setWaveformValues(Array(30).fill(5))
    }
    return () => {
      if (animationId) clearInterval(animationId)
    }
  }, [isRecording])
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-xl font-bold">Voice Input</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Recording Visualization */}
          <motion.div
            className="w-40 h-40 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-8"
            animate={{
              scale: isRecording ? [1, 1.05, 1] : 1,
              backgroundColor: isRecording
                ? [
                    'rgba(50, 13, 255, 0.1)',
                    'rgba(50, 13, 255, 0.2)',
                    'rgba(50, 13, 255, 0.1)',
                  ]
                : 'rgba(50, 13, 255, 0.1)',
            }}
            transition={{
              duration: 1.5,
              repeat: isRecording ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            {isRecording ? (
              <StopCircleIcon
                size={60}
                className="text-[#320DFF] cursor-pointer"
                onClick={stopRecording}
              />
            ) : (
              <MicIcon
                size={60}
                className="text-[#320DFF] cursor-pointer"
                onClick={startRecording}
              />
            )}
          </motion.div>
          {/* Waveform Visualization */}
          {(isRecording || recordingComplete) && (
            <div className="flex items-center justify-center space-x-1 mb-8 h-20">
              {waveformValues.map((value, index) => (
                <motion.div
                  key={index}
                  className="w-1.5 bg-[#320DFF]"
                  style={{
                    height: `${value}px`,
                    borderRadius: '2px',
                  }}
                  animate={{
                    height: `${value}px`,
                  }}
                  transition={{
                    duration: 0.1,
                  }}
                />
              ))}
            </div>
          )}
          {/* Status Text */}
          {!isRecording && !recordingComplete && (
            <motion.div
              className="text-center mb-8"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
              }}
            >
              <h2 className="text-xl font-semibold mb-2">Describe Your Meal</h2>
              <p className="text-gray-600">
                Tap the microphone and tell us what you ate
              </p>
            </motion.div>
          )}
          {isRecording && (
            <div className="text-center mb-8">
              <p className="text-[#320DFF] font-medium mb-2">Listening...</p>
              <p className="text-gray-500">{formatTime(recordingTime)}</p>
            </div>
          )}
          {/* Transcript */}
          {transcript && (
            <motion.div
              className="w-full bg-gray-50 p-4 rounded-xl mb-8"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <p className="text-gray-900">{transcript}</p>
            </motion.div>
          )}
          {/* Action Buttons */}
          {recordingComplete && (
            <motion.div
              className="w-full flex space-x-4"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 0.2,
              }}
            >
              <Button onClick={handleRetry} variant="secondary" fullWidth>
                Retry
              </Button>
              <Button onClick={handleContinue} variant="primary" fullWidth>
                Continue
              </Button>
            </motion.div>
          )}
          {!isRecording && !recordingComplete && (
            <motion.p
              className="text-sm text-gray-500 text-center"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.5,
              }}
            >
              Try saying: "I had a chicken salad with avocado"
            </motion.p>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/BarcodeInputScreen.tsx
import React, { useEffect, useState, useRef } from 'react'
import { ArrowLeftIcon, ScanLineIcon, ImageIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
interface BarcodeInputScreenProps {
  onBack: () => void
  onCapture: (data: any) => void
}
export const BarcodeInputScreen: React.FC<BarcodeInputScreenProps> = ({
  onBack,
  onCapture,
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerLineRef = useRef<HTMLDivElement>(null)
  const startScanner = async () => {
    try {
      setIsScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      // Simulate barcode detection after a few seconds
      setTimeout(() => {
        const mockBarcode = '5901234123457'
        setScannedCode(mockBarcode)
        stopScanner()
      }, 3000)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setIsScanning(false)
    }
  }
  const stopScanner = () => {
    setIsScanning(false)
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }
  const handleContinue = () => {
    if (scannedCode) {
      onCapture({
        barcode: scannedCode,
      })
    }
  }
  const handleRetry = () => {
    setScannedCode(null)
    startScanner()
  }
  // Animate scanner line
  useEffect(() => {
    let animationId: number
    if (isScanning && scannerLineRef.current) {
      let direction = 1
      let position = 0
      const animate = () => {
        if (scannerLineRef.current) {
          position += direction * 2
          if (position >= 200) {
            direction = -1
          } else if (position <= 0) {
            direction = 1
          }
          scannerLineRef.current.style.transform = `translateY(${position}px)`
          animationId = requestAnimationFrame(animate)
        }
      }
      animationId = requestAnimationFrame(animate)
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isScanning])
  // Start scanner when component mounts
  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [])
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-black">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} className="text-white" />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Scan Barcode</h1>
        </div>
        <div className="flex-1 flex flex-col">
          {/* Scanner Viewfinder */}
          <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
            {isScanning && (
              <>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="min-w-full min-h-full object-cover"
                  />
                </motion.div>
                {/* Overlay with barcode scanner frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-72">
                    {/* Scanner window */}
                    <div className="absolute inset-0 border-2 border-white/50 rounded-lg overflow-hidden">
                      {/* Scanning line */}
                      <div
                        ref={scannerLineRef}
                        className="absolute left-0 right-0 h-2 bg-[#320DFF]/70"
                        style={{
                          boxShadow: '0 0 10px rgba(50, 13, 255, 0.7)',
                        }}
                      ></div>
                    </div>
                    {/* Corner marks */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg"></div>
                  </div>
                </div>
                <p className="absolute bottom-20 left-0 right-0 text-center text-white text-sm">
                  Position barcode within the frame
                </p>
              </>
            )}
            {scannedCode && (
              <motion.div
                className="w-full h-full flex flex-col items-center justify-center p-6"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-4">
                  <ScanLineIcon size={40} className="text-[#320DFF]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Barcode Detected
                </h2>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg mb-4">
                  <p className="text-white font-mono">{scannedCode}</p>
                </div>
                <p className="text-gray-300 text-center">
                  The product will be identified and analyzed in the next step
                </p>
              </motion.div>
            )}
          </div>
          {/* Bottom Controls */}
          <div className="bg-black p-6">
            {scannedCode ? (
              <div className="flex space-x-4">
                <Button onClick={handleRetry} variant="secondary" fullWidth>
                  Scan Again
                </Button>
                <Button onClick={handleContinue} variant="primary" fullWidth>
                  Continue
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-around">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                    <ImageIcon size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-white">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <div className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center">
                  <ScanLineIcon size={30} className="text-white" />
                </div>
                <div className="w-12 opacity-0">
                  {/* Placeholder for layout balance */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/TextInputScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, SendIcon, MicIcon, XIcon } from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
import { motion } from 'framer-motion'
interface TextInputScreenProps {
  onBack: () => void
  onSubmit: (data: any) => void
}
export const TextInputScreen: React.FC<TextInputScreenProps> = ({
  onBack,
  onSubmit,
}) => {
  const [inputText, setInputText] = useState('')
  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit({
        text: inputText.trim(),
      })
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }
  const clearInput = () => {
    setInputText('')
  }
  const suggestions = [
    'Chicken salad with avocado',
    'Greek yogurt with berries',
    'Grilled salmon with vegetables',
    'Protein shake with banana',
  ]
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-xl font-bold">Describe Your Meal</h1>
        </div>
        <div className="flex-1 flex flex-col p-4">
          {/* Instructions */}
          <motion.div
            className="mb-6"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <h2 className="font-semibold mb-2">Tell us what you ate</h2>
            <p className="text-sm text-gray-600">
              Describe your meal in detail and our AI will analyze the
              nutritional content
            </p>
          </motion.div>
          {/* Input Area */}
          <motion.div
            className="bg-gray-50 rounded-xl p-4 mb-6"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="E.g. Grilled chicken salad with avocado, tomatoes, and olive oil dressing"
                className="w-full h-32 bg-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 text-gray-800"
              />
              {inputText && (
                <button
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                  onClick={clearInput}
                >
                  <XIcon size={14} className="text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex justify-between mt-3">
              <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <MicIcon size={18} className="text-gray-700" />
              </button>
              <motion.button
                className={`px-4 py-2 rounded-full flex items-center ${inputText.trim() ? 'bg-[#320DFF] text-white' : 'bg-gray-200 text-gray-400'}`}
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                whileHover={
                  inputText.trim()
                    ? {
                        scale: 1.05,
                      }
                    : {}
                }
                whileTap={
                  inputText.trim()
                    ? {
                        scale: 0.95,
                      }
                    : {}
                }
              >
                <span className="mr-1">Analyze</span>
                <SendIcon size={16} />
              </motion.button>
            </div>
          </motion.div>
          {/* Suggestions */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
              delay: 0.2,
            }}
          >
            <h3 className="font-medium mb-3">Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  className="w-full text-left bg-white border border-gray-100 rounded-lg p-3 shadow-sm"
                  onClick={() => setInputText(suggestion)}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.3 + index * 0.1,
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(50, 13, 255, 0.05)',
                  }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
          {/* Tips */}
          <motion.div
            className="mt-6 bg-[#320DFF]/5 p-4 rounded-lg"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
              delay: 0.6,
            }}
          >
            <h3 className="font-medium mb-2">Tips for Better Results</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Include portion sizes (e.g., 1 cup, 3 oz)</li>
              <li>• Mention cooking methods (e.g., grilled, baked)</li>
              <li>• Describe ingredients and toppings</li>
              <li>• Include brand names if applicable</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/AnalyzingScreen.tsx
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Berry } from '../ui/Berry'
interface AnalyzingScreenProps {
  inputType: string
  data: any
  onResults: (results: any) => void
}
export const AnalyzingScreen: React.FC<AnalyzingScreenProps> = ({
  inputType,
  data,
  onResults,
}) => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 200)
    // Simulate completion after a delay
    const timeout = setTimeout(() => {
      onResults({
        foods: [
          {
            name: 'Grilled Chicken Salad',
            calories: 320,
            protein: 28,
            carbs: 12,
            fat: 16,
          },
          {
            name: 'Avocado',
            calories: 160,
            protein: 2,
            carbs: 8,
            fat: 15,
          },
        ],
        totalCalories: 480,
      })
    }, 4000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onResults])
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="mb-8">
          <Berry variant="search" size="large" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">
          Analyzing Your Food
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Berry is using AI to identify your meal and calculate nutrition
          information
        </p>
        <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
          <motion.div
            className="h-full bg-[#320DFF] rounded-full"
            initial={{
              width: 0,
            }}
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.5,
            }}
          ></motion.div>
        </div>
        <p className="text-sm text-gray-500">{progress}%</p>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/FoodResultsScreen.tsx
import React, { useEffect, useState, Children } from 'react'
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  CheckIcon,
  Trash2Icon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface FoodItem {
  id: string
  name: string
  brand?: string
  image?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: string
  confidence?: number
  parent?: string
  isFavorite?: boolean
}
interface FoodGroup {
  id: string
  name: string
  image?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items: FoodItem[]
  expanded: boolean
  isFavorite?: boolean
}
interface FoodResultsScreenProps {
  results: any
  onBack: () => void
  onSave: () => void
  onAddMore: () => void
  onRefine: (data: any) => void
}
export const FoodResultsScreen: React.FC<FoodResultsScreenProps> = ({
  results,
  onBack,
  onSave,
  onAddMore,
  onRefine,
}) => {
  const [selectedMeal, setSelectedMeal] = useState('Lunch')
  const [servingSize, setServingSize] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [editedResults, setEditedResults] = useState(results)
  const [favoriteItems, setFavoriteItems] = useState<string[]>([])
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type?: 'success' | 'error' | 'info'
  }>({
    show: false,
    message: '',
  })
  // Organize food items into groups/individual items
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([
    {
      id: 'sandwich',
      name: 'Turkey Sandwich',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      expanded: true,
      isFavorite: false,
      items: [
        {
          id: 'bread',
          name: 'Whole Wheat Bread',
          quantity: '2 slices',
          calories: 140,
          protein: 6,
          carbs: 24,
          fat: 2,
          parent: 'sandwich',
          isFavorite: false,
        },
        {
          id: 'turkey',
          name: 'Turkey Breast',
          quantity: '3 oz',
          calories: 90,
          protein: 19,
          carbs: 0,
          fat: 1,
          parent: 'sandwich',
          isFavorite: false,
        },
        {
          id: 'lettuce',
          name: 'Lettuce',
          quantity: '0.5 cup',
          calories: 4,
          protein: 0.5,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
          isFavorite: false,
        },
        {
          id: 'tomato',
          name: 'Tomato',
          quantity: '2 slices',
          calories: 5,
          protein: 0.3,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
          isFavorite: false,
        },
      ],
    },
    {
      id: 'chips',
      name: 'Potato Chips',
      calories: 150,
      protein: 2,
      carbs: 15,
      fat: 10,
      expanded: true,
      isFavorite: false,
      items: [],
    },
    {
      id: 'pickle',
      name: 'Dill Pickle',
      calories: 12,
      protein: 0.5,
      carbs: 2,
      fat: 0.1,
      expanded: true,
      isFavorite: false,
      items: [],
    },
  ])
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  const handleServingChange = (change: number) => {
    const newSize = Math.max(0.5, servingSize + change)
    setServingSize(newSize)
    hapticFeedback.selection()
    // Update nutrition values based on serving size
    const scaleFactor = newSize / servingSize
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        calories: Math.round(group.calories * scaleFactor),
        protein: Math.round(group.protein * scaleFactor),
        carbs: Math.round(group.carbs * scaleFactor),
        fat: Math.round(group.fat * scaleFactor),
        items: group.items.map((item) => ({
          ...item,
          calories: Math.round(item.calories * scaleFactor),
          protein: Math.round(item.protein * scaleFactor),
          carbs: Math.round(item.carbs * scaleFactor),
          fat: Math.round(item.fat * scaleFactor),
        })),
      })),
    )
    // Update total nutrition values
    if (results) {
      setEditedResults({
        ...results,
        totalCalories: Math.round(calculateTotalCalories() * scaleFactor),
        totalProtein: Math.round(calculateTotalProtein() * scaleFactor),
        totalCarbs: Math.round(calculateTotalCarbs() * scaleFactor),
        totalFat: Math.round(calculateTotalFat() * scaleFactor),
      })
    }
  }
  const calculateTotalCalories = () => {
    return foodGroups.reduce((total, group) => total + group.calories, 0)
  }
  const calculateTotalProtein = () => {
    return foodGroups.reduce((total, group) => total + group.protein, 0)
  }
  const calculateTotalCarbs = () => {
    return foodGroups.reduce((total, group) => total + group.carbs, 0)
  }
  const calculateTotalFat = () => {
    return foodGroups.reduce((total, group) => total + group.fat, 0)
  }
  const toggleGroupExpanded = (groupId: string) => {
    hapticFeedback.selection()
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              expanded: !group.expanded,
            }
          : group,
      ),
    )
  }
  const handleDeleteItem = (groupId: string, itemId?: string) => {
    hapticFeedback.impact()
    if (!itemId) {
      // Delete entire group
      setFoodGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupId),
      )
      return
    }
    // Delete specific item from group
    setFoodGroups(
      (prevGroups) =>
        prevGroups
          .map((group) => {
            if (group.id === groupId) {
              const updatedItems = group.items.filter(
                (item) => item.id !== itemId,
              )
              // If all items are deleted, remove the group
              if (group.items.length > 0 && updatedItems.length === 0) {
                return null
              }
              // Recalculate group totals
              const itemCalories =
                group.items.find((item) => item.id === itemId)?.calories || 0
              const itemProtein =
                group.items.find((item) => item.id === itemId)?.protein || 0
              const itemCarbs =
                group.items.find((item) => item.id === itemId)?.carbs || 0
              const itemFat =
                group.items.find((item) => item.id === itemId)?.fat || 0
              return {
                ...group,
                items: updatedItems,
                calories: group.calories - itemCalories,
                protein: group.protein - itemProtein,
                carbs: group.carbs - itemCarbs,
                fat: group.fat - itemFat,
              }
            }
            return group
          })
          .filter(Boolean) as FoodGroup[],
    )
  }
  const handleEditItem = (groupId: string, itemId?: string) => {
    hapticFeedback.selection()
    // This would navigate to an edit screen for the specific item
    console.log(`Edit ${itemId ? 'item' : 'group'} ${itemId || groupId}`)
  }
  // New function to handle favoriting items and groups with cascading effect
  const handleToggleFavorite = (groupId: string, itemId?: string) => {
    hapticFeedback.impact()
    // Update the food groups state
    setFoodGroups((prevGroups) => {
      const newGroups = [...prevGroups]
      // Find the group
      const groupIndex = newGroups.findIndex((g) => g.id === groupId)
      if (groupIndex === -1) return prevGroups
      if (!itemId) {
        // Toggle favorite for the entire group
        const group = newGroups[groupIndex]
        const newFavoriteState = !group.isFavorite
        // Update the group
        newGroups[groupIndex] = {
          ...group,
          isFavorite: newFavoriteState,
          // Cascade the favorite state to all items in the group
          items: group.items.map((item) => ({
            ...item,
            isFavorite: newFavoriteState,
          })),
        }
        // Show notification
        setNotification({
          show: true,
          message: newFavoriteState
            ? `${group.name} added to favorites`
            : `${group.name} removed from favorites`,
          type: newFavoriteState ? 'success' : 'info',
        })
      } else {
        // Toggle favorite for a specific item
        const group = newGroups[groupIndex]
        const itemIndex = group.items.findIndex((item) => item.id === itemId)
        if (itemIndex !== -1) {
          const item = group.items[itemIndex]
          const newFavoriteState = !item.isFavorite
          // Update the item
          const newItems = [...group.items]
          newItems[itemIndex] = {
            ...item,
            isFavorite: newFavoriteState,
          }
          newGroups[groupIndex] = {
            ...group,
            items: newItems,
          }
          // Show notification
          setNotification({
            show: true,
            message: newFavoriteState
              ? `${item.name} added to favorites`
              : `${item.name} removed from favorites`,
            type: newFavoriteState ? 'success' : 'info',
          })
        }
      }
      return newGroups
    })
  }
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: '',
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])
  const handleRefine = () => {
    hapticFeedback.selection()
    onRefine(editedResults)
  }
  const toggleEdit = () => {
    hapticFeedback.selection()
    setIsEditing(!isEditing)
  }
  const handleSaveMeal = () => {
    hapticFeedback.success()
    onSave()
  }
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-50"
              initial={{
                y: 50,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 50,
                opacity: 0,
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={onBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold">Analysis Results</h1>
            <p className="text-sm text-gray-500">Review and save your meal</p>
          </div>
        </div>

        <motion.div
          className="px-4 py-2 flex-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Food Items/Groups */}
          {foodGroups.map((group) => (
            <motion.div
              key={group.id}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4"
              variants={itemVariants}
            >
              <div className="flex">
                {group.image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 bg-gray-100">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <h2 className="font-semibold">{group.name}</h2>
                      {group.items.length > 0 && (
                        <button
                          className="ml-2 p-1 rounded-full hover:bg-gray-100"
                          onClick={() => toggleGroupExpanded(group.id)}
                        >
                          {group.expanded ? (
                            <ChevronUpIcon
                              size={16}
                              className="text-gray-500"
                            />
                          ) : (
                            <ChevronDownIcon
                              size={16}
                              className="text-gray-500"
                            />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-gray-500"
                        onClick={() => handleToggleFavorite(group.id)}
                      >
                        <HeartIcon
                          size={18}
                          className={
                            group.isFavorite
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                      {isEditing && (
                        <>
                          <button
                            className="text-[#320DFF] text-sm flex items-center"
                            onClick={() => handleEditItem(group.id)}
                          >
                            <PencilIcon size={14} className="mr-1" />
                            Edit
                          </button>
                          <button
                            className="text-red-500 text-sm flex items-center"
                            onClick={() => handleDeleteItem(group.id)}
                          >
                            <Trash2Icon size={14} className="mr-1" />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-sm">
                      <p className="font-medium">{group.calories} cal</p>
                    </div>
                    <div className="flex space-x-3 text-xs text-gray-500">
                      <span>Protein: {group.protein}g</span>
                      <span>Carbs: {group.carbs}g</span>
                      <span>Fat: {group.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable ingredients list */}
              {group.items.length > 0 && group.expanded && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Ingredients:</p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {group.items.map((item) => (
                        <motion.div
                          key={item.id}
                          className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: 'auto',
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right mr-2">
                              <p className="text-sm font-medium">
                                {item.calories} cal
                              </p>
                              <div className="flex text-xs text-gray-500">
                                <span className="w-[90px] text-right">
                                  Protein: {item.protein}g
                                </span>
                                <span className="w-[80px] text-right">
                                  Carbs: {item.carbs}g
                                </span>
                                <span className="w-[60px] text-right">
                                  Fat: {item.fat}g
                                </span>
                              </div>
                            </div>
                            <div className="flex">
                              <button
                                className="p-1 text-gray-500"
                                onClick={() =>
                                  handleToggleFavorite(group.id, item.id)
                                }
                              >
                                <HeartIcon
                                  size={14}
                                  className={
                                    item.isFavorite
                                      ? 'text-red-500 fill-red-500'
                                      : 'text-gray-300'
                                  }
                                />
                              </button>
                              {isEditing && (
                                <>
                                  <button
                                    className="p-1 text-[#320DFF]"
                                    onClick={() =>
                                      handleEditItem(group.id, item.id)
                                    }
                                  >
                                    <PencilIcon size={14} />
                                  </button>
                                  <button
                                    className="p-1 text-red-500"
                                    onClick={() =>
                                      handleDeleteItem(group.id, item.id)
                                    }
                                  >
                                    <Trash2Icon size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Serving Size Adjuster */}
          <motion.div
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4"
            variants={itemVariants}
          >
            <h3 className="font-medium mb-3">Serving Size</h3>
            <div className="flex items-center justify-between">
              <button
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                onClick={() => handleServingChange(-0.5)}
                disabled={servingSize <= 0.5}
              >
                <span className="text-xl font-medium">-</span>
              </button>
              <div className="text-center">
                <span className="text-xl font-semibold">{servingSize}</span>
                <span className="text-gray-500 ml-1">
                  serving{servingSize !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                onClick={() => handleServingChange(0.5)}
              >
                <span className="text-xl font-medium">+</span>
              </button>
            </div>
          </motion.div>

          {/* Meal Type Selector */}
          <motion.div
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4"
            variants={itemVariants}
          >
            <h3 className="font-medium mb-3">Meal Type</h3>
            <div className="grid grid-cols-4 gap-2">
              {mealOptions.map((meal) => (
                <button
                  key={meal}
                  className={`py-2 rounded-lg text-center text-sm ${selectedMeal === meal ? 'bg-[#320DFF] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSelectedMeal(meal)}
                >
                  {meal}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Nutrition Summary */}
          <motion.div
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Nutrition Summary</h3>
              <button
                className="text-[#320DFF] text-sm flex items-center"
                onClick={toggleEdit}
              >
                {isEditing ? (
                  <>
                    <CheckIcon size={14} className="mr-1" />
                    Done
                  </>
                ) : (
                  <>
                    <PencilIcon size={14} className="mr-1" />
                    Edit
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Calories</span>
              <span className="font-semibold">
                {calculateTotalCalories()} cal
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Protein</span>
                  <span>{calculateTotalProtein()}g</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#42A5F5]"
                    style={{
                      width: `${(calculateTotalProtein() / (calculateTotalProtein() + calculateTotalCarbs() + calculateTotalFat())) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Carbs</span>
                  <span>{calculateTotalCarbs()}g</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFA726]"
                    style={{
                      width: `${(calculateTotalCarbs() / (calculateTotalProtein() + calculateTotalCarbs() + calculateTotalFat())) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fat</span>
                  <span>{calculateTotalFat()}g</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#66BB6A]"
                    style={{
                      width: `${(calculateTotalFat() / (calculateTotalProtein() + calculateTotalCarbs() + calculateTotalFat())) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <Button onClick={handleSaveMeal} variant="primary" fullWidth>
              Save Meal
            </Button>
            <div className="flex space-x-3">
              <Button onClick={onAddMore} variant="secondary" fullWidth>
                <PlusIcon size={18} className="mr-1" />
                Add More
              </Button>
              <Button onClick={handleRefine} variant="secondary" fullWidth>
                <SparklesIcon size={18} className="mr-1" />
                Refine with AI
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

```
```components/ui/AnimatedNumber.tsx
import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
interface AnimatedNumberProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
  className?: string
}
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1.5,
  formatValue = (val) => Math.round(val).toString(),
  className = '',
}) => {
  // Use spring physics for natural animation
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration,
  })
  // Transform the animated value to formatted text
  const displayValue = useTransform(springValue, (current) =>
    formatValue(current),
  )
  // Update the spring value when the prop changes
  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])
  return (
    <motion.span
      className={className}
      style={{
        display: 'inline-block',
      }}
      initial={{
        scale: 0.8,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
    >
      {displayValue}
    </motion.span>
  )
}

```
```components/ui/ElasticButton.tsx
import React from 'react'
import { motion } from 'framer-motion'
interface ElasticButtonProps {
  children: React.ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  color?: 'primary' | 'secondary' | 'white'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
}
export const ElasticButton: React.FC<ElasticButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  color = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
}) => {
  // Color variants
  const colorVariants = {
    primary: 'bg-[#320DFF] text-white hover:bg-[#280ACC]',
    secondary: 'bg-[#320DFF]/10 text-[#320DFF] hover:bg-[#320DFF]/20',
    white: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
  }
  // Size variants
  const sizeVariants = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-3 px-6',
    lg: 'text-lg py-4 px-8',
  }
  return (
    <motion.button
      className={`flex items-center justify-center rounded-full font-medium transition-colors ${colorVariants[color]} ${sizeVariants[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{
        scale: 0.95,
        // Elastic squish effect
        scaleX: 0.9,
        scaleY: 0.98,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 10,
        },
      }}
      whileHover={{
        scale: 1.02,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 10,
        },
      }}
      initial={{
        opacity: 0.9,
      }}
      animate={{
        opacity: 1,
      }}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  )
}

```
```components/ui/GlassMorphism.tsx
import React from 'react'
import { motion } from 'framer-motion'
interface GlassMorphismProps {
  children: React.ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'heavy'
  color?: string
  rounded?: boolean
  border?: boolean
}
export const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className = '',
  intensity = 'medium',
  color = '#ffffff',
  rounded = true,
  border = true,
}) => {
  // Intensity variants
  const intensityVariants = {
    light: 'bg-opacity-20 backdrop-blur-sm',
    medium: 'bg-opacity-30 backdrop-blur-md',
    heavy: 'bg-opacity-40 backdrop-blur-lg',
  }
  // Construct the background color with opacity
  const bgColor = color === '#ffffff' ? 'bg-white' : `bg-[${color}]`
  return (
    <motion.div
      className={`${bgColor} ${intensityVariants[intensity]} ${rounded ? 'rounded-xl' : ''} ${border ? 'border border-white/20' : ''} ${className} overflow-hidden`}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  )
}

```
```components/ui/ParticleEffect.tsx
import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  velocity: {
    x: number
    y: number
  }
  opacity: number
  rotation: number
}
interface ParticleEffectProps {
  type?: 'confetti' | 'sparkle' | 'achievement'
  intensity?: 'low' | 'medium' | 'high'
  duration?: number
  autoPlay?: boolean
  colors?: string[]
  className?: string
}
export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  type = 'confetti',
  intensity = 'medium',
  duration = 2,
  autoPlay = true,
  colors = ['#320DFF', '#FF4D4D', '#FFD60A', '#4CAF50', '#FF9800'],
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const isActiveRef = useRef<boolean>(false)
  // Number of particles based on intensity
  const particleCount = {
    low: 20,
    medium: 50,
    high: 100,
  }[intensity]
  // Initialize particles
  const initParticles = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 10 + 5
      particles.push({
        id: i,
        x: canvas.width / 2,
        y: canvas.height / 2,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8 - 3,
        },
        opacity: 1,
        rotation: Math.random() * 360,
      })
    }
    particlesRef.current = particles
  }
  // Animation loop
  const animate = () => {
    if (!canvasRef.current || !isActiveRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let stillActive = false
    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.velocity.x
      particle.y += particle.velocity.y
      // Apply gravity for confetti
      if (type === 'confetti') {
        particle.velocity.y += 0.1
      }
      // Fade out
      particle.opacity -= 0.005
      // Rotate confetti
      if (type === 'confetti') {
        particle.rotation += particle.velocity.x * 0.5
      }
      // Draw particle
      if (particle.opacity > 0) {
        stillActive = true
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        if (type === 'confetti') {
          ctx.fillStyle = particle.color
          ctx.fillRect(
            -particle.size / 2,
            -particle.size / 4,
            particle.size,
            particle.size / 2,
          )
        } else if (type === 'sparkle') {
          ctx.fillStyle = particle.color
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5
            const innerRadius = particle.size / 4
            const outerRadius = particle.size / 2
            const x1 = Math.cos(angle) * outerRadius
            const y1 = Math.sin(angle) * outerRadius
            const x2 = Math.cos(angle + Math.PI / 5) * innerRadius
            const y2 = Math.sin(angle + Math.PI / 5) * innerRadius
            if (i === 0) {
              ctx.moveTo(x1, y1)
            } else {
              ctx.lineTo(x1, y1)
            }
            ctx.lineTo(x2, y2)
          }
          ctx.closePath()
          ctx.fill()
        } else if (type === 'achievement') {
          // Draw a trophy or medal shape
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(0, 0, particle.size / 3, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }
    })
    if (stillActive) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      isActiveRef.current = false
    }
  }
  // Play animation
  const play = () => {
    if (isActiveRef.current) return
    isActiveRef.current = true
    initParticles()
    animationRef.current = requestAnimationFrame(animate)
    // Auto-stop after duration
    setTimeout(() => {
      isActiveRef.current = false
    }, duration * 1000)
  }
  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    if (autoPlay) {
      play()
    }
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])
  return (
    <motion.canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.3,
      }}
    />
  )
}

```
```components/ui/KineticTypography.tsx
import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
interface KineticTypographyProps {
  text: string
  className?: string
  effect?: 'bounce' | 'wave' | 'stagger' | 'shake'
  duration?: number
  delay?: number
  repeat?: number | boolean
}
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  text,
  className = '',
  effect = 'stagger',
  duration = 0.5,
  delay = 0,
  repeat = false,
}) => {
  const [characters, setCharacters] = useState<string[]>([])
  const controls = useAnimation()
  useEffect(() => {
    setCharacters(text.split(''))
  }, [text])
  useEffect(() => {
    const startAnimation = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000))
      if (effect === 'stagger') {
        await controls.start((i) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.05,
            duration,
          },
        }))
      } else {
        await controls.start('animate')
      }
      if (repeat) {
        const repeatCount = typeof repeat === 'number' ? repeat : Infinity
        let count = 0
        while (count < repeatCount) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          if (effect === 'stagger') {
            await controls.start((i) => ({
              opacity: 0,
              y: 10,
              transition: {
                duration: 0.2,
              },
            }))
            await controls.start((i) => ({
              opacity: 1,
              y: 0,
              transition: {
                delay: i * 0.05,
                duration,
              },
            }))
          } else {
            await controls.start('initial')
            await controls.start('animate')
          }
          count++
        }
      }
    }
    startAnimation()
  }, [controls, effect, duration, delay, repeat])
  // Define animation variants for different effects
  const getVariants = () => {
    switch (effect) {
      case 'bounce':
        return {
          initial: {
            y: 0,
          },
          animate: {
            y: [0, -15, 0],
            transition: {
              times: [0, 0.5, 1],
              duration,
              ease: 'easeInOut',
            },
          },
        }
      case 'wave':
        return {
          initial: {
            y: 0,
          },
          animate: (i: number) => ({
            y: [0, -10, 0],
            transition: {
              times: [0, 0.5, 1],
              delay: i * 0.05,
              duration,
              ease: 'easeInOut',
            },
          }),
        }
      case 'shake':
        return {
          initial: {
            x: 0,
          },
          animate: {
            x: [0, -5, 5, -5, 5, 0],
            transition: {
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              duration,
              ease: 'easeInOut',
            },
          },
        }
      default:
        return {
          initial: {
            opacity: 0,
            y: 10,
          },
          animate: {
            opacity: 1,
            y: 0,
          },
        }
    }
  }
  const variants = getVariants()
  return (
    <span className={`inline-flex ${className}`}>
      {characters.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          custom={index}
          initial={
            effect === 'stagger'
              ? {
                  opacity: 0,
                  y: 10,
                }
              : 'initial'
          }
          animate={controls}
          variants={variants}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

```
```components/food-input/AIDescriptionScreen.tsx
import React, { useState, useRef } from 'react'
import { ArrowLeftIcon, MicIcon, SendIcon, SparklesIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface AIDescriptionScreenProps {
  onBack: () => void
  onSubmit: (data: any) => void
}
export const AIDescriptionScreen: React.FC<AIDescriptionScreenProps> = ({
  onBack,
  onSubmit,
}) => {
  const { colors, isDark } = useTheme()
  const [description, setDescription] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const examples = [
    '2 scrambled eggs with butter, wheat toast with peanut butter, and orange juice',
    'Grilled chicken salad with avocado, tomatoes, and olive oil dressing',
    'Protein shake with banana, peanut butter, and almond milk',
    'Turkey sandwich on whole wheat with lettuce, tomato, and mayo',
  ]
  const handleVoiceInput = () => {
    hapticFeedback.impact()
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setDescription(
          (prev) =>
            prev +
            (prev ? ' ' : '') +
            examples[Math.floor(Math.random() * examples.length)],
        )
        setIsListening(false)
        hapticFeedback.success()
      }, 3000)
    }
  }
  const handleSubmit = () => {
    if (!description.trim()) return
    hapticFeedback.impact()
    setIsAnalyzing(true)
    // Simulate API call to analyze food
    setTimeout(() => {
      const mockResult = {
        items: [
          {
            name: 'Scrambled eggs',
            quantity: '2 large',
            calories: 180,
            protein: 12,
            carbs: 1,
            fat: 12,
          },
          {
            name: 'Butter',
            quantity: '1 tbsp',
            calories: 100,
            protein: 0,
            carbs: 0,
            fat: 11,
          },
          {
            name: 'Wheat toast',
            quantity: '1 slice',
            calories: 80,
            protein: 3,
            carbs: 15,
            fat: 1,
          },
          {
            name: 'Peanut butter',
            quantity: '1 tbsp',
            calories: 95,
            protein: 4,
            carbs: 3,
            fat: 8,
          },
          {
            name: 'Orange juice',
            quantity: '1 cup',
            calories: 110,
            protein: 2,
            carbs: 26,
            fat: 0,
          },
        ],
        total: {
          calories: 565,
          protein: 21,
          carbs: 45,
          fat: 32,
        },
      }
      setIsAnalyzing(false)
      hapticFeedback.success()
      onSubmit(mockResult)
    }, 2000)
  }
  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }
  return (
    <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Describe Your Meal
          </h1>
        </div>
        <div className="px-4 py-4 flex-1 flex flex-col">
          <div className="mb-4 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border-none rounded-xl p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 flex-shrink-0">
                <SparklesIcon
                  size={20}
                  className="text-[#320DFF] dark:text-[#6D56FF]"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  AI-Powered Food Analysis
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Describe what you ate, and our AI will analyze the nutrition
                  for you.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div
              className="flex-1 mb-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
              onClick={focusTextarea}
            >
              <textarea
                ref={textareaRef}
                className="w-full h-full min-h-[150px] bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none"
                placeholder="Describe your meal in detail. For example: '2 scrambled eggs cooked in butter, 1 slice of wheat toast with peanut butter, and a cup of orange juice'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tips for better results:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li>
                  Include portion sizes (e.g., "1 cup of rice, 200g chicken")
                </li>
                <li>Mention cooking methods (e.g., grilled, boiled, fried)</li>
                <li>List all major ingredients and toppings</li>
                <li>Include brand names if relevant for packaged foods</li>
              </ul>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Example meals:
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <motion.button
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full"
                    onClick={() => {
                      hapticFeedback.selection()
                      setDescription(example)
                    }}
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    {example.length > 25
                      ? example.substring(0, 25) + '...'
                      : example}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              className={`w-14 h-14 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : 'bg-gray-100 dark:bg-gray-800'}`}
              onClick={handleVoiceInput}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <MicIcon
                size={24}
                className={
                  isListening
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }
              />
            </motion.button>
            <Button
              variant="primary"
              disabled={!description.trim() || isAnalyzing}
              onClick={handleSubmit}
              fullWidth
              loading={isAnalyzing}
              icon={<SendIcon size={18} />}
              iconPosition="right"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Food'}
            </Button>
          </div>
          <AnimatePresence>
            {isListening && (
              <motion.div
                className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                }}
              >
                <div className="flex space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-5 bg-[#320DFF] dark:bg-[#6D56FF] rounded-full"
                      animate={{
                        height: [5, 15, 5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Listening...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/FoodDetailScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, MinusIcon, PlusIcon, BookmarkIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface FoodDetailScreenProps {
  food?: any // Replace with proper type
  onBack: () => void
  onAddToLog: (food: any, quantity: number, mealType: string) => void
}
export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({
  food = {
    name: 'Grilled Chicken Breast',
    brand: 'Generic',
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    vitamins: [
      {
        name: 'Vitamin B6',
        amount: '15%',
      },
      {
        name: 'Niacin',
        amount: '50%',
      },
      {
        name: 'Phosphorus',
        amount: '20%',
      },
      {
        name: 'Selenium',
        amount: '36%',
      },
    ],
  },
  onBack,
  onAddToLog,
}) => {
  const { colors, isDark } = useTheme()
  const [quantity, setQuantity] = useState(1)
  const [mealType, setMealType] = useState('lunch')
  const [isFavorite, setIsFavorite] = useState(false)
  const handleQuantityChange = (value: number) => {
    if (quantity + value > 0) {
      hapticFeedback.selection()
      setQuantity(quantity + value)
    }
  }
  const handleMealTypeChange = (type: string) => {
    hapticFeedback.selection()
    setMealType(type)
  }
  const handleAddToLog = () => {
    hapticFeedback.success()
    onAddToLog(food, quantity, mealType)
  }
  const toggleFavorite = () => {
    hapticFeedback.impact()
    setIsFavorite(!isFavorite)
  }
  // Calculate nutrition based on quantity
  const calculateNutrition = (value: number) => {
    return Math.round(value * quantity)
  }
  return (
    <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                onBack()
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Food Details
            </h1>
          </div>
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            onClick={toggleFavorite}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <BookmarkIcon
              size={20}
              className={
                isFavorite
                  ? 'text-[#320DFF] dark:text-[#6D56FF] fill-[#320DFF] dark:fill-[#6D56FF]'
                  : 'text-gray-700 dark:text-gray-300'
              }
            />
          </motion.button>
        </div>
        <div className="px-4 py-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {food.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {food.brand}
            </p>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Serving Size
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {food.servingSize}
                </p>
              </div>
              <div className="flex items-center">
                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <MinusIcon
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </motion.button>
                <span className="mx-4 font-bold text-lg text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  onClick={() => handleQuantityChange(1)}
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <PlusIcon
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </motion.button>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Calories
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.calories)}
                </p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#320DFF] dark:bg-[#6D56FF]"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: '100%',
                  }}
                  transition={{
                    duration: 0.8,
                  }}
                ></motion.div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Carbs
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.carbs)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFA726]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(food.carbs / (food.carbs + food.protein + food.fat)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.1,
                    }}
                  ></motion.div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Protein
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.protein)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#42A5F5]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(food.protein / (food.carbs + food.protein + food.fat)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                    }}
                  ></motion.div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fat</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.fat)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#66BB6A]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(food.fat / (food.carbs + food.protein + food.fat)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3,
                    }}
                  ></motion.div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Nutrition Facts
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Fiber
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(food.fiber)}g
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Sugar
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(food.sugar)}g
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Sodium
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(food.sodium)}mg
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Vitamins & Minerals
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {food.vitamins.map((vitamin: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {vitamin.name}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {vitamin.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              Add to meal:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                <motion.button
                  key={meal}
                  className={`py-2 rounded-lg text-sm font-medium ${mealType === meal ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => handleMealTypeChange(meal)}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
          <Button variant="primary" fullWidth onClick={handleAddToLog}>
            Add to Log ({calculateNutrition(food.calories)} cal)
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/SearchResultsScreen.tsx
import React, { useEffect, useState } from 'react'
import { ArrowLeftIcon, SearchIcon, FilterIcon, XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Skeleton } from '../ui/Skeleton'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
import { Berry } from '../ui/Berry'
import { EmptyStateScreen } from '../screens/EmptyStateScreen'
interface SearchResultsScreenProps {
  query?: string
  onBack: () => void
  onSelectFood: (food: any) => void
}
export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  query = '',
  onBack,
  onSelectFood,
}) => {
  const { colors, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState(query)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  // Mock food data
  const mockFoods = [
    {
      id: 1,
      name: 'Grilled Chicken Breast',
      brand: 'Generic',
      servingSize: '100g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      category: 'protein',
    },
    {
      id: 2,
      name: 'Avocado',
      brand: 'Fresh Produce',
      servingSize: '1 medium (150g)',
      calories: 240,
      protein: 3,
      carbs: 12,
      fat: 22,
      category: 'vegetable',
    },
    {
      id: 3,
      name: 'Brown Rice',
      brand: 'Organic',
      servingSize: '1 cup cooked (195g)',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      category: 'grain',
    },
    {
      id: 4,
      name: 'Greek Yogurt',
      brand: 'Fage',
      servingSize: '170g container',
      calories: 100,
      protein: 18,
      carbs: 6,
      fat: 0,
      category: 'dairy',
    },
    {
      id: 5,
      name: 'Salmon Fillet',
      brand: 'Wild Caught',
      servingSize: '100g',
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      category: 'protein',
    },
  ]
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }, [searchQuery, selectedFilter])
  const performSearch = (query: string) => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockFoods.filter((food) => {
        const matchesQuery = food.name
          .toLowerCase()
          .includes(query.toLowerCase())
        const matchesFilter =
          selectedFilter === 'all' || food.category === selectedFilter
        return matchesQuery && matchesFilter
      })
      setResults(filtered)
      setIsLoading(false)
      hapticFeedback.selection()
    }, 800)
  }
  const handleSearch = () => {
    if (searchQuery.trim()) {
      hapticFeedback.selection()
      performSearch(searchQuery)
    }
  }
  const clearSearch = () => {
    hapticFeedback.selection()
    setSearchQuery('')
    setResults([])
  }
  const handleFilterChange = (filter: string) => {
    hapticFeedback.selection()
    setSelectedFilter(filter)
    setFilterOpen(false)
  }
  const handleSelectFood = (food: any) => {
    hapticFeedback.impact()
    onSelectFood(food)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Search Foods
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          {results.length > 0 ? (
            <>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon
                    size={18}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <motion.button
                      onClick={clearSearch}
                      whileHover={{
                        scale: 1.1,
                      }}
                      whileTap={{
                        scale: 0.9,
                      }}
                    >
                      <XIcon
                        size={18}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </motion.button>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isLoading
                    ? 'Searching...'
                    : results.length > 0
                      ? `${results.length} results found`
                      : searchQuery
                        ? 'No results found'
                        : 'Enter a search term'}
                </p>
                <motion.button
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${filterOpen || selectedFilter !== 'all' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => {
                    hapticFeedback.selection()
                    setFilterOpen(!filterOpen)
                  }}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <FilterIcon size={16} />
                  <span className="text-sm font-medium">Filter</span>
                </motion.button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {results.map((food, index) => (
                      <motion.div
                        key={food.id}
                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm"
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -20,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                        onClick={() => handleSelectFood(food)}
                        whileHover={{
                          scale: 1.02,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {food.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {food.brand} • {food.servingSize}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {food.calories} cal
                            </p>
                            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>C: {food.carbs}g</span>
                              <span>P: {food.protein}g</span>
                              <span>F: {food.fat}g</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <EmptyStateScreen
              title="No Results Found"
              description={`Berry couldn't find any foods matching "${query}". Try a different search term or add a custom food.`}
              buttonText="Add Custom Food"
              onAction={() => {}}
            />
          )}
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/AnalyzingResultsScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  ArrowLeftIcon,
  EditIcon,
  PlusIcon,
  CheckIcon,
  XIcon,
  HeartIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface FoodItem {
  id: string
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
  isFavorite?: boolean
}
interface AnalyzingResultsScreenProps {
  results: any
  onBack: () => void
  onSave: (results: any) => void
  onEdit: (item: any, index: number) => void
}
export const AnalyzingResultsScreen: React.FC<AnalyzingResultsScreenProps> = ({
  results = {
    items: [
      {
        id: '1',
        name: 'Scrambled eggs',
        quantity: '2 large',
        calories: 180,
        protein: 12,
        carbs: 1,
        fat: 12,
        isFavorite: false,
      },
      {
        id: '2',
        name: 'Butter',
        quantity: '1 tbsp',
        calories: 100,
        protein: 0,
        carbs: 0,
        fat: 11,
        isFavorite: false,
      },
      {
        id: '3',
        name: 'Wheat toast',
        quantity: '1 slice',
        calories: 80,
        protein: 3,
        carbs: 15,
        fat: 1,
        isFavorite: false,
      },
      {
        id: '4',
        name: 'Peanut butter',
        quantity: '1 tbsp',
        calories: 95,
        protein: 4,
        carbs: 3,
        fat: 8,
        isFavorite: false,
      },
      {
        id: '5',
        name: 'Orange juice',
        quantity: '1 cup',
        calories: 110,
        protein: 2,
        carbs: 26,
        fat: 0,
        isFavorite: false,
      },
    ],
    total: {
      calories: 565,
      protein: 21,
      carbs: 45,
      fat: 32,
    },
  },
  onBack,
  onSave,
  onEdit,
}) => {
  const { colors, isDark } = useTheme()
  const [mealType, setMealType] = useState('breakfast')
  const [items, setItems] = useState<FoodItem[]>(results.items)
  const [totals, setTotals] = useState(results.total)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type?: 'success' | 'error' | 'info'
  }>({
    show: false,
    message: '',
  })
  useEffect(() => {
    // Calculate totals whenever items change
    const newTotals = items.reduce(
      (acc, item) => {
        return {
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
        }
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    )
    setTotals(newTotals)
  }, [items])
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: '',
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])
  const handleMealTypeChange = (type: string) => {
    hapticFeedback.selection()
    setMealType(type)
  }
  const handleRemoveItem = (index: number) => {
    hapticFeedback.impact()
    setItems(items.filter((_, i) => i !== index))
  }
  const toggleSelectItem = (index: number) => {
    hapticFeedback.selection()
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }
  const handleToggleFavorite = (index: number) => {
    hapticFeedback.impact()
    setItems((prevItems) => {
      const newItems = [...prevItems]
      const item = newItems[index]
      if (!item) return prevItems
      const newFavoriteState = !item.isFavorite
      newItems[index] = {
        ...item,
        isFavorite: newFavoriteState,
      }
      // Show notification
      setNotification({
        show: true,
        message: newFavoriteState
          ? `${item.name} added to favorites`
          : `${item.name} removed from favorites`,
        type: newFavoriteState ? 'success' : 'info',
      })
      return newItems
    })
  }
  const handleSave = () => {
    hapticFeedback.success()
    onSave({
      items,
      total: totals,
      mealType,
    })
  }
  return (
    <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-20">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-50"
              initial={{
                y: 50,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 50,
                opacity: 0,
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Analysis Results
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and adjust if needed
            </p>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Nutrition Summary
              </h2>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {totals.calories} cal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Carbs
                </p>
                <div className="flex items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totals.carbs}g
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({Math.round(((totals.carbs * 4) / totals.calories) * 100)}
                    %)
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFA726]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${((totals.carbs * 4) / totals.calories) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Protein
                </p>
                <div className="flex items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totals.protein}g
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (
                    {Math.round(((totals.protein * 4) / totals.calories) * 100)}
                    %)
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#42A5F5]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${((totals.protein * 4) / totals.calories) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.1,
                    }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fat
                </p>
                <div className="flex items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totals.fat}g
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({Math.round(((totals.fat * 9) / totals.calories) * 100)}%)
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#66BB6A]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${((totals.fat * 9) / totals.calories) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                    }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              Add to meal:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                <motion.button
                  key={meal}
                  className={`py-2 rounded-lg text-sm font-medium ${mealType === meal ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => handleMealTypeChange(meal)}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Food Items
              </h2>
              <div className="flex space-x-2">
                <motion.button
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <PlusIcon
                    size={14}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Add Item
                  </span>
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${selectedItems.includes(index) ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                  }}
                >
                  <div className="flex items-center flex-1">
                    <motion.button
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedItems.includes(index) ? 'bg-[#320DFF] dark:bg-[#6D56FF] border-[#320DFF] dark:border-[#6D56FF]' : 'border-gray-300 dark:border-gray-600'}`}
                      onClick={() => toggleSelectItem(index)}
                      whileHover={{
                        scale: 1.1,
                      }}
                      whileTap={{
                        scale: 0.9,
                      }}
                    >
                      {selectedItems.includes(index) && (
                        <CheckIcon size={12} className="text-white" />
                      )}
                    </motion.button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.calories} cal
                      </p>
                      <div className="flex space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Protein: {item.protein}g</span>
                        <span>Carbs: {item.carbs}g</span>
                        <span>Fat: {item.fat}g</span>
                      </div>
                    </div>
                    <div className="flex">
                      <motion.button
                        className="p-1 text-gray-500 dark:text-gray-400"
                        onClick={() => handleToggleFavorite(index)}
                        whileHover={{
                          scale: 1.1,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                      >
                        <HeartIcon
                          size={16}
                          className={
                            item.isFavorite
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-300 hover:text-red-500'
                          }
                        />
                      </motion.button>
                      <motion.button
                        className="p-1 text-gray-500 dark:text-gray-400"
                        onClick={() => onEdit(item, index)}
                        whileHover={{
                          scale: 1.1,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                      >
                        <EditIcon size={16} />
                      </motion.button>
                      <motion.button
                        className="p-1 text-gray-500 dark:text-gray-400"
                        onClick={() => handleRemoveItem(index)}
                        whileHover={{
                          scale: 1.1,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                      >
                        <XIcon size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleSave}>
              Save to Log
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/TrialExpiredScreen.tsx
import React from 'react'
import { LockIcon, StarIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface TrialExpiredScreenProps {
  onUpgrade: () => void
  onRestore: () => void
}
export const TrialExpiredScreen: React.FC<TrialExpiredScreenProps> = ({
  onUpgrade,
  onRestore,
}) => {
  const { colors, isDark } = useTheme()
  const handleUpgrade = () => {
    hapticFeedback.impact()
    onUpgrade()
  }
  const handleRestore = () => {
    hapticFeedback.selection()
    onRestore()
  }
  return (
    <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 justify-center items-center p-6">
        <motion.div
          className="w-24 h-24 bg-[#320DFF] dark:bg-[#6D56FF] rounded-full flex items-center justify-center mb-8"
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          <LockIcon size={48} className="text-white" />
        </motion.div>
        <motion.div
          className="text-center mb-10"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Free Trial Has Ended
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Upgrade to Premium to continue tracking your nutrition and accessing
            all features
          </p>
        </motion.div>
        <motion.div
          className="w-full max-w-xs mb-10"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Premium Features
              </h2>
              <div className="flex">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 ml-0.5"
                    initial={{
                      rotate: 0,
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                      delay: i * 0.2,
                      ease: 'linear',
                    }}
                  >
                    <StarIcon
                      size={16}
                      className="text-[#320DFF] dark:text-[#6D56FF]"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                'AI-powered food recognition',
                'Detailed nutrition insights',
                'Custom meal plans',
                'Unlimited food logging',
                'Progress tracking',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center"
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                  }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <SparklesIcon
                      size={12}
                      className="text-[#320DFF] dark:text-[#6D56FF]"
                    />
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  $4.99/month
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
                    Annual
                  </span>
                  <span className="text-xs bg-[#320DFF] dark:bg-[#6D56FF] text-white px-1.5 py-0.5 rounded">
                    SAVE 15%
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  $49.99/year
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="w-full max-w-xs"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.8,
          }}
        >
          <Button
            variant="primary"
            fullWidth
            onClick={handleUpgrade}
            className="mb-3"
          >
            Upgrade to Premium
          </Button>
          <button
            className="w-full text-center text-[#320DFF] dark:text-[#6D56FF] text-sm font-medium"
            onClick={handleRestore}
          >
            Restore Purchase
          </button>
        </motion.div>
      </div>
    </PageTransition>
  )
}

```
```components/insights/DetailedInsightScreen.tsx
import React from 'react'
import {
  ArrowLeftIcon,
  TrendingUpIcon,
  InfoIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface DetailedInsightScreenProps {
  insight: any // Replace with proper type
  onBack: () => void
}
export const DetailedInsightScreen: React.FC<DetailedInsightScreenProps> = ({
  insight = {
    id: 1,
    title: 'Protein Intake Improved',
    description:
      'Your protein intake has increased by 8% this week compared to last week. Great job!',
    type: 'positive',
    category: 'macros',
    metric: 'protein',
    data: {
      current: 135,
      previous: 125,
      change: 8,
      goal: 150,
      dailyValues: [120, 130, 145, 140, 135, 140, 150],
      previousValues: [110, 125, 130, 120, 135, 125, 130],
    },
    tips: [
      'Maintaining high protein intake helps with muscle recovery and satiety',
      'Try to distribute protein intake evenly throughout the day',
      'Include a protein source with each meal for best results',
    ],
  },
  onBack,
}) => {
  const { colors, isDark } = useTheme()
  const getDayName = (index: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days[index]
  }
  const getMaxValue = () => {
    const allValues = [
      ...insight.data.dailyValues,
      ...insight.data.previousValues,
      insight.data.goal,
    ]
    return Math.max(...allValues) * 1.1 // Add 10% padding
  }
  const getBarHeight = (value: number) => {
    return (value / getMaxValue()) * 100
  }
  const getMetricColor = () => {
    switch (insight.metric) {
      case 'protein':
        return '#42A5F5'
      case 'carbs':
        return '#FFA726'
      case 'fat':
        return '#66BB6A'
      case 'calories':
        return '#FF5252'
      default:
        return '#320DFF'
    }
  }
  const metricColor = getMetricColor()
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Insight Details
          </h1>
        </div>
        <div className="px-4 py-4">
          <div
            className={`rounded-xl p-5 mb-6 ${insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20' : insight.type === 'negative' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}
          >
            <div className="flex items-start">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${insight.type === 'positive' ? 'bg-green-100 dark:bg-green-800/30' : insight.type === 'negative' ? 'bg-red-100 dark:bg-red-800/30' : 'bg-blue-100 dark:bg-blue-800/30'}`}
              >
                {insight.type === 'positive' ? (
                  <ArrowUpIcon
                    size={20}
                    className="text-green-500 dark:text-green-300"
                  />
                ) : insight.type === 'negative' ? (
                  <ArrowDownIcon
                    size={20}
                    className="text-red-500 dark:text-red-300"
                  />
                ) : (
                  <InfoIcon
                    size={20}
                    className="text-blue-500 dark:text-blue-300"
                  />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  {insight.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              Weekly Comparison
            </h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Week
                </p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {insight.data.current}g
                  </span>
                  <span className="text-sm ml-1 text-gray-500 dark:text-gray-400">
                    avg/day
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Change
                </p>
                <div
                  className={`flex items-center ${insight.data.change > 0 ? 'text-green-500' : insight.data.change < 0 ? 'text-red-500' : 'text-gray-500'}`}
                >
                  {insight.data.change > 0 ? (
                    <ArrowUpIcon size={16} />
                  ) : insight.data.change < 0 ? (
                    <ArrowDownIcon size={16} />
                  ) : null}
                  <span className="font-bold">
                    {Math.abs(insight.data.change)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Previous Week
                </p>
                <div className="flex items-baseline justify-end">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {insight.data.previous}g
                  </span>
                  <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">
                    avg/day
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Goal line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-gray-300 dark:border-gray-600 z-10 flex items-center justify-end"
                style={{
                  top: `${100 - getBarHeight(insight.data.goal)}%`,
                }}
              >
                <span className="bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 px-1 -mt-2 mr-1">
                  Goal: {insight.data.goal}g
                </span>
              </div>
              {/* Chart */}
              <div className="flex items-end justify-between h-48 mb-1">
                {insight.data.dailyValues.map(
                  (value: number, index: number) => {
                    const prevValue = insight.data.previousValues[index]
                    const currentHeight = getBarHeight(value)
                    const prevHeight = getBarHeight(prevValue)
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center w-1/7"
                      >
                        <div className="relative w-full flex justify-center">
                          {/* Current week bar */}
                          <motion.div
                            className="w-6 rounded-t-md z-20"
                            style={{
                              height: `${currentHeight}%`,
                              backgroundColor: metricColor,
                            }}
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height: `${currentHeight}%`,
                            }}
                            transition={{
                              duration: 1,
                              delay: index * 0.1,
                            }}
                          >
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                              {value}g
                            </div>
                          </motion.div>
                          {/* Previous week bar (semi-transparent) */}
                          <motion.div
                            className="w-6 rounded-t-md absolute opacity-30"
                            style={{
                              height: `${prevHeight}%`,
                              backgroundColor: metricColor,
                            }}
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height: `${prevHeight}%`,
                            }}
                            transition={{
                              duration: 1,
                              delay: index * 0.1 + 0.5,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getDayName(index)}
                        </span>
                      </div>
                    )
                  },
                )}
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex items-center mr-4">
                  <div
                    className="w-3 h-3 mr-1"
                    style={{
                      backgroundColor: metricColor,
                    }}
                  ></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    This Week
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 mr-1 opacity-30"
                    style={{
                      backgroundColor: metricColor,
                    }}
                  ></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    Last Week
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Recommendations
            </h3>
            <ul className="space-y-2">
              {insight.tips.map((tip: string, index: number) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                  }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-[#320DFF] dark:text-[#6D56FF]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {tip}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/tutorial/TutorialScreen.tsx
import React, { useState } from 'react'
import { XIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface TutorialScreenProps {
  onComplete: () => void
}
export const TutorialScreen: React.FC<TutorialScreenProps> = ({
  onComplete,
}) => {
  const { colors, isDark } = useTheme()
  const [currentStep, setCurrentStep] = useState(0)
  const tutorialSteps = [
    {
      title: 'Track Your Meals',
      description:
        'Log your meals using the + button. Take a photo, scan a barcode, or describe what you ate using our AI assistant.',
      image:
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      color: '#42A5F5',
    },
    {
      title: 'Monitor Your Progress',
      description:
        'Check your daily summary on the home screen. See your calories, macros, and progress towards your goals.',
      image:
        'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      color: '#66BB6A',
    },
    {
      title: 'Get Personalized Insights',
      description:
        'Receive AI-powered insights about your nutrition habits and tips to improve your diet.',
      image:
        'https://images.unsplash.com/photo-1550592704-6c76defa9985?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      color: '#FFA726',
    },
    {
      title: "You're All Set!",
      description:
        "Start your journey to better nutrition today. Let's log your first meal!",
      image:
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      color: '#FF5252',
    },
  ]
  const handleNext = () => {
    hapticFeedback.selection()
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }
  const handlePrevious = () => {
    hapticFeedback.selection()
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  const handleComplete = () => {
    hapticFeedback.success()
    onComplete()
  }
  const currentColor = tutorialSteps[currentStep].color
  return (
    <motion.div
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <div className="relative flex-1 flex flex-col">
        <motion.button
          className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center"
          onClick={handleComplete}
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.9,
          }}
        >
          <XIcon size={20} className="text-gray-700 dark:text-gray-300" />
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="flex-1 flex flex-col"
            initial={{
              opacity: 0,
              x: 100,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -100,
            }}
            transition={{
              type: 'tween',
              duration: 0.3,
            }}
          >
            <div className="relative flex-1">
              <div className="absolute inset-0">
                <img
                  src={tutorialSteps[currentStep].image}
                  alt={tutorialSteps[currentStep].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <motion.h1
                  className="text-3xl font-bold mb-2"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.2,
                  }}
                >
                  {tutorialSteps[currentStep].title}
                </motion.h1>
                <motion.p
                  className="text-white/90"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.3,
                  }}
                >
                  {tutorialSteps[currentStep].description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="p-6 pb-10">
          <div className="flex justify-between items-center mb-6">
            {currentStep > 0 ? (
              <motion.button
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                onClick={handlePrevious}
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              >
                <ChevronLeftIcon
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
              </motion.button>
            ) : (
              <div className="w-10" />
            )}
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${currentStep === index ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-700'}`}
                  initial={{
                    scale: 0.8,
                  }}
                  animate={{
                    scale: currentStep === index ? 1.2 : 0.8,
                    backgroundColor:
                      currentStep === index
                        ? currentColor
                        : isDark
                          ? '#374151'
                          : '#D1D5DB',
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                />
              ))}
            </div>
            {currentStep < tutorialSteps.length - 1 ? (
              <motion.button
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                onClick={handleNext}
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              >
                <ChevronRightIcon
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
              </motion.button>
            ) : (
              <div className="w-10" />
            )}
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={
              currentStep < tutorialSteps.length - 1
                ? handleNext
                : handleComplete
            }
            style={{
              backgroundColor: currentColor,
              borderColor: currentColor,
            }}
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

```
```utils/haptics.ts
// Utility for haptic feedback
export const hapticFeedback = {
  // Light tap for UI element selection
  selection: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  },
  // Medium tap for UI element activation
  impact: () => {
    if (navigator.vibrate) {
      navigator.vibrate(20)
    }
  },
  // Long tap for success feedback
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 50, 30])
    }
  },
  // Sharp tap for error feedback
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10, 30, 10])
    }
  },
  // Two taps for warning feedback
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10])
    }
  },
}

```
```utils/theme.ts
import { useState, useEffect } from 'react'
// Default light theme colors
const lightColors = {
  primary: '#320DFF',
  secondary: '#7B68EE',
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#1F2937',
  border: '#E5E7EB',
  notification: '#EF4444',
}
// Default dark theme colors
const darkColors = {
  primary: '#6D56FF',
  secondary: '#9580FF',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  border: '#374151',
  notification: '#F87171',
}
// Theme hook for components
export const useTheme = () => {
  const [isDark, setIsDark] = useState(false)
  const [colors, setColors] = useState(lightColors)
  useEffect(() => {
    // Check for system preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme')
    const shouldUseDark =
      savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark)
    setIsDark(shouldUseDark)
    setColors(shouldUseDark ? darkColors : lightColors)
    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === null) {
        setIsDark(e.matches)
        setColors(e.matches ? darkColors : lightColors)
      }
    }
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])
  // Function to toggle theme
  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    setColors(newIsDark ? darkColors : lightColors)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }
  return { colors, isDark, toggleTheme }
}

```
```components/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, MailIcon, CheckCircleIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface ForgotPasswordScreenProps {
  onBack: () => void
  onComplete: () => void
}
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      hapticFeedback.success()
    }, 1500)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center mb-8">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h1>
        </div>
        {!isSubmitted ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center flex-1"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mb-4">
              <CheckCircleIcon
                size={32}
                className="text-[#320DFF] dark:text-[#6D56FF]"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
              We've sent a password reset link to{' '}
              <span className="font-medium">{email}</span>. Please check your
              inbox.
            </p>
            <Button onClick={onComplete} variant="primary">
              Back to Login
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

```
```components/auth/DeleteAccountScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, AlertTriangleIcon, LockIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface DeleteAccountScreenProps {
  onBack: () => void
  onAccountDeleted: () => void
}
export const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  onBack,
  onAccountDeleted,
}) => {
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // Validation
    if (!password) {
      setError('Please enter your password')
      return
    }
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm')
      return
    }
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      hapticFeedback.success()
      onAccountDeleted()
    }, 2000)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center mb-6">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Delete Account
          </h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center mr-3 flex-shrink-0">
              <AlertTriangleIcon
                size={20}
                className="text-red-500 dark:text-red-400"
              />
            </div>
            <div>
              <p className="font-medium text-red-600 dark:text-red-400 mb-1">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                Deleting your account will permanently remove all your data,
                including your profile, nutrition history, and preferences.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleDelete} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm your password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 focus:border-red-500 dark:focus:border-red-700"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Type "DELETE" to confirm
            </label>
            <input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 focus:border-red-500 dark:focus:border-red-700"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="pt-4">
            <Button
              type="submit"
              variant="danger"
              fullWidth
              disabled={isLoading || confirmText !== 'DELETE' || !password}
              loading={isLoading}
            >
              {isLoading ? 'Deleting Account...' : 'Permanently Delete Account'}
            </Button>
            <button
              type="button"
              className="w-full mt-4 text-center text-gray-600 dark:text-gray-400 font-medium"
              onClick={onBack}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  )
}

```
```components/recipe/CreateRecipeScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  PlusIcon,
  XIcon,
  CameraIcon,
  BookmarkIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface CreateRecipeScreenProps {
  onBack: () => void
  onSave: (recipe: any) => void
}
export const CreateRecipeScreen: React.FC<CreateRecipeScreenProps> = ({
  onBack,
  onSave,
}) => {
  const { colors, isDark } = useTheme()
  const [recipeName, setRecipeName] = useState('')
  const [recipeImage, setRecipeImage] = useState<string | null>(null)
  const [servings, setServings] = useState('1')
  const [ingredients, setIngredients] = useState<any[]>([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      hapticFeedback.selection()
      setIngredients([
        ...ingredients,
        {
          name: currentIngredient,
          id: Date.now(),
        },
      ])
      setCurrentIngredient('')
    }
  }
  const handleRemoveIngredient = (id: number) => {
    hapticFeedback.impact()
    setIngredients(ingredients.filter((item) => item.id !== id))
  }
  const handleSave = () => {
    if (!recipeName.trim() || ingredients.length === 0) return
    hapticFeedback.success()
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      const newRecipe = {
        id: Date.now(),
        name: recipeName,
        image: recipeImage,
        servings: parseInt(servings),
        ingredients: ingredients,
        calories: 450,
        protein: 30,
        carbs: 45,
        fat: 15,
      }
      setIsSaving(false)
      onSave(newRecipe)
    }, 1500)
  }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setRecipeImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                onBack()
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Recipe
            </h1>
          </div>
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <BookmarkIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
        </div>
        <div className="px-4 py-4 flex-1">
          <div className="space-y-6">
            {/* Recipe Image */}
            <div className="mb-4">
              {recipeImage ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <img
                    src={recipeImage}
                    alt="Recipe"
                    className="w-full h-full object-cover"
                  />
                  <motion.button
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                    onClick={() => setRecipeImage(null)}
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                  >
                    <XIcon size={16} className="text-white" />
                  </motion.button>
                </div>
              ) : (
                <label className="block w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                    <CameraIcon
                      size={24}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Add Recipe Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {/* Recipe Name */}
            <div>
              <label
                htmlFor="recipeName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Recipe Name
              </label>
              <input
                id="recipeName"
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="E.g., Homemade Granola"
                className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]"
              />
            </div>
            {/* Servings */}
            <div>
              <label
                htmlFor="servings"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Servings
              </label>
              <input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]"
              />
            </div>
            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingredients
              </label>
              <div className="flex mb-3">
                <input
                  type="text"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  placeholder="Add ingredient"
                  className="flex-1 h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                />
                <motion.button
                  className="h-12 px-4 bg-[#320DFF] dark:bg-[#6D56FF] text-white rounded-r-lg flex items-center justify-center"
                  onClick={handleAddIngredient}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  disabled={!currentIngredient.trim()}
                >
                  <PlusIcon size={20} />
                </motion.button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {ingredients.map((ingredient) => (
                    <motion.div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -10,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <span className="text-gray-800 dark:text-gray-200">
                        {ingredient.name}
                      </span>
                      <motion.button
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                        onClick={() => handleRemoveIngredient(ingredient.id)}
                        whileHover={{
                          scale: 1.1,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                      >
                        <XIcon
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {ingredients.length === 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    No ingredients added yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4">
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={
              !recipeName.trim() || ingredients.length === 0 || isSaving
            }
            loading={isSaving}
          >
            {isSaving ? 'Saving Recipe...' : 'Save Recipe'}
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/recipe/RecipeListScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  ArrowLeftIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  BookmarkIcon,
  XIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface RecipeListScreenProps {
  onBack: () => void
  onCreateRecipe: () => void
  onSelectRecipe: (recipe: any) => void
}
export const RecipeListScreen: React.FC<RecipeListScreenProps> = ({
  onBack,
  onCreateRecipe,
  onSelectRecipe,
}) => {
  const { colors, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes, setRecipes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  // Mock recipes data
  const mockRecipes = [
    {
      id: 1,
      name: 'Homemade Granola',
      image:
        'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 8,
      ingredients: [
        {
          id: 1,
          name: 'Rolled oats',
        },
        {
          id: 2,
          name: 'Honey',
        },
        {
          id: 3,
          name: 'Almonds',
        },
        {
          id: 4,
          name: 'Coconut flakes',
        },
      ],
      calories: 320,
      protein: 8,
      carbs: 45,
      fat: 12,
      category: 'breakfast',
    },
    {
      id: 2,
      name: 'Greek Salad',
      image:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 2,
      ingredients: [
        {
          id: 1,
          name: 'Cucumber',
        },
        {
          id: 2,
          name: 'Tomatoes',
        },
        {
          id: 3,
          name: 'Feta cheese',
        },
        {
          id: 4,
          name: 'Olives',
        },
        {
          id: 5,
          name: 'Olive oil',
        },
      ],
      calories: 250,
      protein: 8,
      carbs: 12,
      fat: 20,
      category: 'lunch',
    },
    {
      id: 3,
      name: 'Chicken Stir Fry',
      image:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 4,
      ingredients: [
        {
          id: 1,
          name: 'Chicken breast',
        },
        {
          id: 2,
          name: 'Bell peppers',
        },
        {
          id: 3,
          name: 'Broccoli',
        },
        {
          id: 4,
          name: 'Soy sauce',
        },
        {
          id: 5,
          name: 'Garlic',
        },
      ],
      calories: 380,
      protein: 35,
      carbs: 20,
      fat: 15,
      category: 'dinner',
    },
    {
      id: 4,
      name: 'Protein Smoothie',
      image:
        'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 1,
      ingredients: [
        {
          id: 1,
          name: 'Protein powder',
        },
        {
          id: 2,
          name: 'Banana',
        },
        {
          id: 3,
          name: 'Almond milk',
        },
        {
          id: 4,
          name: 'Peanut butter',
        },
      ],
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 8,
      category: 'snack',
    },
  ]
  useEffect(() => {
    // Simulate loading recipes
    setIsLoading(true)
    setTimeout(() => {
      setRecipes(mockRecipes)
      setIsLoading(false)
    }, 1000)
  }, [])
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesFilter =
      selectedFilter === 'all' || recipe.category === selectedFilter
    return matchesSearch && matchesFilter
  })
  const handleFilterChange = (filter: string) => {
    hapticFeedback.selection()
    setSelectedFilter(filter)
    setFilterOpen(false)
  }
  const handleSelectRecipe = (recipe: any) => {
    hapticFeedback.impact()
    onSelectRecipe(recipe)
  }
  const handleClearSearch = () => {
    hapticFeedback.selection()
    setSearchQuery('')
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                onBack()
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              My Recipes
            </h1>
          </div>
          <motion.button
            className="w-10 h-10 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center"
            onClick={() => {
              hapticFeedback.impact()
              onCreateRecipe()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <PlusIcon size={20} className="text-white" />
          </motion.button>
        </div>
        <div className="px-4 py-2">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon
                size={18}
                className="text-gray-500 dark:text-gray-400"
              />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <motion.button
                  onClick={handleClearSearch}
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <XIcon
                    size={18}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </motion.button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading
                ? 'Loading recipes...'
                : filteredRecipes.length > 0
                  ? `${filteredRecipes.length} recipes`
                  : 'No recipes found'}
            </p>
            <motion.button
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${filterOpen || selectedFilter !== 'all' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => {
                hapticFeedback.selection()
                setFilterOpen(!filterOpen)
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <FilterIcon size={16} />
              <span className="text-sm font-medium">Filter</span>
            </motion.button>
          </div>
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                className="mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm"
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Filter by meal:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(
                    (filter) => (
                      <motion.button
                        key={filter}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedFilter === filter ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        onClick={() => handleFilterChange(filter)}
                        whileHover={{
                          scale: 1.05,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </motion.button>
                    ),
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl h-24 animate-pulse"
                ></div>
              ))
            ) : filteredRecipes.length > 0 ? (
              <AnimatePresence>
                {filteredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    onClick={() => handleSelectRecipe(recipe)}
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <div className="flex h-24">
                      <div className="w-24 h-full bg-gray-100 dark:bg-gray-700">
                        {recipe.image && (
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {recipe.name}
                            </h3>
                            <div className="flex items-center">
                              <BookmarkIcon
                                size={16}
                                className="text-[#320DFF] dark:text-[#6D56FF]"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {recipe.ingredients.length} ingredients •{' '}
                            {recipe.servings} servings
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{recipe.calories} cal</span>
                            <span>P: {recipe.protein}g</span>
                            <span>C: {recipe.carbs}g</span>
                            <span>F: {recipe.fat}g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BookmarkIcon
                    size={24}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  No recipes found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first recipe to get started'}
                </p>
                <motion.button
                  className="px-4 py-2 bg-[#320DFF] dark:bg-[#6D56FF] text-white rounded-full text-sm font-medium"
                  onClick={onCreateRecipe}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  Create Recipe
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/recipe/RecipeDetailScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  BookmarkIcon,
  Share2Icon,
  EditIcon,
  PlusIcon,
  ChevronDownIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
import { useTheme } from '../../utils/theme'
interface RecipeDetailScreenProps {
  recipe: any
  onBack: () => void
  onEdit: (recipe: any) => void
  onAddToLog: (recipe: any) => void
}
export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipe,
  onBack,
  onEdit,
  onAddToLog,
}) => {
  const { colors, isDark } = useTheme()
  const [isFavorite, setIsFavorite] = useState(true)
  const [showIngredients, setShowIngredients] = useState(true)
  const [servingSize, setServingSize] = useState(recipe.servings)
  const toggleFavorite = () => {
    hapticFeedback.impact()
    setIsFavorite(!isFavorite)
  }
  const handleAddToLog = () => {
    hapticFeedback.success()
    onAddToLog(recipe)
  }
  const handleEdit = () => {
    hapticFeedback.selection()
    onEdit(recipe)
  }
  const adjustServingSize = (delta: number) => {
    const newSize = servingSize + delta
    if (newSize >= 1) {
      hapticFeedback.selection()
      setServingSize(newSize)
    }
  }
  // Calculate nutrition based on serving size
  const calculateNutrition = (value: number) => {
    const ratio = servingSize / recipe.servings
    return Math.round(value * ratio)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        {/* Header with Image */}
        <div className="relative h-64 w-full">
          <motion.img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
            initial={{
              opacity: 0.8,
              scale: 1.1,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <motion.button
            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} className="text-white" />
          </motion.button>
          <div className="absolute top-12 right-4 flex space-x-2">
            <motion.button
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              onClick={toggleFavorite}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <BookmarkIcon
                size={20}
                className={
                  isFavorite
                    ? 'text-[#320DFF] dark:text-[#6D56FF] fill-[#320DFF] dark:fill-[#6D56FF]'
                    : 'text-white'
                }
              />
            </motion.button>
            <motion.button
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <Share2Icon size={20} className="text-white" />
            </motion.button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-1">
              {recipe.name}
            </h1>
            <div className="flex items-center text-white/80 text-sm">
              <span>{recipe.ingredients.length} ingredients</span>
            </div>
          </div>
        </div>
        {/* Recipe Content */}
        <div className="px-4 py-6">
          {/* Nutrition Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Nutrition
              </h2>
              <div className="flex items-center">
                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  onClick={() => adjustServingSize(-1)}
                  disabled={servingSize <= 1}
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <span className="text-gray-700 dark:text-gray-300 font-bold">
                    -
                  </span>
                </motion.button>
                <span className="mx-3 font-medium text-gray-900 dark:text-white">
                  {servingSize} {servingSize === 1 ? 'serving' : 'servings'}
                </span>
                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  onClick={() => adjustServingSize(1)}
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                >
                  <span className="text-gray-700 dark:text-gray-300 font-bold">
                    +
                  </span>
                </motion.button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 dark:text-gray-400">Calories</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {calculateNutrition(recipe.calories)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Carbs
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.carbs)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFA726]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(recipe.carbs / (recipe.carbs + recipe.protein + recipe.fat)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Protein
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.protein)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#42A5F5]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(recipe.protein / (recipe.carbs + recipe.protein + recipe.fat)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.1,
                    }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fat
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.fat)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#66BB6A]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${(recipe.fat / (recipe.carbs + recipe.protein + recipe.fat)) * 100}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                    }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
          {/* Ingredients */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <motion.button
              className="w-full flex justify-between items-center"
              onClick={() => {
                hapticFeedback.selection()
                setShowIngredients(!showIngredients)
              }}
            >
              <h2 className="font-medium text-gray-900 dark:text-white">
                Ingredients
              </h2>
              <motion.div
                animate={{
                  rotate: showIngredients ? 180 : 0,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                <ChevronDownIcon
                  size={20}
                  className="text-gray-500 dark:text-gray-400"
                />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {showIngredients && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-2">
                    {recipe.ingredients.map(
                      (ingredient: any, index: number) => (
                        <div key={ingredient.id} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] mr-3"></div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {ingredient.name}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              className="flex-1 h-12 flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              onClick={handleEdit}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <EditIcon size={18} />
              <span>Edit</span>
            </motion.button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToLog}
              icon={<PlusIcon size={18} />}
            >
              Add to Log
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/auth/LoginScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface LoginScreenProps {
  onBack: () => void
  onLogin: () => void
  onForgotPassword: () => void
  onSignUp: () => void
}
export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onLogin,
  onForgotPassword,
  onSignUp,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleSocialSignIn = (provider: string) => {
    hapticFeedback.selection()
    // Simulate social sign in
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1000)
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      hapticFeedback.success()
      onLogin()
    }, 1500)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center mb-8">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Log In
          </h1>
        </div>
        <div className="space-y-4 mb-6">
          <button
            className="w-full h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center space-x-2 bg-black text-white"
            onClick={() => handleSocialSignIn('apple')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.09 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
                fill="white"
              />
            </svg>
            <span>Continue with Apple</span>
          </button>
          <button
            className="w-full h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            onClick={() => handleSocialSignIn('google')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                fill="#FFC107"
              />
              <path
                d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z"
                fill="#FF3D00"
              />
              <path
                d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
                fill="#4CAF50"
              />
              <path
                d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                fill="#1976D2"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
            or
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <button
                type="button"
                className="text-sm text-[#320DFF] dark:text-[#6D56FF]"
                onClick={() => {
                  hapticFeedback.selection()
                  onForgotPassword()
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              className="text-[#320DFF] dark:text-[#6D56FF] font-medium"
              onClick={() => {
                hapticFeedback.selection()
                onSignUp()
              }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/premium/PremiumFeatureCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon } from 'lucide-react'
interface PremiumFeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  highlighted?: boolean
}
export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  title,
  description,
  icon,
  highlighted = false,
}) => {
  return (
    <motion.div
      className={`p-4 rounded-xl border ${highlighted ? 'border-[#320DFF] bg-[#320DFF]/5 dark:border-[#6D56FF] dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'} mb-3`}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="flex items-start">
        <div
          className={`w-10 h-10 rounded-full ${highlighted ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mr-3`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={`font-medium ${highlighted ? 'text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-900 dark:text-white'}`}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {highlighted && (
          <div className="w-6 h-6 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center">
            <CheckIcon size={14} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

```
```components/premium/SubscriptionPlanCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
interface SubscriptionPlanCardProps {
  title: string
  price: string
  period: string
  description: string
  isPopular?: boolean
  isSelected?: boolean
  discount?: string
  onSelect: () => void
}
export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  title,
  price,
  period,
  description,
  isPopular = false,
  isSelected = false,
  discount,
  onSelect,
}) => {
  return (
    <motion.div
      className={`p-4 rounded-xl border ${isSelected ? 'border-[#320DFF] bg-[#320DFF]/5 dark:border-[#6D56FF] dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} relative`}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onSelect}
    >
      {isPopular && (
        <div className="absolute -top-3 right-4 bg-[#320DFF] dark:bg-[#6D56FF] text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      {discount && (
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          Save {discount}
        </div>
      )}
      <div className="flex items-center mb-2">
        <div
          className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF] dark:bg-[#6D56FF]' : 'border-gray-300 dark:border-gray-600'} mr-2`}
        >
          {isSelected && (
            <div className="w-full h-full rounded-full bg-white dark:bg-white scale-50" />
          )}
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="mb-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {price}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            /{period}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

```
```components/premium/PaywallScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  ZapIcon,
  BarChartIcon,
  ClockIcon,
  CloudIcon,
  BookOpenIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { PremiumFeatureCard } from './PremiumFeatureCard'
import { SubscriptionPlanCard } from './SubscriptionPlanCard'
import { hapticFeedback } from '../../utils/haptics'
interface PaywallScreenProps {
  onBack: () => void
  onSubscribe: (plan: string) => void
  onRestore: () => void
}
export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onBack,
  onSubscribe,
  onRestore,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(
    'annual',
  )
  const [isLoading, setIsLoading] = useState(false)
  const handleSubscribe = () => {
    hapticFeedback.impact()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSubscribe(selectedPlan)
    }, 1500)
  }
  const handleRestore = () => {
    hapticFeedback.selection()
    onRestore()
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upgrade to Premium
          </h1>
        </div>
        <div className="px-4 py-2 overflow-auto flex-1">
          <motion.div
            className="w-full h-48 bg-gradient-to-br from-[#320DFF] to-[#6D56FF] rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-64 h-64 rounded-full bg-white"></div>
            </div>
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <ZapIcon size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Unlock Full Potential
              </h2>
              <p className="text-white/80 text-sm px-6">
                Get unlimited access to all premium features
              </p>
            </div>
          </motion.div>
          <div className="space-y-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Choose Your Plan
              </h2>
              <div className="space-y-3">
                <SubscriptionPlanCard
                  title="Monthly"
                  price="$4.99"
                  period="month"
                  description="Billed monthly. Cancel anytime."
                  isSelected={selectedPlan === 'monthly'}
                  onSelect={() => {
                    hapticFeedback.selection()
                    setSelectedPlan('monthly')
                  }}
                />
                <SubscriptionPlanCard
                  title="Annual"
                  price="$49.99"
                  period="year"
                  description="Billed annually. Cancel anytime."
                  isPopular={true}
                  isSelected={selectedPlan === 'annual'}
                  discount="17%"
                  onSelect={() => {
                    hapticFeedback.selection()
                    setSelectedPlan('annual')
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Premium Features
              </h2>
              <PremiumFeatureCard
                title="Advanced Analytics"
                description="Get detailed insights about your nutrition and habits."
                icon={
                  <BarChartIcon
                    size={20}
                    className="text-[#320DFF] dark:text-[#6D56FF]"
                  />
                }
                highlighted={true}
              />
              <PremiumFeatureCard
                title="Unlimited History"
                description="Access your complete nutrition history without limits."
                icon={
                  <ClockIcon
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                }
              />
              <PremiumFeatureCard
                title="Cloud Backup"
                description="Keep your data safe with automatic cloud backups."
                icon={
                  <CloudIcon
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                }
              />
              <PremiumFeatureCard
                title="Custom Recipes"
                description="Create and save unlimited custom recipes and meals."
                icon={
                  <BookOpenIcon
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                }
              />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubscribe}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading
              ? 'Processing...'
              : `Subscribe for ${selectedPlan === 'monthly' ? '$4.99/month' : '$49.99/year'}`}
          </Button>
          <button
            className="w-full text-center mt-4 text-sm text-gray-600 dark:text-gray-400"
            onClick={handleRestore}
          >
            Restore Purchase
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
            Your subscription will automatically renew. Cancel anytime in your
            account settings.
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/premium/SubscriptionManagementScreen.tsx
import React from 'react'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface SubscriptionManagementScreenProps {
  onBack: () => void
}
export const SubscriptionManagementScreen: React.FC<
  SubscriptionManagementScreenProps
> = ({ onBack }) => {
  // Sample subscription data
  const subscription = {
    status: 'active',
    plan: 'Premium Annual',
    price: '$49.99',
    nextBillingDate: 'September 15, 2024',
    paymentMethod: 'Apple Pay',
    features: [
      'Advanced Analytics',
      'Unlimited History',
      'Cloud Backup',
      'Custom Recipes',
      'Priority Support',
    ],
  }
  const handleManageSubscription = () => {
    hapticFeedback.impact()
    // This would typically open the app store or payment provider subscription management
    window.open('https://apps.apple.com/account/subscriptions', '_blank')
  }
  const handleContactSupport = () => {
    hapticFeedback.selection()
    // Navigate to support screen
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription
          </h1>
        </div>
        <div className="px-4 py-4 flex-1">
          <motion.div
            className="bg-gradient-to-br from-[#320DFF] to-[#6D56FF] rounded-xl p-6 mb-6"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <CheckCircleIcon size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  {subscription.plan}
                </h2>
                <p className="text-white/80 text-sm">
                  {subscription.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <ClockIcon size={16} className="text-white/80 mr-2" />
                <p className="text-white/80 text-sm">
                  Next billing: {subscription.nextBillingDate}
                </p>
              </div>
              <div className="flex items-center">
                <CreditCardIcon size={16} className="text-white/80 mr-2" />
                <p className="text-white/80 text-sm">
                  Payment method: {subscription.paymentMethod}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              fullWidth
              onClick={handleManageSubscription}
              icon={<ExternalLinkIcon size={16} />}
              iconPosition="right"
              className="bg-white/20 text-white border-white/20 hover:bg-white/30"
            >
              Manage Subscription
            </Button>
          </motion.div>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Premium Features
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <ul className="space-y-3">
                {subscription.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center"
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.3,
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                      <div className="w-2 h-2 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              If you have any questions about your subscription or need
              assistance, our support team is here to help.
            </p>
            <Button variant="outline" fullWidth onClick={handleContactSupport}>
              Contact Support
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Restore Purchase
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Changed devices or reinstalled the app? Restore your previous
              purchases.
            </p>
            <Button variant="secondary" fullWidth>
              Restore Purchases
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/premium/SubscriptionSuccessScreen.tsx
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { CheckCircleIcon, ZapIcon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
import confetti from 'canvas-confetti'
import { Berry } from '../ui/Berry'
interface SubscriptionSuccessScreenProps {
  onContinue: () => void
}
export const SubscriptionSuccessScreen: React.FC<
  SubscriptionSuccessScreenProps
> = ({ onContinue }) => {
  useEffect(() => {
    // Trigger haptic feedback on load
    hapticFeedback.success()
    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    }
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }
    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }
      const particleCount = 50 * (timeLeft / duration)
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
      })
    }, 250)
    return () => clearInterval(interval)
  }, [])
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="mb-8"
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            <Berry variant="celebrate" size="large" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold mb-3 text-center text-gray-900 dark:text-white"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
              duration: 0.5,
            }}
          >
            Welcome to Premium!
          </motion.h1>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
              duration: 0.5,
            }}
          >
            You now have unlimited access to all premium features.
          </motion.p>
          <motion.div
            className="w-full space-y-4 mb-8"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.6,
              duration: 0.5,
            }}
          >
            {[
              'Advanced Analytics & Insights',
              'Unlimited History & Data',
              'Cloud Backup & Sync',
              'Custom Recipe Creation',
              'Priority Support',
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center"
                initial={{
                  x: -20,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.7 + index * 0.1,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                  <ZapIcon
                    size={20}
                    className="text-[#320DFF] dark:text-[#6D56FF]"
                  />
                </div>
                <p className="text-gray-800 dark:text-gray-200">{feature}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 1.2,
            duration: 0.5,
          }}
        >
          <Button
            onClick={() => {
              hapticFeedback.impact()
              onContinue()
            }}
            variant="primary"
            fullWidth
          >
            Continue to App
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  )
}

```
```components/premium/LockedFeatureOverlay.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { LockIcon, XIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface LockedFeatureOverlayProps {
  featureName: string
  onUpgrade: () => void
  onClose: () => void
}
export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  featureName,
  onUpgrade,
  onClose,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <motion.div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.9,
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      >
        <div className="relative h-48 bg-gradient-to-br from-[#320DFF] to-[#6D56FF] flex items-center justify-center">
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => {
              hapticFeedback.selection()
              onClose()
            }}
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <XIcon size={16} className="text-white" />
          </motion.button>
          <motion.div
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
            initial={{
              scale: 0,
              rotate: -45,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 200,
            }}
          >
            <LockIcon size={40} className="text-white" />
          </motion.div>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Premium Feature
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {featureName} is available exclusively to Premium subscribers.
            Upgrade now to unlock this and all other premium features.
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                hapticFeedback.impact()
                onUpgrade()
              }}
            >
              Upgrade to Premium
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                hapticFeedback.selection()
                onClose()
              }}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

```
```components/premium/TrialCountdownSheet.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { ClockIcon, XIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface TrialCountdownSheetProps {
  daysLeft: number
  onUpgrade: () => void
  onClose: () => void
}
export const TrialCountdownSheet: React.FC<TrialCountdownSheetProps> = ({
  daysLeft,
  onUpgrade,
  onClose,
}) => {
  const isLastDay = daysLeft <= 1
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl overflow-hidden"
        initial={{
          y: '100%',
        }}
        animate={{
          y: 0,
        }}
        exit={{
          y: '100%',
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <ClockIcon
                size={20}
                className={
                  isLastDay
                    ? 'text-red-500'
                    : 'text-[#320DFF] dark:text-[#6D56FF]'
                }
              />
              <h2 className="font-bold text-lg text-gray-900 dark:text-white ml-2">
                {isLastDay ? 'Trial Ends Today' : `${daysLeft} Days Left`}
              </h2>
            </div>
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onClick={() => {
                hapticFeedback.selection()
                onClose()
              }}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <XIcon size={16} className="text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>
          <div
            className={`p-4 rounded-xl ${isLastDay ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30' : 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border border-[#320DFF]/10 dark:border-[#6D56FF]/20'} mb-4`}
          >
            <p
              className={`text-sm ${isLastDay ? 'text-red-600 dark:text-red-400' : 'text-[#320DFF] dark:text-[#6D56FF]'}`}
            >
              {isLastDay
                ? 'Your free trial ends today. Subscribe now to keep all premium features and avoid losing access.'
                : `Your free trial will end in ${daysLeft} days. Upgrade now to continue enjoying all premium features.`}
            </p>
          </div>
          <div className="space-y-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Advanced Analytics & Insights
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Unlimited History & Data
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Custom Recipe Creation
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                hapticFeedback.impact()
                onUpgrade()
              }}
            >
              {isLastDay ? 'Subscribe Now' : 'Upgrade to Premium'}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                hapticFeedback.selection()
                onClose()
              }}
            >
              {isLastDay ? 'Remind Me Later' : 'Maybe Later'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

```
```components/dashboard/MacroToggleView.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressRing } from '../ui/ProgressRing'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { hapticFeedback } from '../../utils/haptics'
interface MacroToggleViewProps {
  dailyGoal: number
  consumed: number
  macros: {
    carbs: {
      goal: number
      consumed: number
      color: string
    }
    protein: {
      goal: number
      consumed: number
      color: string
    }
    fat: {
      goal: number
      consumed: number
      color: string
    }
  }
}
export const MacroToggleView: React.FC<MacroToggleViewProps> = ({
  dailyGoal,
  consumed,
  macros,
}) => {
  const [selectedMacro, setSelectedMacro] = useState<
    'calories' | 'carbs' | 'protein' | 'fat'
  >('calories')
  const [animateValues, setAnimateValues] = useState(true)
  const handleMacroSelect = (
    macro: 'calories' | 'carbs' | 'protein' | 'fat',
  ) => {
    if (selectedMacro === macro) return
    hapticFeedback.selection()
    setAnimateValues(false)
    setTimeout(() => {
      setSelectedMacro(macro)
      setAnimateValues(true)
    }, 100)
  }
  const getDisplayData = () => {
    switch (selectedMacro) {
      case 'calories':
        return {
          value: consumed,
          goal: dailyGoal,
          unit: 'cal',
          color: '#320DFF',
          percentage: Math.round((consumed / dailyGoal) * 100),
        }
      case 'carbs':
        return {
          value: macros.carbs.consumed,
          goal: macros.carbs.goal,
          unit: 'g',
          color: macros.carbs.color,
          percentage: Math.round(
            (macros.carbs.consumed / macros.carbs.goal) * 100,
          ),
        }
      case 'protein':
        return {
          value: macros.protein.consumed,
          goal: macros.protein.goal,
          unit: 'g',
          color: macros.protein.color,
          percentage: Math.round(
            (macros.protein.consumed / macros.protein.goal) * 100,
          ),
        }
      case 'fat':
        return {
          value: macros.fat.consumed,
          goal: macros.fat.goal,
          unit: 'g',
          color: macros.fat.color,
          percentage: Math.round((macros.fat.consumed / macros.fat.goal) * 100),
        }
    }
  }
  const data = getDisplayData()
  return (
    <div className="w-full">
      <div className="w-48 h-48 mx-auto mb-4 relative">
        <ProgressRing
          percentage={data.percentage}
          color={data.color}
          size={192}
          strokeWidth={12}
          animate={animateValues}
          duration={1}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMacro}
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                duration: 0.2,
              }}
              className="flex flex-col items-center justify-center"
            >
              <AnimatedNumber
                value={data.value}
                className="text-2xl font-bold"
                duration={1}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                of {data.goal} {data.unit}
              </p>
            </motion.div>
          </AnimatePresence>
        </ProgressRing>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full">
        <motion.button
          className={`flex flex-col items-center p-2 rounded-lg ${selectedMacro === 'calories' ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20' : 'bg-gray-50 dark:bg-gray-800'}`}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={() => handleMacroSelect('calories')}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${selectedMacro === 'calories' ? 'bg-[#320DFF]/20 dark:bg-[#6D56FF]/30' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <span
              className={`text-sm ${selectedMacro === 'calories' ? 'text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Cal
            </span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Calories
          </span>
        </motion.button>
        {Object.entries(macros).map(([key, macro]) => (
          <motion.button
            key={key}
            className={`flex flex-col items-center p-2 rounded-lg ${selectedMacro === key ? `bg-${macro.color.replace('#', '')}/10` : 'bg-gray-50 dark:bg-gray-800'}`}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() =>
              handleMacroSelect(key as 'carbs' | 'protein' | 'fat')
            }
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${selectedMacro === key ? `bg-${macro.color.replace('#', '')}/20` : 'bg-gray-100 dark:bg-gray-700'}`}
              style={{
                backgroundColor:
                  selectedMacro === key ? `${macro.color}20` : '',
              }}
            >
              <span
                className="text-sm"
                style={{
                  color: selectedMacro === key ? macro.color : '',
                }}
              >
                {key.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {key}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

```
```components/dashboard/DailyTipCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  LightbulbIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XIcon,
} from 'lucide-react'
import { GlassMorphism } from '../ui/GlassMorphism'
import { KineticTypography } from '../ui/KineticTypography'
import { Berry } from '../ui/Berry'
type TipType = 'info' | 'warning' | 'success'
interface DailyTipCardProps {
  type: TipType
  message: string
  onDismiss?: () => void
  dismissable?: boolean
}
export const DailyTipCard: React.FC<DailyTipCardProps> = ({
  type = 'info',
  message,
  onDismiss,
  dismissable = false,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/30',
          text: 'text-amber-700 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-800/40',
          icon: (
            <AlertTriangleIcon
              size={18}
              className="text-amber-600 dark:text-amber-400"
            />
          ),
        }
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800/30',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800/40',
          icon: (
            <CheckCircleIcon
              size={18}
              className="text-green-600 dark:text-green-400"
            />
          ),
        }
      default:
        return {
          bg: 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10',
          border: 'border-[#320DFF]/10 dark:border-[#6D56FF]/20',
          text: 'text-[#320DFF] dark:text-[#6D56FF]',
          iconBg: 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20',
          icon: (
            <LightbulbIcon
              size={18}
              className="text-[#320DFF] dark:text-[#6D56FF]"
            />
          ),
        }
    }
  }
  const styles = getTypeStyles()
  return (
    <motion.div
      className={`w-full rounded-xl p-4 ${styles.bg} border ${styles.border} relative`}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="flex">
        <div className="mr-3 shrink-0">
          {type === 'info' ? (
            <Berry variant="wave" size="small" />
          ) : type === 'warning' ? (
            <div
              className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}
            >
              {styles.icon}
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}
            >
              {styles.icon}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${styles.text}`}>
            {type === 'info'
              ? 'Daily Tip'
              : type === 'warning'
                ? 'Attention'
                : 'Great Job!'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <KineticTypography
              text={message}
              effect="wave"
              duration={0.8}
              delay={0.2}
            />
          </p>
        </div>
        {dismissable && onDismiss && (
          <motion.button
            className="w-6 h-6 rounded-full bg-gray-200/50 dark:bg-gray-700/50 flex items-center justify-center ml-2 shrink-0"
            onClick={onDismiss}
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <XIcon size={14} className="text-gray-500 dark:text-gray-400" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

```
```components/dashboard/OverGoalAlert.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircleIcon, XIcon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface OverGoalAlertProps {
  amount: number
  onDismiss: () => void
}
export const OverGoalAlert: React.FC<OverGoalAlertProps> = ({
  amount,
  onDismiss,
}) => {
  return (
    <motion.div
      className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-4 mb-4"
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="flex items-start">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/40 flex items-center justify-center mr-3 shrink-0">
          <AlertCircleIcon
            size={18}
            className="text-red-600 dark:text-red-400"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-red-700 dark:text-red-400">
            Daily Goal Exceeded
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You're {amount} calories over your daily goal. Consider adjusting
            your next meal or adding some activity.
          </p>
        </div>
        <motion.button
          className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-800/40 flex items-center justify-center ml-2 shrink-0"
          onClick={() => {
            hapticFeedback.selection()
            onDismiss()
          }}
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.9,
          }}
        >
          <XIcon size={14} className="text-red-600 dark:text-red-400" />
        </motion.button>
      </div>
    </motion.div>
  )
}

```
```components/dashboard/OfflineStateBanner.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { WifiOffIcon, RefreshCwIcon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface OfflineStateBannerProps {
  onRetry: () => void
}
export const OfflineStateBanner: React.FC<OfflineStateBannerProps> = ({
  onRetry,
}) => {
  return (
    <motion.div
      className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4"
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
          <WifiOffIcon size={18} className="text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            You're Offline
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Working with limited functionality. Some features may not be
            available.
          </p>
        </div>
        <motion.button
          className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300 text-sm"
          onClick={() => {
            hapticFeedback.selection()
            onRetry()
          }}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <RefreshCwIcon size={14} className="mr-1" />
          Retry
        </motion.button>
      </div>
    </motion.div>
  )
}

```
```components/dashboard/EmptyDayPlaceholder.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { PlusIcon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface EmptyDayPlaceholderProps {
  onAddMeal: () => void
}
export const EmptyDayPlaceholder: React.FC<EmptyDayPlaceholderProps> = ({
  onAddMeal,
}) => {
  return (
    <motion.div
      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <motion.div
        className="w-32 h-32 mb-4"
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          delay: 0.2,
          duration: 0.5,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="64"
            cy="64"
            r="64"
            fill="#F3F4F6"
            className="dark:fill-gray-700"
          />
          <ellipse
            cx="64"
            cy="98"
            rx="40"
            ry="6"
            fill="#E5E7EB"
            className="dark:fill-gray-600"
          />
          <path
            d="M64 90C77.2548 90 88 79.2548 88 66C88 52.7452 77.2548 42 64 42C50.7452 42 40 52.7452 40 66C40 79.2548 50.7452 90 64 90Z"
            fill="#D1D5DB"
            className="dark:fill-gray-600"
          />
          <path
            d="M64 84C74.4934 84 83 75.4934 83 65C83 54.5066 74.4934 46 64 46C53.5066 46 45 54.5066 45 65C45 75.4934 53.5066 84 64 84Z"
            fill="white"
            className="dark:fill-gray-500"
          />
          <path
            d="M54 58C56.2091 58 58 56.2091 58 54C58 51.7909 56.2091 50 54 50C51.7909 50 50 51.7909 50 54C50 56.2091 51.7909 58 54 58Z"
            fill="#4B5563"
            className="dark:fill-gray-400"
          />
          <path
            d="M74 58C76.2091 58 78 56.2091 78 54C78 51.7909 76.2091 50 74 50C71.7909 50 70 51.7909 70 54C70 56.2091 71.7909 58 74 58Z"
            fill="#4B5563"
            className="dark:fill-gray-400"
          />
          <path
            d="M64 78C68.4183 78 72 74.4183 72 70C72 65.5817 68.4183 62 64 62C59.5817 62 56 65.5817 56 70C56 74.4183 59.5817 78 64 78Z"
            fill="#320DFF"
            className="dark:fill-[#6D56FF]"
          />
        </svg>
      </motion.div>
      <motion.h3
        className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.3,
          duration: 0.3,
        }}
      >
        No Meals Logged Today
      </motion.h3>
      <motion.p
        className="text-center text-gray-600 dark:text-gray-400 mb-6"
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.4,
          duration: 0.3,
        }}
      >
        Start tracking your nutrition by adding your first meal of the day.
      </motion.p>
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.5,
          duration: 0.3,
        }}
      >
        <Button
          variant="primary"
          icon={<PlusIcon size={18} />}
          onClick={() => {
            hapticFeedback.impact()
            onAddMeal()
          }}
        >
          Add Your First Meal
        </Button>
      </motion.div>
    </motion.div>
  )
}

```
```components/dashboard/StreakBreakModal.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { XIcon, ZapIcon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
import { Berry } from '../ui/Berry'
interface StreakBreakModalProps {
  streakDays: number
  onUseToken: () => void
  onClose: () => void
  tokensAvailable: number
}
export const StreakBreakModal: React.FC<StreakBreakModalProps> = ({
  streakDays,
  onUseToken,
  onClose,
  tokensAvailable,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <motion.div
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.9,
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      >
        <div className="relative h-48 bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
          <motion.button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => {
              hapticFeedback.selection()
              onClose()
            }}
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <XIcon size={16} className="text-white" />
          </motion.button>
          <motion.div
            className="text-center"
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.5,
            }}
          >
            <div className="mx-auto mb-3">
              <Berry variant="streak" size="small" />
            </div>
            <p className="text-white font-bold text-xl">
              {streakDays} Day Streak at Risk!
            </p>
          </motion.div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            You haven't logged any meals today. Use a Freeze Token to protect
            your {streakDays} day streak.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center mr-3">
                <ZapIcon
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  Freeze Tokens Available: {tokensAvailable}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Premium users get 3 tokens per month
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                hapticFeedback.impact()
                onUseToken()
              }}
              disabled={tokensAvailable <= 0}
            >
              Use a Freeze Token
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                hapticFeedback.selection()
                onClose()
              }}
            >
              I'll Log a Meal
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

```
```components/metrics/WeightLogSheet.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XIcon, ArrowRightIcon, CalendarIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface WeightLogSheetProps {
  onClose: () => void
  onSave: (weight: number, date: Date) => void
  currentWeight?: number
}
export const WeightLogSheet: React.FC<WeightLogSheetProps> = ({
  onClose,
  onSave,
  currentWeight = 150,
}) => {
  const [weight, setWeight] = useState(currentWeight)
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const handleSave = () => {
    hapticFeedback.impact()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onSave(weight, date)
    }, 1000)
  }
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }
  const incrementWeight = () => {
    hapticFeedback.selection()
    setWeight((prev) => {
      const increment = weightUnit === 'lbs' ? 0.2 : 0.1
      return parseFloat((prev + increment).toFixed(1))
    })
  }
  const decrementWeight = () => {
    hapticFeedback.selection()
    setWeight((prev) => {
      const decrement = weightUnit === 'lbs' ? 0.2 : 0.1
      return parseFloat((prev - decrement).toFixed(1))
    })
  }
  const toggleWeightUnit = () => {
    hapticFeedback.selection()
    if (weightUnit === 'lbs') {
      // Convert lbs to kg
      setWeight(parseFloat((weight * 0.453592).toFixed(1)))
      setWeightUnit('kg')
    } else {
      // Convert kg to lbs
      setWeight(parseFloat((weight * 2.20462).toFixed(1)))
      setWeightUnit('lbs')
    }
  }
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl overflow-hidden"
        initial={{
          y: '100%',
        }}
        animate={{
          y: 0,
        }}
        exit={{
          y: '100%',
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Log Weight
            </h2>
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onClick={() => {
                hapticFeedback.selection()
                onClose()
              }}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <XIcon size={16} className="text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <button
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                onClick={decrementWeight}
              >
                <svg
                  width="16"
                  height="2"
                  viewBox="0 0 16 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="16"
                    height="2"
                    rx="1"
                    fill="#6B7280"
                    className="dark:fill-gray-400"
                  />
                </svg>
              </button>
              <div className="flex items-baseline mx-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {weight}
                </span>
                <button
                  className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                  onClick={toggleWeightUnit}
                >
                  {weightUnit}
                </button>
              </div>
              <button
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                onClick={incrementWeight}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 1V15"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="dark:stroke-gray-400"
                  />
                  <path
                    d="M1 8H15"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="dark:stroke-gray-400"
                  />
                </svg>
              </button>
            </div>
            <div className="flex justify-center">
              <button
                className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                onClick={() => setDate(new Date())}
              >
                <CalendarIcon size={16} className="mr-1" />
                {formatDate(date)}
                <ArrowRightIcon size={14} className="ml-1" />
              </button>
            </div>
          </div>
          <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border border-[#320DFF]/10 dark:border-[#6D56FF]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
              Regular weigh-ins help track your progress and adjust your
              nutrition plan for better results.
            </p>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Weight'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

```
```components/metrics/WeightTrendGraph.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
interface WeightDataPoint {
  date: string
  weight: number
}
interface WeightTrendGraphProps {
  data: WeightDataPoint[]
  startWeight: number
  currentWeight: number
  goalWeight?: number
  unit: 'lbs' | 'kg'
  onExpand?: () => void
}
export const WeightTrendGraph: React.FC<WeightTrendGraphProps> = ({
  data,
  startWeight,
  currentWeight,
  goalWeight,
  unit = 'lbs',
  onExpand,
}) => {
  const weightChange = currentWeight - startWeight
  const isPositiveChange = weightChange >= 0
  // Format the tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].value} {unit}
          </p>
        </div>
      )
    }
    return null
  }
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Weight Trend
        </h3>
        {onExpand && (
          <button
            className="text-sm text-[#320DFF] dark:text-[#6D56FF]"
            onClick={onExpand}
          >
            View More
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Starting</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {startWeight} {unit}
          </p>
        </div>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full ${isPositiveChange ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center mr-2`}
          >
            {isPositiveChange ? (
              <TrendingUpIcon
                size={16}
                className="text-red-600 dark:text-red-400"
              />
            ) : (
              <TrendingDownIcon
                size={16}
                className="text-green-600 dark:text-green-400"
              />
            )}
          </div>
          <div>
            <p
              className={`text-xs ${isPositiveChange ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
            >
              {isPositiveChange ? '+' : ''}
              {weightChange.toFixed(1)} {unit}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Since start
            </p>
          </div>
        </div>
        {goalWeight && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {goalWeight} {unit}
            </p>
          </div>
        )}
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              bottom: 5,
              left: 5,
            }}
          >
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 10,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              domain={[
                Math.min(...data.map((d) => d.weight)) - 5,
                Math.max(...data.map((d) => d.weight)) + 5,
              ]}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#320DFF"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: '#320DFF',
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
                fill: '#320DFF',
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

```
```components/metrics/WeightCheckInScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  ScaleIcon,
  SmileIcon,
  MehIcon,
  FrownIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { WeightTrendGraph } from './WeightTrendGraph'
import { hapticFeedback } from '../../utils/haptics'
interface WeightCheckInScreenProps {
  onBack: () => void
  onComplete: () => void
}
export const WeightCheckInScreen: React.FC<WeightCheckInScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<
    'weight' | 'mood' | 'recommendation'
  >('weight')
  const [selectedMood, setSelectedMood] = useState<
    'happy' | 'neutral' | 'unhappy' | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  // Sample data
  const weightData = [
    {
      date: 'Mon',
      weight: 165.2,
    },
    {
      date: 'Tue',
      weight: 164.8,
    },
    {
      date: 'Wed',
      weight: 164.5,
    },
    {
      date: 'Thu',
      weight: 164.3,
    },
    {
      date: 'Fri',
      weight: 164.0,
    },
    {
      date: 'Sat',
      weight: 163.8,
    },
    {
      date: 'Sun',
      weight: 163.5,
    },
  ]
  const handleNextStep = () => {
    hapticFeedback.selection()
    if (currentStep === 'weight') {
      setCurrentStep('mood')
    } else if (currentStep === 'mood') {
      setCurrentStep('recommendation')
    } else {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        onComplete()
      }, 1500)
    }
  }
  const handleSelectMood = (mood: 'happy' | 'neutral' | 'unhappy') => {
    hapticFeedback.selection()
    setSelectedMood(mood)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weekly Check-In
          </h1>
        </div>
        <div className="px-4 py-4 flex-1">
          {currentStep === 'weight' && (
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                  <ScaleIcon
                    size={24}
                    className="text-[#320DFF] dark:text-[#6D56FF]"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                    Confirm Your Weight
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Let's check your progress for the week
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Current Weight
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white mr-1">
                      163.5
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      lbs
                    </span>
                  </div>
                </div>
                <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-lg p-3 mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 8L7 12L13 4"
                          stroke="#22C55E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        -1.7 lbs this week
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Great progress! You're on track.
                      </p>
                    </div>
                  </div>
                </div>
                <button className="text-sm text-[#320DFF] dark:text-[#6D56FF] font-medium">
                  Update Weight
                </button>
              </div>
              <WeightTrendGraph
                data={weightData}
                startWeight={165.2}
                currentWeight={163.5}
                goalWeight={150}
                unit="lbs"
              />
            </motion.div>
          )}
          {currentStep === 'mood' && (
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="mb-6 text-center">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  How do you feel about your progress?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your feedback helps us personalize your plan
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border ${selectedMood === 'happy' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'}`}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => handleSelectMood('happy')}
                >
                  <div
                    className={`w-16 h-16 rounded-full ${selectedMood === 'happy' ? 'bg-green-100 dark:bg-green-800/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mb-3`}
                  >
                    <SmileIcon
                      size={32}
                      className={
                        selectedMood === 'happy'
                          ? 'text-green-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`font-medium ${selectedMood === 'happy' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    Happy
                  </span>
                </motion.button>
                <motion.button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border ${selectedMood === 'neutral' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => handleSelectMood('neutral')}
                >
                  <div
                    className={`w-16 h-16 rounded-full ${selectedMood === 'neutral' ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mb-3`}
                  >
                    <MehIcon
                      size={32}
                      className={
                        selectedMood === 'neutral'
                          ? 'text-blue-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`font-medium ${selectedMood === 'neutral' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    Neutral
                  </span>
                </motion.button>
                <motion.button
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border ${selectedMood === 'unhappy' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'}`}
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => handleSelectMood('unhappy')}
                >
                  <div
                    className={`w-16 h-16 rounded-full ${selectedMood === 'unhappy' ? 'bg-amber-100 dark:bg-amber-800/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mb-3`}
                  >
                    <FrownIcon
                      size={32}
                      className={
                        selectedMood === 'unhappy'
                          ? 'text-amber-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    />
                  </div>
                  <span
                    className={`font-medium ${selectedMood === 'unhappy' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    Unhappy
                  </span>
                </motion.button>
              </div>
              {selectedMood === 'unhappy' && (
                <motion.div
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 mb-6"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Remember that progress isn't always linear. Would you like
                    to discuss adjusting your goals?
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
          {currentStep === 'recommendation' && (
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  Your Weekly Recommendation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Based on your progress and feedback
                </p>
              </div>
              <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border border-[#320DFF]/10 dark:border-[#6D56FF]/20 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 dark:bg-[#6D56FF]/30 flex items-center justify-center mr-3 mt-1">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 4V16M4 10H16"
                        stroke="#320DFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="dark:stroke-[#6D56FF]"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#320DFF] dark:text-[#6D56FF] mb-1">
                      Plan Update: +80 kcal Daily Target
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      You're losing weight faster than your goal rate. We're
                      adjusting your daily calorie target to ensure sustainable
                      progress.
                    </p>
                    <div className="flex items-center">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#320DFF] dark:bg-[#6D56FF] w-3/4"></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                        1920 → 2000 kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Progress Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Weekly Weight Change
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        -1.7 lbs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Weight Loss
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        -6.5 lbs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Goal Progress
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        43%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Estimated Goal Date
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Oct 15, 2023
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Nutrition Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 6L5 9L10 3"
                            stroke="#22C55E"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Great job staying within your protein targets this week.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2 mt-0.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 2V7M6 10V10.01"
                            stroke="#F59E0B"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Consider adding more fiber-rich foods to your diet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="primary"
            fullWidth
            onClick={handleNextStep}
            disabled={currentStep === 'mood' && selectedMood === null}
            loading={isLoading}
          >
            {currentStep === 'weight'
              ? 'Continue'
              : currentStep === 'mood'
                ? 'Next'
                : isLoading
                  ? 'Updating Plan...'
                  : 'Apply Changes & Continue'}
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/metrics/GoalProgressCelebrationScreen.tsx
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { PageTransition } from '../ui/PageTransition'
import { TrendingDownIcon, CheckCircleIcon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
import confetti from 'canvas-confetti'
import { Berry } from '../ui/Berry'
interface GoalProgressCelebrationScreenProps {
  onContinue: () => void
  onSetNewGoal: () => void
  goalWeight: number
  startWeight: number
  currentWeight: number
  unit: 'lbs' | 'kg'
}
export const GoalProgressCelebrationScreen: React.FC<
  GoalProgressCelebrationScreenProps
> = ({
  onContinue,
  onSetNewGoal,
  goalWeight,
  startWeight,
  currentWeight,
  unit = 'lbs',
}) => {
  const totalLoss = startWeight - currentWeight
  const percentComplete = Math.min(
    100,
    Math.round((totalLoss / (startWeight - goalWeight)) * 100),
  )
  useEffect(() => {
    // Trigger haptic feedback on load
    hapticFeedback.success()
    // Trigger confetti animation
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    }
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }
    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }
      const particleCount = 50 * (timeLeft / duration)
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
      })
    }, 250)
    return () => clearInterval(interval)
  }, [])
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="mb-8"
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            <Berry variant="celebrate" size="large" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold mb-3 text-center text-gray-900 dark:text-white"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
              duration: 0.5,
            }}
          >
            Goal Achieved!
          </motion.h1>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
              duration: 0.5,
            }}
          >
            Congratulations! You've reached your weight goal.
          </motion.p>
          <motion.div
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.6,
              duration: 0.5,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Starting Weight
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {startWeight} {unit}
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                  <TrendingDownIcon
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    -{totalLoss.toFixed(1)} {unit}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Loss
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Weight
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentWeight} {unit}
                </p>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">
                  Progress
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {percentComplete}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 dark:bg-green-400 rounded-full"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${percentComplete}%`,
                  }}
                  transition={{
                    delay: 0.8,
                    duration: 1.5,
                  }}
                ></motion.div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Goal Weight: {goalWeight} {unit}
            </p>
          </motion.div>
          <motion.div
            className="w-full space-y-4"
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.9,
              duration: 0.5,
            }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                28-day streak maintained
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Healthy weight loss pace achieved
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Nutrition balance improved by 45%
              </p>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="space-y-3 mt-8"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 1.2,
            duration: 0.5,
          }}
        >
          <Button
            onClick={() => {
              hapticFeedback.impact()
              onSetNewGoal()
            }}
            variant="primary"
            fullWidth
          >
            Set a New Goal
          </Button>
          <Button
            onClick={() => {
              hapticFeedback.selection()
              onContinue()
            }}
            variant="secondary"
            fullWidth
          >
            Continue with Maintenance
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/MealTypeSelector.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Coffee, Sun, Moon } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface MealTypeSelectorProps {
  selectedMeal: string
  onSelect: (mealType: string) => void
}
export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedMeal,
  onSelect,
}) => {
  const mealTypes = [
    {
      id: 'breakfast',
      name: 'Breakfast',
      icon: <Coffee size={20} />,
      time: '6-10 AM',
    },
    {
      id: 'lunch',
      name: 'Lunch',
      icon: <Sun size={20} />,
      time: '11-3 PM',
    },
    {
      id: 'dinner',
      name: 'Dinner',
      icon: <Moon size={20} />,
      time: '5-9 PM',
    },
    {
      id: 'snack',
      name: 'Snack',
      icon: <Clock size={20} />,
      time: 'Anytime',
    },
  ]
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
        Meal Type
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {mealTypes.map((meal) => (
          <motion.button
            key={meal.id}
            className={`flex items-center p-3 rounded-lg border ${selectedMeal === meal.id ? 'border-[#320DFF] bg-[#320DFF]/5 dark:border-[#6D56FF] dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'}`}
            onClick={() => {
              hapticFeedback.selection()
              onSelect(meal.id)
            }}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedMeal === meal.id ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 text-[#320DFF] dark:text-[#6D56FF]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
            >
              {meal.icon}
            </div>
            <div className="text-left">
              <p
                className={`font-medium ${selectedMeal === meal.id ? 'text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-900 dark:text-white'}`}
              >
                {meal.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {meal.time}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

```
```components/food-input/NutritionFactsPanel.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Info } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface NutritionItem {
  name: string
  amount: number
  unit: string
  dailyValue?: number
  subItems?: {
    name: string
    amount: number
    unit: string
    dailyValue?: number
  }[]
}
interface NutritionFactsPanelProps {
  servingSize: string
  calories: number
  nutritionItems: NutritionItem[]
}
export const NutritionFactsPanel: React.FC<NutritionFactsPanelProps> = ({
  servingSize,
  calories,
  nutritionItems,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = () => {
    hapticFeedback.selection()
    setExpanded(!expanded)
  }
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="font-medium text-gray-900 dark:text-white">
          Nutrition Facts
        </h3>
        <motion.div
          animate={{
            rotate: expanded ? 180 : 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <ChevronDown className="text-gray-500 dark:text-gray-400" size={20} />
        </motion.div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="px-4 pb-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Serving size: {servingSize}
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Calories
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calories}
                  </p>
                </div>
              </div>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 mb-2">
                % Daily Value*
              </p>
              <div className="space-y-2">
                {nutritionItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name} {item.amount}
                        {item.unit}
                      </p>
                      {item.dailyValue && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.dailyValue}%
                        </p>
                      )}
                    </div>
                    {item.subItems &&
                      item.subItems.map((subItem, subIndex) => (
                        <div
                          key={`${index}-${subIndex}`}
                          className="flex justify-between items-center py-1 pl-4 border-b border-gray-200 dark:border-gray-700"
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subItem.name} {subItem.amount}
                            {subItem.unit}
                          </p>
                          {subItem.dailyValue && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {subItem.dailyValue}%
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start text-xs text-gray-500 dark:text-gray-400">
                <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                <p>
                  *Percent Daily Values are based on a 2,000 calorie diet. Your
                  daily values may be higher or lower depending on your calorie
                  needs.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

```
```components/food-input/PortionSizeSelector.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface PortionOption {
  id: string
  name: string
  multiplier: number
}
interface PortionSizeSelectorProps {
  options: PortionOption[]
  selectedOption: string
  quantity: number
  onOptionChange: (optionId: string) => void
  onQuantityChange: (quantity: number) => void
  caloriesPerServing: number
}
export const PortionSizeSelector: React.FC<PortionSizeSelectorProps> = ({
  options,
  selectedOption,
  quantity,
  onOptionChange,
  onQuantityChange,
  caloriesPerServing,
}) => {
  const selectedPortionOption =
    options.find((option) => option.id === selectedOption) || options[0]
  const totalCalories = Math.round(
    caloriesPerServing * selectedPortionOption.multiplier * quantity,
  )
  const handleIncrement = () => {
    hapticFeedback.selection()
    onQuantityChange(quantity + 0.5)
  }
  const handleDecrement = () => {
    if (quantity > 0.5) {
      hapticFeedback.selection()
      onQuantityChange(quantity - 0.5)
    }
  }
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
        Portion Size
      </h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map((option) => (
          <motion.button
            key={option.id}
            className={`px-3 py-1.5 rounded-full text-sm ${selectedOption === option.id ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => {
              hapticFeedback.selection()
              onOptionChange(option.id)
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            {option.name}
          </motion.button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 dark:text-gray-400">Quantity</span>
        <div className="flex items-center">
          <motion.button
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            onClick={handleDecrement}
            disabled={quantity <= 0.5}
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <Minus size={16} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
          <span className="mx-4 font-medium text-gray-900 dark:text-white">
            {quantity}
          </span>
          <motion.button
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            onClick={handleIncrement}
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <Plus size={16} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">Total calories</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {totalCalories}
        </span>
      </div>
    </div>
  )
}

```
```components/food-input/FoodSearchBar.tsx
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Mic, Camera } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface FoodSearchBarProps {
  onSearch: (query: string) => void
  onVoiceSearch: () => void
  onCameraSearch: () => void
  onBarcodeSearch: () => void
  recentSearches?: string[]
}
export const FoodSearchBar: React.FC<FoodSearchBarProps> = ({
  onSearch,
  onVoiceSearch,
  onCameraSearch,
  onBarcodeSearch,
  recentSearches = [],
}) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSearch = () => {
    if (query.trim()) {
      hapticFeedback.selection()
      onSearch(query)
      setShowRecent(false)
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  const handleClear = () => {
    hapticFeedback.selection()
    setQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  const handleRecentSearch = (searchTerm: string) => {
    hapticFeedback.selection()
    setQuery(searchTerm)
    onSearch(searchTerm)
    setShowRecent(false)
  }
  useEffect(() => {
    if (isFocused && recentSearches.length > 0 && !query) {
      setShowRecent(true)
    } else {
      setShowRecent(false)
    }
  }, [isFocused, query, recentSearches])
  return (
    <div className="relative">
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="pl-4 pr-2 py-3">
          <Search size={20} className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search for food..."
          className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="flex items-center pr-2">
          {query && (
            <motion.button
              className="w-8 h-8 rounded-full flex items-center justify-center mr-1"
              onClick={handleClear}
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              exit={{
                scale: 0,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}
          <div className="flex space-x-1">
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onClick={() => {
                hapticFeedback.selection()
                onVoiceSearch()
              }}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <Mic size={16} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onClick={() => {
                hapticFeedback.selection()
                onCameraSearch()
              }}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <Camera size={16} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onClick={() => {
                hapticFeedback.selection()
                onBarcodeSearch()
              }}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <div size={16} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showRecent && (
          <motion.div
            className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                Recent searches
              </p>
              {recentSearches.map((search, index) => (
                <motion.button
                  key={index}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleRecentSearch(search)}
                  whileHover={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="flex items-center">
                    <Search
                      size={14}
                      className="text-gray-500 dark:text-gray-400 mr-2"
                    />
                    <span>{search}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

```
```components/food-input/FoodItemCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Star, Clock, Heart, PlusCircle } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface FoodItemCardProps {
  id: string
  name: string
  brand?: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  image?: string
  isFavorite?: boolean
  isRecent?: boolean
  isFrequent?: boolean
  onSelect: (id: string) => void
  onToggleFavorite?: (id: string) => void
}
export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  id,
  name,
  brand,
  calories,
  protein,
  carbs,
  fat,
  image,
  isFavorite = false,
  isRecent = false,
  isFrequent = false,
  onSelect,
  onToggleFavorite,
}) => {
  const handleSelect = () => {
    hapticFeedback.selection()
    onSelect(id)
  }
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleFavorite) {
      hapticFeedback.impact()
      onToggleFavorite(id)
    }
  }
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={handleSelect}
    >
      <div className="flex p-3">
        {image ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
            <span className="text-2xl text-gray-400 dark:text-gray-500">
              🍽️
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {name}
              </h3>
              {brand && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {brand}
                </p>
              )}
            </div>
            {onToggleFavorite && (
              <motion.button
                className="w-8 h-8 rounded-full flex items-center justify-center"
                onClick={handleToggleFavorite}
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              >
                <Heart
                  size={18}
                  className={
                    isFavorite
                      ? 'text-red-500 fill-red-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }
                />
              </motion.button>
            )}
          </div>
          <div className="flex justify-between items-end mt-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {calories} cal
            </div>
            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {protein !== undefined && <span>P: {protein}g</span>}
              {carbs !== undefined && <span>C: {carbs}g</span>}
              {fat !== undefined && <span>F: {fat}g</span>}
            </div>
          </div>
        </div>
      </div>
      {(isRecent || isFrequent) && (
        <div
          className={`px-3 py-1 text-xs border-t border-gray-200 dark:border-gray-700 ${isFrequent ? 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'bg-gray-50 dark:bg-gray-750'}`}
        >
          <div className="flex items-center">
            {isRecent && (
              <>
                <Clock
                  size={12}
                  className="text-gray-500 dark:text-gray-400 mr-1"
                />
                <span className="text-gray-500 dark:text-gray-400">
                  Recently added
                </span>
              </>
            )}
            {isFrequent && (
              <>
                <Star
                  size={12}
                  className="text-[#320DFF] dark:text-[#6D56FF] mr-1"
                />
                <span className="text-[#320DFF] dark:text-[#6D56FF]">
                  Frequently used
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

```
```components/food-input/CustomFoodForm.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface CustomFoodFormProps {
  onSave: (foodData: any) => void
  onCancel: () => void
}
export const CustomFoodForm: React.FC<CustomFoodFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [servingSize, setServingSize] = useState('')
  const [servingUnit, setServingUnit] = useState('g')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    [key: string]: string
  }>({})
  const validateForm = () => {
    const newErrors: {
      [key: string]: string
    } = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!servingSize.trim()) newErrors.servingSize = 'Serving size is required'
    if (!calories.trim()) newErrors.calories = 'Calories are required'
    // Validate numbers
    if (servingSize && isNaN(Number(servingSize))) {
      newErrors.servingSize = 'Must be a number'
    }
    if (calories && isNaN(Number(calories))) {
      newErrors.calories = 'Must be a number'
    }
    if (protein && isNaN(Number(protein))) {
      newErrors.protein = 'Must be a number'
    }
    if (carbs && isNaN(Number(carbs))) {
      newErrors.carbs = 'Must be a number'
    }
    if (fat && isNaN(Number(fat))) {
      newErrors.fat = 'Must be a number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = () => {
    if (validateForm()) {
      hapticFeedback.success()
      onSave({
        name,
        brand: brand || undefined,
        servingSize: {
          amount: Number(servingSize),
          unit: servingUnit,
        },
        nutrition: {
          calories: Number(calories),
          protein: protein ? Number(protein) : undefined,
          carbs: carbs ? Number(carbs) : undefined,
          fat: fat ? Number(fat) : undefined,
        },
        image,
      })
    } else {
      hapticFeedback.error()
    }
  }
  const handleAddImage = () => {
    // In a real app, this would open the camera or file picker
    // For now, just set a placeholder image
    setImage(
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    )
  }
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Food Name*
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`}
          placeholder="e.g. Grilled Chicken Breast"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle size={12} className="mr-1" /> {errors.name}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Brand (optional)
        </label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20"
          placeholder="e.g. Tyson"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Serving Size*
          </label>
          <div className="flex">
            <input
              type="text"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className={`flex-1 px-3 py-2 bg-white dark:bg-gray-800 border ${errors.servingSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`}
              placeholder="100"
            />
            <select
              value={servingUnit}
              onChange={(e) => setServingUnit(e.target.value)}
              className="px-2 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="oz">oz</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="piece">piece</option>
            </select>
          </div>
          {errors.servingSize && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.servingSize}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Calories*
          </label>
          <input
            type="text"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.calories ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`}
            placeholder="150"
          />
          {errors.calories && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.calories}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Protein (g)
          </label>
          <input
            type="text"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.protein ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`}
            placeholder="20"
          />
          {errors.protein && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.protein}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Carbs (g)
          </label>
          <input
            type="text"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.carbs ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`}
            placeholder="0"
          />
          {errors.carbs && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.carbs}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fat (g)
          </label>
          <input
            type="text"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.fat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`}
            placeholder="8"
          />
          {errors.fat && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.fat}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image (optional)
        </label>
        {image ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
            <img
              src={image}
              alt="Food"
              className="w-full h-full object-cover"
            />
            <button
              className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
              onClick={() => setImage(null)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <motion.button
            className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center"
            onClick={handleAddImage}
            whileHover={{
              backgroundColor: 'rgba(0,0,0,0.02)',
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Camera
              size={32}
              className="text-gray-400 dark:text-gray-500 mb-2"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add photo
            </p>
          </motion.button>
        )}
      </div>
      <div className="flex space-x-3 pt-4">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            hapticFeedback.selection()
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" fullWidth onClick={handleSubmit}>
          Save Food
        </Button>
      </div>
    </div>
  )
}

```
```components/food-input/MealSummaryCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, PlusCircle } from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
interface FoodItem {
  id: string
  name: string
  brand?: string
  quantity: number
  calories: number
  protein?: number
  carbs?: number
  fat?: number
}
interface MealSummaryCardProps {
  mealType: string
  time: string
  foodItems: FoodItem[]
  onEdit: () => void
  onDelete: () => void
  onAddMore: () => void
}
export const MealSummaryCard: React.FC<MealSummaryCardProps> = ({
  mealType,
  time,
  foodItems,
  onEdit,
  onDelete,
  onAddMore,
}) => {
  const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0)
  const totalProtein = foodItems.reduce(
    (sum, item) => sum + (item.protein || 0),
    0,
  )
  const totalCarbs = foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0)
  const totalFat = foodItems.reduce((sum, item) => sum + (item.fat || 0), 0)
  const handleEdit = () => {
    hapticFeedback.selection()
    onEdit()
  }
  const handleDelete = () => {
    hapticFeedback.impact()
    onDelete()
  }
  const handleAddMore = () => {
    hapticFeedback.selection()
    onAddMore()
  }
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {mealType}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">
              {totalCalories} cal
            </p>
            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>P: {totalProtein}g</span>
              <span>C: {totalCarbs}g</span>
              <span>F: {totalFat}g</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div>
                <p className="text-gray-800 dark:text-gray-200">{item.name}</p>
                {item.brand && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.brand}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-gray-800 dark:text-gray-200">
                  {item.calories} cal
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.quantity} {item.quantity === 1 ? 'serving' : 'servings'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <motion.button
            className="flex-1 py-2 flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700"
            onClick={handleEdit}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </motion.button>
          <motion.button
            className="flex-1 py-2 flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700"
            onClick={handleDelete}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </motion.button>
          <motion.button
            className="flex-1 py-2 flex items-center justify-center space-x-1 text-sm text-[#320DFF] dark:text-[#6D56FF] rounded-lg bg-[#320DFF]/5 dark:bg-[#6D56FF]/10"
            onClick={handleAddMore}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <PlusCircle size={14} />
            <span>Add More</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

```
```components/screens/AddFoodScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { FoodSearchBar } from '../food-input/FoodSearchBar'
import { FoodItemCard } from '../food-input/FoodItemCard'
import { MealTypeSelector } from '../food-input/MealTypeSelector'
import { hapticFeedback } from '../../utils/haptics'
interface AddFoodScreenProps {
  onBack: () => void
  onNavigate: (screen: string, params: any) => void
}
export const AddFoodScreen: React.FC<AddFoodScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [searchQuery, setSearchQuery] = useState('')
  // Sample data
  const recentSearches = [
    'chicken breast',
    'greek yogurt',
    'protein shake',
    'banana',
  ]
  const recentFoods = [
    {
      id: '1',
      name: 'Greek Yogurt',
      brand: 'Fage',
      calories: 130,
      protein: 18,
      carbs: 6,
      fat: 4,
      isRecent: true,
    },
    {
      id: '2',
      name: 'Grilled Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      isRecent: true,
    },
  ]
  const frequentFoods = [
    {
      id: '3',
      name: 'Banana',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      isFrequent: true,
    },
    {
      id: '4',
      name: 'Protein Shake',
      brand: 'Optimum Nutrition',
      calories: 120,
      protein: 24,
      carbs: 3,
      fat: 1,
      isFrequent: true,
    },
  ]
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onNavigate('search-results', {
      query,
    })
  }
  const handleSelectFood = (id: string) => {
    // Find the selected food item
    const food = [...recentFoods, ...frequentFoods].find(
      (item) => item.id === id,
    )
    if (food) {
      onNavigate('food-detail', {
        food,
      })
    }
  }
  const handleVoiceSearch = () => {
    onNavigate('voice-input', {})
  }
  const handleCameraSearch = () => {
    onNavigate('camera-input', {})
  }
  const handleBarcodeSearch = () => {
    onNavigate('barcode-input', {})
  }
  const handleCreateCustomFood = () => {
    onNavigate('create-food', {})
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Food
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="mb-4">
            <FoodSearchBar
              onSearch={handleSearch}
              onVoiceSearch={handleVoiceSearch}
              onCameraSearch={handleCameraSearch}
              onBarcodeSearch={handleBarcodeSearch}
              recentSearches={recentSearches}
            />
          </div>
          <MealTypeSelector
            selectedMeal={selectedMeal}
            onSelect={setSelectedMeal}
          />
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Recent Foods
              </h2>
              <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                See All
              </button>
            </div>
            <div className="space-y-3">
              {recentFoods.map((food) => (
                <FoodItemCard
                  key={food.id}
                  {...food}
                  onSelect={handleSelectFood}
                  onToggleFavorite={(id) => console.log('Toggle favorite', id)}
                />
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Frequent Foods
              </h2>
              <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                See All
              </button>
            </div>
            <div className="space-y-3">
              {frequentFoods.map((food) => (
                <FoodItemCard
                  key={food.id}
                  {...food}
                  onSelect={handleSelectFood}
                  onToggleFavorite={(id) => console.log('Toggle favorite', id)}
                />
              ))}
            </div>
          </div>
          <div className="mb-6">
            <Button
              variant="secondary"
              fullWidth
              icon={<PlusIcon size={18} />}
              onClick={handleCreateCustomFood}
            >
              Create Custom Food
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/CreateFoodScreen.tsx
import React from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { CustomFoodForm } from '../food-input/CustomFoodForm'
import { hapticFeedback } from '../../utils/haptics'
interface CreateFoodScreenProps {
  onBack: () => void
  onSave: (foodData: any) => void
}
export const CreateFoodScreen: React.FC<CreateFoodScreenProps> = ({
  onBack,
  onSave,
}) => {
  const handleSave = (foodData: any) => {
    onSave(foodData)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Custom Food
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add details about your custom food item. Fields marked with * are
            required.
          </p>
          <CustomFoodForm onSave={handleSave} onCancel={onBack} />
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/FoodDetailsScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { PortionSizeSelector } from '../food-input/PortionSizeSelector'
import { MealTypeSelector } from '../food-input/MealTypeSelector'
import { NutritionFactsPanel } from '../food-input/NutritionFactsPanel'
import { hapticFeedback } from '../../utils/haptics'
interface FoodDetailsScreenProps {
  food: any
  onBack: () => void
  onAddToLog: (food: any, quantity: number, mealType: string) => void
}
export const FoodDetailsScreen: React.FC<FoodDetailsScreenProps> = ({
  food,
  onBack,
  onAddToLog,
}) => {
  const [isFavorite, setIsFavorite] = useState(food.isFavorite || false)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [selectedPortion, setSelectedPortion] = useState('serving')
  const [quantity, setQuantity] = useState(1)
  const portionOptions = [
    {
      id: 'serving',
      name: 'Serving',
      multiplier: 1,
    },
    {
      id: 'cup',
      name: 'Cup',
      multiplier: 1.5,
    },
    {
      id: 'oz',
      name: 'Ounce',
      multiplier: 0.25,
    },
    {
      id: 'gram',
      name: 'Gram',
      multiplier: 0.01,
    },
  ]
  const nutritionItems = [
    {
      name: 'Total Fat',
      amount: food.fat || 0,
      unit: 'g',
      dailyValue: Math.round(((food.fat || 0) / 65) * 100),
      subItems: [
        {
          name: 'Saturated Fat',
          amount: food.saturatedFat || 0,
          unit: 'g',
          dailyValue: Math.round(((food.saturatedFat || 0) / 20) * 100),
        },
      ],
    },
    {
      name: 'Cholesterol',
      amount: food.cholesterol || 0,
      unit: 'mg',
      dailyValue: Math.round(((food.cholesterol || 0) / 300) * 100),
    },
    {
      name: 'Sodium',
      amount: food.sodium || 0,
      unit: 'mg',
      dailyValue: Math.round(((food.sodium || 0) / 2300) * 100),
    },
    {
      name: 'Total Carbohydrate',
      amount: food.carbs || 0,
      unit: 'g',
      dailyValue: Math.round(((food.carbs || 0) / 300) * 100),
      subItems: [
        {
          name: 'Dietary Fiber',
          amount: food.fiber || 0,
          unit: 'g',
          dailyValue: Math.round(((food.fiber || 0) / 25) * 100),
        },
        {
          name: 'Total Sugars',
          amount: food.sugar || 0,
          unit: 'g',
        },
      ],
    },
    {
      name: 'Protein',
      amount: food.protein || 0,
      unit: 'g',
    },
  ]
  const handleToggleFavorite = () => {
    hapticFeedback.impact()
    setIsFavorite(!isFavorite)
  }
  const handleAddToLog = () => {
    hapticFeedback.success()
    onAddToLog(food, quantity, selectedMeal)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                onBack()
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Food Details
            </h1>
          </div>
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            onClick={handleToggleFavorite}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <Heart
              size={20}
              className={
                isFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-700 dark:text-gray-300'
              }
            />
          </motion.button>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <div className="flex items-start">
              {food.image ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mr-4">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <span className="text-2xl text-gray-400 dark:text-gray-500">
                    🍽️
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                  {food.name}
                </h2>
                {food.brand && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {food.brand}
                  </p>
                )}
                <div className="flex justify-between items-end mt-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {food.calories} cal
                  </div>
                  <div className="flex space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    {food.protein !== undefined && (
                      <span>P: {food.protein}g</span>
                    )}
                    {food.carbs !== undefined && <span>C: {food.carbs}g</span>}
                    {food.fat !== undefined && <span>F: {food.fat}g</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MealTypeSelector
            selectedMeal={selectedMeal}
            onSelect={setSelectedMeal}
          />
          <PortionSizeSelector
            options={portionOptions}
            selectedOption={selectedPortion}
            quantity={quantity}
            onOptionChange={setSelectedPortion}
            onQuantityChange={setQuantity}
            caloriesPerServing={food.calories}
          />
          <NutritionFactsPanel
            servingSize={`${quantity} ${selectedPortion}`}
            calories={Math.round(
              food.calories *
                quantity *
                (portionOptions.find((o) => o.id === selectedPortion)
                  ?.multiplier || 1),
            )}
            nutritionItems={nutritionItems}
          />
          <div className="mt-6">
            <Button variant="primary" fullWidth onClick={handleAddToLog}>
              Add to Food Log
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/DailyLogScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  PlusCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { MealSummaryCard } from '../food-input/MealSummaryCard'
import { ProgressRing } from '../ui/ProgressRing'
import { hapticFeedback } from '../../utils/haptics'
interface DailyLogScreenProps {
  onBack: () => void
  onNavigate: (screen: string, params: any) => void
}
export const DailyLogScreen: React.FC<DailyLogScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  // Sample data
  const dailyGoal = 2000
  const totalConsumed = 1620
  const remaining = dailyGoal - totalConsumed
  const percentage = Math.round((totalConsumed / dailyGoal) * 100)
  const macros = {
    protein: {
      consumed: 95,
      goal: 150,
      percentage: 63,
    },
    carbs: {
      consumed: 180,
      goal: 250,
      percentage: 72,
    },
    fat: {
      consumed: 48,
      goal: 65,
      percentage: 74,
    },
  }
  const meals = [
    {
      type: 'Breakfast',
      time: '8:30 AM',
      foodItems: [
        {
          id: '1',
          name: 'Greek Yogurt',
          brand: 'Fage',
          quantity: 1,
          calories: 130,
          protein: 18,
          carbs: 6,
          fat: 4,
        },
        {
          id: '2',
          name: 'Banana',
          quantity: 1,
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.4,
        },
      ],
    },
    {
      type: 'Lunch',
      time: '12:45 PM',
      foodItems: [
        {
          id: '3',
          name: 'Grilled Chicken Sandwich',
          quantity: 1,
          calories: 450,
          protein: 35,
          carbs: 45,
          fat: 15,
        },
        {
          id: '4',
          name: 'Side Salad',
          quantity: 1,
          calories: 120,
          protein: 3,
          carbs: 10,
          fat: 8,
        },
      ],
    },
    {
      type: 'Snack',
      time: '3:30 PM',
      foodItems: [
        {
          id: '5',
          name: 'Protein Bar',
          brand: 'Quest',
          quantity: 1,
          calories: 190,
          protein: 20,
          carbs: 21,
          fat: 8,
        },
      ],
    },
    {
      type: 'Dinner',
      time: '7:00 PM',
      foodItems: [
        {
          id: '6',
          name: 'Salmon Fillet',
          quantity: 1,
          calories: 367,
          protein: 39.8,
          carbs: 0,
          fat: 22,
        },
        {
          id: '7',
          name: 'Steamed Broccoli',
          quantity: 1,
          calories: 55,
          protein: 3.7,
          carbs: 11.2,
          fat: 0.6,
        },
        {
          id: '8',
          name: 'Brown Rice',
          quantity: 0.5,
          calories: 108,
          protein: 2.5,
          carbs: 22.5,
          fat: 0.9,
        },
      ],
    },
  ]
  const handleDateChange = (days: number) => {
    hapticFeedback.selection()
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + days)
    setCurrentDate(newDate)
  }
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }
  const isToday = () => {
    const today = new Date()
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }
  const handleAddMeal = (mealType?: string) => {
    hapticFeedback.selection()
    onNavigate('add-food', {
      mealType,
    })
  }
  const handleEditMeal = (mealType: string) => {
    hapticFeedback.selection()
    // Find the meal and navigate to edit screen
    const meal = meals.find((m) => m.type === mealType)
    if (meal) {
      onNavigate('edit-meal', {
        meal,
      })
    }
  }
  const handleDeleteMeal = (mealType: string) => {
    hapticFeedback.impact()
    // In a real app, this would delete the meal
    console.log('Delete meal:', mealType)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Food Log
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          {/* Date Selector */}
          <div className="flex justify-between items-center mb-6">
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              onClick={() => handleDateChange(-1)}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <ChevronLeft
                size={18}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
            <div className="flex items-center">
              <CalendarIcon
                size={18}
                className="text-[#320DFF] dark:text-[#6D56FF] mr-2"
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {isToday() ? 'Today' : formatDate(currentDate)}
              </span>
            </div>
            <motion.button
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              onClick={() => handleDateChange(1)}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <ChevronRight
                size={18}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
          </div>
          {/* Daily Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex">
              <div className="w-24 h-24 relative mr-4">
                <ProgressRing
                  percentage={percentage}
                  color="#320DFF"
                  size={96}
                  strokeWidth={8}
                  animate={true}
                  duration={1}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {totalConsumed}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      cal
                    </span>
                  </div>
                </ProgressRing>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Goal
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dailyGoal} cal
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Food
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    +{totalConsumed} cal
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Exercise
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    +0 cal
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Remaining
                  </span>
                  <span className="text-sm font-bold text-[#320DFF] dark:text-[#6D56FF]">
                    {remaining} cal
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(macros).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center">
                  <div className="w-10 h-10 mb-1">
                    <ProgressRing
                      percentage={value.percentage}
                      color={
                        key === 'protein'
                          ? '#42A5F5'
                          : key === 'carbs'
                            ? '#FFA726'
                            : '#66BB6A'
                      }
                      size={40}
                      strokeWidth={4}
                      animate={true}
                      duration={1}
                    >
                      <span className="text-xs">{value.percentage}%</span>
                    </ProgressRing>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {value.consumed}/{value.goal}g
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Meals */}
          <div className="space-y-4 mb-6">
            {meals.map((meal, index) => (
              <MealSummaryCard
                key={index}
                mealType={meal.type}
                time={meal.time}
                foodItems={meal.foodItems}
                onEdit={() => handleEditMeal(meal.type)}
                onDelete={() => handleDeleteMeal(meal.type)}
                onAddMore={() => handleAddMeal(meal.type)}
              />
            ))}
          </div>
          {/* Add Meal Button */}
          <motion.button
            className="w-full py-4 flex items-center justify-center space-x-2 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 text-[#320DFF] dark:text-[#6D56FF] rounded-xl"
            onClick={() => handleAddMeal()}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <PlusCircle size={20} />
            <span className="font-medium">Add Meal</span>
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/insights/NutritionInsightCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { hapticFeedback } from '../../utils/haptics'
type InsightType = 'positive' | 'negative' | 'neutral' | 'warning'
interface NutritionInsightCardProps {
  title: string
  description: string
  type: InsightType
  metric?: {
    name: string
    value: number
    unit: string
    change?: number
    target?: number
  }
  onClick?: () => void
}
export const NutritionInsightCard: React.FC<NutritionInsightCardProps> = ({
  title,
  description,
  type,
  metric,
  onClick,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-100 dark:border-green-800/30',
          icon: (
            <CheckCircle
              size={20}
              className="text-green-600 dark:text-green-400"
            />
          ),
          iconBg: 'bg-green-100 dark:bg-green-800/40',
        }
      case 'negative':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-100 dark:border-red-800/30',
          icon: (
            <AlertTriangle
              size={20}
              className="text-red-600 dark:text-red-400"
            />
          ),
          iconBg: 'bg-red-100 dark:bg-red-800/40',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-100 dark:border-amber-800/30',
          icon: (
            <Info size={20} className="text-amber-600 dark:text-amber-400" />
          ),
          iconBg: 'bg-amber-100 dark:bg-amber-800/40',
        }
      default:
        return {
          bg: 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10',
          border: 'border-[#320DFF]/10 dark:border-[#6D56FF]/20',
          icon: (
            <Info size={20} className="text-[#320DFF] dark:text-[#6D56FF]" />
          ),
          iconBg: 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20',
        }
    }
  }
  const styles = getTypeStyles()
  const handleClick = () => {
    if (onClick) {
      hapticFeedback.selection()
      onClick()
    }
  }
  return (
    <motion.div
      className={`p-4 rounded-xl border ${styles.border} ${styles.bg}`}
      whileHover={
        onClick
          ? {
              scale: 1.02,
            }
          : {}
      }
      whileTap={
        onClick
          ? {
              scale: 0.98,
            }
          : {}
      }
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div
          className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center mr-3 shrink-0`}
        >
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
          {metric && (
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.name}
                </span>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 dark:text-white mr-1">
                    {metric.value}
                    {metric.unit}
                  </span>
                  {metric.change && (
                    <div
                      className={`flex items-center ml-1 ${metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {metric.change > 0 ? (
                        <TrendingUp size={14} className="mr-0.5" />
                      ) : (
                        <TrendingDown size={14} className="mr-0.5" />
                      )}
                      <span className="text-xs font-medium">
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {metric.target && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      Target
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {metric.target}
                      {metric.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${type === 'positive' ? 'bg-green-500 dark:bg-green-400' : type === 'negative' ? 'bg-red-500 dark:bg-red-400' : 'bg-[#320DFF] dark:bg-[#6D56FF]'}`}
                      style={{
                        width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

```
```components/ui/Berry.tsx
import React from 'react'
type BerryVariant =
  | 'celebrate'
  | 'search'
  | 'sleep'
  | 'wave'
  | 'default'
  | 'reading'
  | 'sad'
  | 'shock'
  | 'sweat'
  | 'trophy'
  | 'thumbs-up'
  | 'party'
  | 'chef'
  | 'head'
  | 'magnify'
  | 'streak'
type BerrySize = 'tiny' | 'small' | 'medium' | 'large' | 'inline'
interface BerryProps {
  variant?: BerryVariant
  size?: BerrySize
  className?: string
}
export const Berry: React.FC<BerryProps> = ({
  variant = 'default',
  size = 'medium',
  className = '',
}) => {
  const getImageUrl = () => {
    switch (variant) {
      case 'reading':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/k8WrWmDsJdJ9fE5QnYiy6v/berry_reading.png'
      case 'sad':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/4swCmLK9NJxpVTpQr6dWhx/berry_sad.png'
      case 'shock':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/cwJzW4F3RiDQErKnd9XbpK/berry_shock.png'
      case 'sweat':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/uPGH4Y21bXTcwGGY8LjDqM/berry_sweat.png'
      case 'trophy':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/iW3yAXeJxPKgdhmcahnBCk/berry_trophy.png'
      case 'celebrate':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/gsezTeV6JYgdjJqxBVQKQT/berry_celebrate.png'
      case 'search':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/jF1s2i18c98TsQdaPikqsJ/berry_search.png'
      case 'sleep':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/1kn4c5mUGq4jsKWCZMoMgV/berry_sleep.png'
      case 'thumbs-up':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/q2Qe9Dur17FBhxJ882hvm6/berry_wave.png'
      case 'head':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/q2Qe9Dur17FBhxJ882hvm6/berry_wave.png'
      case 'magnify':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/jF1s2i18c98TsQdaPikqsJ/berry_search.png'
      case 'streak':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/wPsxeY4MrZk5roUvNoks2y/berry_streak.png'
      case 'wave':
      case 'default':
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/q2Qe9Dur17FBhxJ882hvm6/berry_wave.png'
      default:
        return 'https://uploadthingy.s3.us-west-1.amazonaws.com/q2Qe9Dur17FBhxJ882hvm6/berry_wave.png'
    }
  }
  const getSize = () => {
    switch (size) {
      case 'tiny':
        return 'w-6 h-6'
      case 'small':
        return 'w-24 h-24'
      case 'large':
        return 'w-48 h-48'
      case 'inline':
        return 'w-10 h-10'
      case 'medium':
      default:
        return 'w-36 h-36'
    }
  }
  return (
    <div className={`${getSize()} ${className}`}>
      <img
        src={getImageUrl()}
        alt="Berry mascot"
        className="w-full h-full object-contain"
      />
    </div>
  )
}

```
```components/screens/EmptyStateScreen.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Berry } from '../ui/Berry'
interface EmptyStateScreenProps {
  title: string
  description: string
  buttonText: string
  onAction: () => void
}
export const EmptyStateScreen: React.FC<EmptyStateScreenProps> = ({
  title,
  description,
  buttonText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="text-center"
      >
        <div className="mb-6">
          <Berry variant="wave" size="large" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs mx-auto">
          {description}
        </p>
        <Button variant="primary" onClick={onAction}>
          {buttonText}
        </Button>
      </motion.div>
    </div>
  )
}

```
```components/onboarding/GenderSelectionScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface GenderSelectionScreenProps {
  onBack: () => void
  onNext: (gender: string) => void
  progress: number
}
export const GenderSelectionScreen: React.FC<GenderSelectionScreenProps> = ({
  onBack,
  onNext,
  progress,
}) => {
  const [selectedGender, setSelectedGender] = useState('')
  const handleSelect = (gender: string) => {
    hapticFeedback.selection()
    setSelectedGender(gender)
  }
  const handleContinue = () => {
    if (selectedGender) {
      onNext(selectedGender)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Tell us about yourself</h1>
        <p className="text-gray-600 text-lg">
          This helps us calculate your metabolic rate
        </p>
      </div>
      <div className="space-y-4 mb-8">
        <motion.button
          className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGender === 'male' ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
          onClick={() => handleSelect('male')}
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
        >
          <span
            className={`text-lg font-medium ${selectedGender === 'male' ? 'text-[#320DFF]' : ''}`}
          >
            Male
          </span>
        </motion.button>
        <motion.button
          className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGender === 'female' ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
          onClick={() => handleSelect('female')}
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
        >
          <span
            className={`text-lg font-medium ${selectedGender === 'female' ? 'text-[#320DFF]' : ''}`}
          >
            Female
          </span>
        </motion.button>
        <motion.button
          className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGender === 'other' ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
          onClick={() => handleSelect('other')}
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
        >
          <span
            className={`text-lg font-medium ${selectedGender === 'other' ? 'text-[#320DFF]' : ''}`}
          >
            Other
          </span>
        </motion.button>
      </div>
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          variant="primary"
          fullWidth
          disabled={!selectedGender}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/ReferralSourceScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface ReferralSourceScreenProps {
  onBack: () => void
  onNext: (source: string) => void
}
export const ReferralSourceScreen: React.FC<ReferralSourceScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [selectedSource, setSelectedSource] = useState('')
  const sources = [
    {
      id: 'facebook',
      label: 'Facebook',
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png"
          alt="Facebook"
          className="w-6 h-6"
        />
      ),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png"
          alt="Instagram"
          className="w-6 h-6"
        />
      ),
    },
    {
      id: 'google',
      label: 'Google',
      icon: (
        <img
          src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
          alt="Google"
          className="w-12 h-4"
        />
      ),
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.321 5.562a5.124 5.124 0 01-1.38-3.573h-3.826v12.193c0 1.264-1.034 2.281-2.3 2.281-1.266 0-2.3-1.017-2.3-2.281 0-1.264 1.034-2.281 2.3-2.281.252 0 .497.04.73.116V8.113a6.217 6.217 0 00-.73-.043c-3.406 0-6.174 2.767-6.174 6.17 0 3.404 2.768 6.17 6.174 6.17 3.405 0 6.173-2.766 6.173-6.17V9.07a8.803 8.803 0 005.131 1.643V6.868c-1.43 0-2.757-.495-3.798-1.306z"
            fill="#000"
          />
        </svg>
      ),
    },
    {
      id: 'friend',
      label: 'Friend/Family',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
            fill="#FF5722"
          />
        </svg>
      ),
    },
    {
      id: 'app-store',
      label: 'App Store',
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/App_Store_%28iOS%29.svg/1024px-App_Store_%28iOS%29.svg.png"
          alt="App Store"
          className="w-6 h-6"
        />
      ),
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            fill="#FF0000"
          />
        </svg>
      ),
    },
    {
      id: 'tv',
      label: 'TV',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H8V21H16V19H21C22.1 19 23 18.1 23 17V5C23 3.9 22.1 3 21 3ZM21 17H3V5H21V17Z"
            fill="#673AB7"
          />
        </svg>
      ),
    },
    {
      id: 'other',
      label: 'Other',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z"
            fill="#757575"
          />
        </svg>
      ),
    },
  ]
  const handleSelect = (source: string) => {
    hapticFeedback.selection()
    setSelectedSource(source)
  }
  const handleContinue = () => {
    if (selectedSource) {
      onNext(selectedSource)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar - fixed to show correct progress */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: '30%',
          }}
        ></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Where did you hear about us?
        </h1>
        <p className="text-gray-600 text-lg">
          We'd love to know how you found NutriAI
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {sources.map((source) => (
          <motion.button
            key={source.id}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 ${selectedSource === source.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
            onClick={() => handleSelect(source.id)}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div
              className={`mb-2 ${selectedSource === source.id ? 'text-[#320DFF]' : 'text-gray-500'}`}
            >
              {source.icon}
            </div>
            <span className="text-sm font-medium">{source.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          variant="primary"
          fullWidth
          disabled={!selectedSource}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/HeightWeightScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface HeightWeightScreenProps {
  onBack: () => void
  onNext: (height: any, weight: any) => void
  progress: number
}
export const HeightWeightScreen: React.FC<HeightWeightScreenProps> = ({
  onBack,
  onNext,
  progress,
}) => {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial')
  const [height, setHeight] = useState({
    feet: '5',
    inches: '6',
    cm: '168',
  })
  const [weight, setWeight] = useState({
    value: '150',
    unit: 'lbs',
  })
  const handleUnitToggle = () => {
    hapticFeedback.selection()
    setUnit(unit === 'imperial' ? 'metric' : 'imperial')
    if (unit === 'imperial') {
      // Convert to metric
      setWeight({
        value: Math.round(parseInt(weight.value) * 0.453592).toString(),
        unit: 'kg',
      })
    } else {
      // Convert to imperial
      setWeight({
        value: Math.round(parseInt(weight.value) * 2.20462).toString(),
        unit: 'lbs',
      })
    }
  }
  const handleHeightChange = (field: string, value: string) => {
    setHeight({
      ...height,
      [field]: value,
    })
    hapticFeedback.selection()
  }
  const handleWeightChange = (value: string) => {
    setWeight({
      ...weight,
      value,
    })
    hapticFeedback.selection()
  }
  const handleContinue = () => {
    onNext(height, weight)
  }
  // Generate options for pickers
  const feetOptions = Array.from(
    {
      length: 8,
    },
    (_, i) => i + 3,
  )
  const inchesOptions = Array.from(
    {
      length: 12,
    },
    (_, i) => i,
  )
  const cmOptions = Array.from(
    {
      length: 121,
    },
    (_, i) => i + 120,
  )
  const weightOptionsImperial = Array.from(
    {
      length: 301,
    },
    (_, i) => i + 80,
  )
  const weightOptionsMetric = Array.from(
    {
      length: 151,
    },
    (_, i) => i + 35,
  )
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">Your height & weight</h1>
        <p className="text-gray-600 text-lg">
          This helps us personalize your nutrition plan
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <motion.div
          className="flex items-center bg-gray-100 p-1 rounded-full"
          whileTap={{
            scale: 0.98,
          }}
        >
          <motion.button
            className={`px-4 py-2 rounded-full text-sm font-medium ${unit === 'imperial' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`}
            onClick={() => unit !== 'imperial' && handleUnitToggle()}
            whileTap={{
              scale: 0.95,
            }}
          >
            Imperial
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-full text-sm font-medium ${unit === 'metric' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`}
            onClick={() => unit !== 'metric' && handleUnitToggle()}
            whileTap={{
              scale: 0.95,
            }}
          >
            Metric
          </motion.button>
        </motion.div>
      </div>
      <div className="space-y-6 mb-4">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Height
          </label>
          {unit === 'imperial' ? (
            <div className="flex space-x-4">
              <div className="flex-1">
                <select
                  value={height.feet}
                  onChange={(e) => handleHeightChange('feet', e.target.value)}
                  className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
                >
                  {feetOptions.map((feet) => (
                    <option key={feet} value={feet}>
                      {feet} ft
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={height.inches}
                  onChange={(e) => handleHeightChange('inches', e.target.value)}
                  className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
                >
                  {inchesOptions.map((inch) => (
                    <option key={inch} value={inch}>
                      {inch} in
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <select
                value={height.cm}
                onChange={(e) => handleHeightChange('cm', e.target.value)}
                className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
              >
                {cmOptions.map((cm) => (
                  <option key={cm} value={cm}>
                    {cm} cm
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Weight
          </label>
          <select
            value={weight.value}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
          >
            {(unit === 'imperial'
              ? weightOptionsImperial
              : weightOptionsMetric
            ).map((w) => (
              <option key={w} value={w}>
                {w} {unit === 'imperial' ? 'lbs' : 'kg'}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/BirthDateScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface BirthDateScreenProps {
  onBack: () => void
  onNext: (date: any) => void
  progress: number
}
export const BirthDateScreen: React.FC<BirthDateScreenProps> = ({
  onBack,
  onNext,
  progress,
}) => {
  const [birthDate, setBirthDate] = useState({
    month: '1',
    day: '1',
    year: '1990',
  })
  const handleChange = (field: string, value: string) => {
    hapticFeedback.selection()
    setBirthDate({
      ...birthDate,
      [field]: value,
    })
  }
  const handleContinue = () => {
    onNext(birthDate)
  }
  // Generate options for pickers
  const months = Array.from(
    {
      length: 12,
    },
    (_, i) => i + 1,
  ).map((month) => ({
    value: month.toString(),
    label: new Date(2000, month - 1, 1).toLocaleString('default', {
      month: 'long',
    }),
  }))
  const days = Array.from(
    {
      length: 31,
    },
    (_, i) => i + 1,
  ).map((day) => ({
    value: day.toString(),
    label: day.toString(),
  }))
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    {
      length: 100,
    },
    (_, i) => currentYear - 100 + i,
  ).map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }))
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">When were you born?</h1>
        <p className="text-gray-600 text-lg">
          Your age helps us calculate your metabolic rate
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <select
            value={birthDate.month}
            onChange={(e) => handleChange('month', e.target.value)}
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
          >
            {months.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Day
          </label>
          <select
            value={birthDate.day}
            onChange={(e) => handleChange('day', e.target.value)}
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
          >
            {days.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select
            value={birthDate.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
          >
            {years.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/GoalSelectionScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, TrendingDown, Scale, TrendingUp } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface GoalSelectionScreenProps {
  onBack: () => void
  onNext: (goal: string) => void
  progress: number
}
export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  onBack,
  onNext,
  progress,
}) => {
  const [selectedGoal, setSelectedGoal] = useState('')
  const goals = [
    {
      id: 'lose',
      label: 'Lose Weight',
      description: 'Reduce body fat and get leaner',
      icon: <TrendingDown size={28} />,
    },
    {
      id: 'maintain',
      label: 'Maintain Weight',
      description: 'Stay at your current weight',
      icon: <Scale size={28} />,
    },
    {
      id: 'gain',
      label: 'Gain Weight',
      description: 'Build muscle and increase weight',
      icon: <TrendingUp size={28} />,
    },
  ]
  const handleSelect = (goal: string) => {
    hapticFeedback.selection()
    setSelectedGoal(goal)
  }
  const handleContinue = () => {
    if (selectedGoal) {
      onNext(selectedGoal)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">What is your goal?</h1>
        <p className="text-gray-600 text-lg">
          We'll create a plan tailored to your goal
        </p>
      </div>
      <div className="space-y-4 mb-8">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGoal === goal.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
            onClick={() => handleSelect(goal.id)}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div
              className={`text-3xl mr-4 ${selectedGoal === goal.id ? 'text-[#320DFF]' : 'text-gray-500'}`}
            >
              {goal.icon}
            </div>
            <div className="text-left">
              <div className="text-lg font-medium">{goal.label}</div>
              <div className="text-sm text-gray-600">{goal.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          variant="primary"
          fullWidth
          disabled={!selectedGoal}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/TargetWeightScreen.tsx
import React, { useEffect, useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface TargetWeightScreenProps {
  onBack: () => void
  onNext: (targetWeight: any) => void
  currentWeight: {
    value: string
    unit: string
  }
  goal: string
  progress: number
}
export const TargetWeightScreen: React.FC<TargetWeightScreenProps> = ({
  onBack,
  onNext,
  currentWeight,
  goal,
  progress,
}) => {
  const [targetWeight, setTargetWeight] = useState({
    value: '',
    unit: currentWeight.unit,
  })
  const [currentGoal, setCurrentGoal] = useState(goal)
  useEffect(() => {
    // Set initial target weight based on goal and current weight
    const currentWeightValue = parseInt(currentWeight.value)
    let initialTarget = currentWeightValue
    // Start with ±10 from current weight based on goal
    if (goal === 'lose') {
      initialTarget = Math.max(
        currentWeightValue - 10,
        currentWeight.unit === 'lbs' ? 100 : 45,
      )
    } else if (goal === 'gain') {
      initialTarget = currentWeightValue + 10
    }
    setTargetWeight({
      value: initialTarget.toString(),
      unit: currentWeight.unit,
    })
  }, [currentWeight, goal])
  useEffect(() => {
    // Update goal based on target weight compared to current weight
    const currentWeightValue = parseInt(currentWeight.value)
    const targetWeightValue = parseInt(targetWeight.value)
    if (targetWeightValue < currentWeightValue) {
      setCurrentGoal('lose')
    } else if (targetWeightValue > currentWeightValue) {
      setCurrentGoal('gain')
    } else {
      setCurrentGoal('maintain')
    }
  }, [targetWeight, currentWeight])
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setTargetWeight({
      ...targetWeight,
      value: newValue,
    })
    hapticFeedback.selection()
  }
  const handleContinue = () => {
    onNext({
      ...targetWeight,
      goal: currentGoal,
    })
  }
  // Generate min and max values for the slider
  const getSliderLimits = () => {
    const currentWeightValue = parseInt(currentWeight.value)
    const range = currentWeight.unit === 'lbs' ? 50 : 23 // Approx 50 lbs or 23 kg range
    return {
      min: Math.max(
        currentWeightValue - range,
        currentWeight.unit === 'lbs' ? 80 : 36,
      ),
      max: currentWeightValue + range,
    }
  }
  const { min, max } = getSliderLimits()
  const currentWeightValue = parseInt(currentWeight.value)
  const goalText =
    currentGoal === 'lose'
      ? 'lose'
      : currentGoal === 'gain'
        ? 'gain'
        : 'maintain'
  const weightDifference = Math.abs(
    parseInt(targetWeight.value) - currentWeightValue,
  )
  // Generate tick marks for the slider
  const generateTickMarks = () => {
    const ticks = []
    const totalRange = max - min
    const majorInterval = 10 // Major tick every 10 units
    const minorTicksPerMajor = 4 // 4 minor ticks between major ticks
    for (let i = 0; i <= totalRange; i++) {
      const isMajorTick = i % majorInterval === 0
      if (isMajorTick || i % (majorInterval / minorTicksPerMajor) === 0) {
        ticks.push({
          value: min + i,
          isMajorTick: isMajorTick,
        })
      }
    }
    return ticks
  }
  const ticks = generateTickMarks()
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">What's your target weight?</h1>
        <p className="text-gray-600 text-lg">
          {`Select how much weight you want to ${goalText}`}
        </p>
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="text-center mb-4">
          <p
            className={`text-sm font-medium ${currentGoal === 'lose' ? 'text-[#320DFF]' : currentGoal === 'gain' ? 'text-[#320DFF]' : 'text-[#320DFF]'}`}
          >
            {currentGoal === 'lose'
              ? 'Lose weight'
              : currentGoal === 'gain'
                ? 'Gain weight'
                : 'Maintain weight'}
          </p>
        </div>
        <div className="w-full mb-6">
          {/* Slider design inspired by Cal AI */}
          <div className="relative h-24">
            {/* Gradient background based on goal */}
            <div className="absolute left-0 right-0 top-10 h-1 overflow-hidden">
              <div
                className="absolute left-0 right-0 h-full"
                style={{
                  background: `linear-gradient(to right, 
                    rgba(50, 13, 255, 0.3) 0%, 
                    rgba(50, 13, 255, 0.05) 50%, 
                    rgba(50, 13, 255, 0.3) 100%)`,
                }}
              ></div>
            </div>
            {/* Tick marks */}
            <div className="absolute left-0 right-0 top-4 flex justify-between">
              {ticks.map((tick, index) => (
                <div
                  key={index}
                  className="relative"
                  style={{
                    height: tick.isMajorTick ? '14px' : '8px',
                  }}
                >
                  <div
                    className={`absolute bottom-0 w-0.5 ${tick.isMajorTick ? 'bg-gray-400 h-full' : 'bg-gray-300 h-full'}`}
                  ></div>
                </div>
              ))}
            </div>
            {/* Current weight marker */}
            <div
              className="absolute w-1 h-20 bg-gray-700 rounded-full z-10"
              style={{
                left: `${((currentWeightValue - min) / (max - min)) * 100}%`,
                top: '0px',
              }}
            ></div>
            {/* Slider thumb */}
            <div
              className="absolute w-6 h-6 bg-white border-2 border-[#320DFF] rounded-full shadow-lg z-20 flex items-center justify-center"
              style={{
                left: `${((parseInt(targetWeight.value) - min) / (max - min)) * 100}%`,
                transform: 'translateX(-50%)',
                top: '8px',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#320DFF]"></div>
            </div>
            {/* Hidden range input for interaction */}
            <input
              type="range"
              min={min}
              max={max}
              step="1"
              value={targetWeight.value}
              onChange={handleWeightChange}
              className="absolute w-full h-20 top-0 opacity-0 cursor-pointer z-30"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              {min} {targetWeight.unit}
            </span>
            <span>
              {max} {targetWeight.unit}
            </span>
          </div>
        </div>
        <div className="text-center mb-6">
          <motion.div
            className="text-5xl font-bold text-[#320DFF] mb-2"
            key={targetWeight.value}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
          >
            {targetWeight.value}{' '}
            <span className="text-2xl">{targetWeight.unit}</span>
          </motion.div>
          <p className="text-gray-600">Target Weight</p>
        </div>
      </div>
      <motion.div
        className="bg-gradient-to-r from-[#320DFF]/20 to-[#5D4DFF]/20 p-5 rounded-2xl mb-8"
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
      >
        <p className="text-center text-[#320DFF] font-medium text-lg">
          {currentGoal === 'maintain'
            ? 'You want to maintain your current weight'
            : `You want to ${goalText} ${weightDifference} ${targetWeight.unit}`}
        </p>
      </motion.div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/WeightSpeedScreen.tsx
import React, { useEffect, useState } from 'react'
import { ArrowLeftIcon, Snail, Rabbit, Zap } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface WeightSpeedScreenProps {
  onBack: () => void
  onNext: (speed: number) => void
  goal: string
  progress: number
}
export const WeightSpeedScreen: React.FC<WeightSpeedScreenProps> = ({
  onBack,
  onNext,
  goal,
  progress,
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState(1.0)
  const [isMetric, setIsMetric] = useState(false)
  useEffect(() => {
    // Check if user's system is using metric
    const isMetricSystem =
      Intl.NumberFormat().resolvedOptions().locale !== 'en-US'
    setIsMetric(isMetricSystem)
  }, [])
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    hapticFeedback.selection()
    setSelectedSpeed(value)
  }
  const handleContinue = () => {
    onNext(selectedSpeed)
  }
  const actionWord = goal === 'lose' ? 'lose' : 'gain'
  // Get description based on selected speed
  const getSpeedDescription = () => {
    if (selectedSpeed < 0.8) {
      return 'Slower pace, but easier to maintain long-term'
    } else if (selectedSpeed < 2.3) {
      return 'Balanced approach for most people'
    } else {
      return 'Faster results, but requires more discipline'
    }
  }
  // Get icon based on selected speed
  const getSpeedIcon = () => {
    if (selectedSpeed < 0.8) {
      return <Snail size={40} className="text-[#320DFF]" />
    } else if (selectedSpeed < 2.3) {
      return <Rabbit size={40} className="text-[#320DFF]" />
    } else {
      return <Zap size={40} className="text-[#320DFF]" />
    }
  }
  // Convert to kg per week for metric display
  const kgPerWeek = (selectedSpeed * 0.453592).toFixed(1)
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">
          How fast do you want to reach your goal?
        </h1>
        <p className="text-gray-600 text-lg">
          {`Select your preferred ${actionWord} weight speed`}
        </p>
      </div>
      <div className="space-y-8 mb-8">
        <div className="flex justify-center mb-4">
          <motion.div
            key={
              selectedSpeed < 0.8
                ? 'snail'
                : selectedSpeed < 2.3
                  ? 'rabbit'
                  : 'zap'
            }
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
          >
            {getSpeedIcon()}
          </motion.div>
        </div>
        <div className="text-center mb-4">
          <motion.div
            key={selectedSpeed.toString()}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
          >
            <span className="text-3xl font-bold text-[#320DFF]">
              {selectedSpeed.toFixed(1)}
            </span>
            <span className="text-xl font-medium text-gray-700"> lb/week</span>
            {isMetric && (
              <div className="text-sm text-gray-500 mt-1">
                ({kgPerWeek} kg/week)
              </div>
            )}
          </motion.div>
        </div>
        <div className="px-4">
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={selectedSpeed}
            onChange={handleSpeedChange}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #320DFF ${((selectedSpeed - 0.2) / 2.8) * 100}%, #e5e7eb ${((selectedSpeed - 0.2) / 2.8) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Gradual</span>
            <span>Moderate</span>
            <span>Ambitious</span>
          </div>
          {/* Indicators for each speed range */}
          <div className="flex justify-between mt-1">
            <div
              className={`h-1 w-3 rounded-full ${selectedSpeed < 0.8 ? 'bg-[#320DFF]' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`h-1 w-3 rounded-full ${selectedSpeed >= 0.8 && selectedSpeed < 2.3 ? 'bg-[#320DFF]' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`h-1 w-3 rounded-full ${selectedSpeed >= 2.3 ? 'bg-[#320DFF]' : 'bg-gray-300'}`}
            ></div>
          </div>
        </div>
        <motion.div
          className="bg-gradient-to-r from-[#320DFF]/20 to-[#5D4DFF]/20 p-5 rounded-2xl"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
        >
          <p className="text-center text-[#320DFF] font-medium">
            {getSpeedDescription()}
          </p>
        </motion.div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/WeightTransitionScreen.tsx
import React, { useEffect, useRef } from 'react'
import { ArrowLeftIcon, TrophyIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface WeightTransitionScreenProps {
  onBack: () => void
  onNext: () => void
  goal: string
  progress: number
}
export const WeightTransitionScreen: React.FC<WeightTransitionScreenProps> = ({
  onBack,
  onNext,
  goal,
  progress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2) // For retina displays
    // Animation variables
    let animationFrame: number
    const animDuration = 2.5 // seconds
    const startTime = performance.now()
    const draw = (currentTime: number) => {
      if (!ctx) return
      // Calculate animation progress
      const elapsed = currentTime - startTime
      const linearProgress = Math.min(1, elapsed / (animDuration * 1000))
      // Use an easing function to make the animation more fluid
      const animProgress = easeInOutQuart(linearProgress)
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      // Fill background with light blue color
      ctx.fillStyle = 'rgba(240, 245, 255, 0.5)'
      ctx.fillRect(0, 0, width, height)
      // Draw horizontal guide lines (dotted)
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      // Draw 3 horizontal guide lines
      const guideLinePositions = [height * 0.3, height * 0.5, height * 0.7]
      guideLinePositions.forEach((y) => {
        ctx.beginPath()
        ctx.moveTo(50, y)
        ctx.lineTo(width - 50, y)
        ctx.stroke()
      })
      ctx.setLineDash([]) // Reset line dash
      // Draw x-axis
      ctx.beginPath()
      ctx.moveTo(50, height - 50)
      ctx.lineTo(width - 50, height - 50)
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.stroke()
      // Define key points for the graph - following Cal AI's pattern
      // For 'gain': starts with minimal progress, then accelerates upward
      // For 'lose': starts with minimal progress, then accelerates downward
      const keyPoints = [
        {
          label: '3 Days',
          x: 50 + (width - 100) * 0.2,
          // For gain: start near bottom (higher y value), for lose: start near top (lower y value)
          yRatio: goal === 'gain' ? 0.7 : 0.3,
        },
        {
          label: '7 Days',
          x: 50 + (width - 100) * 0.45,
          // For gain: slight improvement, for lose: slight improvement
          yRatio: goal === 'gain' ? 0.65 : 0.35,
        },
        {
          label: '30 Days',
          x: width - 50,
          // For gain: significant improvement (lower y value), for lose: significant improvement (higher y value)
          yRatio: goal === 'gain' ? 0.25 : 0.75,
        },
      ]
      // Draw time labels
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      keyPoints.forEach((point) => {
        ctx.fillText(point.label, point.x, height - 30)
      })
      // Calculate points for the curve
      const startPoint = {
        x: keyPoints[0].x,
        y: height * keyPoints[0].yRatio,
      }
      const midPoint = {
        x: keyPoints[1].x,
        y: height * keyPoints[1].yRatio,
      }
      const endPoint = {
        x: keyPoints[2].x,
        y: height * keyPoints[2].yRatio,
      }
      // Create control points for a more natural curve with Cal AI pattern
      // First segment (3-7 days): flatter curve with minimal progress
      const control1 = {
        x: startPoint.x + (midPoint.x - startPoint.x) * 0.5,
        y: startPoint.y,
      }
      const control2 = {
        x: midPoint.x - (midPoint.x - startPoint.x) * 0.3,
        y: midPoint.y,
      }
      // Second segment (7-30 days): steeper curve with accelerated progress
      const control3 = {
        x: midPoint.x + (endPoint.x - midPoint.x) * 0.2,
        y: midPoint.y,
      }
      const control4 = {
        x: endPoint.x - (endPoint.x - midPoint.x) * 0.6,
        y: endPoint.y,
      }
      // Draw filled area under the curve
      ctx.beginPath()
      ctx.moveTo(startPoint.x, height - 50)
      // Calculate points along the curve for the animation
      const points = []
      const numPoints = 100
      for (let i = 0; i <= numPoints * animProgress; i++) {
        const t = i / numPoints
        let x, y
        if (t <= 0.5) {
          // First half of the curve (start to mid)
          const segmentT = t * 2
          x = bezierPoint(
            startPoint.x,
            control1.x,
            control2.x,
            midPoint.x,
            segmentT,
          )
          y = bezierPoint(
            startPoint.y,
            control1.y,
            control2.y,
            midPoint.y,
            segmentT,
          )
        } else {
          // Second half of the curve (mid to end)
          const segmentT = (t - 0.5) * 2
          x = bezierPoint(
            midPoint.x,
            control3.x,
            control4.x,
            endPoint.x,
            segmentT,
          )
          y = bezierPoint(
            midPoint.y,
            control3.y,
            control4.y,
            endPoint.y,
            segmentT,
          )
        }
        points.push({
          x,
          y,
        })
      }
      // Draw filled area
      if (points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, height - 50)
        points.forEach((point) => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.lineTo(points[points.length - 1].x, height - 50)
        ctx.closePath()
        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, 'rgba(50, 13, 255, 0.2)')
        gradient.addColorStop(1, 'rgba(240, 245, 255, 0)')
        ctx.fillStyle = gradient
        ctx.fill()
      }
      // Draw the curve
      if (points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.strokeStyle = '#320DFF'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      // Draw markers at key points
      const drawMarker = (x, y, isFilled = false) => {
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = isFilled ? '#320DFF' : '#FFFFFF'
        ctx.fill()
        ctx.strokeStyle = '#320DFF'
        ctx.lineWidth = 2
        ctx.stroke()
        if (!isFilled) {
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#320DFF'
          ctx.fill()
        }
      }
      // Draw start marker
      drawMarker(startPoint.x, startPoint.y)
      // Draw mid marker if we've reached it
      if (animProgress >= 0.5) {
        drawMarker(midPoint.x, midPoint.y)
      }
      // Draw end marker with a simple filled circle (no trophy)
      if (animProgress === 1) {
        drawMarker(endPoint.x, endPoint.y, true)
      }
      // Draw current position marker
      if (points.length > 0 && animProgress < 1) {
        const currentPoint = points[points.length - 1]
        drawMarker(currentPoint.x, currentPoint.y)
      }
      // Continue animation if not complete
      if (linearProgress < 1) {
        animationFrame = requestAnimationFrame(draw)
      }
    }
    // Bezier curve calculation helper
    function bezierPoint(p0, p1, p2, p3, t) {
      const oneMinusT = 1 - t
      return (
        Math.pow(oneMinusT, 3) * p0 +
        3 * Math.pow(oneMinusT, 2) * t * p1 +
        3 * oneMinusT * Math.pow(t, 2) * p2 +
        Math.pow(t, 3) * p3
      )
    }
    // Easing function for smoother animation
    function easeInOutQuart(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
    }
    // Start animation
    animationFrame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [goal])
  const handleContinue = () => {
    hapticFeedback.selection()
    onNext()
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Your journey to success starts now
        </h1>
        <p className="text-gray-600 text-lg">
          See your transformation timeline below
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center mb-12">
        <motion.div
          className="w-full h-60 mb-8 bg-[#f0f5ff] rounded-xl p-4 shadow-lg border border-gray-100"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className="text-lg font-medium text-gray-800 mb-2">
            Your transformation journey
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-[#320DFF]/20 to-[#5D41FF]/20 p-5 rounded-2xl w-full"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
        >
          <p className="text-center text-[#320DFF] font-medium">
            {goal === 'lose'
              ? 'The first week is about adapting, then your body accelerates into fat-burning mode!'
              : 'Initial progress may be subtle, but after the first week your muscle growth will accelerate!'}
          </p>
        </motion.div>
      </div>

      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/GoalAccomplishmentScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, Salad, Zap, Flame, Activity } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface GoalAccomplishmentScreenProps {
  onBack: () => void
  onNext: (goals: string[]) => void
  progress: number
}
export const GoalAccomplishmentScreen: React.FC<
  GoalAccomplishmentScreenProps
> = ({ onBack, onNext, progress }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const goals = [
    {
      id: 'healthier',
      label: 'Eat and live healthier',
      icon: <Salad size={24} />,
    },
    {
      id: 'energy',
      label: 'Boost energy and mood',
      icon: <Zap size={24} />,
    },
    {
      id: 'motivation',
      label: 'Stay motivated and consistent',
      icon: <Flame size={24} />,
    },
    {
      id: 'confidence',
      label: 'Feel better about my body',
      icon: <Activity size={24} />,
    },
  ]
  const handleToggleGoal = (goalId: string) => {
    hapticFeedback.selection()
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId)
      } else {
        return [...prev, goalId]
      }
    })
  }
  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onNext(selectedGoals)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          What would you like to accomplish?
        </h1>
        <p className="text-gray-600 text-lg">Select all that apply to you</p>
      </div>
      <div className="space-y-4 mb-8">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGoals.includes(goal.id) ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}
            onClick={() => handleToggleGoal(goal.id)}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div
              className={`mr-4 ${selectedGoals.includes(goal.id) ? 'text-[#320DFF]' : 'text-gray-500'}`}
            >
              {goal.icon}
            </div>
            <span className="text-lg font-medium">{goal.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          variant="primary"
          fullWidth
          disabled={selectedGoals.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/WeightProgressScreen.tsx
import React, { useEffect, useState, useRef } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
import { Berry } from '../ui/Berry'
interface WeightProgressScreenProps {
  onBack: () => void
  onNext: () => void
  goal: string
}
export const WeightProgressScreen: React.FC<WeightProgressScreenProps> = ({
  onBack,
  onNext,
  goal,
}) => {
  const handleContinue = () => {
    hapticFeedback.selection()
    onNext()
  }
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimated, setIsAnimated] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setIsAnimated(true)
    }, 500)
  }, [])
  return (
    <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-8">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Thank you for trusting us</h1>
        <p className="text-gray-600 text-lg">
          Now let's personalize NutriAI for you
        </p>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center mb-8"
        ref={containerRef}
      >
        <motion.div
          className="flex items-center justify-center"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <motion.div
            initial={{
              x: -50,
              opacity: 0,
            }}
            animate={{
              x: isAnimated ? 0 : -50,
              opacity: isAnimated ? 1 : 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <Berry variant="trophy" size="large" />
          </motion.div>
          <motion.div
            initial={{
              x: 50,
              opacity: 0,
            }}
            animate={{
              x: isAnimated ? 0 : 50,
              opacity: isAnimated ? 1 : 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
          >
            <Berry variant="celebrate" size="large" />
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-8 bg-[#320DFF]/10 p-4 rounded-2xl w-full"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: isAnimated ? 1 : 0,
            y: isAnimated ? 0 : 20,
          }}
          transition={{
            duration: 0.5,
            delay: 0.5,
          }}
        >
          <p className="text-center text-[#320DFF] font-medium">
            {goal === 'lose'
              ? "We'll help you lose weight while maintaining your energy and health"
              : goal === 'gain'
                ? "We'll help you gain weight and build muscle effectively"
                : "We'll help you maintain your weight and optimize your nutrition"}
          </p>
        </motion.div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>
  )
}

```
```components/onboarding/ReferralCodeScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface ReferralCodeScreenProps {
  onBack: () => void
  onNext: (code: string, isValid: boolean) => void
  progress: number
}
export const ReferralCodeScreen: React.FC<ReferralCodeScreenProps> = ({
  onBack,
  onNext,
  progress,
}) => {
  const [referralCode, setReferralCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<
    'valid' | 'invalid' | null
  >(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(e.target.value.toUpperCase())
    // Reset validation when input changes
    if (validationResult) {
      setValidationResult(null)
    }
  }
  const validateCode = () => {
    if (!referralCode) {
      handleSkip()
      return
    }
    setIsValidating(true)
    // Simulate API call to validate code
    setTimeout(() => {
      // For demo purposes, consider codes starting with "NUTRIAI" as valid
      const isValid = referralCode.startsWith('NUTRIAI')
      setValidationResult(isValid ? 'valid' : 'invalid')
      setIsValidating(false)
      if (isValid) {
        hapticFeedback.success()
        // Wait a moment to show success state before proceeding
        setTimeout(() => {
          onNext(referralCode, true)
        }, 1000)
      } else {
        hapticFeedback.error()
      }
    }, 1500)
  }
  const handleSkip = () => {
    hapticFeedback.selection()
    onNext('', false)
  }
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div
          className="h-full bg-[#320DFF] rounded-full"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Have a referral code?</h1>
        <p className="text-gray-600 text-lg">
          Enter it to unlock special benefits
        </p>
      </div>
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Referral Code (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={referralCode}
              onChange={handleChange}
              placeholder="Enter code"
              className={`w-full h-16 px-4 bg-gray-100 rounded-2xl text-xl font-medium text-center focus:outline-none focus:ring-2 ${validationResult === 'valid' ? 'focus:ring-green-500 border-green-500' : validationResult === 'invalid' ? 'focus:ring-red-500 border-red-500' : 'focus:ring-[#320DFF]'}`}
              maxLength={10}
            />
            <AnimatePresence>
              {validationResult === 'valid' && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <CheckCircle size={24} className="text-green-500" />
                </motion.div>
              )}
              {validationResult === 'invalid' && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <XCircle size={24} className="text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {validationResult === 'valid' && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="mt-2 text-sm text-green-600"
              >
                Valid code! You'll receive special benefits.
              </motion.p>
            )}
            {validationResult === 'invalid' && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="mt-2 text-sm text-red-600"
              >
                Invalid code. Please check and try again.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-auto space-y-4">
        <Button
          onClick={validateCode}
          variant="primary"
          fullWidth
          disabled={isValidating}
          loading={isValidating}
        >
          {referralCode ? 'Apply Code' : 'Continue'}
        </Button>
        {referralCode && validationResult !== 'valid' && (
          <Button
            onClick={handleSkip}
            variant="secondary"
            fullWidth
            disabled={isValidating}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  )
}

```
```components/WelcomeScreen.tsx
import React from 'react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
import { Berry } from '../ui/Berry'
interface WelcomeScreenProps {
  onGetStarted: () => void
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
}) => {
  const handleGetStarted = () => {
    hapticFeedback.impact()
    onGetStarted()
  }
  const handleLogin = () => {
    hapticFeedback.selection()
    // Navigate to login screen
    onGetStarted() // For now, just go to onboarding
  }
  return (
    <div className="flex flex-col h-full min-h-screen bg-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="mb-8"
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            duration: 0.8,
          }}
        >
          <Berry variant="wave" size="large" />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold mb-4 text-center text-gray-900"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
        >
          Nutrition Tracking Made Easy
        </motion.h1>
        <motion.p
          className="text-center text-gray-600 text-lg mb-10 max-w-xs"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
            duration: 0.5,
          }}
        >
          The smartest way to track your nutrition with AI-powered food
          recognition
        </motion.p>
        <motion.div
          className="w-full max-w-xs space-y-5 mb-10"
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
            duration: 0.5,
          }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">AI-powered food recognition</p>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">
              Effortless nutrition tracking
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">Personalized insights</p>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="mb-8 w-full"
        initial={{
          y: 20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.6,
          duration: 0.5,
        }}
      >
        <Button onClick={handleGetStarted} variant="primary" fullWidth>
          Get Started
        </Button>
        <motion.button
          className="w-full text-center mt-5 text-gray-600 py-2"
          onClick={handleLogin}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          I already have an account
        </motion.button>
      </motion.div>
    </div>
  )
}

```
```components/onboarding/NutritionPlanLoadingScreen.tsx
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
import { Dumbbell, Salad, Calculator, Zap, Brain } from 'lucide-react'
interface NutritionPlanLoadingScreenProps {
  onComplete: () => void
  userData: any
}
export const NutritionPlanLoadingScreen: React.FC<
  NutritionPlanLoadingScreenProps
> = ({ onComplete, userData }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const loadingSteps = [
    {
      text: 'Analyzing your profile data...',
      icon: <Calculator size={24} className="text-[#320DFF]" />,
    },
    {
      text: 'Calculating optimal macronutrient ratios...',
      icon: <Brain size={24} className="text-[#320DFF]" />,
    },
    {
      text: 'Personalizing your nutrition plan...',
      icon: <Salad size={24} className="text-[#320DFF]" />,
    },
    {
      text: 'Optimizing for your activity level...',
      icon: <Dumbbell size={24} className="text-[#320DFF]" />,
    },
    {
      text: 'Finalizing your personalized plan...',
      icon: <Zap size={24} className="text-[#320DFF]" />,
    },
  ]
  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1
        // Update current step based on progress
        if (newProgress % 20 === 0 && currentStep < loadingSteps.length - 1) {
          setCurrentStep((prev) => prev + 1)
          hapticFeedback.selection()
        }
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            hapticFeedback.success()
            onComplete()
          }, 500)
        }
        return newProgress > 100 ? 100 : newProgress
      })
    }, 50)
    return () => clearInterval(interval)
  }, [currentStep, onComplete])
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold mb-3">Creating Your Plan</h1>
          <p className="text-gray-600 text-lg">
            We're calculating your personalized nutrition plan
          </p>
        </motion.div>
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-[#320DFF] rounded-full"
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.2,
              }}
            />
          </div>
          <div className="text-right text-sm text-gray-500">{progress}%</div>
        </div>
        <div className="space-y-4 mb-8">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
              }}
              className={`flex items-center p-4 rounded-xl ${index === currentStep ? 'bg-[#320DFF]/5 border border-[#320DFF]/20' : ''}`}
            >
              <div className="mr-4">{step.icon}</div>
              <span
                className={`${index === currentStep ? 'text-[#320DFF] font-medium' : ''}`}
              >
                {step.text}
              </span>
              {index < currentStep && (
                <motion.div
                  className="ml-auto text-green-500"
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: 'spring',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7 10.5L9 12.5L13 8.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: progress > 75 ? 1 : 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-center text-gray-600"
        >
          Almost there! Your personalized nutrition plan is ready.
        </motion.div>
      </div>
    </div>
  )
}

```
```components/onboarding/SubscriptionScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, Check, X, Zap } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { hapticFeedback } from '../../utils/haptics'
interface SubscriptionScreenProps {
  onBack: () => void
  onComplete: () => void
  hasReferralCode: boolean
}
export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onComplete,
  hasReferralCode,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    'yearly',
  )
  const plans = {
    monthly: {
      price: 9.99,
      period: 'month',
      discount: null,
      trialDays: 7,
    },
    yearly: {
      price: 59.99,
      period: 'year',
      discount: '50%',
      trialDays: 14,
    },
  }
  // Apply referral code discount if applicable
  if (hasReferralCode) {
    plans.monthly.trialDays = 14
    plans.yearly.trialDays = 30
  }
  const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
    hapticFeedback.selection()
    setSelectedPlan(plan)
  }
  const handleContinue = () => {
    hapticFeedback.success()
    onComplete()
  }
  const handleSkip = () => {
    hapticFeedback.selection()
    onComplete()
  }
  const features = [
    'Unlimited AI food recognition',
    'Personalized nutrition coaching',
    'Advanced analytics and insights',
    'Custom meal recommendations',
    'Progress tracking and reports',
    'Priority support',
  ]
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-8">
        <motion.button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onBack}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Upgrade to Premium</h1>
        <p className="text-gray-600 text-lg">
          Get the most out of your nutrition journey
        </p>
      </div>
      <div className="flex justify-center mb-8">
        <motion.div
          className="flex items-center bg-gray-100 p-1 rounded-full"
          whileTap={{
            scale: 0.98,
          }}
        >
          <motion.button
            className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPlan === 'monthly' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`}
            onClick={() => handlePlanSelect('monthly')}
            whileTap={{
              scale: 0.95,
            }}
          >
            Monthly
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPlan === 'yearly' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`}
            onClick={() => handlePlanSelect('yearly')}
            whileTap={{
              scale: 0.95,
            }}
          >
            Yearly
          </motion.button>
        </motion.div>
      </div>
      <div className="mb-8">
        <motion.div
          className="bg-[#320DFF]/5 border-2 border-[#320DFF] rounded-2xl p-6 relative overflow-hidden"
          initial={{
            scale: 0.95,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {selectedPlan === 'yearly' && plans.yearly.discount && (
            <div className="absolute top-0 right-0">
              <div className="bg-[#320DFF] text-white px-4 py-1 rounded-bl-lg text-sm font-bold">
                SAVE {plans.yearly.discount}
              </div>
            </div>
          )}
          <div className="flex items-center mb-4">
            <Zap size={24} className="text-[#320DFF] mr-2" />
            <h3 className="text-xl font-bold">
              Premium {selectedPlan === 'yearly' ? 'Annual' : 'Monthly'}
            </h3>
          </div>
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                ${plans[selectedPlan].price}
              </span>
              <span className="text-gray-600 ml-1">
                /{plans[selectedPlan].period}
              </span>
            </div>
            {hasReferralCode && (
              <div className="mt-1 text-sm text-green-600 font-medium">
                Referral discount applied!
              </div>
            )}
          </div>
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-3 mt-0.5 text-[#320DFF]">
                  <Check size={16} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="bg-[#320DFF]/10 p-3 rounded-xl text-center mb-6">
            <p className="text-[#320DFF] font-medium">
              {plans[selectedPlan].trialDays}-day free trial, cancel anytime
            </p>
          </div>
          <Button onClick={handleContinue} variant="primary" fullWidth>
            Start Free Trial
          </Button>
        </motion.div>
      </div>
      <div className="mt-auto text-center">
        <motion.button
          className="text-gray-500 font-medium"
          onClick={handleSkip}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          Continue with limited version
        </motion.button>
        <p className="text-xs text-gray-400 mt-2">
          You can upgrade anytime from the app settings
        </p>
      </div>
    </div>
  )
}

```
```components/food-input/RefineWithAIScreen.tsx
import React, { useState } from 'react'
import { ArrowLeftIcon, SendIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface RefineWithAIScreenProps {
  onBack: () => void
  onSubmit: (data: any) => void
  currentResults: any
}
export const RefineWithAIScreen: React.FC<RefineWithAIScreenProps> = ({
  onBack,
  onSubmit,
  currentResults,
}) => {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    'Add a side of chips',
    'The bread was whole wheat',
    'There was mayo on the sandwich',
    'The portion was smaller',
    'There was cheese on the sandwich',
  ])
  const handleSubmit = () => {
    if (!inputText.trim()) return
    hapticFeedback.impact()
    setIsLoading(true)
    // Simulate API processing
    setTimeout(() => {
      setIsLoading(false)
      onSubmit({
        ...currentResults,
        refinedWith: inputText,
      })
    }, 1500)
  }
  const handleSuggestionClick = (suggestion: string) => {
    hapticFeedback.selection()
    setInputText(suggestion)
  }
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
            onClick={() => {
              hapticFeedback.selection()
              onBack()
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={20} className="text-gray-700" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold">Refine with AI</h1>
            <p className="text-sm text-gray-500">
              Add details to improve accuracy
            </p>
          </div>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="bg-[#320DFF]/5 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <SparklesIcon
                size={20}
                className="text-[#320DFF] mr-3 mt-1 flex-shrink-0"
              />
              <p className="text-sm text-gray-700">
                Tell our AI about any details we missed or corrections needed.
                This helps us improve the accuracy of your meal analysis.
              </p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-3">Quick Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  className="bg-gray-100 py-2 px-3 rounded-full text-sm text-gray-700"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: 'rgba(50, 13, 255, 0.1)',
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="refinement-input"
              className="font-medium mb-2 block"
            >
              Your Refinement
            </label>
            <div className="relative">
              <textarea
                id="refinement-input"
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50"
                placeholder="Example: The sandwich had mayo and cheese, and the bread was whole wheat..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Current analysis:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Turkey Sandwich with Chips</p>
              <p className="text-xs text-gray-500">
                {currentResults?.totalCalories || 542} calories •{' '}
                {currentResults?.totalProtein || 28}g protein •{' '}
                {currentResults?.totalCarbs || 62}g carbs •{' '}
                {currentResults?.totalFat || 22}g fat
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <Button
              onClick={handleSubmit}
              variant="primary"
              fullWidth
              disabled={!inputText.trim() || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Submit Refinement'}
              {!isLoading && <SendIcon size={16} className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/EditMealScreen.tsx
import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  CameraIcon,
  MicIcon,
  BarcodeIcon,
  KeyboardIcon,
  SparklesIcon,
  CheckIcon,
  XIcon,
  HeartIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface FoodItem {
  id: string
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
  parent?: string
  isEditing?: boolean
}
interface FoodGroup {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  items: FoodItem[]
  isEditing?: boolean
}
interface EditMealScreenProps {
  meal: any
  onBack: () => void
  onSave: (meal: any) => void
  onAddMore: (method: string) => void
  onRefineWithAI: () => void
}
export const EditMealScreen: React.FC<EditMealScreenProps> = ({
  meal,
  onBack,
  onSave,
  onAddMore,
  onRefineWithAI,
}) => {
  const [selectedMealType, setSelectedMealType] = useState(meal?.type || 'Meal')
  const [isLoading, setIsLoading] = useState(false)
  const [favoriteItems, setFavoriteItems] = useState<string[]>([])
  // Mock food groups for the detailed breakdown
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([
    {
      id: 'sandwich',
      name: 'Turkey Sandwich',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      items: [
        {
          id: 'bread',
          name: 'Whole Wheat Bread',
          quantity: '2 slices',
          calories: 140,
          protein: 6,
          carbs: 24,
          fat: 2,
          parent: 'sandwich',
        },
        {
          id: 'turkey',
          name: 'Turkey Breast',
          quantity: '3 oz',
          calories: 90,
          protein: 19,
          carbs: 0,
          fat: 1,
          parent: 'sandwich',
        },
        {
          id: 'lettuce',
          name: 'Lettuce',
          quantity: '0.5 cup',
          calories: 4,
          protein: 0.5,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
        },
        {
          id: 'tomato',
          name: 'Tomato',
          quantity: '2 slices',
          calories: 5,
          protein: 0.3,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
        },
      ],
    },
    {
      id: 'chips',
      name: 'Potato Chips',
      calories: 150,
      protein: 2,
      carbs: 15,
      fat: 10,
      items: [],
    },
    {
      id: 'pickle',
      name: 'Dill Pickle',
      calories: 12,
      protein: 0.5,
      carbs: 2,
      fat: 0.1,
      items: [],
    },
  ])
  const handleEditItem = (groupId: string, itemId?: string) => {
    hapticFeedback.selection()
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          if (!itemId) {
            // Editing the whole group
            return {
              ...group,
              isEditing: !group.isEditing,
            }
          } else {
            // Editing a specific item
            return {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isEditing: !item.isEditing,
                    }
                  : item,
              ),
            }
          }
        }
        return group
      }),
    )
  }
  const handleUpdateItem = (
    groupId: string,
    itemId: string | undefined,
    field: 'calories' | 'protein' | 'carbs' | 'fat' | 'quantity' | 'name',
    value: string | number,
  ) => {
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          if (!itemId) {
            // Update group
            return {
              ...group,
              [field]:
                field === 'name' || field === 'quantity'
                  ? value
                  : Number(value),
            }
          } else {
            // Update specific item
            return {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      [field]:
                        field === 'name' || field === 'quantity'
                          ? value
                          : Number(value),
                    }
                  : item,
              ),
            }
          }
        }
        return group
      }),
    )
  }
  const handleSaveEdit = (groupId: string, itemId?: string) => {
    hapticFeedback.success()
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          if (!itemId) {
            // Save group edit
            return {
              ...group,
              isEditing: false,
            }
          } else {
            // Save specific item edit
            return {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isEditing: false,
                    }
                  : item,
              ),
            }
          }
        }
        return group
      }),
    )
    // Recalculate group totals if an item was edited
    if (itemId) {
      recalculateGroupTotals(groupId)
    }
  }
  const recalculateGroupTotals = (groupId: string) => {
    setFoodGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId && group.items.length > 0) {
          const totals = group.items.reduce(
            (acc, item) => ({
              calories: acc.calories + item.calories,
              protein: acc.protein + item.protein,
              carbs: acc.carbs + item.carbs,
              fat: acc.fat + item.fat,
            }),
            {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            },
          )
          return {
            ...group,
            ...totals,
          }
        }
        return group
      }),
    )
  }
  const handleDeleteItem = (groupId: string, itemId?: string) => {
    hapticFeedback.impact()
    if (!itemId) {
      // Delete entire group
      setFoodGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupId),
      )
      return
    }
    // Delete specific item from group
    setFoodGroups(
      (prevGroups) =>
        prevGroups
          .map((group) => {
            if (group.id === groupId) {
              const updatedItems = group.items.filter(
                (item) => item.id !== itemId,
              )
              // If all items are deleted, remove the group
              if (group.items.length > 0 && updatedItems.length === 0) {
                return null
              }
              // Recalculate group totals
              const itemCalories =
                group.items.find((item) => item.id === itemId)?.calories || 0
              const itemProtein =
                group.items.find((item) => item.id === itemId)?.protein || 0
              const itemCarbs =
                group.items.find((item) => item.id === itemId)?.carbs || 0
              const itemFat =
                group.items.find((item) => item.id === itemId)?.fat || 0
              return {
                ...group,
                items: updatedItems,
                calories: group.calories - itemCalories,
                protein: group.protein - itemProtein,
                carbs: group.carbs - itemCarbs,
                fat: group.fat - itemFat,
              }
            }
            return group
          })
          .filter(Boolean) as FoodGroup[],
    )
  }
  const handleToggleFavorite = (itemId: string, groupId?: string) => {
    hapticFeedback.impact()
    if (favoriteItems.includes(itemId)) {
      // Remove from favorites
      setFavoriteItems(favoriteItems.filter((id) => id !== itemId))
    } else {
      // Add to favorites
      setFavoriteItems([...favoriteItems, itemId])
    }
  }
  const calculateTotalCalories = () => {
    return foodGroups.reduce((total, group) => total + group.calories, 0)
  }
  const handleSave = () => {
    hapticFeedback.success()
    setIsLoading(true)
    // Simulate saving
    setTimeout(() => {
      setIsLoading(false)
      onSave({
        ...meal,
        type: selectedMealType,
        time: meal?.time,
        calories: calculateTotalCalories(),
        foodGroups,
      })
    }, 800)
  }
  // Handler functions for adding more food
  const handleAddMoreCamera = () => {
    hapticFeedback.selection()
    onAddMore('camera')
  }
  const handleAddMoreVoice = () => {
    hapticFeedback.selection()
    onAddMore('voice')
  }
  const handleAddMoreBarcode = () => {
    hapticFeedback.selection()
    onAddMore('barcode')
  }
  const handleAddMoreText = () => {
    hapticFeedback.selection()
    onAddMore('text')
  }
  const handleRefineWithAI = () => {
    hapticFeedback.selection()
    onRefineWithAI()
  }
  // Meal type options
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                onBack()
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon size={20} className="text-gray-700" />
            </motion.button>
            <h1 className="text-xl font-bold">Edit Meal</h1>
          </div>
        </div>
        <div className="px-4 py-2 flex-1">
          {/* Meal Type Selector */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-medium mb-3">Meal Type</h3>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type}
                  className={`py-2 rounded-lg text-center text-sm ${selectedMealType === type ? 'bg-[#320DFF] text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSelectedMealType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/* Food items */}
          <h2 className="font-medium mb-3">Food Items</h2>
          <div className="space-y-3 mb-6">
            {foodGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                {group.isEditing ? (
                  // Group editing mode
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-200 rounded-lg"
                        value={group.name}
                        onChange={(e) =>
                          handleUpdateItem(
                            group.id,
                            undefined,
                            'name',
                            e.target.value,
                          )
                        }
                      />
                      <div className="flex ml-2">
                        <motion.button
                          className="p-1 rounded-full bg-green-100 text-green-600 mr-1"
                          onClick={() => handleSaveEdit(group.id)}
                          whileTap={{
                            scale: 0.9,
                          }}
                        >
                          <CheckIcon size={18} />
                        </motion.button>
                        <motion.button
                          className="p-1 rounded-full bg-red-100 text-red-600"
                          onClick={() => handleEditItem(group.id)}
                          whileTap={{
                            scale: 0.9,
                          }}
                        >
                          <XIcon size={18} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Calories
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          value={group.calories}
                          onChange={(e) =>
                            handleUpdateItem(
                              group.id,
                              undefined,
                              'calories',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          value={group.protein}
                          onChange={(e) =>
                            handleUpdateItem(
                              group.id,
                              undefined,
                              'protein',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          value={group.carbs}
                          onChange={(e) =>
                            handleUpdateItem(
                              group.id,
                              undefined,
                              'carbs',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          value={group.fat}
                          onChange={(e) =>
                            handleUpdateItem(
                              group.id,
                              undefined,
                              'fat',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Group normal view
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{group.name}</h3>
                      <div className="flex items-center">
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-[#320DFF]"
                            onClick={() => handleEditItem(group.id)}
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            className="p-1 text-red-500"
                            onClick={() => handleDeleteItem(group.id)}
                          >
                            <Trash2Icon size={16} />
                          </button>
                          <button
                            className="p-1"
                            onClick={() => handleToggleFavorite(group.id)}
                          >
                            <HeartIcon
                              size={16}
                              className={
                                favoriteItems.includes(group.id)
                                  ? 'text-red-500 fill-red-500'
                                  : 'text-gray-300'
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-sm">
                        <p className="font-medium">{group.calories} cal</p>
                      </div>
                      <div className="flex space-x-3 text-xs text-gray-500">
                        <span>Protein: {group.protein}g</span>
                        <span>Carbs: {group.carbs}g</span>
                        <span>Fat: {group.fat}g</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Ingredients */}
                {group.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Ingredients:</p>
                    <div className="space-y-2">
                      {group.items.map((item) =>
                        item.isEditing ? (
                          // Item editing mode
                          <div
                            key={item.id}
                            className="p-3 bg-white border border-[#320DFF]/30 rounded-lg space-y-2"
                          >
                            <div className="flex justify-between">
                              <input
                                type="text"
                                className="flex-1 p-2 border border-gray-200 rounded-lg"
                                value={item.name}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    group.id,
                                    item.id,
                                    'name',
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="flex ml-2">
                                <motion.button
                                  className="p-1 rounded-full bg-green-100 text-green-600 mr-1"
                                  onClick={() =>
                                    handleSaveEdit(group.id, item.id)
                                  }
                                  whileTap={{
                                    scale: 0.9,
                                  }}
                                >
                                  <CheckIcon size={18} />
                                </motion.button>
                                <motion.button
                                  className="p-1 rounded-full bg-red-100 text-red-600"
                                  onClick={() =>
                                    handleEditItem(group.id, item.id)
                                  }
                                  whileTap={{
                                    scale: 0.9,
                                  }}
                                >
                                  <XIcon size={18} />
                                </motion.button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                Quantity
                              </label>
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    group.id,
                                    item.id,
                                    'quantity',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Calories
                                </label>
                                <input
                                  type="number"
                                  className="w-full p-2 border border-gray-200 rounded-lg"
                                  value={item.calories}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      group.id,
                                      item.id,
                                      'calories',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Protein
                                </label>
                                <input
                                  type="number"
                                  className="w-full p-2 border border-gray-200 rounded-lg"
                                  value={item.protein}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      group.id,
                                      item.id,
                                      'protein',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Carbs
                                </label>
                                <input
                                  type="number"
                                  className="w-full p-2 border border-gray-200 rounded-lg"
                                  value={item.carbs}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      group.id,
                                      item.id,
                                      'carbs',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Fat
                                </label>
                                <input
                                  type="number"
                                  className="w-full p-2 border border-gray-200 rounded-lg"
                                  value={item.fat}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      group.id,
                                      item.id,
                                      'fat',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Item normal view
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <div className="text-right mr-3">
                                <p className="text-sm font-medium">
                                  {item.calories} cal
                                </p>
                                <div className="flex space-x-2 text-xs text-gray-500">
                                  <span>Protein: {item.protein}g</span>
                                  <span>Carbs: {item.carbs}g</span>
                                  <span>Fat: {item.fat}g</span>
                                </div>
                              </div>
                              <div className="flex">
                                <button
                                  className="p-1 text-[#320DFF]"
                                  onClick={() =>
                                    handleEditItem(group.id, item.id)
                                  }
                                >
                                  <PencilIcon size={14} />
                                </button>
                                <button
                                  className="p-1 text-red-500"
                                  onClick={() =>
                                    handleDeleteItem(group.id, item.id)
                                  }
                                >
                                  <Trash2Icon size={14} />
                                </button>
                                <button
                                  className="p-1"
                                  onClick={() =>
                                    handleToggleFavorite(item.id, group.id)
                                  }
                                >
                                  <HeartIcon
                                    size={14}
                                    className={
                                      favoriteItems.includes(item.id)
                                        ? 'text-red-500 fill-red-500'
                                        : 'text-gray-300'
                                    }
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Add more options */}
          <h2 className="font-medium mb-3">Add More Food</h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <motion.button
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(50, 13, 255, 0.05)',
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleAddMoreCamera}
            >
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <CameraIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Camera</span>
            </motion.button>
            <motion.button
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(50, 13, 255, 0.05)',
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleAddMoreVoice}
            >
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <MicIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Voice</span>
            </motion.button>
            <motion.button
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(50, 13, 255, 0.05)',
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleAddMoreBarcode}
            >
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <BarcodeIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Barcode</span>
            </motion.button>
            <motion.button
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(50, 13, 255, 0.05)',
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleAddMoreText}
            >
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <KeyboardIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Text</span>
            </motion.button>
          </div>
          <div className="mb-6">
            <Button variant="secondary" fullWidth onClick={handleRefineWithAI}>
              <SparklesIcon size={18} className="mr-1" />
              Refine with AI
            </Button>
          </div>
          <div className="mb-4">
            <Button
              variant="primary"
              fullWidth
              onClick={handleSave}
              loading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/FavoritesScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  ArrowLeftIcon,
  SearchIcon,
  PlusIcon,
  HeartIcon,
  FilterIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
  CheckCircleIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface FavoriteItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  type: 'meal' | 'food' | 'recipe' | 'ingredient'
  quantity?: string
  frequency: number
  isFavorite?: boolean
}
interface FavoritesScreenProps {
  onBack: () => void
  onSelectFavorite: (item: FavoriteItem) => void
}
export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onBack,
  onSelectFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'meals' | 'foods' | 'ingredients'
  >('all')
  const [showAddWithAI, setShowAddWithAI] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
  }>({
    show: false,
    message: '',
  })
  // Sample favorites data
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: '1',
      name: 'Turkey Sandwich',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      type: 'meal',
      frequency: 12,
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Protein Shake',
      calories: 220,
      protein: 30,
      carbs: 15,
      fat: 3,
      type: 'food',
      frequency: 8,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Greek Salad',
      calories: 320,
      protein: 12,
      carbs: 20,
      fat: 24,
      type: 'food',
      frequency: 5,
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Chicken & Rice Bowl',
      calories: 450,
      protein: 35,
      carbs: 55,
      fat: 10,
      type: 'meal',
      frequency: 7,
      isFavorite: true,
    },
    {
      id: '5',
      name: 'Avocado Toast',
      calories: 280,
      protein: 8,
      carbs: 30,
      fat: 16,
      type: 'food',
      frequency: 10,
      isFavorite: true,
    },
    {
      id: '6',
      name: 'Turkey Breast',
      calories: 90,
      protein: 19,
      carbs: 0,
      fat: 1,
      quantity: '3 oz',
      type: 'ingredient',
      frequency: 15,
      isFavorite: true,
    },
    {
      id: '7',
      name: 'Whole Wheat Bread',
      calories: 70,
      protein: 3,
      carbs: 12,
      fat: 1,
      quantity: '1 slice',
      type: 'ingredient',
      frequency: 14,
      isFavorite: true,
    },
    {
      id: '8',
      name: 'Lettuce',
      calories: 4,
      protein: 0.5,
      carbs: 1,
      fat: 0,
      quantity: '0.5 cup',
      type: 'ingredient',
      frequency: 9,
      isFavorite: true,
    },
  ])
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: '',
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])
  const handleFilterChange = (
    filter: 'all' | 'meals' | 'foods' | 'ingredients',
  ) => {
    hapticFeedback.selection()
    setActiveFilter(filter)
  }
  const handleSelectFavorite = (item: FavoriteItem) => {
    hapticFeedback.selection()
    if (isMultiSelectMode) {
      toggleItemSelection(item.id)
    } else {
      // Set isFavorite to true when selecting an item from favorites
      onSelectFavorite({
        ...item,
        isFavorite: true,
      })
    }
  }
  const toggleItemSelection = (id: string) => {
    hapticFeedback.selection()
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
      if (!isMultiSelectMode) {
        setIsMultiSelectMode(true)
      }
    }
  }
  const handleToggleMultiSelectMode = () => {
    hapticFeedback.selection()
    setIsMultiSelectMode(!isMultiSelectMode)
    if (isMultiSelectMode) {
      setSelectedItems([])
    }
  }
  const handleAddSelectedItems = () => {
    hapticFeedback.success()
    // Here you would handle adding all selected items
    // For now, we'll just log them and clear selection
    console.log('Adding items:', selectedItems)
    setNotification({
      show: true,
      message: `${selectedItems.length} items added to meal`,
    })
    setSelectedItems([])
    setIsMultiSelectMode(false)
  }
  const handleAddWithAI = () => {
    if (!aiInput.trim()) return
    hapticFeedback.selection()
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      // Add a new item based on AI input
      const newItem: FavoriteItem = {
        id: Date.now().toString(),
        name: aiInput,
        calories: Math.floor(Math.random() * 300) + 100,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 30) + 10,
        fat: Math.floor(Math.random() * 15) + 2,
        type: 'food',
        frequency: 1,
        isFavorite: true,
      }
      setFavorites([newItem, ...favorites])
      setAiInput('')
      setIsProcessing(false)
      setShowAddWithAI(false)
      setNotification({
        show: true,
        message: `${newItem.name} added to favorites`,
      })
      hapticFeedback.success()
    }, 1500)
  }
  const handleSwipe = (id: string) => {
    if (swipedItemId === id) {
      setSwipedItemId(null)
    } else {
      hapticFeedback.selection()
      setSwipedItemId(id)
    }
  }
  const handleDeleteFavorite = (id: string) => {
    hapticFeedback.impact()
    const itemToDelete = favorites.find((item) => item.id === id)
    setFavorites(favorites.filter((item) => item.id !== id))
    setSwipedItemId(null)
    if (itemToDelete) {
      setNotification({
        show: true,
        message: `${itemToDelete.name} removed from favorites`,
      })
    }
  }
  const filteredFavorites = favorites
    .filter((item) => {
      // Apply search filter
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
    .filter((item) => {
      // Apply type filter
      if (activeFilter === 'all') return true
      if (activeFilter === 'meals') return item.type === 'meal'
      if (activeFilter === 'foods') return item.type === 'food'
      if (activeFilter === 'ingredients') return item.type === 'ingredient'
      return true
    })
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        {/* Header - Fixed height */}
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
              onClick={() => {
                hapticFeedback.selection()
                if (isMultiSelectMode) {
                  setIsMultiSelectMode(false)
                  setSelectedItems([])
                } else {
                  onBack()
                }
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ArrowLeftIcon
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Favorites
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your saved meals and foods
              </p>
            </div>
          </div>
          {isMultiSelectMode ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleToggleMultiSelectMode}
            >
              Done
            </Button>
          ) : (
            <div className="flex space-x-2">
              <motion.button
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                onClick={handleToggleMultiSelectMode}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                <CheckIcon
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
              </motion.button>
              <motion.button
                className="w-10 h-10 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center"
                onClick={() => {
                  hapticFeedback.selection()
                  setShowAddWithAI(!showAddWithAI)
                }}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                <PlusIcon size={20} className="text-white" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Add with AI section */}
        <AnimatePresence>
          {showAddWithAI && (
            <motion.div
              className="mx-4 bg-white dark:bg-gray-800 border border-[#320DFF]/20 dark:border-[#6D56FF]/20 rounded-xl p-4 mb-4 shadow-sm"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
            >
              <div className="flex items-center mb-2">
                <SparklesIcon
                  size={16}
                  className="text-[#320DFF] dark:text-[#6D56FF] mr-2"
                />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Add with AI
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Describe the food you want to add to your favorites
              </p>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50"
                  placeholder="E.g., Grilled chicken breast with rice"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <Button
                  variant="primary"
                  className="ml-2"
                  onClick={handleAddWithAI}
                  loading={isProcessing}
                  disabled={isProcessing || !aiInput.trim()}
                >
                  Add
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="px-4">
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                hapticFeedback.selection()
              }}
            />
          </div>
          {/* Filters */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'all' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFilterChange('all')}
            >
              All Favorites
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'meals' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFilterChange('meals')}
            >
              Meals
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'foods' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFilterChange('foods')}
            >
              Foods
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'ingredients' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFilterChange('ingredients')}
            >
              Ingredients
            </button>
          </div>
        </div>

        {/* Quick Add section */}
        {filteredFavorites.length > 0 && !isMultiSelectMode && (
          <div className="px-4 mb-4">
            <h2 className="font-medium text-gray-900 dark:text-white mb-2">
              Quick Add
            </h2>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {filteredFavorites.slice(0, 5).map((item) => (
                <motion.button
                  key={item.id}
                  className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg min-w-[80px]"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: 'rgba(50, 13, 255, 0.05)',
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => {
                    handleSelectFavorite(item)
                    hapticFeedback.selection()
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/10 flex items-center justify-center mb-1">
                    <span className="text-[#320DFF] dark:text-[#6D56FF] font-bold">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-center line-clamp-1 text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.calories} cal
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites list */}
        <div className="px-4 pb-24">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <HeartIcon
                      size={24}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No favorites found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                    {searchQuery
                      ? 'No results match your search'
                      : 'Save your favorite meals and foods for quick access'}
                  </p>
                  {!showAddWithAI && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setShowAddWithAI(true)
                        hapticFeedback.selection()
                      }}
                    >
                      <PlusIcon size={16} className="mr-1" />
                      Add with AI
                    </Button>
                  )}
                </div>
              ) : (
                filteredFavorites.map((item) => (
                  <div key={item.id} className="relative overflow-hidden">
                    {/* Swipe delete action - Enhanced with better visual */}
                    <motion.div
                      className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center px-6 rounded-r-xl"
                      initial={{
                        x: '100%',
                      }}
                      animate={{
                        x: swipedItemId === item.id ? '0%' : '100%',
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <button
                        className="text-white"
                        onClick={() => handleDeleteFavorite(item.id)}
                      >
                        <Trash2Icon size={24} />
                      </button>
                    </motion.div>
                    <motion.div
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm relative z-10"
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      drag={!isMultiSelectMode ? 'x' : false}
                      dragConstraints={{
                        left: -100,
                        right: 0,
                      }}
                      dragElastic={0.1}
                      onDragEnd={(e, info) => {
                        if (!isMultiSelectMode && info.offset.x < -50) {
                          handleSwipe(item.id)
                          hapticFeedback.impact()
                        }
                      }}
                      style={{
                        x: swipedItemId === item.id ? -100 : 0,
                        borderColor: selectedItems.includes(item.id)
                          ? '#320DFF'
                          : undefined,
                        borderWidth: selectedItems.includes(item.id)
                          ? '2px'
                          : '1px',
                      }}
                    >
                      <div className="flex">
                        <div
                          className="mr-3 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleItemSelection(item.id)
                          }}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedItems.includes(item.id) ? 'bg-[#320DFF] dark:bg-[#6D56FF] border-[#320DFF] dark:border-[#6D56FF]' : 'border-gray-300 dark:border-gray-600'}`}
                          >
                            {selectedItems.includes(item.id) && (
                              <CheckIcon size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        <div
                          className="flex-grow"
                          onClick={(e) => {
                            if (isMultiSelectMode) {
                              // In multi-select mode, clicking on the content should also select the item
                              toggleItemSelection(item.id)
                            } else {
                              // In normal mode, clicking on the content should navigate to details
                              handleSelectFavorite(item)
                            }
                          }}
                        >
                          <div className="flex">
                            <div className="w-12 h-12 rounded-lg mr-3 bg-[#320DFF]/10 dark:bg-[#6D56FF]/10 flex items-center justify-center">
                              <span className="text-[#320DFF] dark:text-[#6D56FF] font-bold text-xl">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {item.name}
                                    </h3>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span className="capitalize">
                                      {item.type}
                                    </span>
                                    {item.quantity && (
                                      <span className="ml-2">
                                        • {item.quantity}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {item.calories} cal
                                </span>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div className="flex space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Protein: {item.protein}g</span>
                                  <span>Carbs: {item.carbs}g</span>
                                  <span>Fat: {item.fat}g</span>
                                </div>
                                {!isMultiSelectMode && (
                                  <button
                                    className="text-[#320DFF] dark:text-[#6D56FF] text-xs flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      hapticFeedback.selection()
                                      // Handle adding item logic
                                      setNotification({
                                        show: true,
                                        message: `${item.name} added to meal`,
                                      })
                                    }}
                                  >
                                    <PlusIcon size={12} className="mr-0.5" />
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {swipedItemId === item.id && !isMultiSelectMode && (
                          <motion.button
                            className="ml-2 self-center"
                            onClick={() => {
                              setSwipedItemId(null)
                              hapticFeedback.selection()
                            }}
                            initial={{
                              opacity: 0,
                              scale: 0.5,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                          >
                            <XIcon
                              size={20}
                              className="text-gray-500 dark:text-gray-400"
                            />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>
          {!isMultiSelectMode && filteredFavorites.length > 0 && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 mb-4">
              Swipe left on an item to delete
            </div>
          )}
        </div>

        {/* Multi-select action bar - Floating but smaller */}
        <AnimatePresence>
          {isMultiSelectMode && selectedItems.length > 0 && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-lg z-40"
              initial={{
                y: 100,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 100,
                opacity: 0,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {selectedItems.length} items selected
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddSelectedItems}
                >
                  Add Selected
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification - Floating */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-40"
              initial={{
                y: 50,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 50,
                opacity: 0,
              }}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

```
```components/food-input/AddMoreScreen.tsx
import React from 'react'
import {
  ArrowLeftIcon,
  CameraIcon,
  MicIcon,
  BarcodeIcon,
  KeyboardIcon,
  StarIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '../ui/PageTransition'
import { hapticFeedback } from '../../utils/haptics'
interface AddMoreScreenProps {
  onBack: () => void
  currentMeal: any
  onCameraCapture: () => void
  onVoiceCapture: () => void
  onBarcodeCapture: () => void
  onTextInput: () => void
  onFavorites?: () => void
}
export const AddMoreScreen: React.FC<AddMoreScreenProps> = ({
  onBack,
  currentMeal,
  onCameraCapture,
  onVoiceCapture,
  onBarcodeCapture,
  onTextInput,
  onFavorites,
}) => {
  const handleBack = () => {
    hapticFeedback.selection()
    onBack()
  }
  const inputMethods = [
    {
      name: 'Camera',
      icon: CameraIcon,
      color: '#4CAF50',
      action: onCameraCapture,
      description: 'Take a photo of your food',
    },
    {
      name: 'Voice',
      icon: MicIcon,
      color: '#2196F3',
      action: onVoiceCapture,
      description: 'Describe your food with your voice',
    },
    {
      name: 'Barcode',
      icon: BarcodeIcon,
      color: '#9C27B0',
      action: onBarcodeCapture,
      description: 'Scan a product barcode',
    },
    {
      name: 'Text',
      icon: KeyboardIcon,
      color: '#FF9800',
      action: onTextInput,
      description: 'Type what you ate',
    },
    {
      name: 'Favorites',
      icon: StarIcon,
      color: '#F44336',
      action: onFavorites,
      description: 'Add from your favorites',
    },
  ]
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4"
            onClick={handleBack}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Add More Food
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose how to add more items
            </p>
          </div>
        </div>
        <div className="px-4 py-6 flex-1">
          <div className="space-y-4">
            {inputMethods.map((method, index) => (
              <motion.button
                key={method.name}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center"
                onClick={() => {
                  hapticFeedback.selection()
                  method.action()
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                }}
                whileTap={{
                  scale: 0.98,
                }}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                  style={{
                    backgroundColor: `${method.color}15`,
                  }}
                >
                  <method.icon
                    size={24}
                    style={{
                      color: method.color,
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {method.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

```
```components/screens/MealSavedScreen.tsx
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { ParticleEffect } from '../ui/ParticleEffect'
import { hapticFeedback } from '../../utils/haptics'
interface MealSavedScreenProps {
  meal: any
  onContinue: () => void
}
export const MealSavedScreen: React.FC<MealSavedScreenProps> = ({
  meal,
  onContinue,
}) => {
  useEffect(() => {
    hapticFeedback.success()
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      onContinue()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onContinue])
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 relative overflow-hidden"
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.8,
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          damping: 20,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <ParticleEffect
            type="confetti"
            intensity="medium"
            colors={['#320DFF', '#4F46E5', '#818CF8', '#66BB6A', '#FFA726']}
            duration={2}
          />
        </div>
        <div className="flex flex-col items-center text-center mb-4">
          <motion.div
            className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              delay: 0.2,
              type: 'spring',
              damping: 12,
            }}
          >
            <CheckCircleIcon size={32} className="text-green-500" />
          </motion.div>
          <motion.h2
            className="text-xl font-bold mb-2"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
          >
            Meal Saved!
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-4"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
          >
            Your {meal?.type || 'meal'} has been added to your food log
          </motion.p>
          <motion.div
            className="bg-gray-50 w-full p-3 rounded-lg mb-4"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
            }}
          >
            <p className="font-medium">{meal?.calories || 542} calories</p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500 mt-1">
              <span>P: {meal?.macros?.protein || 28}g</span>
              <span>C: {meal?.macros?.carbs || 62}g</span>
              <span>F: {meal?.macros?.fat || 22}g</span>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.6,
          }}
        >
          <Button variant="primary" fullWidth onClick={onContinue}>
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

```
```components/ui/Avatar.tsx
import React, { useState } from 'react'
interface AvatarProps {
  src?: string
  alt?: string
  size?: 'small' | 'medium' | 'large'
  fallback?: string
}
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'medium',
  fallback,
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14',
  }
  const [error, setError] = useState(false)
  const handleError = () => {
    setError(true)
  }
  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}
    >
      {!error && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-medium">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

```
```components/feedback/FeedbackForm.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquareIcon, StarIcon, XIcon, SendIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { hapticFeedback } from '../../utils/haptics'
interface FeedbackFormProps {
  onClose: () => void
  onSubmit: (feedback: {
    rating: number
    comment: string
    contactInfo?: string
  }) => void
}
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [step, setStep] = useState<'rating' | 'comment'>('rating')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showContactField, setShowContactField] = useState(false)
  const handleRatingSelect = (selectedRating: number) => {
    hapticFeedback.selection()
    setRating(selectedRating)
  }
  const handleNextStep = () => {
    hapticFeedback.selection()
    setStep('comment')
  }
  const handleSubmit = () => {
    if (comment.trim() === '') return
    hapticFeedback.success()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      onSubmit({
        rating,
        comment,
        contactInfo: contactInfo.trim() !== '' ? contactInfo : undefined,
      })
      setIsSubmitting(false)
    }, 1000)
  }
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.9,
          opacity: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageSquareIcon
              className="text-[#320DFF] dark:text-[#6D56FF] mr-2"
              size={20}
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Your Feedback
            </h2>
          </div>
          <button
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'rating' ? (
              <motion.div
                key="rating-step"
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 20,
                }}
              >
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  How would you rate your experience with our app?
                </p>
                <div className="flex justify-center space-x-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${rating >= star ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20' : 'bg-gray-100 dark:bg-gray-700'}`}
                      whileHover={{
                        scale: 1.1,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={() => handleRatingSelect(star)}
                    >
                      <StarIcon
                        size={24}
                        className={
                          rating >= star
                            ? 'text-[#320DFF] dark:text-[#6D56FF] fill-[#320DFF] dark:fill-[#6D56FF]'
                            : 'text-gray-400 dark:text-gray-500'
                        }
                      />
                    </motion.button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleNextStep}
                  disabled={rating === 0}
                >
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="comment-step"
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
              >
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Please share your thoughts with us:
                </p>
                <textarea
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50 mb-4"
                  rows={4}
                  placeholder="What do you like or dislike? Any suggestions for improvement?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <div className="mb-4">
                  <button
                    className="text-[#320DFF] dark:text-[#6D56FF] text-sm flex items-center"
                    onClick={() => setShowContactField(!showContactField)}
                  >
                    {showContactField
                      ? 'Hide contact field'
                      : 'Add contact information (optional)'}
                  </button>
                </div>
                <AnimatePresence>
                  {showContactField && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      className="overflow-hidden mb-4"
                    >
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50"
                        placeholder="Email or phone number (optional)"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setStep('rating')}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={comment.trim() === '' || isSubmitting}
                    loading={isSubmitting}
                  >
                    <SendIcon size={16} className="mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

```
```components/feedback/FeedbackButton.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareIcon } from 'lucide-react'
import { FeedbackForm } from './FeedbackForm'
import { hapticFeedback } from '../../utils/haptics'
interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}
export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  position = 'bottom-right',
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-24 right-4'
      case 'bottom-left':
        return 'bottom-24 left-4'
      case 'top-right':
        return 'top-24 right-4'
      case 'top-left':
        return 'top-24 left-4'
      default:
        return 'bottom-24 right-4'
    }
  }
  const handleOpenFeedback = () => {
    hapticFeedback.selection()
    setShowFeedbackForm(true)
  }
  const handleCloseFeedback = () => {
    setShowFeedbackForm(false)
  }
  const handleSubmitFeedback = (feedback: {
    rating: number
    comment: string
    contactInfo?: string
  }) => {
    console.log('Feedback submitted:', feedback)
    setShowFeedbackForm(false)
    setShowThankYou(true)
    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false)
    }, 3000)
  }
  return (
    <>
      <motion.button
        className={`fixed ${getPositionClasses()} z-40 w-12 h-12 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] shadow-lg flex items-center justify-center`}
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.9,
        }}
        onClick={handleOpenFeedback}
      >
        <MessageSquareIcon size={20} className="text-white" />
      </motion.button>
      {showFeedbackForm && (
        <FeedbackForm
          onClose={handleCloseFeedback}
          onSubmit={handleSubmitFeedback}
        />
      )}
      {showThankYou && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 max-w-md mx-auto bg-[#320DFF] dark:bg-[#6D56FF] text-white px-4 py-3 rounded-xl shadow-lg z-50"
          initial={{
            y: 50,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: 50,
            opacity: 0,
          }}
        >
          Thank you for your feedback! We appreciate your input.
        </motion.div>
      )}
    </>
  )
}

```