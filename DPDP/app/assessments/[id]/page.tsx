import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { FrappeClient } from '@/lib/frappe/client';
import QuestionnaireWizard from './wizard';

export default async function AssessmentAndQuestionnairePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    
    // Redirect to login if no session instead of 404
    if (!session) {
        console.log("No session found, redirecting to login");
        redirect(`/login?callbackUrl=/assessments/${params.id}`);
    }

    const cookieStore = await cookies();
    const sid = cookieStore.get('sid')?.value;
    const client = new FrappeClient(sid ? `sid=${sid}` : undefined);

    try {
        // 1. Fetch Assessment
        const assessment = await client.getDoc<any>('Assessment_dpdp', params.id);
        if (!assessment) throw new Error(`Assessment ${params.id} not found on local server.`);

        // 2. Fetch Organization Details
        const org = await client.getDoc<any>('Organization_dpdp', assessment.organization);

        // 3. Fetch Version & Sections
        const versionDoc = await client.getDoc<any>('Questionnaire_Version_dpdp', assessment.version);

        // Fetch all sections linked to this version
        const sectionsData = await client.getList<any>('Section_dpdp', [['version', '=', assessment.version]], ['*'], 100);
        const sectionIds = sectionsData.map((s: any) => s.name);

        // 4. Fetch Questions for these sections
        let questionsData: any[] = [];
        if (sectionIds.length > 0) {
            const questionList = await client.getList<any>('Question_dpdp', [['section', 'in', sectionIds]], ['name'], 1000);
            questionsData = await Promise.all(
                questionList.map((q: any) => client.getDoc<any>('Question_dpdp', q.name))
            );
        }

        // 5. Fetch Responses
        const responsesData = await client.getList<any>('Assessment_Response_dpdp', [['assessment', '=', assessment.name]], ['*']);
        const responses = responsesData.map((r: any) => ({
            ...r,
            questionId: r.question,
            evidence: []
        }));

        const sections = sectionsData
            .sort((a: any, b: any) => a.order - b.order)
            .map((s: any) => ({
                ...s,
                id: s.name,
                questions: questionsData
                    .filter((q: any) => q.section === s.name)
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((q: any) => ({
                        id: q.name,
                        text: q.text,
                        type: q.type,
                        order: q.order,
                        options: q.options,
                        updates_role: q.updates_role,
                        updates_flag: q.updates_flag
                    }))
            }));

        const fullAssessment = {
            id: assessment.name,
            version: { id: assessment.version, sections },
            identified_role: assessment.identified_role,
            process_children_data: assessment.process_children_data === 1,
            has_cross_border_transfers: assessment.has_cross_border_transfers === 1,
            organization: { id: org.name, name: org.organization_name || org.name },
            responses
        };

        return <QuestionnaireWizard assessment={fullAssessment} />;

    } catch (e: any) {
        console.error("Critical error in Assessment Page:", e);
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Assessment</h1>
                <p className="text-slate-600 mb-8">{e.message || "An unexpected error occurred."}</p>
                <div className="bg-slate-50 p-4 rounded text-left inline-block max-w-lg mx-auto font-mono text-sm overflow-auto">
                    Check if your local Frappe server is running at 172.22.31.244:83 and that you have permissions for _dpdp Doctypes.
                </div>
            </div>
        );
    }
}
