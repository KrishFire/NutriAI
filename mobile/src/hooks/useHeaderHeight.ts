import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEADER_CONTENT_HEIGHT } from '../components/common/BaseHeader';

/**
 * Custom hook to calculate the total header height including safe area
 * This ensures consistent spacing across all devices
 */
export const useHeaderHeight = () => {
  const insets = useSafeAreaInsets();
  
  // Total header height = safe area top + header content height
  const headerHeight = insets.top + HEADER_CONTENT_HEIGHT;
  
  return {
    headerHeight,
    safeAreaTop: insets.top,
  };
};