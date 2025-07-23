import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Home,
  Calendar,
  Plus,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { hapticFeedback } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tokens from '../../tokens.json';

// Import screens (will be created later)
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LogScreen from '../screens/LogScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Log: undefined;
  Insights: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
      style={{
        paddingBottom: insets.bottom,
        height: tokens.constants.TAB_BAR_HEIGHT + insets.bottom,
      }}
    >
      <View className="flex-row items-center justify-around h-full px-4">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const isFocused = state.index === index;

          const onPress = async () => {
            await hapticFeedback.selection();
            
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIcon = () => {
            const iconSize = label === 'Log' ? 28 : 24;
            const iconColor = isFocused 
              ? tokens.colors.primary.DEFAULT 
              : '#9CA3AF';

            switch (label) {
              case 'Home':
                return <Home size={iconSize} color={iconColor} />;
              case 'History':
                return <Calendar size={iconSize} color={iconColor} />;
              case 'Log':
                return <Plus size={iconSize} color={iconColor} />;
              case 'Insights':
                return <TrendingUp size={iconSize} color={iconColor} />;
              case 'Profile':
                return <User size={iconSize} color={iconColor} />;
              default:
                return null;
            }
          };

          // Special styling for Log (center) button
          if (label === 'Log') {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="items-center justify-center -mt-4"
              >
                <View 
                  className={`
                    w-14 h-14 rounded-full items-center justify-center
                    ${isFocused ? 'bg-primary' : 'bg-primary/90'}
                  `}
                  style={{
                    shadowColor: tokens.colors.primary.DEFAULT,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Plus size={28} color="#FFFFFF" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center py-2"
            >
              <View className="items-center">
                {getIcon()}
                <Text 
                  className={`
                    text-xs mt-1
                    ${isFocused 
                      ? 'text-primary font-medium' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}