# DecimalSlider Component

A React Native wrapper component that safely handles decimal values in sliders by converting them to integers for the native layer, solving the "Loss of precision during arithmetic conversion" error.

## Problem

React Native's Slider component on iOS can throw precision errors when using floating-point values:

```
Error: Exception in HostFunction: Loss of precision during arithmetic conversion: (long long) 0.2
```

This occurs because the native iOS layer expects integer values but receives floating-point numbers, causing type conversion issues in React Native's bridge.

## Solution

DecimalSlider wraps the native Slider component and:

1. Converts all decimal values to integers before passing to native layer
2. Handles the conversion back to decimals for your app logic
3. Auto-calculates precision factor based on step size (V2 feature)
4. Ensures all values are explicitly rounded to prevent precision issues

## Usage

```tsx
import DecimalSlider from '@/components/common/DecimalSlider';

// Basic usage
<DecimalSlider
  minimumValue={0.2}
  maximumValue={3.0}
  value={selectedSpeed}
  onValueChange={handleSpeedChange}
  step={0.1}
/>

// With custom precision factor (optional)
<DecimalSlider
  minimumValue={0.0}
  maximumValue={100.0}
  value={percentage}
  onValueChange={setPercentage}
  step={0.01}
  precisionFactor={100} // Optional - auto-calculated if not provided
/>
```

## V2 Features

1. **Auto-calculated Precision Factor**: No need to manually specify `precisionFactor`. The component automatically calculates it based on the decimal places in your `step` prop.

2. **Enhanced Rounding**: All values are explicitly rounded using `Math.round()` before any operations to ensure maximum compatibility.

3. **Value Clamping**: Ensures the value stays within min/max bounds even with floating-point precision issues.

4. **Memoized Calculations**: Uses React's `useMemo` to prevent unnecessary recalculations and ensure stable integer values.

## Props

- `value`: number - The decimal value to display
- `onValueChange`: (value: number) => void - Callback with decimal value
- `minimumValue`: number - Minimum decimal value
- `maximumValue`: number - Maximum decimal value
- `step`: number - Step size in decimal (default: 0.1)
- `precisionFactor`: number (optional) - Multiplier for conversion (auto-calculated from step if not provided)
- All other Slider props are passed through

## Implementation Details

The component works by:

1. Converting your decimal values (e.g., 0.2, 1.5, 3.0) to integers (2, 15, 30)
2. Passing only integers to the native Slider
3. Converting back to decimals when values change
4. Ensuring proper rounding at each step to avoid accumulating precision errors
