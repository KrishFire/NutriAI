const React = require('react');
const { View } = require('react-native');

const MotiView = ({ children, ...props }) => {
  return React.createElement(View, props, children);
};

const MotiText = ({ children, ...props }) => {
  const { Text } = require('react-native');
  return React.createElement(Text, props, children);
};

const MotiPressable = ({ children, ...props }) => {
  const { Pressable } = require('react-native');
  return React.createElement(Pressable, props, children);
};

const AnimatePresence = ({ children, ...props }) => {
  return React.createElement(React.Fragment, null, children);
};

module.exports = {
  MotiView,
  MotiText,
  MotiPressable,
  AnimatePresence,
  // Animation helpers
  useDynamicAnimation: () => ({
    animateTo: jest.fn(),
    current: {},
  }),
  useAnimationState: () => ({
    transitionTo: jest.fn(),
    current: 'from',
  }),
};
