
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { FrappeClient } from '../../lib/frappe/client';

export default function OrganizationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [org, setOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const client = new FrappeClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await client.getDoc<any>('Organization_dpdp', id);
                setOrg(data);
            } catch (err) {
                console.error(err);
                alert('Organization not found');
                navigate('/organizations');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            await client.updateDoc('Organization_dpdp', id, {
                organization_name: formData.get('name'),
                industry: formData.get('industry'),
                country: formData.get('country'),
            });
            navigate('/organizations');
        } catch (error) {
            console.error(error);
            alert('Failed to update organization');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setDeleting(true);
        try {
            await client.deleteDoc('Organization_dpdp', id);
            navigate('/organizations');
        } catch (error) {
            console.error(error);
            alert('Error deleting organization');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 animate-pulse text-slate-400 font-serif italic">
            Loading organization details...
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 text-left">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-serif">Organization Profile</h1>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-bold"
                >
                    <Trash2 className="w-5 h-5" />
                    {deleting ? 'Deleting...' : 'Delete Organization'}
                </button>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Organization?"
                description="This will permanently remove the company profile. This action cannot be undone."
                isDeleting={deleting}
            />

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Organization Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={org.organization_name || org.name}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Industry</label>
                        <select
                            name="industry"
                            defaultValue={org.industry}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
                        >
                            <option>Technology</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Country</label>
                        <select
                            name="country"
                            defaultValue={org.country || org.geography}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
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

                <div className="flex justify-between items-center pt-6 border-t border-stone-100 mt-2">
                    <button type="button" onClick={() => navigate(-1)} className="text-stone-500 hover:text-slate-800 text-sm font-bold transition-colors flex items-center gap-1 px-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" disabled={saving} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
                        {saving ? <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Saving...</span> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
