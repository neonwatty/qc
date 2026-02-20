import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor 8 configuration for QC iOS app.
 *
 * Mode: Remote URL — WKWebView loads tryqc.co (not a local bundle).
 * Override with CAPACITOR_SERVER_URL for local dev testing.
 *
 * Reference: mean-weasel/bullhorn capacitor.config.ts
 */
const config: CapacitorConfig = {
  appId: 'co.tryqc.app',
  appName: 'QC',
  webDir: 'capacitor-web',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://tryqc.co',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    appendUserAgent: 'QCCapacitor',
  },
}

export default config
