import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chefai.app',
  appName: 'Chef AI',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#faf7f2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#faf7f2',
    },
  },
  android: {
    backgroundColor: '#faf7f2',
  },
  ios: {
    backgroundColor: '#faf7f2',
  },
};

export default config;
