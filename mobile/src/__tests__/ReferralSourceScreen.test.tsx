import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ReferralSourceScreen from '../screens/onboarding/ReferralSourceScreen';

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
    progress: 18,
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

describe('ReferralSourceScreen', () => {
  it('renders all referral source options', () => {
    render(<ReferralSourceScreen />);

    // Check for title and subtitle
    expect(screen.getByText('Where did you hear about us?')).toBeTruthy();
    expect(
      screen.getByText("We'd love to know how you found NutriAI")
    ).toBeTruthy();

    // Check for all referral source options
    expect(screen.getByText('Facebook')).toBeTruthy();
    expect(screen.getByText('Instagram')).toBeTruthy();
    expect(screen.getByText('Google')).toBeTruthy();
    expect(screen.getByText('TikTok')).toBeTruthy();
    expect(screen.getByText('Friend/Family')).toBeTruthy();
    expect(screen.getByText('App Store')).toBeTruthy();
    expect(screen.getByText('YouTube')).toBeTruthy();
    expect(screen.getByText('TV')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
  });

  it('renders with correct styling for unselected options', () => {
    render(<ReferralSourceScreen />);

    // Get some option buttons
    const facebookButton = screen.getByTestId('referral-option-facebook');
    const instagramButton = screen.getByTestId('referral-option-instagram');

    // Check initial styling (unselected state)
    [facebookButton, instagramButton].forEach(button => {
      const styles = button.props.style;
      expect(styles.borderWidth).toBe(2);
      expect(styles.borderColor).toBe('#E5E7EB'); // gray-200
      expect(styles.backgroundColor).toBe('transparent');
    });
  });

  it('highlights selected option with correct styling', () => {
    render(<ReferralSourceScreen />);

    const googleButton = screen.getByTestId('referral-option-google');

    // Click google option
    fireEvent.press(googleButton);

    // Check selected styling
    const styles = googleButton.props.style;
    expect(styles.borderColor).toBe('#320DFF'); // primary color
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.05)'); // primary with 5% opacity
  });

  it('shows continue button as disabled when no option selected', () => {
    render(<ReferralSourceScreen />);

    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;

    // Check disabled styling
    expect(styles.backgroundColor).toBe('rgba(50, 13, 255, 0.5)'); // 50% opacity
    expect(continueButton.props.disabled).toBe(true);
  });

  it('enables continue button when option is selected', () => {
    render(<ReferralSourceScreen />);

    // Select an option
    fireEvent.press(screen.getByTestId('referral-option-tiktok'));

    const continueButton = screen.getByTestId('continue-button');
    const styles = continueButton.props.style;

    // Check enabled styling
    expect(styles.backgroundColor).toBe('#320DFF'); // full opacity
    expect(continueButton.props.disabled).toBe(false);
  });

  it('has correct layout measurements', () => {
    render(<ReferralSourceScreen />);

    // Check option button dimensions
    const optionButton = screen.getByTestId('referral-option-facebook');
    const styles = optionButton.props.style;

    expect(styles.height).toBe(112); // 28 * 4 from h-28 in Tailwind
    expect(styles.borderRadius).toBe(16);
    expect(styles.marginBottom).toBe(16);

    // Check continue button dimensions
    const continueButton = screen.getByTestId('continue-button');
    const buttonStyles = continueButton.props.style;

    expect(buttonStyles.height).toBe(58);
    expect(buttonStyles.borderRadius).toBe(29);
  });

  it('displays progress bar at correct percentage', () => {
    render(<ReferralSourceScreen />);

    const progressBar = screen.getByTestId('progress-bar-fill');
    const styles = progressBar.props.style;

    // Progress should be 18% (from mock)
    expect(styles.width).toBe('18%');
  });

  it('renders logos/icons for each referral source', () => {
    render(<ReferralSourceScreen />);

    // Check that all options have logo containers
    const sources = [
      'facebook',
      'instagram',
      'google',
      'tiktok',
      'friend',
      'app-store',
      'youtube',
      'tv',
      'other',
    ];

    sources.forEach(source => {
      const optionButton = screen.getByTestId(`referral-option-${source}`);
      // Find the logo container within the option
      const logoContainer = optionButton.findByProps({
        testID: `logo-${source}`,
      });

      expect(logoContainer).toBeTruthy();
    });
  });

  it('displays options in a 3x3 grid layout', () => {
    render(<ReferralSourceScreen />);

    // Check that we have 9 options
    const options = screen.getAllByTestId(/referral-option-/);
    expect(options).toHaveLength(9);

    // Check the grid container styling
    const gridContainer = screen.getByTestId('referral-grid');
    const styles = gridContainer.props.style;

    expect(styles.flexDirection).toBe('row');
    expect(styles.flexWrap).toBe('wrap');
    expect(styles.justifyContent).toBe('space-between');
  });
});
