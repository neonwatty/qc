export function sanitizeRedirect(url: string | null | undefined, fallback = '/dashboard'): string {
  if (!url || typeof url !== 'string') return fallback
  // Must start with exactly one slash and not be protocol-relative (//)
  if (!url.startsWith('/') || url.startsWith('//')) return fallback
  return url
}
