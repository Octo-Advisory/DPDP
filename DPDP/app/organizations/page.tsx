import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';

export default async function OrganizationsPage() {
    const session = await getSession();

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

    const [orgsData, assessmentsData] = await Promise.all([
        client.getList<any>('Organization_dpdp', undefined, ['*']),
        client.getList<any>('Assessment_dpdp', undefined, ['*'])
    ]);

    // Calculate counts
    const counts = new Map<string, number>();
    assessmentsData.forEach((a: any) => {
        const orgName = a.organization;
        counts.set(orgName, (counts.get(orgName) || 0) + 1);
    });

    const orgs = orgsData.map((org: any) => ({
        id: org.name, // Name is the ID
        name: org.organization_name || org.name,
        industry: org.industry,
        country: org.country || org.geography,
        _count: {
            assessments: counts.get(org.name) || 0
        }
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
                <Link href="/organizations/new" className="btn-primary">
                    + New Organization
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orgs.map((org) => (
                    <div key={org.id} className="card hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-600 group">
                        <h3 className="text-xl font-bold text-slate-900 mb-1 font-serif tracking-tight">{org.name}</h3>
                        <div className="text-base text-stone-500 mb-4 flex gap-2 items-center">
                            <span className="bg-stone-100 px-2 py-0.5 rounded text-sm font-medium">{org.industry}</span>
                            <span>•</span>
                            <span>{org.country}</span>
                        </div>
                        <div className="mt-4 flex justify-between items-center border-t border-stone-100 pt-4">
                            <span className="text-sm font-semibold text-slate-600 bg-stone-100 px-3 py-1 rounded-full">
                                {org._count.assessments} Assessment{org._count.assessments !== 1 ? 's' : ''}
                            </span>
                            <Link href={`/organizations/${org.id}`} className="text-amber-700 text-sm font-bold hover:text-amber-900 flex items-center gap-1 group-hover:underline decoration-amber-300 underline-offset-4 transition-all">
                                View Details <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                ))}
                {orgs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                        No organizations found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
