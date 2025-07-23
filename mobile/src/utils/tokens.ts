import tokens from '../../tokens.json';

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