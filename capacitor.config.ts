import type { CapacitorConfig } from '@capacitor/cli'

// Customize these values for your app
const config: CapacitorConfig = {
  appId: 'com.tryqc.app',
  appName: 'QC',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
  },
}

export default config
