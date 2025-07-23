# NutriAI Notification Service

This service provides comprehensive notification functionality for the NutriAI app, including daily reminders and calorie progress notifications.

## Features

- **Permission Management**: Request and check notification permissions
- **Daily Reminders**: Schedule 8 PM daily reminders to log meals
- **Progress Tracking**: Check if user has logged <75% of daily calories
- **Custom Notifications**: Send immediate notifications based on progress
- **Settings Integration**: Respects user preferences from database

## Usage

### 1. Using the Hook (Recommended)

```typescript
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const {
    isLoading,
    error,
    isDailyReminderActive,
    requestPermissions,
    enableDailyReminder,
    disableDailyReminder,
    checkCalorieProgress,
    sendProgressNotification,
    toggleNotifications,
  } = useNotifications();

  // Enable notifications
  const handleEnableNotifications = async () => {
    const result = await toggleNotifications(true);
    if (result.success) {
      console.log('Notifications enabled!');
    }
  };
}
```

### 2. Direct Service Usage

```typescript
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  checkDailyCalorieProgress,
  sendCalorieProgressNotification,
} from '../services/notifications';

// Request permissions
const { success, error } = await requestNotificationPermissions();

// Schedule daily reminder
if (success) {
  await scheduleDailyReminder(userId);
}

// Check calorie progress
const progress = await checkDailyCalorieProgress(userId);
if (progress.shouldNotify) {
  await sendCalorieProgressNotification(userId);
}
```

## Integration with User Preferences

The notification service automatically integrates with the user preferences system:

```typescript
// In ProfileScreen or Settings
const handleToggleNotifications = async () => {
  const newState = !preferences.notifications_enabled;
  
  // This will handle permissions and scheduling
  const result = await toggleNotifications(newState);
  
  if (result.success) {
    // Update database preferences
    await updatePreferences({
      notifications_enabled: newState
    });
  }
};
```

## Notification Types

### 1. Daily Reminder (8 PM)
- **Title**: "Time to log your meals! 📝"
- **Body**: "How was your nutrition today? Log your meals to track your progress."
- **Trigger**: Daily at 8:00 PM
- **Type**: `daily_reminder`

### 2. Calorie Progress Notification
- **Title**: "You've logged X% of your daily calories"
- **Body**: "X calories left to reach your X calorie goal!"
- **Trigger**: On-demand
- **Type**: `calorie_reminder`

## Component Example

```typescript
import CalorieProgressNotifier from '../components/CalorieProgressNotifier';

// In your screen
<CalorieProgressNotifier onPress={() => navigation.navigate('MealLog')} />
```

## Platform Considerations

### iOS
- Requires explicit permission request
- Notifications appear in Notification Center
- Supports notification categories and actions

### Android
- Creates notification channels for better organization
- Supports high priority notifications
- Custom vibration patterns and LED colors

## Testing

```typescript
// Send a test notification
import { sendTestNotification } from '../services/notifications';

const testNotifications = async () => {
  const result = await sendTestNotification();
  console.log('Test notification sent:', result.success);
};
```

## Error Handling

The service provides detailed error messages:

```typescript
const result = await scheduleDailyReminder(userId);
if (!result.success) {
  switch (result.error) {
    case 'Notification permissions denied':
      // Handle permission denial
      break;
    case 'Notifications are disabled in user preferences':
      // Handle preference setting
      break;
    default:
      // Handle other errors
  }
}
```

## Best Practices

1. **Always check permissions** before scheduling notifications
2. **Respect user preferences** - check `notifications_enabled` before sending
3. **Handle errors gracefully** - show appropriate messages to users
4. **Test on both platforms** - iOS and Android have different behaviors
5. **Use the hook** for component integration - it handles loading states

## Troubleshooting

### Notifications not appearing
1. Check device notification settings
2. Verify permissions are granted
3. Ensure `notifications_enabled` is true in user preferences
4. Check if app is in foreground (notifications may be silent)

### Scheduling fails
1. Verify user is authenticated
2. Check if previous notifications need to be cancelled
3. Ensure notification identifier is unique

### Progress calculation issues
1. Verify user has preferences set
2. Check if daily_calorie_goal is valid
3. Ensure meals are being logged correctly