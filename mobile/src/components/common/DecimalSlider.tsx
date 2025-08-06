import React, { useMemo } from 'react';
import Slider from '@react-native-community/slider';
import type { SliderProps } from '@react-native-community/slider';

// A wrapper component that handles decimal values safely
// by converting them to integers for the native slider
interface DecimalSliderProps
  extends Omit<
    SliderProps,
    'value' | 'onValueChange' | 'step' | 'minimumValue' | 'maximumValue'
  > {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  precisionFactor?: number; // Optional - will be auto-calculated from step if not provided
  step?: number; // Step in decimal terms (e.g., 0.1)
}

export const DecimalSlider: React.FC<DecimalSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  precisionFactor,
  step = 0.1,
  accessibilityHint,
  accessibilityLabel,
  ...rest
}) => {
  // V2: Auto-derive precision factor from step if not provided
  const calculatedPrecisionFactor = useMemo(() => {
    if (precisionFactor !== undefined) {
      return precisionFactor;
    }

    // Calculate precision factor based on decimal places in step
    const stepString = step.toString();
    const decimalIndex = stepString.indexOf('.');

    if (decimalIndex === -1) {
      // No decimal point, step is a whole number
      return 1;
    }

    // Count decimal places
    const decimalPlaces = stepString.length - decimalIndex - 1;
    return Math.pow(10, decimalPlaces);
  }, [step, precisionFactor]);

  // Convert decimal step to integer step with explicit rounding
  const integerStep = Math.round(step * calculatedPrecisionFactor);

  // Handle value changes by converting back to decimal
  const handleIntegerChange = (intValue: number) => {
    // V2: Ensure all integer values are explicitly rounded before division
    const roundedIntValue = Math.round(intValue);
    const decimalValue = roundedIntValue / calculatedPrecisionFactor;

    // Ensure the value is properly rounded to avoid floating point issues
    // Round to the precision defined by step
    const stepPrecision = step.toString().split('.')[1]?.length || 0;
    const roundedValue = parseFloat(
      (Math.round(decimalValue / step) * step).toFixed(stepPrecision)
    );

    onValueChange(roundedValue);
  };

  // V2: Convert all decimal values to integers with explicit safeguards
  // Pre-calculate to ensure no floating-point operations in props
  const intMinValue = useMemo(() => {
    return Math.round(minimumValue * calculatedPrecisionFactor);
  }, [minimumValue, calculatedPrecisionFactor]);

  const intMaxValue = useMemo(() => {
    return Math.round(maximumValue * calculatedPrecisionFactor);
  }, [maximumValue, calculatedPrecisionFactor]);

  const intValue = useMemo(() => {
    // Ensure value is within bounds before converting
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, value));
    return Math.round(clampedValue * calculatedPrecisionFactor);
  }, [value, minimumValue, maximumValue, calculatedPrecisionFactor]);

  return (
    <Slider
      {...rest}
      minimumValue={intMinValue}
      maximumValue={intMaxValue}
      value={intValue}
      onValueChange={handleIntegerChange}
      step={integerStep}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityValue={{
        now: intValue,
        min: intMinValue,
        max: intMaxValue,
      }}
    />
  );
};

export default DecimalSlider;
