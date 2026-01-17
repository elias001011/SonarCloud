import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sonarcloud.app',
  appName: 'SonarCloud',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: '#0f172a'
};

export default config;