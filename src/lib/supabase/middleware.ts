import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/api/health',
  '/api/email/webhook',
  '/api/email/unsubscribe',
  '/api/cron',
  '/onboarding',
  '/invite',
  '/privacy',
  '/terms',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

function isAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/check-in') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/milestones') ||
    pathname.startsWith('/photos') ||
    pathname.startsWith('/love-languages')
  )
}

function isAllowedEmail(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_EMAILS
  if (!allowedEmails) return true // no restriction if env var not set
  const list = allowedEmails.split(',').map((e) => e.trim().toLowerCase())
  return list.includes(email.toLowerCase())
}

function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Next.js uses inline scripts for hydration data (self.__next_f.push).
  // Capacitor WKWebView also injects inline scripts for the native bridge.
  // Without 'unsafe-inline', pages fail to hydrate in the browser.
  const isDev = process.env.NODE_ENV === 'development'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const extraConnectSrc = supabaseUrl && !supabaseUrl.includes('.supabase.co') ? ` ${supabaseUrl}` : ''

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: https://*.supabase.co${extraConnectSrc}`,
    "font-src 'self'",
    `connect-src 'self' https://*.supabase.co${extraConnectSrc}${isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Block users not on the allowlist
  if (user && !isAllowedEmail(user.email ?? '')) {
    await supabase.auth.signOut()
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('error', 'Access restricted')
    response = NextResponse.redirect(redirectUrl)
    addSecurityHeaders(response)
    return response
  }

  if (!user && !isPublicRoute(pathname) && pathname !== '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    response = NextResponse.redirect(redirectUrl)
    addSecurityHeaders(response)
    return response
  }

  if (user && (isAppRoute(pathname) || pathname === '/onboarding')) {
    const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

    const hasCoupleId = !!profile?.couple_id

    if (!hasCoupleId && isAppRoute(pathname)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      response = NextResponse.redirect(redirectUrl)
      addSecurityHeaders(response)
      return response
    }

    if (hasCoupleId && pathname === '/onboarding') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      response = NextResponse.redirect(redirectUrl)
      addSecurityHeaders(response)
      return response
    }
  }

  addSecurityHeaders(response)

  return response
}
