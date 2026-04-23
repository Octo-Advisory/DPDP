'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AssessmentActions from './actions';
import { Trash2, AlertCircle } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Assessment {
    id: string;
    updatedAt: Date;
    status: string;
    overallScore: number | null;
    riskTag: string | null;
    organization: {
        name: string;
        industry: string;
    };
}

export default function AssessmentList({ assessments }: { assessments: Assessment[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Toggle single row selection
    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    // Toggle all rows
    const toggleAll = () => {
        if (selectedIds.size === assessments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(assessments.map(a => a.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        setIsBulkDeleting(true);

        try {
            const res = await fetch('/api/assessments/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });

            if (res.ok) {
                // Clear selection and refresh
                setSelectedIds(new Set());
                setShowBulkDeleteModal(false);
                router.refresh();
            } else {
                alert('Failed to delete some assessments. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred during deletion.');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const allSelected = assessments.length > 0 && selectedIds.size === assessments.length;

    return (
        <div className="space-y-4">
            {/* Bulk Actions Header */}
            {selectedIds.size > 0 && (
                <div className="bg-slate-900 text-white px-6 py-3 rounded-lg flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded">
                            {selectedIds.size} Selected
                        </span>
                        <span className="text-sm text-slate-300">
                            Select all to delete multiple assessments at once.
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setShowBulkDeleteModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-stone-50/50">
                        <tr>
                            <th className="px-5 py-5 w-12">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-stone-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="px-3 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest pl-0">Organization</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Score</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Risk</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</th>
                            <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {assessments.map((a) => {
                            const isSelected = selectedIds.has(a.id);
                            return (
                                <tr
                                    key={a.id}
                                    className={`group transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-stone-50/50'}`}
                                >
                                    <td className="px-5 py-6 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-stone-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => toggleSelection(a.id)}
                                        />
                                    </td>
                                    <td className="px-3 py-6 whitespace-nowrap pl-0">
                                        <div className="text-lg font-bold text-slate-900 font-serif">{a.organization.name}</div>
                                        <div className="text-xs text-stone-500 font-medium mt-0.5">{a.organization.industry}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wide rounded border ${a.status === 'COMPLETED'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {a.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {typeof a.overallScore === 'number' ? (
                                            <span className="text-lg font-bold text-slate-700 font-serif">{a.overallScore.toFixed(0)}%</span>
                                        ) : (
                                            <span className="text-stone-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        {a.riskTag ? (
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${a.riskTag === 'Critical' ? 'bg-red-50 text-red-700' :
                                                a.riskTag === 'High' ? 'bg-orange-50 text-orange-700' :
                                                    a.riskTag === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                                                }`}>
                                                {a.riskTag}
                                            </span>
                                        ) : <span className="text-stone-300">-</span>}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-stone-500 font-medium">
                                        {new Date(a.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <AssessmentActions assessmentId={a.id} status={a.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {assessments.length === 0 && (
                    <div className="p-12 text-center text-stone-500 bg-stone-50/30">
                        <p className="text-lg font-serif italic mb-2">No assessments yet</p>
                        <p className="text-sm">Create your first assessment to get started.</p>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedIds.size} Assessments?`}
                description="This will permanently delete the selected assessments and their responses. This action cannot be undone."
                isDeleting={isBulkDeleting}
            />
        </div>
    );
}
