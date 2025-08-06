const inset = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

module.exports = {
  SafeAreaContext: {
    Consumer: ({ children }) => children(inset),
    Provider: ({ children }) => children,
  },
  SafeAreaProvider: ({ children }) => children,
  SafeAreaConsumer: ({ children }) => children(inset),
  SafeAreaView: ({ children, style, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { style, ...props }, children);
  },
  useSafeAreaInsets: () => inset,
  useSafeAreaFrame: () => ({
    x: 0,
    y: 0,
    width: 375,
    height: 812,
  }),
  withSafeAreaInsets: Component => Component,
  initialWindowMetrics: {
    insets: inset,
    frame: {
      x: 0,
      y: 0,
      width: 375,
      height: 812,
    },
  },
};
