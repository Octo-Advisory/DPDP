import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';
import AssessmentList from './assessment-list';
import { log } from 'console';

export default async function AssessmentsPage() {
    const session = await getSession();
    if (!session) {
        return redirect('/api/auth/logout');
    }

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

    // Fetch Assessments and Organizations
    // We fetch all organizations to map the details since Frappe Link fields only give us the ID (name)
    const [assessmentsData, orgsData] = await Promise.all([
        client.getList<any>('Assessment_dpdp', undefined, ['*']),
        client.getList<any>('Organization_dpdp', undefined, ['name', 'industry'])
    ]);

    // Create a map for quick organization lookup
    const orgMap = new Map(orgsData.map((o: any) => [o.name, o]));
    console.log('........');
    // Map to the shape expected by the UI
    const assessments = assessmentsData.map((a: any) => {
        const orgBox = orgMap.get(a.organization);
        return {
            id: a.name,
            updatedAt: new Date(a.modified),
            status: a.status ? a.status.toUpperCase() : 'DRAFT',
            overallScore: a.overall_score,
            riskTag: a.risk_tag,
            organization: {
                // Use organization_name if available in the org object, otherwise use the link ID
                name: orgBox?.organization_name || orgBox?.name || a.organization || 'Unknown',
                industry: orgBox?.industry || 'Unknown'
            }
        };
    });

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Assessments</h1>
                <Link href="/assessments/new" className="bg-amber-600 text-white px-6 py-3 rounded-lg text-base font-bold shadow-lg shadow-amber-100 hover:bg-amber-700 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                    <span>+</span> New Assessment
                </Link>
            </div>

            <AssessmentList assessments={assessments} />
        </div>
    );
}
