// Mock for NativeWind
module.exports = {
  styled: Component => Component,
  // Export the original component for className prop support
  StyledComponent: props => props.children,
};
