import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FrappeClient } from '@/lib/frappe/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    // const params = await props.params; // Next.js 15 only
    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;

    if (!sid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const client = new FrappeClient(`sid=${sid}`);

    try {
        // 0. Fetch Assessment Metadata (Flags) first
        const assessmentDoc = await client.getDoc<any>('Assessment_dpdp', params.id);

        // 1. Fetch Assessment Responses
        const responses = await client.getList<any>('Assessment Response_dpdp', [['parent1', '=', params.id]]);

        if (!responses || responses.length === 0) {
            return NextResponse.json({ score: 0, grade: 'N/A', risk: 'Unknown' });
        }

        // 2. Fetch Questions to map IDs to Types and Sections
        const questionList = await client.getList<any>('Question_dpdp', undefined, ['name', 'type', 'section_link']);
        const questionMap = new Map<string, any>();
        questionList.forEach(q => questionMap.set(q.name, q));

        // 3. Fetch Sections to get Weights and Titles
        const sections = await client.getList<any>('Section_dpdp', undefined, ['name', 'weight', 'title']);
        const sectionMap = new Map<string, any>();
        sections.forEach(s => sectionMap.set(s.name, s));

        // 4. Calculate Scores
        const sectionScores = new Map<string, { total: number, count: number }>();

        // Initialize sections
        sections.forEach(s => sectionScores.set(s.name, { total: 0, count: 0 }));

        for (const resp of responses) {
            const q = questionMap.get(resp.question);
            if (!q || !q.section_link) continue;

            let score = 0;

            if (q.type === 'Scale') {
                const val = resp.value_scale || 1;
                score = (val - 1) * 25;
            } else if (q.type === 'Factual') {
                const val = resp.value_factual || '';
                if (val.startsWith('A') || val.startsWith('B')) {
                    score = 100;
                } else {
                    score = 0;
                }
            } else {
                continue;
            }

            const current = sectionScores.get(q.section_link) || { total: 0, count: 0 };
            sectionScores.set(q.section_link, {
                total: current.total + score,
                count: current.count + 1
            });
        }

        // 5. Aggregate Weighted Score & Prepare Breakdown
        let totalWeightedScore = 0;
        let totalMaxWeight = 0;

        // Breakdown must be Record<string, number> for Frontend
        const breakdown: Record<string, number> = {};

        // Gaps must be { text: string, section: string }[]
        const gaps: { text: string, section: string }[] = [];

        sectionScores.forEach((stats, sectionId) => {
            const section = sectionMap.get(sectionId);
            const title = section?.title || sectionId;
            let sectionPct = 0;

            if (stats.count > 0) {
                sectionPct = Math.round(stats.total / stats.count);
                const weight = section?.weight || 1;

                totalWeightedScore += (sectionPct * weight);
                totalMaxWeight += weight;
            }

            // Populate Breakdown Object
            breakdown[title] = sectionPct;

            // Generate Gaps if score is low
            if (sectionPct < 50) {
                gaps.push({
                    text: `Low compliance score (${sectionPct}%) indicates significant gaps.`,
                    section: title
                });
            } else if (sectionPct < 75) {
                gaps.push({
                    text: `Moderate compliance (${sectionPct}%). Process improvements recommended.`,
                    section: title
                });
            }
        });

        const rawScore = totalMaxWeight > 0 ? Math.round(totalWeightedScore / totalMaxWeight) : 0;

        // --- APPLY LOGIC FOR FLAGS ---
        let finalScore = rawScore;

        // Logic 1: Children's Data
        if (assessmentDoc.flag_childrendata === 1) {
            // Processing children's data is high risk. If not perfect, penalty is higher.
            if (finalScore < 90) {
                finalScore = Math.max(0, finalScore - 10);
            }
        }

        // Logic 2: Significant Data Fiduciary (SDF)
        if (assessmentDoc.flag_roleclassification === 'Significant Data Fiduciary') {
            // SDFs are held to the highest standard.
            if (finalScore < 95) {
                finalScore = Math.max(0, finalScore - 5);
            }
        }

        // 6. Determine Grade & Risk
        let grade = 'D';
        if (finalScore >= 90) grade = 'A';
        else if (finalScore >= 75) grade = 'B';
        else if (finalScore >= 50) grade = 'C';

        let risk = 'High';
        if (finalScore >= 80) risk = 'Low';
        else if (finalScore >= 50) risk = 'Medium';

        // Critical Overrides
        if (assessmentDoc.flag_childrendata === 1 && finalScore < 80) {
            risk = 'Critical'; // Children's data failure is critical
        }
        if (assessmentDoc.flag_roleclassification === 'Significant Data Fiduciary' && finalScore < 85) {
            risk = 'Critical';
        }

        // 7. Update Assessment Status
        await client.updateDoc('Assessment_dpdp', params.id, {
            status: 'Evaluated',
            overall_score: finalScore,
            overall_grade: grade,
            risk_tag: risk,
        });

        // 8. Create History Event (Persist Breakdown for UI)
        try {
            await client.createDoc('Scoring Event_dpdp', {
                assessment: params.id,
                score: finalScore,
                grade: grade,
                risk: risk,
                breakdown: JSON.stringify(breakdown),
                gaps: JSON.stringify(gaps),
                penalty_exposure: 'N/A'
            });
        } catch (e) {
            console.error('Failed to save history:', e);
            // Continue, don't fail the request just because history failed
        }

        return NextResponse.json({
            score: finalScore,
            grade: grade,
            risk: risk,
            breakdown: breakdown,
            gaps: gaps,
            penaltyExposure: 'N/A'
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: 'Error calculating score' }, { status: 500 });
    }
}
