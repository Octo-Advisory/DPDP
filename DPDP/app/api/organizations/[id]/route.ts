import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(`sid=${sid}`);

    try {
        const json = await request.json();
        // Map fields to Frappe
        const org = await client.updateDoc('Organization_dpdp', params.id, {
            organization_name: json.name,
            industry: json.industry,
            geography: json.geography,
        });
        return NextResponse.json(org);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message || 'Error updating organization' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(`sid=${sid}`);

    try {
        // Warning: Frappe usually handles cascade if configured, or manual delete needed.
        // For now, simpler delete.
        await client.call('frappe.client.delete', {
            doctype: 'Organization_dpdp',
            name: params.id
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message || 'Error deleting organization' }, { status: 500 });
    }
}
