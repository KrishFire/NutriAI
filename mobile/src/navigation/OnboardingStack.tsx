import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  const { completeOnboarding } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingFlow">
        {(props) => <OnboardingFlow {...props} onComplete={completeOnboarding} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}