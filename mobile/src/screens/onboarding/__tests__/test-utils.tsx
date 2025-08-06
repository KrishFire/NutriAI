import React from 'react';
import {
  OnboardingContext,
  OnboardingContextType,
} from '../../../contexts/OnboardingContext';

// Export the type for external use
export type { OnboardingContextType };

// Mock context value with proper types
export const mockContextValue: OnboardingContextType = {
  currentStep: 'subscription',
  userData: { referralCode: 'TEST123' },
  updateUserData: jest.fn(),
  goToNextStep: jest.fn(),
  goToPreviousStep: jest.fn(),
  progress: 85,
  navigation: null,
  route: null,
  isLoading: false,
};

// Helper to render components with OnboardingContext
export const renderWithContext = (
  component: React.ReactElement,
  contextOverrides?: Partial<OnboardingContextType>
) => {
  const contextValue = {
    ...mockContextValue,
    ...contextOverrides,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {component}
    </OnboardingContext.Provider>
  );
};
