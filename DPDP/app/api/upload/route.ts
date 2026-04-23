import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getStorage } from '@/lib/storage';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;

        if (!file) return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });

        const storage = getStorage();
        const url = await storage.upload(file);

        return NextResponse.json({ url });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
    }
}
