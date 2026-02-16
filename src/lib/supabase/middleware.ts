import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/api/health',
  '/api/stripe/webhook',
  '/api/email/webhook',
  '/api/cron',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  )
}

function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin',
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
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
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && !isPublicRoute(pathname) && pathname !== '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    response = NextResponse.redirect(redirectUrl)
  }

  addSecurityHeaders(response)

  return response
}
