import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FrappeClient } from '@/lib/frappe/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;

    if (!sid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const client = new FrappeClient(`sid=${sid}`);

    try {
        const { questionId, valueScale, valueFactual, note } = await request.json();

        // Check if response exists (Updated Doctype Name)
        const existing = await client.getList<any>('Assessment_Response_dpdp', [
            ['assessment', '=', params.id],
            ['question', '=', questionId]
        ]);

        let responseId;
        
        // v2 stores the main answer in 'response_value'
        // We will combine scale/factual into this field for now
        const responseValue = valueScale || valueFactual || '';

        if (existing && existing.length > 0) {
            const doc = existing[0];
            if (!responseValue) {
                // Deselect: Delete the record
                await client.deleteDoc('Assessment_Response_dpdp', doc.name);
                responseId = null;
            } else {
                // Update
                await client.updateDoc('Assessment_Response_dpdp', doc.name, {
                    response_value: String(responseValue)
                });
                responseId = doc.name;
            }
        } else if (responseValue) {
            // Create
            const newDoc = await client.createDoc<any>('Assessment_Response_dpdp', {
                assessment: params.id,
                question: questionId,
                response_value: String(responseValue)
            });
            responseId = newDoc.name;
        }

        return NextResponse.json({ success: true, id: responseId });
    } catch (error: any) {
        console.error("Error saving response:", error);
        return NextResponse.json({ message: error.message || 'Error saving response' }, { status: 500 });
    }
}
