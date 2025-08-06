// Utility for haptic feedback
export const hapticFeedback = {
  // Light tap for UI element selection
  selection: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  // Medium tap for UI element activation
  impact: () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  // Long tap for success feedback
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 50, 30]);
    }
  },
  // Sharp tap for error feedback
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10, 30, 10]);
    }
  },
  // Two taps for warning feedback
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  }
};