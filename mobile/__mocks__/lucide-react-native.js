const React = require('react');
const { View } = require('react-native');

// Mock icon component
const createIcon = name => {
  const Icon = ({ size = 24, color = '#000', ...props }) => {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        ...props,
      },
      [
        React.createElement('path', {
          key: 'path1',
          fill: color,
          d: 'M0 0h24v24H0z',
        }),
        React.createElement('path', {
          key: 'path2',
          fill: color,
          d: 'M12 2L2 12h3v8h14v-8h3z',
        }),
      ]
    );
  };
  Icon.displayName = name;
  return Icon;
};

// Export all icons used in the app
module.exports = {
  ArrowLeft: createIcon('ArrowLeft'),
  ArrowRight: createIcon('ArrowRight'),
  Check: createIcon('Check'),
  CheckCircle: createIcon('CheckCircle'),
  ChevronLeft: createIcon('ChevronLeft'),
  ChevronRight: createIcon('ChevronRight'),
  X: createIcon('X'),
  Plus: createIcon('Plus'),
  Minus: createIcon('Minus'),
  Home: createIcon('Home'),
  User: createIcon('User'),
  Settings: createIcon('Settings'),
  Camera: createIcon('Camera'),
  Mic: createIcon('Mic'),
  Search: createIcon('Search'),
  Zap: createIcon('Zap'),
  Bell: createIcon('Bell'),
  Calendar: createIcon('Calendar'),
  Clock: createIcon('Clock'),
  Star: createIcon('Star'),
  Heart: createIcon('Heart'),
  Info: createIcon('Info'),
  AlertCircle: createIcon('AlertCircle'),
  Activity: createIcon('Activity'),
  BarChart: createIcon('BarChart'),
  TrendingUp: createIcon('TrendingUp'),
  TrendingDown: createIcon('TrendingDown'),
  LogOut: createIcon('LogOut'),
  // Add more icons as needed
};
