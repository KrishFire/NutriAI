# Navigation Architecture Fix - High Priority

## Issue Summary

**Status:** 🔴 Root Cause Identified - Requires Architectural Fix
**Priority:** HIGH - Stability Issue
**Type:** Core Architecture Anti-Pattern

### Problem

The app experiences "Couldn't find a navigation context" errors during onboarding flow, particularly when state changes trigger conditional navigator rendering. While we've implemented a UI workaround (side-by-side subscription plans), the underlying architectural issues remain.

## Root Causes

### 1. Conditional Navigator Rendering (Critical)

**Location:** `/src/navigation/RootNavigator.tsx` lines 302-317

```jsx
// ANTI-PATTERN: Conditional navigator rendering
{!user ? (
  <RootStack.Navigator>...  // Navigator A
) : hasCompletedOnboarding ? (
  <AppStack />              // Navigator B
) : (
  <RootStack.Navigator>...  // Navigator C
)}
```

**Problem:** When `user` or `hasCompletedOnboarding` state changes, React unmounts the entire navigator tree and mounts a new one, destroying all navigation context.

### 2. Context Provider Inside Screen Component

**Location:** `/src/screens/onboarding/OnboardingFlow.tsx` line 333

```jsx
// ANTI-PATTERN: Context provider inside screen component
export default function OnboardingFlow() {
  return (
    <ErrorBoundary>
      <OnboardingContext.Provider value={contextValue}>
        <View className="flex-1">{renderCurrentStep()}</View>
      </OnboardingContext.Provider>
    </ErrorBoundary>
  );
}
```

**Problem:** OnboardingContext.Provider should wrap the navigator stack, not be inside a screen component.

## Recommended Fixes

### Fix 1: Refactor RootNavigator to Use Conditional Screens

**File:** `/src/navigation/RootNavigator.tsx`

```jsx
// CORRECT PATTERN: Single navigator with conditional screens
export default function RootNavigator() {
  const { user, loading, preferences } = useAuth();
  const hasCompletedOnboarding = user && preferences?.has_completed_onboarding;

  if (loading) {
    return <LoadingSpinner text="Loading..." overlay />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Unauthenticated screens
          <>
            <RootStack.Screen name="Onboarding" component={OnboardingStack} />
            <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
          </>
        ) : !hasCompletedOnboarding ? (
          // Authenticated but not onboarded
          <>
            <RootStack.Screen name="Onboarding" component={OnboardingStack} />
            <RootStack.Screen name="Main" component={BottomTabNavigator} />
          </>
        ) : (
          // Fully authenticated and onboarded
          <>
            <RootStack.Screen name="Main" component={BottomTabNavigator} />
            <RootStack.Screen name="AppTabs" component={AppTabNavigator} />
            <RootStack.Group screenOptions={{ presentation: 'modal' }}>
              <RootStack.Screen
                name="AddMealFlow"
                component={AddMealStackNavigator}
              />
            </RootStack.Group>
            <RootStack.Screen
              name="MealDetails"
              component={MealDetailsScreen}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

### Fix 2: Move OnboardingContext Provider to Wrap Stack

**File:** `/src/navigation/OnboardingStack.tsx`

```jsx
import { OnboardingProvider } from '../contexts/OnboardingContext';

export default function OnboardingStack() {
  const { completeOnboarding } = useAuth();

  return (
    <OnboardingProvider> {/* Add provider here */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingFlow">
          {({ navigation, route }: OnboardingFlowScreenProps) => (
            <OnboardingFlow
              navigation={navigation}
              route={route}
              onComplete={completeOnboarding}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
```

**File:** `/src/contexts/OnboardingContext.tsx` (add provider component)

```jsx
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userData, setUserData] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Move all state and logic from OnboardingFlow here

  const contextValue = useMemo<OnboardingContextType>(
    () => ({
      currentStep,
      userData,
      updateUserData,
      goToNextStep,
      goToPreviousStep,
      progress,
      navigation: null, // Will be set by OnboardingFlow
      route: null,      // Will be set by OnboardingFlow
      isLoading,
    }),
    [currentStep, userData, /*...*/]
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}
```

**File:** `/src/screens/onboarding/OnboardingFlow.tsx` (simplified)

```jsx
export default function OnboardingFlow({ navigation, route, onComplete }) {
  const context = useOnboarding();

  // Update context with navigation props
  useEffect(() => {
    context.setNavigation(navigation);
    context.setRoute(route);
  }, [navigation, route]);

  return (
    <ErrorBoundary>
      <View className="flex-1">{renderCurrentStep()}</View>
    </ErrorBoundary>
  );
}
```

## Implementation Steps

1. **Phase 1: Context Refactor** (Lower Risk)
   - Extract state management from OnboardingFlow to OnboardingProvider
   - Move provider to wrap OnboardingStack
   - Update all onboarding screens to use context from provider
   - Test thoroughly

2. **Phase 2: Navigator Refactor** (Higher Risk)
   - Create feature flag for new navigation structure
   - Implement conditional screens pattern in RootNavigator
   - Test all navigation flows and state transitions
   - Remove old conditional navigator code

## Testing Checklist

- [ ] Onboarding flow completes without navigation errors
- [ ] Authentication state changes don't break navigation
- [ ] Deep linking works correctly
- [ ] Navigation persistence works on app resume
- [ ] All screens accessible and back navigation works
- [ ] Memory leaks check (no orphaned navigators)

## Benefits

1. **Stability**: No more navigation context errors
2. **Performance**: Single navigator = less re-rendering
3. **Maintainability**: Clearer architecture
4. **Future-proof**: Allows reverting to toggle UI if desired

## Timeline

- **Immediate**: Document issue and workaround
- **Next Sprint**: Implement Phase 1 (Context Refactor)
- **Following Sprint**: Implement Phase 2 (Navigator Refactor)

## References

- [React Navigation: Authentication Flow](https://reactnavigation.org/docs/auth-flow)
- [React Navigation: Conditional Routes Best Practices](https://reactnavigation.org/docs/upgrading-from-5.x#conditional-screens-instead-of-conditional-navigators)
- Original error: "Couldn't find a navigation context"
- Workaround: Side-by-side subscription plans (SubscriptionScreen.tsx)

## Conclusion

While the UI redesign successfully avoids triggering the navigation error, the underlying architectural issues should be addressed for long-term stability. This is not technical debt - it's a critical stability fix that will prevent similar issues in the future.
