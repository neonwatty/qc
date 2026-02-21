import type { CapacitorConfig } from '@capacitor/cli'

// Customize these values for your app
const config: CapacitorConfig = {
  appId: 'com.tryqc.app',
  appName: 'QC',
  webDir: 'out',
  server: {
    url: 'https://tryqc.co',
    iosScheme: 'https',
    androidScheme: 'https',
    allowNavigation: ['tryqc.co', '*.supabase.co'],
  },
  ios: {
    contentInset: 'automatic',
  },
}

export default config
