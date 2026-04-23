import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    if (!sid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const client = new FrappeClient(`sid=${sid}`);

    try {
        const body = await request.json();
        const updated = await client.updateDoc('Assessment_dpdp', params.id, body);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error updating assessment:", error);
        return NextResponse.json({ message: error.message || 'Error updating' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

    try {
        console.log(`DEBUG: Starting deletion for assessment: ${params.id}`);

        // 1. Try to delete linked Responses (Forgiving errors)
        try {
            const responses = await client.getList<any>('Assessment_Response_dpdp', [['assessment', '=', params.id]], ['name'], 1000);
            if (responses && responses.length > 0) {
                console.log(`Deleting ${responses.length} responses...`);
                await Promise.all(responses.map(r => client.deleteDoc('Assessment_Response_dpdp', r.name)));
            }
        } catch (e) {
            console.warn("Could not clean up responses (may not exist):", e);
        }

        // 2. Try to delete linked Scoring Events (Forgiving errors)
        try {
            const events = await client.getList<any>('Scoring_Event_dpdp', [['assessment', '=', params.id]], ['name'], 1000);
            if (events && events.length > 0) {
                console.log(`Deleting ${events.length} events...`);
                await Promise.all(events.map(e => client.deleteDoc('Scoring_Event_dpdp', e.name)));
            }
        } catch (e) {
            console.warn("Could not clean up events (may not exist):", e);
        }

        // 3. Delete the Assessment itself (This is the critical one)
        await client.deleteDoc('Assessment_dpdp', params.id);

        console.log("Deletion complete!");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("CRITICAL DELETE ERROR:", error);
        return NextResponse.json({ message: error.message || 'Error deleting assessment' }, { status: 500 });
    }
}
