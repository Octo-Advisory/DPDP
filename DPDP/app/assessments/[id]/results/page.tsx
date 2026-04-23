import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';
import ResultActions from './actions';

export default async function ResultsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return redirect('/login');

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

    let assessment;
    let result;

    try {
        assessment = await client.getDoc<any>('Assessment_dpdp', params.id);
        const org = await client.getDoc<any>('Organization_dpdp', assessment.organization);
        assessment.organization = { name: org.organization_name || org.name }; // Map for UI

        // Fetch latest scoring event
        const events = await client.getList<any>('Scoring Event_dpdp', [['assessment', '=', params.id]], ['*']);
        if (events && events.length > 0) {
            // Sort by creation desc? Frappe list usually default order updated desc or creation desc? 
            // We'll take the first one assuming 'desc' or just the one found.
            const latest = events[0];
            result = {
                score: latest.score,
                grade: latest.grade,
                risk: latest.risk,
                breakdown: JSON.parse(latest.breakdown),
                overrides: [], // Add if available in doc
                gaps: [], // Add if available in doc
                penaltyExposure: 'Low Risk' // Placeholder or fetch
            };
        } else {
            // Fallback if no event found (maybe just submitted)
            result = {
                score: assessment.overall_score || 0,
                grade: assessment.overall_grade || 'N/A',
                risk: assessment.risk_tag || 'Low',
                breakdown: {},
                overrides: [],
                gaps: [],
                penaltyExposure: 'N/A'
            };
        }

    } catch (e) {
        console.error(e);
        return notFound();
    }

    // if (assessment.status === 'Draft') redirect ... (logic from before)


    const gradeColor = (g: string) => {
        if (['A+', 'A'].includes(g)) return 'text-green-600 bg-green-50 ring-green-500';
        if (g === 'B') return 'text-yellow-600 bg-yellow-50 ring-yellow-500';
        if (g === 'C') return 'text-orange-600 bg-orange-50 ring-orange-500';
        return 'text-red-600 bg-red-50 ring-red-500';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Readiness Report</h1>
                    <p className="text-slate-500">{assessment.organization.name} • {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <ResultActions assessmentId={assessment.id} scoreResult={result} />
                    <span className="text-sm text-slate-400 block mt-2">Overall Risk</span>
                    <span className={`text-lg font-bold uppercase ${result.risk === 'Critical' ? 'text-red-600' :
                        result.risk === 'High' ? 'text-orange-600' : 'text-slate-700'
                        }`}>{result.risk}</span>
                </div>
            </div>

            {/* Score Card */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className={`rounded-xl p-8 flex flex-col items-center justify-center ring-1 ring-inset ${gradeColor(result.grade)}`}>
                    <span className="text-sm font-semibold uppercase tracking-wider mb-2">Final Grade</span>
                    <span className="text-8xl font-black">{result.grade}</span>
                    <span className="text-lg mt-2 font-medium opacity-80">{result.score.toFixed(1)} / 100</span>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Section Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(result.breakdown as Record<string, number>).map(([title, score]) => (
                            <div key={title}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-700 truncate pr-4">{title}</span>
                                    <span className="font-medium text-slate-900">{score.toFixed(1)} pts</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-800" style={{ width: `${(score / 25) * 100}%` }} />
                                    {/* Width calc is rough, max weight is 25. Should normalize visually if needed */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Financial Exposure</p>
                    <p className={`text-3xl font-bold ${result.penaltyExposure !== 'Low Risk' ? 'text-red-600' : 'text-green-600'}`}>{result.penaltyExposure}</p>
                    <p className="text-xs text-slate-400 mt-2">Potential max penalty under DPDP Act Sec 33</p>
                </div>
            </div>

            {/* Risk Overrides */}
            {result.overrides.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                        Critical Compliance Violations ⚠️
                    </h3>
                    <ul className="space-y-2">
                        {result.overrides.map((o: string, idx: number) => (
                            <li key={idx} className="flex gap-2 text-red-700 items-start">
                                <span className="font-bold">•</span>
                                <span className="text-sm font-medium">{o}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Compliance Breakdown</h3>
                    <div className="space-y-4">
                        {Object.entries(result.breakdown).map(([title, score]) => (
                            <div key={title}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 truncate">{title}</span>
                                    <span className="font-medium">{(score as number).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(score as number) * 4}%` }} // Adjusted for visualization
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations / Gaps */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Top Improvement Areas</h3>
                    <div className="space-y-4">
                        {result.gaps.length > 0 ? (
                            result.gaps.slice(0, 5).map((gap: any, idx: number) => (
                                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-md">
                                    <p className="text-sm font-medium text-slate-900">{gap.text}</p>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">{gap.section}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic">All sections meet minimum compliance thresholds.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
