import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Perform login against Frappe
        // The login function in lib/auth now handles the remote call and cookie setting
        await login(email, password);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ message: err.message || 'Invalid credentials' }, { status: 401 });
    }
}
