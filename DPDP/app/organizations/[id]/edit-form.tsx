'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

export default function EditOrganizationForm({ org }: { org: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name'),
            industry: formData.get('industry'),
            country: formData.get('country'),
        };

        const res = await fetch(`/api/organizations/${org.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            router.push('/organizations');
            router.refresh();
        } else {
            alert('Failed to update organization');
        }
        setLoading(false);
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/api/organizations/${org.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/organizations');
                router.refresh();
                setShowDeleteModal(false);
            } else {
                alert('Failed to delete organization');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting organization');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Details</h1>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-base font-semibold"
                >
                    <Trash2 className="w-5 h-5" />
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Organization?"
                description="This action cannot be undone."
                isDeleting={deleting}
            />

            <form onSubmit={handleSubmit} className="card space-y-8 shadow-lg border-slate-200">
                <div>
                    <label className="block text-base font-semibold text-slate-800 mb-2">Organization Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={org.name}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">Industry</label>
                        <select
                            name="industry"
                            defaultValue={org.industry}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                            <option>Technology</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">Country</label>
                        <select
                            name="country"
                            defaultValue={org.country || org.geography}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
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

                <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-2">
                    <button type="button" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 text-base font-semibold transition-colors flex items-center gap-1 px-2">
                        &larr; Back to List
                    </button>
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="btn-primary min-w-[140px] text-lg py-3">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
