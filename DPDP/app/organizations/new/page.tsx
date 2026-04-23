'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewOrganizationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        // Simple client-side submit for MVP
        const data = {
            name: formData.get('name'),
            industry: formData.get('industry'),
            country: formData.get('country'),
        };

        const res = await fetch('/api/organizations', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            router.push('/organizations');
            router.refresh();
        } else {
            alert('Failed to create organization');
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Organization</h1>
            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                    <input name="name" type="text" required className="w-full border border-slate-300 rounded px-3 py-2" placeholder="Acme Corp" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                        <select name="industry" className="w-full border border-slate-300 rounded px-3 py-2">
                            <option>Technology</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                        <select name="country" className="w-full border border-slate-300 rounded px-3 py-2">
                            <option>India</option>
                            <option>USA</option>
                            <option>United Kingdom</option>
                            <option>Canada</option>
                            <option>Australia</option>
                            <option>Germany</option>
                            <option>France</option>
                            <option>Singapore</option>
                            <option>UAE</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Organization'}
                    </button>
                </div>
            </form>
        </div>
    );
}
