import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

/**
 * Custom render function that wraps components with NavigationContainer
 * This prevents the "Couldn't find a navigation object" error in tests
 */
export function renderWithNavigation(component: React.ReactElement) {
  return render(<NavigationContainer>{component}</NavigationContainer>);
}

// Re-export everything from @testing-library/react-native
export * from '@testing-library/react-native';
