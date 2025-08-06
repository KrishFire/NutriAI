export const colors = {
  primary: '#320DFF',
  white: '#FFFFFF',
  black: '#000000',
  text: '#1F2937', // gray-900
  textSecondary: '#6B7280', // gray-600
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  red: {
    500: '#EF4444',
    600: '#DC2626',
  },
  macro: {
    carbs: '#FFA726',
    protein: '#42A5F5',
    fat: '#66BB6A',
  },
};

export const typography = {
  // Headers
  screenTitle: {
    fontSize: 20, // Rounded from 20.4
    fontWeight: 'bold',
    color: colors.text,
  },
  screenSubtitle: {
    fontSize: 14, // Rounded from 13.6
    color: colors.textSecondary,
  },
  
  // Body text
  body: {
    fontSize: 14,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 12,
    color: colors.text,
  },
  caption: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  
  // Special text
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
};

const theme = { colors, typography, spacing, borderRadius, shadows };
export default theme;