import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/checkin/',
          '/notes/',
          '/growth/',
          '/love-languages/',
          '/reminders/',
          '/requests/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: 'https://tryqc.co/sitemap.xml',
  }
}
