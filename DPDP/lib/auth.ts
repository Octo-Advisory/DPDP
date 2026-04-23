import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://64.227.187.13:82//';

export interface UserSession {
    user: string; // email/user_id
    name: string;
}

export async function login(usr: string, pwd: string): Promise<UserSession> {
    const res = await fetch(`${FRAPPE_URL}/api/method/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ usr, pwd })
    });

    if (!res.ok) {
        throw new Error('Invalid credentials');
    }

    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');

    if (setCookie) {
        // Simple extraction for 'sid'. 
        // In a real robust app we might parse all cookies, but 'sid' is the key.
        const sidMatch = setCookie.match(/sid=([^;]+)/);
        if (sidMatch) {
            const sid = sidMatch[1];
            const cookieStore = await cookies();

            cookieStore.set('sid', sid, {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                // secure: process.env.NODE_ENV === 'production' 
            });

            // Store basic user info in cookies for easy access (optional, but helpful)
            cookieStore.set('system_user', 'yes', { path: '/' });
            cookieStore.set('user_id', usr, { path: '/' });
            if (data.full_name) {
                cookieStore.set('full_name', data.full_name, { path: '/' });
            }
        }
    }

    return {
        user: usr,
        name: data.full_name || usr
    };
}

export async function logout() {
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;

    if (sid) {
        try {
            await fetch(`${FRAPPE_URL}/api/method/logout`, {
                headers: { Cookie: `sid=${sid}` }
            });
        } catch (e) {
            // Ignore logout errors
        }
    }

    cookieStore.delete('sid');
    cookieStore.delete('system_user');
    cookieStore.delete('user_id');
    cookieStore.delete('full_name');
    cookieStore.delete('session'); // Clean up old session cookie if exists
}

export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;

    if (!sid) return null;

    // We can optimistically return the cookie values to avoid a fetch on every request,
    // but verifying with Frappe is safer.
    // For performance, let's Verify.

    try {
        const res = await fetch(`${FRAPPE_URL}/api/method/frappe.auth.get_logged_user`, {
            method: 'GET',
            headers: {
                Cookie: `sid=${sid}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            return {
                user: cookieStore.get('user_id')?.value || data.message,
                name: cookieStore.get('full_name')?.value || data.message,
            };
        }
    } catch (error) {
        console.error("Auth check failed", error);
    }

    return null;
}

export async function updateSession(request: NextRequest) {
    // Pass-through for now, Frappe handles expiration via the 'sid' on server side.
    return NextResponse.next();
}
