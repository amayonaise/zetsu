import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zetsu.stream',
  appName: 'Zetsu',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
