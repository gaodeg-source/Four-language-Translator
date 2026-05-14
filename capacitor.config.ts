import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gaodeg.languagetranslator',
  appName: 'Language Translator',
  webDir: 'dist',
  server: {
    url: 'https://four-language-translator.vercel.app',
    cleartext: false,
    allowNavigation: [
      '*.google.com',
      'accounts.google.com',
      'four-language-translator.vercel.app',
    ],
  },
  ios: {
    contentInset: 'always',
    // Spoof Mobile Safari so Google doesn't block OAuth in WKWebView
    customUserAgentString: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
};

export default config;
