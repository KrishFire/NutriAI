import './global.css';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider } from './src/contexts/AuthContext';
import { StreakProvider } from './src/contexts/StreakContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeNotificationService } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Initialize notification service and set up listeners
    const cleanup = initializeNotificationService();

    // Cleanup listeners on unmount
    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <StreakProvider>
              <RootNavigator />
            </StreakProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
