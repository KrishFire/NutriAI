import tokensRaw from '../../tokens.json';

// Helper function to convert rem to pixels (assuming 1rem = 16px)
function remToNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Parse rem values
    if (value.endsWith('rem')) {
      const remValue = parseFloat(value.replace('rem', ''));
      return remValue * 16; // 1rem = 16px base
    }
    // Parse px values
    if (value.endsWith('px')) {
      return parseFloat(value.replace('px', ''));
    }
    // Try to parse as number
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Helper to convert object with rem values to numbers
function convertRemObject<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      typeof value === 'string' &&
      (value.includes('rem') || value.includes('px'))
    ) {
      result[key] = remToNumber(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertRemObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Convert spacing values from rem to numbers
const spacingNumeric = convertRemObject(tokensRaw.spacing);

// Convert borderRadius values from rem to numbers
const borderRadiusNumeric = convertRemObject(tokensRaw.borderRadius);

// Convert fontSize values from rem to numbers
const fontSizeNumeric = convertRemObject(tokensRaw.fontSize);

// Create processed tokens object
const tokens = {
  ...tokensRaw,
  spacing: spacingNumeric,
  borderRadius: borderRadiusNumeric,
  fontSize: fontSizeNumeric,
};

// Re-export all tokens
export const colors = tokens.colors;
export const spacing = tokens.spacing;
export const borderRadius = tokens.borderRadius;
export const fontSize = tokens.fontSize;
export const boxShadow = tokens.boxShadow;
export const constants = tokens.constants;

// Export specific constants for easy access
export const TAB_BAR_HEIGHT = tokens.constants.TAB_BAR_HEIGHT;

// Export the full tokens object as default
export default tokens;
