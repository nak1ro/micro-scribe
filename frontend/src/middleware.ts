import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth cookie - thin check, only verify presence
    // We check common cookie names since the backend might use different defaults
    const token = request.cookies.get('token') ||
        request.cookies.get('access_token') ||
        request.cookies.get('.AspNetCore.Identity.Application') ||
        request.cookies.get('.AspNetCore.Cookies');

    if (!token) {
        // Redirect unauthenticated users to landing page
        const landingUrl = new URL('/landing', request.url);
        return NextResponse.redirect(landingUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Only match protected routes explicitly
    matcher: ['/dashboard/:path*', '/transcriptions/:path*', '/account/:path*'],
};
