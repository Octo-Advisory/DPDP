'use client';

import Link from 'next/link';

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
    const handleSignOut = () => {
        window.location.href = '/api/auth/logout';
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight font-serif group-hover:text-slate-700 transition-colors">DPDP Scorecard</span>
                </Link>

                <nav className="hidden md:flex gap-8 items-center">
                    {isLoggedIn && (
                        <>
                            <Link href="/assessments" className="text-sm font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-md transition-all">Assessments</Link>
                            <Link href="/organizations" className="text-sm font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-md transition-all">Organizations</Link>
                            <div className="h-5 w-px bg-slate-200 mx-2" />
                        </>
                    )}

                    {isLoggedIn ? (
                        <button
                            onClick={handleSignOut}
                            className="text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
