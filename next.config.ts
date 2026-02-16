import type { NextConfig } from 'next'

const isStaticExport = process.env.STATIC_EXPORT === 'true'

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? { output: 'export' }
    : {
        output: 'standalone',
        headers: async () => [
          {
            source: '/(.*)',
            headers: securityHeaders,
          },
        ],
      }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
}

export default nextConfig
