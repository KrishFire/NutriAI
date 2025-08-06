# Bug Fix: Navigation Context Error in SubscriptionScreen

## Issue Summary

**Error**: "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?"
**Location**: SubscriptionScreen.tsx:15 at useOnboarding() call
**Trigger**: User pressing "monthly" button to switch subscription plans

## Root Cause Analysis

### The Real Problem

The error message was misleading. The actual issue was:

1. **OnboardingContext Loss**: Not a navigation context issue, but an OnboardingContext issue
2. **Animation-Induced Unmount**: The `AnimatePresence` component with `exitBeforeEnter` prop was causing the component tree to unmount during transitions
3. **Context Provider Disconnect**: During the unmount phase, child components lost access to the OnboardingContext

### Technical Details

- The deprecated `exitBeforeEnter` prop in AnimatePresence forces complete unmount before mounting the new component
- During this gap, `useOnboarding()` hook couldn't find its context provider
- The error propagated up through: SubscriptionScreen → OnboardingFlow → OnboardingStack → RootNavigator

## Solution Applied

### 1. Updated AnimatePresence Usage

```tsx
// Before (problematic):
<AnimatePresence exitBeforeEnter>
  <MotiView key={selectedPlan}>
    {planContent}
  </MotiView>
</AnimatePresence>

// After (fixed):
<AnimatePresence mode="wait">
  <MotiView key={selectedPlan}>
    {planContent}
  </MotiView>
</AnimatePresence>
```

### 2. Enhanced Error Messages

Added more descriptive error messaging in the useOnboarding hook to help debug similar issues in the future.

### 3. Created SafeAnimatePresence Component

A wrapper component that prevents context loss during animations and automatically uses the correct API.

## Prevention Measures

### Best Practices

1. **Always use `mode="wait"`** instead of deprecated `exitBeforeEnter`
2. **Test context-dependent components** with animations enabled
3. **Use SafeAnimatePresence** wrapper for components that depend on React Context
4. **Memoize heavy computations** but don't rely on it to prevent context loss

### Testing

Added comprehensive tests to verify:

- Plan switching maintains context access
- No errors during animation transitions
- All user interactions work correctly

## Lessons Learned

1. Error messages from React hooks can be misleading when the actual error occurs deeper in the stack
2. Animation libraries can cause subtle bugs by unmounting components at unexpected times
3. Deprecated API usage (exitBeforeEnter) can lead to hard-to-debug issues
4. Always verify context availability after animation transitions in tests

## Related Files Modified

- `/mobile/src/screens/onboarding/SubscriptionScreen.tsx` - Fixed AnimatePresence usage
- `/mobile/src/screens/onboarding/OnboardingFlow.tsx` - Enhanced error messages
- `/mobile/src/components/onboarding/SafeAnimatePresence.tsx` - Created safe wrapper
- `/mobile/src/screens/onboarding/__tests__/SubscriptionScreen.test.tsx` - Added tests
