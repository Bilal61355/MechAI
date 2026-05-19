import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mechanicai.app',
  appName: 'MechanicAI',
  webDir: 'public', // Dummy webDir since we are using server URL
  server: {
    // IMPORTANT: Replace this URL with your actual live Vercel domain!
    url: 'https://mech-ai-eight.vercel.app/',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;