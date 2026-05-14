import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gaodeg.languagetranslator',
  appName: 'Language Translator',
  webDir: 'dist',
  server: {
    url: 'https://four-language-translator.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
