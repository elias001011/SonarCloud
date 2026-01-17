import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sonarcloud.app',
  appName: 'SonarCloud',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
