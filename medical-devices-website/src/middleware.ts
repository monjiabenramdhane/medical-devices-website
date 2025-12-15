import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getLocaleFromRequest } from '@/lib/i18n/get-locale-from-request';

const ADMIN_LOGIN_PATH = '/admin/login';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Always allow NextAuth API routes
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Locale detection
    const locale = getLocaleFromRequest(req);

    // Always allow the login page (exact match and with trailing slash)
    if (pathname === ADMIN_LOGIN_PATH || pathname === `${ADMIN_LOGIN_PATH}/`) {
        const response = NextResponse.next();
        response.headers.set('Content-Language', locale);
        return response;
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        // Not logged in → redirect to login
        if (!token) {
            return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.url));
        }

        // Not admin → redirect to home
        if ((token as any).role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

  // Set locale for all responses
  const response = NextResponse.next();
  response.headers.set('Content-Language', locale);
  response.headers.set('Vary', 'Accept-Language, Cookie');
  
  // Ensure locale cookie is set
  if (!req.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};