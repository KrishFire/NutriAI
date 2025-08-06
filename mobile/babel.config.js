module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      [
        'nativewind/babel',
        {
          allowModuleTransform: true,
          runtime: 'automatic',
        },
      ],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/constants': './src/constants',
            '@/config': './src/config',
            '@/contexts': './src/contexts',
            '@/assets': './assets',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
