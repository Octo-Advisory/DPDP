'use client';

import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={isDeleting ? undefined : onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 sm:max-w-md transform transition-all scale-100">
                <div className="absolute right-4 top-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-slate-400 hover:text-slate-500 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start text-center sm:text-left">
                    <div className="mx-auto sm:mx-0 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-2 sm:mt-0 min-w-0">
                        <h3 className="text-lg font-bold leading-6 text-slate-900 font-serif">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500 whitespace-normal break-words">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse sm:gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex w-full justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed sm:w-auto"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
