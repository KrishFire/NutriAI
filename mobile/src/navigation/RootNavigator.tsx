import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import {
  RootStackParamList,
  AuthStackParamList,
  AppTabParamList,
  HomeStackParamList,
  HistoryStackParamList,
  ProfileStackParamList,
  AddMealStackParamList,
  OnboardingStackParamList,
} from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import ExpandableFAB from '../components/ExpandableFAB';

// Import navigators
import OnboardingStack from './OnboardingStack';
import BottomTabNavigator from './BottomTabNavigator';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DeleteAccountScreen from '../screens/auth/DeleteAccountScreen';

// Import old screens for compatibility
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import MealDetailsScreen from '../screens/MealDetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TextInputScreen from '../screens/food-input/TextInputScreen';
import AnalyzingScreen from '../screens/food-input/AnalyzingScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import VoiceLogScreen from '../screens/VoiceLogScreen';
import PaywallScreen from '../screens/premium/PaywallScreen';
import FoodResultsScreen from '../screens/food-input/FoodResultsScreen';
import MealSavedScreen from '../screens/MealSavedScreen';
import RefineWithAIScreen from '../screens/RefineWithAIScreen';
import AddMoreScreen from '../screens/AddMoreScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const AddMealStack = createNativeStackNavigator<AddMealStackParamList>();

// Close button component for modal exit
function CloseButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.getParent()?.goBack()}
      style={{ padding: 4 }}
    >
      <Ionicons name="close" size={24} />
    </TouchableOpacity>
  );
}

function AddMealStackNavigator() {
  return (
    <AddMealStack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
      }}
    >
      <AddMealStack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          headerShown: false, // CameraScreen has its own header
        }}
        initialParams={{}}
      />
      <AddMealStack.Screen
        name="ManualEntry"
        component={TextInputScreen}
        options={{
          headerShown: false, // TextInputScreen has its own header
        }}
        initialParams={undefined}
      />
      <AddMealStack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{
          headerShown: false, // BarcodeScannerScreen has its own header
        }}
        initialParams={undefined}
      />
      <AddMealStack.Screen
        name="VoiceLog"
        component={VoiceLogScreen}
        options={{
          headerShown: false, // VoiceLogScreen has its own header
        }}
      />
    </AddMealStack.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </AuthStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <HistoryStack.Screen name="HistoryScreen" component={HistoryScreen} />
    </HistoryStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// FAB wrapper component that can access navigation
function FABWithNavigation() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ExpandableFAB
      onCameraPress={() =>
        navigation.navigate('AddMealFlow', { screen: 'Camera' })
      }
      onManualPress={() =>
        navigation.navigate('AddMealFlow', { screen: 'ManualEntry' })
      }
      onBarcodePress={() =>
        navigation.navigate('AddMealFlow', { screen: 'BarcodeScanner' })
      }
    />
  );
}

function AppTabNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <FABWithNavigation />
    </View>
  );
}

function AppStack() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{
          presentation: 'card',
        }}
      />
      {/* Legacy tab navigator for compatibility */}
      <RootStack.Screen
        name="AppTabs"
        component={AppTabNavigator}
        options={{
          presentation: 'card',
        }}
      />
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen
          name="AddMealFlow"
          component={AddMealStackNavigator}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </RootStack.Group>
      <RootStack.Screen
        name="MealDetails"
        component={MealDetailsScreen}
        options={{
          title: 'Meal Details',
          headerShown: true,
          animation: 'slide_from_right',
        }}
      />
      {/* Food Input Screens */}
      <RootStack.Screen
        name="TextInput"
        component={TextInputScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="VoiceLog"
        component={VoiceLogScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="CameraInput"
        component={CameraScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="BarcodeInput"
        component={BarcodeScannerScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="AnalyzingScreen"
        component={AnalyzingScreen}
        options={{
          headerShown: false,
          animation: 'fade',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="FoodResultsScreen"
        component={FoodResultsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="RefineWithAIScreen"
        component={RefineWithAIScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Screen
        name="AddMoreScreen"
        component={AddMoreScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen
          name="PaywallModal"
          component={PaywallScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <RootStack.Screen
          name="MealSaved"
          component={MealSavedScreen}
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const {
    user,
    loading,
    preferences,
    preferencesLoading,
    hasCompletedOnboarding,
  } = useAuth();

  // Log for debugging
  console.log('RootNavigator render:', {
    user: !!user,
    hasCompletedOnboarding,
    loading,
    preferencesLoading,
  });

  // Show loading spinner while checking auth state
  if (loading || preferencesLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <LoadingIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        // User is not authenticated - show onboarding/auth flow
        <OnboardingStack />
      ) : !hasCompletedOnboarding ? (
        // User is authenticated but hasn't completed onboarding
        <OnboardingStack />
      ) : (
        // User is authenticated and has completed onboarding - show main app
        <AppStack />
      )}
    </NavigationContainer>
  );
}
