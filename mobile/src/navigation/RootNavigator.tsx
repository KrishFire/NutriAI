import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
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
} from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components';
import ExpandableFAB from '../components/ExpandableFAB';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import CameraScreen from '../screens/CameraScreen';
import MealDetailsScreen from '../screens/MealDetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import VoiceLogScreen from '../screens/VoiceLogScreen';

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
      <Ionicons name="close" size={24} color="#007AFF" />
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
        component={ManualEntryScreen}
        options={{
          title: 'Manual Entry',
          headerLeft: () => <CloseButton />,
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
      <AddMealStack.Screen
        name="MealDetails"
        component={MealDetailsScreen}
        options={{
          title: 'Meal Details',
          gestureEnabled: false, // Prevent accidental swipe dismissal with data
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
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading..." overlay />;
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
