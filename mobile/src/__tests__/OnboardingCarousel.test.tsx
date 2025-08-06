import React from 'react';
import { render, screen } from '@testing-library/react-native';
import OnboardingCarousel from '../screens/onboarding/OnboardingCarousel';
import { Dimensions } from 'react-native';

// Mock the useOnboarding hook to provide necessary context
jest.mock('../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
  }),
}));

// Mock haptic feedback
jest.mock('../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
    impact: jest.fn(),
  },
}));

const { width: SCREEN_WIDTH } = Dimensions.get('window');

describe('OnboardingCarousel', () => {
  it('renders slides with correct structure for proper layout', () => {
    render(<OnboardingCarousel />);

    // Find all slide containers by testID
    const slideContainers = screen.getAllByTestId('slide-container');

    // Verify we have 3 slides
    expect(slideContainers).toHaveLength(3);

    // 1. Verify that each slide container has the full screen width and no horizontal padding
    slideContainers.forEach(container => {
      const styles = container.props.style;

      // Check width
      expect(styles.width).toBe(SCREEN_WIDTH);

      // Ensure no padding is applied to the container
      expect(styles.paddingHorizontal).toBeUndefined();
      expect(styles.paddingLeft).toBeUndefined();
      expect(styles.paddingRight).toBeUndefined();
    });

    // 2. Verify that the inner content view has the correct padding
    const slideContents = screen.getAllByTestId('slide-content');
    slideContents.forEach(content => {
      const styles = content.props.style;

      // Check that padding is applied to the content, not the container
      expect(styles.paddingHorizontal).toBe(24);
    });
  });

  it('renders the ScrollView with pagingEnabled', () => {
    render(<OnboardingCarousel />);
    const scrollView = screen.getByTestId('carousel-scroll-view');

    // Verify pagingEnabled is true
    expect(scrollView.props.pagingEnabled).toBe(true);

    // Verify horizontal scrolling
    expect(scrollView.props.horizontal).toBe(true);

    // Verify no horizontal scroll indicator
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
  });

  it('has proper layout hierarchy without conflicting styles', () => {
    const { root } = render(<OnboardingCarousel />);

    // Get the SafeAreaView container
    const container = root.findByProps({ testID: undefined }).props.style;

    // Verify container has flex: 1 and no centering
    expect(container.flex).toBe(1);
    expect(container.alignItems).toBeUndefined();

    // Verify ScrollView wrapper has no conflicting styles
    const scrollView = screen.getByTestId('carousel-scroll-view');
    const scrollViewStyle = scrollView.props.style;
    expect(scrollViewStyle.flex).toBe(1);
  });
});
