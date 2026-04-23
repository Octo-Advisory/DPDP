
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Use the server-injected is_guest status for the most reliable auth signal
        const checkAuth = () => {
            // window.is_guest is 0 if logged in, 1 if Guest.
            // fallback to cookie if window.is_guest is undefined
            const isLoggedInStatus = window.is_guest === 0 || (window.is_guest === undefined && document.cookie.includes('sid='));
            setIsLoggedIn(isLoggedInStatus);
        };
        
        checkAuth();
    }, []);

    const handleSignOut = async () => {
        try {
            // Perform logout in background
            await fetch('/api/method/logout');
            // Clear local states if any and go back to landing page
            window.location.href = '/DPDP/'; 
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/DPDP/';
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight font-serif group-hover:text-slate-700 transition-colors">DPDP Scorecard</span>
                </Link>

                <nav className="flex gap-8 items-center">
                    {isLoggedIn && (
                        <>
                            <Link to="/assessments" className="text-sm font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-md transition-all">Assessments</Link>
                            <Link to="/organizations" className="text-sm font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-md transition-all">Organizations</Link>
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
                            to="/login"
                            className="text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors no-underline"
                        >
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
