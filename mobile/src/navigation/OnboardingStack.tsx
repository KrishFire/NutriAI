import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';

export type OnboardingStackParamList = {
  OnboardingFlow:
    | { initialStep?: string; authMode?: 'signin' | 'signup' }
    | undefined;
};

type OnboardingFlowScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'OnboardingFlow'
>;

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  const { completeOnboarding } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="OnboardingFlow"
    >
      <Stack.Screen
        name="OnboardingFlow"
        initialParams={{ initialStep: 'welcome', authMode: 'signup' }}
      >
        {({ navigation, route }: OnboardingFlowScreenProps) => (
          <OnboardingFlow
            navigation={navigation}
            route={route}
            onComplete={completeOnboarding}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
