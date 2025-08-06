# Subscription State Migration Guide

## Overview

This guide explains how to migrate components to use the new bulletproof subscription state management system.

## Key Changes

### 1. Centralized Subscription State

- All subscription state is now managed in `SubscriptionContext`
- No more local `isPremium` or `selectedPlan` state in components
- Automatic abort controller management for async operations

### 2. Safe Hooks

- Use `useSubscriptionSafe()` instead of direct state management
- Use `useSubscriptionPlanSelection()` for plan selection UI
- All hooks prevent stale closures automatically

### 3. Debounced Operations

- Plan changes are automatically debounced (500ms)
- Prevents rapid toggling issues
- Concurrent operations are blocked

## Migration Steps

### Step 1: Add SubscriptionProvider to App Root

```tsx
// App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>{/* Your app content */}</SubscriptionProvider>
    </AuthProvider>
  );
}
```

### Step 2: Replace Local State with Hooks

#### Before:

```tsx
const [isPremium, setIsPremium] = useState(false);
const [selectedPlan, setSelectedPlan] = useState('free');

const handleUpgrade = async () => {
  // Manual API call
  setIsPremium(true);
};
```

#### After:

```tsx
import { useSubscriptionSafe } from '../hooks/useSubscription';

const { isPremium, plan, changePlanSafe } = useSubscriptionSafe();

const handleUpgrade = async () => {
  await changePlanSafe('monthly');
};
```

### Step 3: Update Button Handlers

#### Before:

```tsx
<TouchableOpacity onPress={() => {
  setSelectedPlan('yearly');
  handleSubscribe();
}}>
```

#### After:

```tsx
const { selectPlan, confirmSelection, isConfirming } = useSubscriptionPlanSelection();

<TouchableOpacity
  onPress={() => selectPlan('yearly')}
  disabled={isConfirming}
>
```

### Step 4: Handle Loading States

#### Before:

```tsx
const [loading, setLoading] = useState(false);
```

#### After:

```tsx
const { isLoading, isChangingPlan } = useSubscriptionSafe();
const isProcessing = isLoading || isChangingPlan;
```

### Step 5: Check Premium Features

```tsx
import { useRequiresPremium } from '../contexts/SubscriptionContext';

const { canAccess, reason } = useRequiresPremium('Advanced Analytics');

if (!canAccess) {
  return <LockedFeatureOverlay message={reason} />;
}
```

## Components to Update

### High Priority (Contains State Management):

1. `SubscriptionScreen.tsx` → Use `SubscriptionScreen.safe.tsx` as reference
2. `PaywallScreen.tsx` → Update to use `useSubscriptionSafe()`
3. `ManageSubscriptionScreen.tsx` → Replace local state
4. `PremiumBanner.tsx` → Use context for premium status

### Medium Priority (Reads Subscription State):

1. `HomeScreen.tsx` → Use `useRequiresPremium()` for features
2. `ProfileScreen.tsx` → Display subscription status from context
3. `SettingsScreen.tsx` → Update subscription section

### Low Priority (UI Only):

1. `SubscriptionPlanCard.tsx` → No changes needed
2. `PremiumFeatureCard.tsx` → No changes needed
3. `LockedFeatureOverlay.tsx` → No changes needed

## Testing Checklist

### Edge Cases to Test:

- [ ] Rapid plan toggling (monthly ↔ yearly repeatedly)
- [ ] Navigation during async operations
- [ ] Multiple simultaneous upgrade attempts
- [ ] App backgrounding during subscription
- [ ] Network failure during plan change
- [ ] Component unmounting during operation

### Expected Behavior:

- Only one operation processes at a time
- Debouncing prevents rapid API calls
- Aborted operations don't update state
- Latest state is always used in handlers
- No stale closures in async callbacks

## Common Pitfalls

### 1. Using Direct State in Closures

```tsx
// ❌ BAD - Can have stale state
const handleClick = async () => {
  await someAsyncOperation();
  if (isPremium) {
    // This might be stale!
    doSomething();
  }
};

// ✅ GOOD - Always reads latest
const { getLatestState } = useSubscriptionSafe();
const handleClick = async () => {
  await someAsyncOperation();
  const { isPremium } = getLatestState();
  if (isPremium) {
    doSomething();
  }
};
```

### 2. Not Checking Operation Status

```tsx
// ❌ BAD - Allows concurrent operations
<Button onPress={handleUpgrade}>

// ✅ GOOD - Prevents concurrent operations
<Button
  onPress={handleUpgrade}
  disabled={isOperationInProgress()}
>
```

### 3. Local Plan State

```tsx
// ❌ BAD - Can desync from actual subscription
const [localPlan, setLocalPlan] = useState('free');

// ✅ GOOD - Always synced
const { selectedPlan } = useSubscriptionPlanSelection();
```

## Performance Considerations

1. **Context Updates**: The context only updates when subscription state actually changes
2. **Memoization**: All callbacks are memoized to prevent unnecessary re-renders
3. **Abort Controllers**: Automatically cleaned up to prevent memory leaks
4. **Debouncing**: Reduces API calls and improves UX

## Need Help?

If you encounter issues during migration:

1. Check the console for warnings about concurrent operations
2. Verify SubscriptionProvider is at the app root
3. Ensure all async operations use the safe methods
4. Review the reference implementation in `SubscriptionScreen.safe.tsx`
