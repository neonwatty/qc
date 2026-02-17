import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/api/health',
  '/api/email/webhook',
  '/api/cron',
  '/onboarding',
  '/invite',
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
