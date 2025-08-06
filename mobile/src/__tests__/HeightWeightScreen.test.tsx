import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HeightWeightScreen from '../screens/onboarding/HeightWeightScreen';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Moti
jest.mock('moti', () => ({
  MotiView: ({ children }: any) => children,
}));

// Mock the useOnboarding hook
jest.mock('../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    progress: 24,
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

describe('HeightWeightScreen', () => {
  it('renders all input fields and labels', () => {
    render(<HeightWeightScreen />);

    // Check for title and subtitle
    expect(screen.getByText('Your height and weight')).toBeTruthy();
    expect(
      screen.getByText('This helps us calculate your nutritional needs')
    ).toBeTruthy();

    // Check for height section
    expect(screen.getByText('Height')).toBeTruthy();
    expect(screen.getByPlaceholderText('5')).toBeTruthy(); // feet
    expect(screen.getByPlaceholderText('8')).toBeTruthy(); // inches
    expect(screen.getByText('ft')).toBeTruthy();
    expect(screen.getByText('in')).toBeTruthy();

    // Check for weight section
    expect(screen.getByText('Weight')).toBeTruthy();
    expect(screen.getByPlaceholderText('150')).toBeTruthy();
    expect(screen.getByText('lbs')).toBeTruthy();
  });

  it('allows toggling between imperial and metric units', () => {
    render(<HeightWeightScreen />);

    // Initially should show imperial units
    expect(screen.getByText('ft')).toBeTruthy();
    expect(screen.getByText('in')).toBeTruthy();
    expect(screen.getByText('lbs')).toBeTruthy();

    // Find and press metric toggle
    const metricToggle = screen.getByTestId('unit-toggle-metric');
    fireEvent.press(metricToggle);

    // Should now show metric units
    expect(screen.getByText('cm')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
    expect(screen.getByPlaceholderText('173')).toBeTruthy(); // cm placeholder
    expect(screen.getByPlaceholderText('68')).toBeTruthy(); // kg placeholder
  });

  it('shows continue button as disabled when fields are empty', () => {
    render(<HeightWeightScreen />);

    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;

    // Check disabled styling
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.5)'); // 50% opacity
    expect(continueButton.props.disabled).toBe(true);
  });

  it('enables continue button when all fields are filled', () => {
    render(<HeightWeightScreen />);

    // Fill in height
    const feetInput = screen.getByPlaceholderText('5');
    const inchesInput = screen.getByPlaceholderText('8');
    fireEvent.changeText(feetInput, '6');
    fireEvent.changeText(inchesInput, '0');

    // Fill in weight
    const weightInput = screen.getByPlaceholderText('150');
    fireEvent.changeText(weightInput, '180');

    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;

    // Check enabled styling
    expect(styles.backgroundColor).toBe('#320DFF'); // full opacity
    expect(continueButton.props.disabled).toBe(false);
  });

  it('validates numeric input only', () => {
    render(<HeightWeightScreen />);

    const weightInput = screen.getByPlaceholderText('150');

    // Try to enter non-numeric text
    fireEvent.changeText(weightInput, 'abc');

    // Value should remain empty or show error
    expect(weightInput.props.value).toBe('');
  });

  it('has correct layout measurements', () => {
    render(<HeightWeightScreen />);

    // Check input field dimensions
    const weightInput = screen.getByPlaceholderText('150');
    const styles = weightInput.props.style;

    expect(styles.height).toBe(56);
    expect(styles.borderRadius).toBe(12);

    // Check continue button dimensions
    const continueButton = screen.getByTestId('continue-button');
    const buttonStyles = continueButton.props.style;

    expect(buttonStyles.height).toBe(58);
    expect(buttonStyles.borderRadius).toBe(29);
  });

  it('displays progress bar at correct percentage', () => {
    render(<HeightWeightScreen />);

    const progressBar = screen.getByTestId('progress-bar-fill');
    const styles = progressBar.props.style;

    // Progress should be 24% (from mock)
    expect(styles.width).toBe('24%');
  });

  it('handles metric unit conversion correctly', () => {
    render(<HeightWeightScreen />);

    // Switch to metric
    const metricToggle = screen.getByTestId('unit-toggle-metric');
    fireEvent.press(metricToggle);

    // Fill in metric values
    const heightInput = screen.getByPlaceholderText('173');
    const weightInput = screen.getByPlaceholderText('68');

    fireEvent.changeText(heightInput, '180');
    fireEvent.changeText(weightInput, '75');

    // Values should be accepted
    expect(heightInput.props.value).toBe('180');
    expect(weightInput.props.value).toBe('75');
  });
});
