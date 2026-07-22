import { NextRequest, NextResponse } from 'next/server'

const adminUser = process.env.ADMIN_USER || 'admin'
const adminPassword = process.env.ADMIN_PASSWORD || ''
const adminSecret = process.env.ADMIN_SECRET_PATH || ''

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith(`/admin/${adminSecret}`)) {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="NOIRA Admin"' },
      })
    }

    const base64 = authHeader.split(' ')[1]
    const decoded = atob(base64)
    const [user, pass] = decoded.split(':')

    if (user !== adminUser || pass !== adminPassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="NOIRA Admin"' },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
