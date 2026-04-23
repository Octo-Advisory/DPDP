'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Assessment New Page Error:', error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-white text-slate-900 p-4">
            <div className="max-w-md text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold">Something went wrong!</h2>
                <p className="text-sm text-slate-500">
                    We encountered an error loading the assessment form.
                    {error.message && <span className="block mt-2 font-mono text-xs bg-slate-50 p-2 rounded">{error.message}</span>}
                </p>
                <div className="flex gap-4 justify-center pt-2">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        Try again
                    </button>
                    <a
                        href="/assessments"
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        Go Back
                    </a>
                </div>
            </div>
        </div>
    );
}
