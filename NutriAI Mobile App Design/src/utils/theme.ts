import { useState, useEffect } from 'react';
// Default light theme colors
const lightColors = {
  primary: '#320DFF',
  secondary: '#7B68EE',
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#1F2937',
  border: '#E5E7EB',
  notification: '#EF4444'
};
// Default dark theme colors
const darkColors = {
  primary: '#6D56FF',
  secondary: '#9580FF',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  border: '#374151',
  notification: '#F87171'
};
// Theme hook for components
export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState(lightColors);
  useEffect(() => {
    // Check for system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark' || savedTheme !== 'light' && prefersDark;
    setIsDark(shouldUseDark);
    setColors(shouldUseDark ? darkColors : lightColors);
    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === null) {
        setIsDark(e.matches);
        setColors(e.matches ? darkColors : lightColors);
      }
    };
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  // Function to toggle theme
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setColors(newIsDark ? darkColors : lightColors);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };
  return {
    colors,
    isDark,
    toggleTheme
  };
};