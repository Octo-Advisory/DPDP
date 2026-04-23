
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FrappeClient } from '../../lib/frappe/client';

export default function NewAssessment() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [versionId, setVersionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const client = new FrappeClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Organizations
                const orgsData = await client.getList<any>('Organization_dpdp', undefined, ['*'], 100);
                setOrganizations(orgsData.map((o: any) => ({
                    id: o.name,
                    name: o.organization_name || o.name
                })));

                // 2. Fetch Active Version
                const versions = await client.getList<any>('Questionnaire_Version_dpdp', [['active', '=', 1]], ['*'], 10);
                
                // Find best version (v2.0 preferred)
                let version = versions.find((v: any) => v.version_id?.includes('v2.0')) || versions[0];
                
                if (version) {
                    setVersionId(version.name);
                } else {
                    setError('No active questionnaire version found. Please contact an admin.');
                }
            } catch (err: any) {
                console.error(err);
                setError('Failed to load configuration.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!versionId) return;

        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const organizationId = formData.get('organizationId');

        try {
            const doc = await client.createDoc('Assessment_dpdp', {
                organization: organizationId,
                version: versionId,
                identified_role: '', // Start blank to trigger logic from beginning
                status: 'Draft'
            });
            navigate(`/assessments/${doc.name}`);
        } catch (err: any) {
            console.error(err);
            alert('Failed to start assessment: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 animate-pulse text-slate-400 font-serif italic">
            Preparing your workspace...
        </div>
    );

    if (error) return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
                <p>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-12 px-4">
            <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Start New Assessment</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8 text-left">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Select Organization</label>
                    <p className="text-stone-500 text-xs mb-4">Choose the company profile for this assessment.</p>
                    <select 
                        name="organizationId" 
                        required 
                        disabled={submitting}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                    >
                        <option value="">-- Choose Organization --</option>
                        {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="px-6 py-2.5 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Starting...' : 'Start Assessment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
