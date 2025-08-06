# Reanimated Worklet Troubleshooting

## Issue

Getting "Functions cannot be used as 'worklet'" error for `polarToCartesian` and `describeArc` functions.

## Solutions Applied

1. **Fixed the background circle rendering**
   - The background circle was calling `describeArc` outside of a worklet context
   - Now using a regular React.useMemo to create the background path

2. **Verified babel.config.js**
   - `react-native-reanimated/plugin` is correctly placed at the end of the plugins array
   - This is critical for the plugin to work properly

## Additional Troubleshooting Steps

If the error persists, try these steps in order:

### 1. Clear Metro Cache

```bash
# Stop the Metro bundler if running
# Then run:
npx expo start -c
```

### 2. Clear All Caches (Nuclear Option)

```bash
# From the mobile directory
rm -rf node_modules
rm -rf .expo
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build

# If using npm
npm cache clean --force
npm install

# If using yarn
yarn cache clean
yarn install

# For iOS
cd ios && pod install && cd ..

# Start with cache clear
npx expo start -c
```

### 3. Verify Reanimated Version

Make sure you're using a compatible version of react-native-reanimated:

```bash
npm list react-native-reanimated
```

### 4. Check for Conflicting Babel Transforms

Ensure no other babel plugins are interfering with the worklet transform.

### 5. Alternative Solution (if all else fails)

If the worklet error persists, you can try moving the helper functions inside the component or using `runOnUI`:

```typescript
const AnimatedSegment: React.FC<AnimatedSegmentProps> = ({ ... }) => {
  const animatedProps = useAnimatedProps(() => {
    'worklet';

    // Define the functions inside the worklet
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      if (endAngle - startAngle === 0) return '';
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
    };

    // ... rest of the logic
  });
};
```

## Verification

After applying fixes and clearing caches, the worklet functions should work properly.
