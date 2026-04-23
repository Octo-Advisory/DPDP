import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FrappeClient } from '@/lib/frappe/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: 'No IDs provided' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const sid = cookieStore.get('sid')?.value;

        if (!sid) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const client = new FrappeClient(`sid=${sid}`);

        // Delete assessments sequentially to ensure all related logic (e.g. cascading deletes in Frappe) runs
        // Or we could try Promise.all if Frappe handles it, but sequential is safer for now.
        const errors = [];
        for (const id of ids) {
            try {
                // 1. Fetch all related responses for this assessment
                const responses = await client.getList('Assessment_Response_dpdp', [['assessment', '=', id]], ['name']);
                
                // 2. Delete all related responses first (Cascading Delete)
                for (const resp of responses) {
                    await client.deleteDoc('Assessment_Response_dpdp', resp.name);
                }

                // 3. Now it is safe to delete the main assessment
                await client.deleteDoc('Assessment_dpdp', id);
            } catch (err) {
                console.error(`Failed to delete assessment ${id}`, err);
                errors.push({ id, error: String(err) });
            }
        }

        if (errors.length > 0 && errors.length === ids.length) {
            // All failed
            return NextResponse.json({ message: 'All deletions failed', errors }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Bulk delete completed',
            deletedCount: ids.length - errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Bulk delete error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
