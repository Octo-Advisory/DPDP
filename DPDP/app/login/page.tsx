'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                router.push('/assessments');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.message || 'Login failed');
                setLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
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
                            <div className="flex-shrink-0 text-red-400">⚠️</div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                                <div className="mt-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="email_address" className="block text-sm font-bold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email_address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 focus:ring-1 focus:outline-none sm:text-sm transition-all bg-stone-50/30"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-stone-300 px-4 py-3 pr-10 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 focus:ring-1 focus:outline-none sm:text-sm transition-all bg-stone-50/30"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative flex w-full justify-center rounded-lg bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-100 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                <div className="pt-2 text-center">
                    <p className="text-xs text-stone-400">
                        Secure Access • Local Instance
                    </p>
                </div>
            </div>
        </div>
    );
}
