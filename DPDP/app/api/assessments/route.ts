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

        // Database requires a valid role, so we start with 'Data Fiduciary'
        // But we will keep the UI clean by hiding sections in the wizard.tsx
        const assessment = await client.createDoc('Assessment_dpdp', {
            organization: json.organizationId,
            version: json.versionId,
            identified_role: "", // Ensure discovery phase is NOT skipped
            process_children_data: 0,
            has_cross_border_transfers: 0,
            status: 'Draft',
        });

        return NextResponse.json(assessment);
    } catch (error: any) {
        console.error("Error creating assessment:", error);
        return NextResponse.json({ message: error.message || 'Error creating assessment' }, { status: 500 });
    }
}
