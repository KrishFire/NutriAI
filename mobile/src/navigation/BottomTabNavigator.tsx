import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Plus, TrendingUp, User } from 'lucide-react-native';
import { hapticFeedback } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, colors } from '../utils/tokens';

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

  // Use solid background instead of blur for consistent appearance
  const TabBarComponent = View;
  const tabBarProps = {};

  return (
    <TabBarComponent
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: constants.TAB_BAR_HEIGHT + insets.bottom,
          backgroundColor: '#FFFFFF',
        },
      ]}
      {...tabBarProps}
    >
      <View
        className="flex-row items-center justify-around"
        style={[
          {
            height: constants.TAB_BAR_HEIGHT,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          },
        ]}
      >
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
            const iconColor = isFocused ? colors.primary.DEFAULT : '#9CA3AF';

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
                className="items-center justify-center"
                style={{ marginTop: -20 }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#320DFF',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Plus size={24} color="#FFFFFF" />
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#FFFFFF',
                      fontWeight: '500',
                      position: 'absolute',
                      bottom: 10,
                    }}
                  >
                    Log
                  </Text>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center"
              style={{ paddingTop: 6, paddingBottom: 4 }}
            >
              <View className="items-center">
                {getIcon()}
                <Text
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    color: isFocused ? '#320DFF' : '#9CA3AF',
                    fontWeight: isFocused ? '500' : '400',
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </TabBarComponent>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
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
