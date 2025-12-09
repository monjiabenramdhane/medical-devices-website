// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_LOGIN_PATH = '/admin/login';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Always allow NextAuth API routes
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Always allow the login page (exact match and with trailing slash)
    if (pathname === ADMIN_LOGIN_PATH || pathname === `${ADMIN_LOGIN_PATH}/`) {
        return NextResponse.next();
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

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
