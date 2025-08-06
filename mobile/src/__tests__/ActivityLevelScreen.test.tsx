import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';

// Mock the useOnboarding hook
jest.mock('../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    progress: 12,
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

describe('ActivityLevelScreen', () => {
  it('renders all activity level options', () => {
    render(<ActivityLevelScreen />);

    // Check for title and subtitle
    expect(screen.getByText('How active are you?')).toBeTruthy();
    expect(
      screen.getByText('This helps us calculate your daily calorie needs')
    ).toBeTruthy();

    // Check for all activity level options
    expect(screen.getByText('Sedentary')).toBeTruthy();
    expect(screen.getByText('Little to no exercise')).toBeTruthy();

    expect(screen.getByText('Lightly Active')).toBeTruthy();
    expect(screen.getByText('Exercise 1-3 days/week')).toBeTruthy();

    expect(screen.getByText('Moderately Active')).toBeTruthy();
    expect(screen.getByText('Exercise 3-5 days/week')).toBeTruthy();

    expect(screen.getByText('Very Active')).toBeTruthy();
    expect(screen.getByText('Exercise 6-7 days/week')).toBeTruthy();

    expect(screen.getByText('Extra Active')).toBeTruthy();
    expect(screen.getByText('Very hard exercise daily')).toBeTruthy();
  });

  it('renders with correct styling for unselected options', () => {
    render(<ActivityLevelScreen />);

    // Get all option buttons
    const sedentaryButton = screen.getByTestId('activity-option-sedentary');
    const lightlyActiveButton = screen.getByTestId(
      'activity-option-lightly_active'
    );

    // Check initial styling (unselected state)
    [sedentaryButton, lightlyActiveButton].forEach(button => {
      const styles = button.props.style;
      expect(styles.borderWidth).toBe(2);
      expect(styles.borderColor).toBe('#E5E7EB'); // gray-200
      expect(styles.backgroundColor).toBe('transparent');
    });
  });

  it('highlights selected option with correct styling', () => {
    render(<ActivityLevelScreen />);

    const moderateButton = screen.getByTestId(
      'activity-option-moderately_active'
    );

    // Click moderate option
    fireEvent.press(moderateButton);

    // Check selected styling
    const styles = moderateButton.props.style;
    expect(styles.borderColor).toBe('#320DFF'); // primary color
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.05)'); // primary with 5% opacity
  });

  it('shows continue button as disabled when no option selected', () => {
    render(<ActivityLevelScreen />);

    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;

    // Check disabled styling
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.5)'); // 50% opacity
    expect(continueButton.props.disabled).toBe(true);
  });

  it('enables continue button when option is selected', () => {
    render(<ActivityLevelScreen />);

    // Select an option
    fireEvent.press(screen.getByTestId('activity-option-very_active'));

    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;

    // Check enabled styling
    expect(styles.backgroundColor).toBe('#320DFF'); // full opacity
    expect(continueButton.props.disabled).toBe(false);
  });

  it('has correct layout measurements', () => {
    render(<ActivityLevelScreen />);

    // Check option button dimensions
    const optionButton = screen.getByTestId('activity-option-sedentary');
    const styles = optionButton.props.style;

    expect(styles.height).toBe(88); // Taller than gender options for description
    expect(styles.borderRadius).toBe(16);
    expect(styles.marginBottom).toBe(16);

    // Check continue button dimensions
    const continueButton = screen.getByTestId('continue-button');
    const buttonStyles = continueButton.props.style;

    expect(buttonStyles.height).toBe(58);
    expect(buttonStyles.borderRadius).toBe(29);
  });

  it('displays progress bar at correct percentage', () => {
    render(<ActivityLevelScreen />);

    const progressBar = screen.getByTestId('progress-bar-fill');
    const styles = progressBar.props.style;

    // Progress should be 12% (from mock)
    expect(styles.width).toBe('12%');
  });

  it('renders option titles and descriptions correctly', () => {
    render(<ActivityLevelScreen />);

    // Check that each option has both title and description
    const sedentaryOption = screen.getByTestId('activity-option-sedentary');
    const sedentaryTitle = sedentaryOption.findByProps({
      children: 'Sedentary',
    });
    const sedentaryDesc = sedentaryOption.findByProps({
      children: 'Little to no exercise',
    });

    expect(sedentaryTitle).toBeTruthy();
    expect(sedentaryDesc).toBeTruthy();

    // Check font sizes
    expect(sedentaryTitle.props.style.fontSize).toBe(15.3);
    expect(sedentaryDesc.props.style.fontSize).toBe(12.8);
  });

  it('renders icons for each activity level option', () => {
    render(<ActivityLevelScreen />);

    // Check that all options have icon containers
    const options = [
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'extra_active',
    ];

    options.forEach(option => {
      const optionButton = screen.getByTestId(`activity-option-${option}`);
      // Find the icon container within the option
      const iconContainer = optionButton.findByProps({
        style: expect.objectContaining({
          width: 48,
          height: 48,
          borderRadius: 12,
        }),
      });

      expect(iconContainer).toBeTruthy();
    });
  });
});
