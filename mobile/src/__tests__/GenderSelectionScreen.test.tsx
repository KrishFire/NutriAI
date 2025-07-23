import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GenderSelectionScreen from '../screens/onboarding/GenderSelectionScreen';

// Mock the useOnboarding hook
jest.mock('../screens/onboarding/OnboardingFlow', () => ({
  useOnboarding: () => ({
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    progress: 6,
    updateUserData: jest.fn(),
  }),
}));

// Mock haptic feedback
jest.mock('../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
    impact: jest.fn(),
  },
}));

describe('GenderSelectionScreen', () => {
  it('renders all gender options', () => {
    render(<GenderSelectionScreen />);
    
    // Check for title and subtitle
    expect(screen.getByText('Tell us about yourself')).toBeTruthy();
    expect(screen.getByText('This helps us calculate your metabolic rate')).toBeTruthy();
    
    // Check for all gender options
    expect(screen.getByText('Male')).toBeTruthy();
    expect(screen.getByText('Female')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
  });

  it('renders with correct styling for unselected options', () => {
    render(<GenderSelectionScreen />);
    
    // Get all option buttons
    const maleButton = screen.getByTestId('gender-option-male');
    const femaleButton = screen.getByTestId('gender-option-female');
    const otherButton = screen.getByTestId('gender-option-other');
    
    // Check initial styling (unselected state)
    [maleButton, femaleButton, otherButton].forEach(button => {
      const styles = button.props.style;
      expect(styles.borderWidth).toBe(2);
      expect(styles.borderColor).toBe('#E5E7EB'); // gray-200
      expect(styles.backgroundColor).toBe('transparent');
    });
  });

  it('highlights selected option with correct styling', () => {
    render(<GenderSelectionScreen />);
    
    const maleButton = screen.getByTestId('gender-option-male');
    
    // Click male option
    fireEvent.press(maleButton);
    
    // Check selected styling
    const styles = maleButton.props.style;
    expect(styles.borderColor).toBe('#320DFF'); // primary color
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.05)'); // primary with 5% opacity
  });

  it('shows continue button as disabled when no option selected', () => {
    render(<GenderSelectionScreen />);
    
    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;
    
    // Check disabled styling
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.5)'); // 50% opacity
    expect(continueButton.props.disabled).toBe(true);
  });

  it('enables continue button when option is selected', () => {
    render(<GenderSelectionScreen />);
    
    // Select an option
    fireEvent.press(screen.getByTestId('gender-option-female'));
    
    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;
    
    // Check enabled styling
    expect(styles.backgroundColor).toBe('#320DFF'); // full opacity
    expect(continueButton.props.disabled).toBe(false);
  });

  it('has correct layout measurements', () => {
    render(<GenderSelectionScreen />);
    
    // Check option button dimensions
    const optionButton = screen.getByTestId('gender-option-male');
    const styles = optionButton.props.style;
    
    expect(styles.height).toBe(72);
    expect(styles.borderRadius).toBe(16);
    expect(styles.marginBottom).toBe(16);
    
    // Check continue button dimensions
    const continueButton = screen.getByTestId('continue-button');
    const buttonStyles = continueButton.props.style;
    
    expect(buttonStyles.height).toBe(58);
    expect(buttonStyles.borderRadius).toBe(29);
  });

  it('displays progress bar at correct percentage', () => {
    render(<GenderSelectionScreen />);
    
    const progressBar = screen.getByTestId('progress-bar-fill');
    const styles = progressBar.props.style;
    
    // Progress should be 6% (from mock)
    expect(styles.width).toBe('6%');
  });
});