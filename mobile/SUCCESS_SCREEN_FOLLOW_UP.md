# SuccessScreen Follow-Up Tickets

Based on review with Gemini 2.5 Pro, the following improvements should be implemented:

## 1. Accessibility: Verify Color Contrast (HIGH PRIORITY)

**Title:** A11y: Verify and adjust color contrast on Onboarding Success screen
**Description:**

- **Goal:** Ensure all text and meaningful UI elements on the success screen meet WCAG AA contrast standards
- **Elements to check:**
  - Progress bar colors (#FFA726, #42A5F5, #66BB6A) against nutrition plan background (#F8F5FF)
  - Text within milestone box (#E8E2FF)
  - All other text against backgrounds in both light and dark modes
- **Action:** Use contrast checking tool (Figma plugin or web-based) to verify ratios. Collaborate with Design to adjust any failing colors

## 2. Navigation Hook Migration

**Title:** Migrate SuccessScreen to use useFocusEffect for better timing control
**Description:**

- Replace useEffect with useFocusEffect once OnboardingFlow migrates to React Navigation
- This ensures animations trigger only when screen is fully focused
- More reliable than setTimeout approach

## 3. Implement Reduce Motion Support

**Title:** Add reduce motion support to SuccessScreen confetti
**Priority:** HIGH - Accessibility requirement
**Implementation:**

```typescript
useEffect(() => {
  let isMounted = true;
  let confettiTimer: NodeJS.Timeout;

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  const triggerConfetti = async () => {
    try {
      const reduceMotionEnabled =
        await AccessibilityInfo.isReduceMotionEnabled();

      if (isMounted && !reduceMotionEnabled) {
        confettiTimer = setTimeout(() => {
          setShowConfetti(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to read accessibility info:', error);
    }
  };

  triggerConfetti();

  return () => {
    isMounted = false;
    clearTimeout(confettiTimer);
  };
}, []);
```

## 4. Add Screen Reader Support

**Title:** Add accessibilityLabels to macro progress bars
**Priority:** HIGH - Accessibility requirement
**Implementation:**

```jsx
<View
  accessible={true}
  accessibilityLabel={`Carbohydrates: ${carbPercentage}% of daily goal, ${macros.carbs} grams`}
  accessibilityRole="progressbar"
  accessibilityValue={{ now: carbPercentage, min: 0, max: 100 }}
>
  {/* Progress bar UI */}
</View>
```

## 5. Context Error Handling Pattern

**Title:** Implement useOnboardingContext hook with proper error handling
**Implementation:**

```typescript
export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error(
      'useOnboardingContext must be used within an OnboardingProvider'
    );
  }
  return context;
};
```

## 6. Performance Optimization

**Title:** Optimize berry image and consider WebP format
**Description:**

- Current image is 140x140 PNG
- Convert to WebP for smaller file size
- Ensure image is properly optimized (under 50KB)
