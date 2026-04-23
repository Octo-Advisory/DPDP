import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';
import EditOrganizationForm from './edit-form';

export default async function OrganizationDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return <div>Unauthorized</div>;

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

    let org;
    try {
        org = await client.getDoc<any>('Organization_dpdp', params.id);
        // Map fields if necessary, though edit-form expects 'org' object
        // Frappe Doc has 'name', 'organization_name', etc.
        // If edit-form expects 'id', map it.
        org.id = org.name;
        org.name = org.organization_name; // Map back for form if it expects 'name'
    } catch (e) {
        return notFound();
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EditOrganizationForm org={org} />
        </div>
    );
}
