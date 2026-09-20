import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'app_tineda',
  slug: 'app-tineda',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'apptineda',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.organizacion.aplicacion',
    supportsTablet: true,
  },
  android: {
    ...config.android,
    package: 'com.organizacion.aplicacion',
    adaptiveIcon: {
      backgroundColor: '#E8EEF7',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    ...config.web,
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    ['expo-router', { root: 'app' }],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
      },
    ],
  ],
  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
});
