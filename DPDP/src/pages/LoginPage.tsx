
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FrappeClient } from '../../lib/frappe/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const client = new FrappeClient();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use Frappe's standard login method via our client
            // Note: client.call is for generic API calls, but login is a special endpoint
            // In a production SPA served by Frappe, we can just fetch to /api/method/login
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (typeof window !== 'undefined' && (window as any).csrf_token) {
                headers['X-Frappe-CSRF-Token'] = (window as any).csrf_token;
            }

            const res = await fetch('/api/method/login', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({ usr: email, pwd: password })
            });

            if (res.ok) {
                // Login successful
                navigate('/assessments');
                window.location.reload(); // Force reload to refresh auth state in Navbar
            } else {
                const data = await res.json();
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100">
                <div className="text-center">
                    <h2 className="mx-auto text-4xl font-serif font-bold tracking-tight text-slate-900">
                        DPDP Scorecard
                    </h2>
                    <p className="mt-4 text-sm text-stone-500 font-medium">
                        Sign in to access your assessment dashboard
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex">
                            <div className="flex-shrink-0 text-red-500">⚠️</div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                                <div className="mt-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="text-left">
                            <label htmlFor="email_address" className="block text-sm font-bold text-slate-700 mb-2">
                                Email or Username
                            </label>
                            <input
                                id="email_address"
                                name="email"
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                placeholder="Administrator"
                            />
                        </div>
                        <div className="text-left">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-stone-300 px-4 py-3 pr-10 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative flex w-full justify-center rounded-xl bg-amber-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all ${loading ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                <div className="pt-2 text-center text-xs text-stone-400">
                    Secure Access • Local Instance
                </div>
            </div>
        </div>
    );
}
