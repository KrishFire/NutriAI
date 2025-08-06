import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import navigators
import BottomTabNavigator from './BottomTabNavigator';
import OnboardingStack from './OnboardingStack';

// Import auth screens (will be created later)
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Import modal screens
import PaywallScreen from '../screens/premium/PaywallScreen';
import SubscriptionSuccessScreen from '../screens/premium/SubscriptionSuccessScreen';

// TODO: Import from real auth context
import { useAuth } from '../hooks/useAuth';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;

  // Main flows
  Onboarding: undefined;
  MainApp: undefined;

  // Modal screens
  Paywall: { feature?: string };
  SubscriptionSuccess: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  // TODO: Replace with real auth state
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();

  if (isLoading) {
    // TODO: Replace with proper loading screen
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth flow
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          </Stack.Group>
        ) : !hasCompletedOnboarding ? (
          // Onboarding flow
          <Stack.Screen
            name="Onboarding"
            component={OnboardingStack}
            options={{
              animation: 'fade',
            }}
          />
        ) : (
          // Main app
          <>
            <Stack.Screen
              name="MainApp"
              component={BottomTabNavigator}
              options={{
                animation: 'fade',
              }}
            />

            {/* Modal screens */}
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            >
              <Stack.Screen name="Paywall" component={PaywallScreen} />
              <Stack.Screen
                name="SubscriptionSuccess"
                component={SubscriptionSuccessScreen}
                options={{
                  presentation: 'fullScreenModal',
                }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </>
  );
}
