
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Edit, AlertTriangle } from 'lucide-react';
import AssessmentActions from '../components/AssessmentActions';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { FrappeClient } from '../../lib/frappe/client';

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

export default function AssessmentList() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    
    const client = new FrappeClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [assessmentsData, orgsData] = await Promise.all([
                    client.getList<any>('Assessment_dpdp', undefined, ['*'], 100),
                    client.getList<any>('Organization_dpdp', undefined, ['name', 'industry', 'organization_name'], 100)
                ]);

                const orgMap = new Map(orgsData.map((o: any) => [o.name, o]));

                const mapped = assessmentsData.map((a: any) => {
                    const orgBox = orgMap.get(a.organization);
                    return {
                        id: a.name,
                        updatedAt: new Date(a.modified),
                        status: a.status ? a.status.toUpperCase() : 'DRAFT',
                        overallScore: a.overall_score,
                        riskTag: a.risk_tag,
                        organization: {
                            name: orgBox?.organization_name || orgBox?.name || a.organization || 'Unknown',
                            industry: orgBox?.industry || 'Unknown'
                        }
                    };
                });

                setAssessments(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === assessments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(assessments.map(a => a.id)));
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => client.deleteDoc('Assessment_dpdp', id)));
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Error during deletion.');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const allSelected = assessments.length > 0 && selectedIds.size === assessments.length;

    if (loading) return (
        <div className="flex items-center justify-center p-20 animate-pulse text-slate-400 font-serif italic">
            Gathering assessments...
        </div>
    );

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Assessments</h1>
                <Link to="/assessments/new" className="bg-amber-600 text-white px-6 py-3 rounded-lg text-base font-bold shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 flex items-center gap-2">
                    <span>+</span> New Assessment
                </Link>
            </div>

            <div className="space-y-4">
                {selectedIds.size > 0 && (
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-lg flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded">
                                {selectedIds.size} Selected
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedIds(new Set())} className="text-slate-300 hover:text-white text-sm font-medium px-3">Cancel</button>
                            <button onClick={() => setShowBulkDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                        <thead className="bg-stone-50/50">
                            <tr>
                                <th className="px-5 py-5 w-12">
                                    <input type="checkbox" className="w-4 h-4 rounded border-stone-300" checked={allSelected} onChange={toggleAll} />
                                </th>
                                <th className="px-3 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest pl-0">Organization</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Risk</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {assessments.map((a) => {
                                const isSelected = selectedIds.has(a.id);
                                return (
                                    <tr key={a.id} className={`group transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-stone-50/50'}`}>
                                        <td className="px-5 py-6 whitespace-nowrap">
                                            <input type="checkbox" className="w-4 h-4 rounded border-stone-300" checked={isSelected} onChange={() => toggleSelection(a.id)} />
                                        </td>
                                        <td className="px-3 py-6 whitespace-nowrap pl-0">
                                            <div className="text-lg font-bold text-slate-900 font-serif">{a.organization.name}</div>
                                            <div className="text-xs text-stone-500 font-medium mt-0.5">{a.organization.industry}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wide rounded border ${a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {typeof a.overallScore === 'number' ? <span className="text-lg font-bold text-slate-700 font-serif">{a.overallScore.toFixed(0)}%</span> : <span className="text-stone-300">-</span>}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {a.riskTag ? (
                                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${a.riskTag === 'Critical' ? 'bg-red-50 text-red-700' : a.riskTag === 'High' ? 'bg-orange-50 text-orange-700' : a.riskTag === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                                                    {a.riskTag}
                                                </span>
                                            ) : <span className="text-stone-300">-</span>}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-stone-500 font-medium">
                                            {a.updatedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
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
            </div>

            <DeleteConfirmationModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedIds.size} Assessments?`}
                description="This action cannot be undone."
                isDeleting={isBulkDeleting}
            />
        </div>
    );
}
