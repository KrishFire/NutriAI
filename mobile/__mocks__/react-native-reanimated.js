const React = require('react');
const {
  View,
  Text,
  Image,
  Animated,
  ScrollView,
  FlatList,
  SectionList,
} = require('react-native');

const ReanimatedView = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref })
);
const ReanimatedText = React.forwardRef((props, ref) =>
  React.createElement(Text, { ...props, ref })
);
const ReanimatedImage = React.forwardRef((props, ref) =>
  React.createElement(Image, { ...props, ref })
);
const ReanimatedScrollView = React.forwardRef((props, ref) =>
  React.createElement(ScrollView, { ...props, ref })
);
const ReanimatedFlatList = React.forwardRef((props, ref) =>
  React.createElement(FlatList, { ...props, ref })
);

const Reanimated = {
  default: {
    createAnimatedComponent: component => component,
    View: ReanimatedView,
    Text: ReanimatedText,
    Image: ReanimatedImage,
    ScrollView: ReanimatedScrollView,
    FlatList: ReanimatedFlatList,
    SectionList: React.forwardRef((props, ref) =>
      React.createElement(SectionList, { ...props, ref })
    ),
  },

  // Layout animations
  FadeIn: { duration: () => ({ duration: 300 }) },
  FadeOut: { duration: () => ({ duration: 300 }) },
  SlideInRight: { duration: () => ({ duration: 300 }) },
  SlideOutLeft: { duration: () => ({ duration: 300 }) },
  SlideInUp: { duration: () => ({ duration: 300 }) },
  SlideOutDown: { duration: () => ({ duration: 300 }) },

  // Hooks
  useAnimatedStyle: () => ({}),
  useSharedValue: initialValue => ({ value: initialValue }),
  useAnimatedProps: () => ({}),
  useDerivedValue: fn => ({ value: fn() }),
  useAnimatedGestureHandler: () => ({}),
  useAnimatedRef: () => React.createRef(),
  useAnimatedScrollHandler: () => ({}),

  // Functions
  runOnJS: fn => fn,
  runOnUI: fn => fn,
  withTiming: (toValue, options, callback) => toValue,
  withSpring: (toValue, options, callback) => toValue,
  withDecay: (options, callback) => 0,
  withDelay: (delay, animation) => animation,
  withSequence: (...animations) => animations[animations.length - 1],
  withRepeat: (animation, numberOfReps, reverse) => animation,
  cancelAnimation: () => {},

  // Easing
  Easing: {
    linear: t => t,
    ease: t => t,
    quad: t => t,
    cubic: t => t,
    poly: n => t => t,
    sin: t => t,
    circle: t => t,
    exp: t => t,
    elastic:
      (bounciness = 1) =>
      t =>
        t,
    back:
      (s = 1.70158) =>
      t =>
        t,
    bounce: t => t,
    bezier: (x1, y1, x2, y2) => t => t,
    in: easing => easing,
    out: easing => easing,
    inOut: easing => easing,
  },

  // Interpolation
  interpolate: (value, inputRange, outputRange, extrapolate) => value,
  Extrapolate: {
    EXTEND: 'extend',
    CLAMP: 'clamp',
    IDENTITY: 'identity',
  },

  // Colors
  interpolateColor: (value, inputRange, outputRange) => outputRange[0],

  // Gesture handler integration
  Gesture: {
    Tap: () => ({ enabled: () => {} }),
    Pan: () => ({ enabled: () => {} }),
    Pinch: () => ({ enabled: () => {} }),
    Rotation: () => ({ enabled: () => {} }),
    Fling: () => ({ enabled: () => {} }),
    LongPress: () => ({ enabled: () => {} }),
    ForceTouch: () => ({ enabled: () => {} }),
  },
  GestureDetector: ({ children }) => children,
};

module.exports = {
  ...Reanimated,
  default: {
    ...Reanimated.default,
    ...Reanimated,
  },
  // Export everything as named exports too
  createAnimatedComponent: Reanimated.default.createAnimatedComponent,
  View: ReanimatedView,
  Text: ReanimatedText,
  Image: ReanimatedImage,
  ScrollView: ReanimatedScrollView,
  FlatList: ReanimatedFlatList,
};
