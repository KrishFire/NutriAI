// Application configuration

const ENV = process.env.NODE_ENV || 'development';

export const config = {
  // Environment
  env: ENV,
  isDev: ENV === 'development',
  isProd: ENV === 'production',

  // API Configuration
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Feature Flags
  features: {
    voiceInput: true,
    barcodeScanning: true,
    offlineMode: false,
    premiumFeatures: false,
  },

  // App Settings
  app: {
    defaultMealReminderTime: '20:00', // 8 PM
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['jpg', 'jpeg', 'png'],
    recentFoodsLimit: 20,
    historyDaysToShow: 30,
  },

  // Nutrition Defaults
  nutrition: {
    defaultMacroSplit: {
      proteinPercent: 30,
      carbsPercent: 40,
      fatPercent: 30,
    },
    calorieEstimationBuffer: 0.1, // 10% buffer for AI estimates
  },

  // Performance
  performance: {
    imageCacheSize: 50, // Number of images to cache
    dataCacheDuration: 5 * 60 * 1000, // 5 minutes
    debounceDelay: 300, // milliseconds
  },
};
