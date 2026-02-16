import type { CapacitorConfig } from '@capacitor/cli'

// Customize these values for your app
const config: CapacitorConfig = {
  appId: 'com.template.app',
  appName: 'My App',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
  },
}

export default config
