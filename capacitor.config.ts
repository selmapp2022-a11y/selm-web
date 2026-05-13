import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.selmapp.app',
  appName: 'SELM',
  webDir: 'dist',
  ios: {
    // Don't auto-pad — we handle safe-area insets in CSS so the layout
    // controls exactly where content sits relative to the notch and
    // home-indicator.
    contentInset: 'never',
  },
  plugins: {
    StatusBar: {
      // Match the brand navy header so the status bar text reads cleanly.
      style: 'DARK',
      backgroundColor: '#183048',
      overlaysWebView: false,
    },
    SplashScreen: {
      // The splash overlay was lingering on Android and visually doubling
      // the dashboard. Disable it for now — the WebView shows a brand-navy
      // background while the React app boots, which is fast enough that
      // the user doesn't see a blank flash.
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#183048',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
