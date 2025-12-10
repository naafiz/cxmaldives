import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/vote', '/admin'];
    const isProtected = protectedRoutes.some(route => path.startsWith(route));

    if (isProtected) {
        const cookie = request.cookies.get('session')?.value;

        if (!cookie) {
            return NextResponse.redirect(new URL('/login', request.nextUrl));
        }

        const session = await verifySession(cookie);
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.nextUrl));
        }

        // Role checks
        if (path.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.nextUrl)); // Unauthorized for admin
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
