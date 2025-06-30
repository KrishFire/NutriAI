// Navigation hook types for type-safe navigation

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './navigation';

export type RootNavigationProp = NavigationProp<RootStackParamList>;

export type HomeScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'Home'
>;

export type CameraScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'Camera'
>;

export type MealDetailsScreenNavigationProp = NavigationProp<
  RootStackParamList,
  'MealDetails'
>;

export type MealDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'MealDetails'
>;

// Usage example:
// const navigation = useNavigation<HomeScreenNavigationProp>();
// const route = useRoute<MealDetailsScreenRouteProp>();
