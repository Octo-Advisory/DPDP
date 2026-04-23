'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

export default function AssessmentActions({ assessmentId, status }: { assessmentId: string, status: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
// hiii
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/assessments/${assessmentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh();
                setShowDeleteModal(false);
            } else {
                alert('Failed to delete assessment');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting assessment');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3 justify-end">
                <button
                    onClick={() => router.push(`/assessments/${assessmentId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                    title="Edit Assessment"
                >
                    <Edit className="w-4 h-4" />
                    {status === 'COMPLETED' ? 'View Report' : 'Continue'}
                </button>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Assessment"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Assessment?"
                description="This action cannot be undone."
                isDeleting={isDeleting}
            />
        </>
    );
}
