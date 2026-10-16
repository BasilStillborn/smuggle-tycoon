import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smuggletycoon.app',
  appName: 'Smuggle Tycoon',
  webDir: 'dist',
  backgroundColor: '#0a0a0a',
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
  },
};

export default config;
