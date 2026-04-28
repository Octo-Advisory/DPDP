import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { FrappeClient } from '../../lib/frappe/client';

export default function SetPasswordPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const client = new FrappeClient();

    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    // Reset confirmation if password changes
    useEffect(() => {
        setIsPasswordConfirmed(false);
        setConfirmPassword('');
    }, [password]);

    const passwordRequirements = {
        length: password.length >= 8 && password.length <= 32,
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Please meet all password requirements before submitting.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await client.call('dpdp_compliance.api.set_user_password', {
                email,
                password
            });
            setSuccess(true);
            // Redirect to landing page after 3 seconds so they can login manually
            setTimeout(() => {
                window.location.href = '/DPDP/';
            }, 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to set password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100 text-center">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900">Password Set!</h2>
                    <p className="text-stone-600 leading-relaxed mt-4">
                        Your account is ready. Redirecting you to your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100">
                <div className="text-center">
                    <h2 className="mx-auto text-4xl font-serif font-bold tracking-tight text-slate-900">
                        Set Your Password
                    </h2>
                    <p className="mt-4 text-sm text-stone-500 font-medium">
                        Secure your account for <span className="text-slate-900 font-bold">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-100">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="text-left">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                New Password
                            </label>
                            <div className="flex space-x-2">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                                        <Lock className="h-5 w-5" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-lg border border-stone-300 pl-10 pr-10 py-3 text-slate-900 focus:border-amber-500 focus:ring-1 focus:Amber-500 outline-none transition-all bg-stone-50/30"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-amber-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    disabled={!isPasswordValid || isPasswordConfirmed}
                                    onClick={() => setIsPasswordConfirmed(true)}
                                    className="px-4 py-3 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 disabled:opacity-0 transition-all uppercase tracking-wider shadow-sm"
                                >
                                    {isPasswordConfirmed ? '✓' : 'Confirm'}
                                </button>
                            </div>

                            {/* Password Requirements Checklist */}
                            <div className="mt-3 grid grid-cols-1 gap-2">
                                <div className={`flex items-center text-[11px] font-medium transition-colors ${passwordRequirements.length ? 'text-emerald-600' : 'text-stone-400'}`}>
                                    <div className={`mr-2 h-1.5 w-1.5 rounded-full ${passwordRequirements.length ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                                    8-32 Characters
                                </div>
                                <div className={`flex items-center text-[11px] font-medium transition-colors ${passwordRequirements.number ? 'text-emerald-600' : 'text-stone-400'}`}>
                                    <div className={`mr-2 h-1.5 w-1.5 rounded-full ${passwordRequirements.number ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                                    At least one number
                                </div>
                                <div className={`flex items-center text-[11px] font-medium transition-colors ${passwordRequirements.special ? 'text-emerald-600' : 'text-stone-400'}`}>
                                    <div className={`mr-2 h-1.5 w-1.5 rounded-full ${passwordRequirements.special ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                                    At least one special character (!@#$)
                                </div>
                            </div>
                        </div>

                        <div className="text-left">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                                    <Lock className="h-5 w-5" />
                                </span>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    disabled={!isPasswordConfirmed}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-stone-300 pl-10 pr-12 py-3 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30 disabled:opacity-50 disabled:bg-stone-100 disabled:cursor-not-allowed"
                                    placeholder={isPasswordConfirmed ? "••••••••" : "Confirm password above first"}
                                />
                                <button
                                    type="button"
                                    disabled={!isPasswordConfirmed}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-amber-600 disabled:opacity-0"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-xl bg-amber-600 px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Activate Account'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
