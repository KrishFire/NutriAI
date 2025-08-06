# NotificationsPermissionScreen Follow-Up Tickets

Based on review with Gemini 2.5 Pro, the following improvements were identified but deferred to maintain scope:

## 1. Add Loading State to Permission Buttons

**Priority:** Medium
**Description:** Prevent double-taps and provide user feedback during async permission requests
**Implementation:**

- Add `isSubmitting` state
- Disable both buttons during permission request
- Consider adding ActivityIndicator or changing button text

## 2. Refactor Error Handling with try/finally

**Priority:** Low
**Description:** Clean up duplicate code in handleAllow function
**Implementation:**

- Move updateUserData and goToNextStep to finally block
- Simplify permission status tracking with single isGranted variable
- Follows DRY principle

## 3. Handle Permanently Denied Permissions

**Priority:** High
**Description:** Better UX when permissions are permanently denied
**Implementation:**

- Check `canAskAgain` property from getPermissionsAsync
- If false and status is denied, show Alert with Settings redirect
- Guide users to manually enable notifications in device settings

## 4. Production Error Monitoring

**Priority:** Medium (if not already implemented)
**Description:** Replace console.error with proper error tracking
**Implementation:**

- Integrate Sentry, Bugsnag, or similar service
- Track permission request failures in production
- Monitor success rates for notification opt-in
