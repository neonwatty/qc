/**
 * Platform detection for Capacitor iOS app.
 *
 * In remote URL mode, the Capacitor bridge JS is NOT available because
 * the WebView loads tryqc.co (not a local bundle). Therefore
 * Capacitor.isNativePlatform() does NOT work.
 *
 * Instead, we detect the native app via a custom user agent marker
 * set in capacitor.config.ts > ios.appendUserAgent.
 *
 * Reference: mean-weasel/bullhorn src/lib/capacitor.ts
 */

const USER_AGENT_MARKER = 'QCCapacitor'

/**
 * Returns true when running inside the Capacitor iOS WKWebView.
 * Works on both server (returns false) and client.
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return navigator.userAgent.includes(USER_AGENT_MARKER)
}
