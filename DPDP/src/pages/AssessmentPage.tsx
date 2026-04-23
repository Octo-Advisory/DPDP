import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FrappeClient } from '../../lib/frappe/client';
import Wizard from '../components/Wizard';

export default function AssessmentPage() {
    const { id } = useParams();
    const [assessment, setAssessment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const client = new FrappeClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // 1. Fetch Assessment
                const assessmentData = await client.getDoc('Assessment_dpdp', id);
                
                // 2. Fetch Version with full sections and questions
                // In Frappe, we might need to fetch the child tables if getDoc doesn't include them
                // But usually getDoc returns everything for a Document
                const versionData = await client.getDoc('Questionnaire_Version_dpdp', assessmentData.version);
                
                // 3. Fetch Sections for this version
                const sections = await client.getList('Section_dpdp', [['version', '=', versionData.name]], ['*'], 100);
                
                // 4. For each section, fetch questions
                const sectionsWithQuestions = await Promise.all(sections.map(async (s: any) => {
                    const questions = await client.getList('Question_dpdp', [['section', '=', s.name]], ['*'], 100);
                    return { ...s, questions: questions.sort((a, b) => (a.order || 0) - (b.order || 0)) };
                }));

                setAssessment({
                    ...assessmentData,
                    version_details: {
                        ...versionData,
                        sections: sectionsWithQuestions.sort((a, b) => (a.order || 0) - (b.order || 0))
                    }
                });
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load assessment');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-slate-500 font-medium animate-pulse">Initializing Assessment...</div>
        </div>
    );
    
    if (error) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Verification Needed</h1>
            <p className="text-slate-500 max-w-md">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-amber-600 text-white rounded-lg font-bold">
                Try Again
            </button>
        </div>
    );

    if (!assessment) return null;

    return <Wizard assessment={assessment} />;
}
