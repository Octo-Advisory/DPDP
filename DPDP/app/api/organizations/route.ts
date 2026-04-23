import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FrappeClient } from '@/lib/frappe/client';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;

    if (!sid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const client = new FrappeClient(`sid=${sid}`);

    try {
        const json = await request.json();
        const org = await client.createDoc('Organization_dpdp', {
            organization_name: json.name,
            industry: json.industry,
            geography: json.geography,
        });
        return NextResponse.json(org);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Error creating organization' }, { status: 500 });
    }
}
