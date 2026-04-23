'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAssessmentForm({ organizations, versionId }: { organizations: any[], versionId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            organizationId: formData.get('organizationId'),
            versionId: versionId,
            // Flags and Role are removed from here as they are now automatic
        };

        const res = await fetch('/api/assessments', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            const doc = await res.json();
            router.push(`/assessments/${doc.name}`); // Go to the questionnaire
            router.refresh();
        } else {
            alert('Failed to start assessment');
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">
            <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Select Organization</label>
                <p className="text-stone-500 text-xs mb-4">Choose the company profile for this assessment.</p>
                <select 
                    name="organizationId" 
                    required 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='Wait, I'll just use a simple native select")` }}
                >
                    <option value="">-- Choose Organization --</option>
                    {(Array.isArray(organizations) ? organizations : []).map(org => (
                        <option key={org.id} value={org.id}>{org.name || 'Unnamed Organization'}</option>
                    ))}
                </select>
            </div>


            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <button 
                    type="button" 
                    onClick={() => router.back()} 
                    className="px-6 py-2.5 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-slate-900 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                    {loading ? 'Starting...' : 'Start Assessment'}
                </button>
            </div>
        </form>
    );
}
