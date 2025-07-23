import React from 'react';

const Svg = ({ children, ...props }) => React.createElement('svg', props, children);
const Path = ({ ...props }) => React.createElement('path', props);
const Rect = ({ ...props }) => React.createElement('rect', props);
const Circle = ({ ...props }) => React.createElement('circle', props);
const G = ({ children, ...props }) => React.createElement('g', props, children);
const Defs = ({ children, ...props }) => React.createElement('defs', props, children);
const ClipPath = ({ children, ...props }) => React.createElement('clipPath', props, children);
const LinearGradient = ({ children, ...props }) => React.createElement('linearGradient', props, children);
const Stop = ({ ...props }) => React.createElement('stop', props);

export {
  Svg,
  Path,
  Rect,
  Circle,
  G,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
};

export default Svg;