import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/auth';

export async function middleware(request: NextRequest) {
    // Update session expiration if valid
    await updateSession(request);

    const currentUser = request.cookies.get('sid')?.value;

    // Protect routes (e.g., /assessments, /organizations)
    // Allow /login, /register, / (home)
    if (currentUser && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/assessments', request.url));
    }

    if (!currentUser && (
        request.nextUrl.pathname.startsWith('/assessments') ||
        request.nextUrl.pathname.startsWith('/organizations')
    )) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
