import { cookies } from 'next/headers';
import { FrappeClient } from '@/lib/frappe/client';
import CreateAssessmentForm from './form';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function NewAssessmentPage() {
    const session = await getSession();
    if (!session) {
        return redirect('/api/auth/logout');
    }

    try {
        const cookieStore = await cookies();
        const sid = cookieStore.get('sid')?.value;
        const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

        // Fetch Organizations
        const orgsData = await client.getList<any>('Organization_dpdp', undefined, ['*']) || [];

        // Sanitize Orgs
        const safeOrgs = (orgsData || [])
            .filter((o: any) => o && typeof o === 'object')
            .map((o: any) => ({
                id: String(o.name || ''),
                name: String(o.organization_name || o.name || 'Unnamed Organization')
            }));

        // Fetch Active Version (Updated Doctype Name)
        const versions = await client.getList<any>('Questionnaire_Version_dpdp', [['active', '=', 1]], ['*']) || [];

        // Find best version
        const safeVersions = Array.isArray(versions) ? versions : [];
        let version: any = undefined;

        // Try to favor v2.0 since we just seeded it
        const preferredTags = ['DPDP v2.0', 'India DPDP v2.0', 'v2.0', 'Official', 'v1.0'];

        for (const tag of preferredTags) {
            version = safeVersions.find((v: any) => v && v.version_id && String(v.version_id).includes(tag));
            if (version) break;
        }

        if (!version && safeVersions.length > 0) {
            version = safeVersions[0];
        }

        const validVersionId = version && version.name ? String(version.name) : '';

        return (
            <div className="max-w-2xl mx-auto space-y-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Start New Assessment</h1>
                {validVersionId ? (
                    <CreateAssessmentForm organizations={safeOrgs} versionId={validVersionId} />
                ) : (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <h3 className="font-bold text-lg mb-2">Configuration Error</h3>
                        <p>No active <strong>Questionnaire Version</strong> found.</p>
                        <p className="text-sm mt-4 text-stone-600">
                            Please go to Frappe Desk and create a "Questionnaire_Version_dpdp" with <strong>Active</strong> checked.
                        </p>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error loading New Assessment page:", error);
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-2">System Error</h2>
                    <p className="mb-4">Unable to load assessment configuration. This could be due to:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700 ml-2">
                        <li>Missing database tables (DocTypes) in Frappe.</li>
                        <li>Connection issues with the backend server.</li>
                        <li>Insufficient permissions for the current user.</li>
                    </ul>
                    <p className="mt-6 text-sm italic opacity-75">
                        Technical Details: {String(error)}
                    </p>
                </div>
            </div>
        );
    }
}
