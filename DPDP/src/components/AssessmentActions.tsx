
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { FrappeClient } from '../../lib/frappe/client';

export default function AssessmentActions({ assessmentId, status }: { assessmentId: string, status: string }) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const client = new FrappeClient();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await client.deleteDoc('Assessment_dpdp', assessmentId);
            // In a real app, you'd trigger a list refresh. 
            // For now, we'll just reload the page to simplify
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Error deleting assessment');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3 justify-end">
                <button
                    onClick={() => navigate(`/assessments/${assessmentId}${status === 'COMPLETED' ? '/results' : ''}`)}
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
