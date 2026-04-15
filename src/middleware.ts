import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  let session: any = null;
  if (token) {
    session = await verifyToken(token);
  }

  // === CUSTOMER routes: only CUSTOMER can access ===
  if (pathname.startsWith('/customer')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== 'CUSTOMER') {
      // Non-customers go to their own dashboard
      if (session.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // === MONITORING dashboard routes: only MONITORING + ADMIN ===
  const isMonitoringRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/fleet') || pathname.startsWith('/map') || pathname.startsWith('/analytics');
  if (isMonitoringRoute) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role === 'CUSTOMER') return NextResponse.redirect(new URL('/customer', request.url));
    // ADMIN and MONITORING can access
  }

  // === ADMIN routes: only ADMIN ===
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role === 'MONITORING') return NextResponse.redirect(new URL('/dashboard', request.url));
    if (session.role === 'CUSTOMER') return NextResponse.redirect(new URL('/customer', request.url));
  }

  // === Protect admin-only API routes ===
  if (
    pathname.startsWith('/api/users') ||
    pathname.startsWith('/api/crew') ||
    pathname.startsWith('/api/reports') ||
    (pathname.startsWith('/api/vessels') && ['POST', 'PUT', 'DELETE'].includes(request.method))
  ) {
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // === Protect shipment API: CUSTOMER can POST, ADMIN can GET/PUT/DELETE ===
  if (pathname.startsWith('/api/shipments')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // MONITORING cannot touch shipments API
    if (session.role === 'MONITORING') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/customer/:path*', '/dashboard/:path*', '/fleet/:path*', '/map/:path*', '/analytics/:path*'],
};
