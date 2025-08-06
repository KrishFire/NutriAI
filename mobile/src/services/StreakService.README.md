# StreakService Documentation

The StreakService provides comprehensive streak management functionality for NutriAI, including milestone tracking, celebration messages, and streak health monitoring.

## Features

- **Milestone Tracking**: Automatically detects and celebrates key milestones (7, 14, 21, 30, 50, 100, 150, 200, 365 days)
- **Streak Status**: Monitors streak health with statuses: `active`, `at_risk`, `broken`, `inactive`
- **Display Formatting**: Provides both detailed and short display formats for different UI contexts
- **Motivational Messages**: Generates contextual motivational messages based on streak status
- **Celebration Data**: Returns celebration information when users hit milestones

## Basic Usage

### Using the Service Directly

```typescript
import { StreakService } from '../services/streakService';

// Check if a streak count is a milestone
const isMilestone = StreakService.isMilestone(30); // true

// Get next milestone
const nextMilestone = StreakService.getNextMilestone(25); // 30

// Get celebration message
const celebration = StreakService.getCelebrationMessage(30, true);
// Returns: {
//   milestone: 30,
//   message: "One month milestone! You're a nutrition tracking champion! 🏅 This is your longest streak ever!",
//   emoji: "🎉",
//   isPersonalBest: true
// }

// Get comprehensive display data
const displayData = await StreakService.getStreakWithDisplayData(userId);
```

### Using the React Hook

```typescript
import { useStreak } from '../hooks/useStreak';

function MyComponent() {
  const { streakData, loading, motivationalMessage, refresh } = useStreak();

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{streakData?.displayText}</Text>
      <Text>{motivationalMessage}</Text>
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

### Using the StreakBadge Component

```typescript
import { StreakBadge } from '../components/StreakBadge';

// Compact badge for headers
<StreakBadge variant="compact" />

// Detailed badge for profile screens
<StreakBadge
  variant="detailed"
  onPress={() => navigation.navigate('StreakDetails')}
/>
```

## API Reference

### Types

```typescript
interface UserStreak {
  id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  total_days_logged: number;
  created_at?: string;
  updated_at?: string;
}

type StreakStatus = 'active' | 'at_risk' | 'broken' | 'inactive';

interface StreakDisplayData {
  currentStreak: number;
  longestStreak: number;
  status: StreakStatus;
  displayText: string;
  shortDisplayText: string;
  daysUntilNextMilestone: number | null;
  nextMilestone: number | null;
  isOnFire: boolean;
  celebrationData?: MilestoneCelebration;
}
```

### Service Methods

#### `isMilestone(streakCount: number): boolean`

Checks if a given streak count is a milestone day.

#### `getNextMilestone(currentStreak: number): number | null`

Returns the next milestone, or null if past all milestones.

#### `getCelebrationMessage(milestone: number, isPersonalBest: boolean): MilestoneCelebration`

Generates appropriate celebration message for a milestone.

#### `calculateStreakStatus(lastLogDate: string | null, currentStreak: number): StreakStatus`

Determines streak health based on last log date:

- `active`: Logged today
- `at_risk`: Haven't logged today yet (1 day since last log)
- `broken`: Missed one or more days
- `inactive`: No streak or no logs

#### `getStreakDisplayData(streak: UserStreak | null): StreakDisplayData`

Returns comprehensive display data including formatted text, status, and milestone info.

## Integration with Existing Code

The StreakService is designed to work seamlessly with the existing `updateUserStreak` function in `meals.ts`. When a meal is logged:

1. `saveMealAnalysis` is called
2. It calls `updateUserStreak` to update the database
3. Components using `useStreak` hook will automatically reflect the changes

## Streak Status Logic

| Last Log    | Current Streak | Status   | Display                                  |
| ----------- | -------------- | -------- | ---------------------------------------- |
| Today       | > 0            | active   | "X day streak 🔥"                        |
| Yesterday   | > 0            | at_risk  | "X day streak ⚠️ Log today to continue!" |
| 2+ days ago | > 0            | broken   | "X day streak ❌ Streak ended"           |
| Never/null  | 0              | inactive | "Start your streak today!"               |

## Milestones

The service tracks these milestone days:

- **Week 1**: 7 days
- **Week 2**: 14 days
- **Week 3**: 21 days (habit formation)
- **Month 1**: 30 days
- **50 days**: First major milestone
- **100 days**: Triple digits
- **150 days**: Dedication milestone
- **200 days**: Wellness warrior
- **365 days**: Full year

## Best Practices

1. **Use the Hook**: For React components, always use `useStreak` instead of calling the service directly
2. **Handle Loading States**: Always show loading indicators while streak data is fetching
3. **Celebrate Milestones**: Use `useStreakCelebration` hook to show celebration modals
4. **Cache Considerations**: The hook manages its own state and refresh logic
5. **Error Handling**: The service returns sensible defaults on error

## Example: Full Implementation

```typescript
import React from 'react';
import { View, Text, Modal } from 'react-native';
import { useStreak, useStreakCelebration } from '../hooks/useStreak';
import { StreakBadge } from '../components/StreakBadge';

function HomeScreen() {
  const { streakData, motivationalMessage } = useStreak();
  const { shouldCelebrate, celebration, dismissCelebration } = useStreakCelebration();

  return (
    <View>
      {/* Streak badge in header */}
      <StreakBadge variant="compact" />

      {/* Motivational message */}
      <Text>{motivationalMessage}</Text>

      {/* Milestone celebration modal */}
      <Modal visible={shouldCelebrate} transparent>
        <View style={styles.celebrationModal}>
          <Text style={styles.celebrationEmoji}>{celebration?.emoji}</Text>
          <Text style={styles.celebrationTitle}>Milestone Achieved!</Text>
          <Text style={styles.celebrationMessage}>{celebration?.message}</Text>
          <Button title="Continue" onPress={dismissCelebration} />
        </View>
      </Modal>
    </View>
  );
}
```

## Testing

```typescript
// Test milestone detection
expect(StreakService.isMilestone(7)).toBe(true);
expect(StreakService.isMilestone(8)).toBe(false);

// Test status calculation
const today = new Date().toISOString().split('T')[0];
expect(StreakService.calculateStreakStatus(today, 5)).toBe('active');

// Test display formatting
const mockStreak = {
  current_streak: 7,
  longest_streak: 10,
  last_log_date: today,
};
const displayData = StreakService.getStreakDisplayData(mockStreak);
expect(displayData.isOnFire).toBe(true);
expect(displayData.displayText).toContain('🔥');
```
