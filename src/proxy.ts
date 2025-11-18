import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup')

  const isPrivateRoute = nextUrl.pathname.startsWith('/dashboard')

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (isPrivateRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
