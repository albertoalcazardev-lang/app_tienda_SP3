import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Mercado',
  slug: 'mercado-us01',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mercado',
  userInterfaceStyle: 'light',
  ios: {
    icon: './assets/expo.icon',
    config: { usesNonExemptEncryption: false },
  },
  android: {
    package: 'com.mercado.us01',
    adaptiveIcon: {
      backgroundColor: '#EEF0FA',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F5F6FC',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    ['expo-secure-store', { configureAndroidBackup: true }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
