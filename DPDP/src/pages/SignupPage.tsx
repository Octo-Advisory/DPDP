import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { FrappeClient } from '../../lib/frappe/client';

const COMMON_COUNTRIES = [
    { name: 'India', code: 'IN', phone_code: '91' },
    { name: 'United States', code: 'US', phone_code: '1' },
    { name: 'United Kingdom', code: 'GB', phone_code: '44' },
    { name: 'United Arab Emirates', code: 'AE', phone_code: '971' },
    { name: 'Australia', code: 'AU', phone_code: '61' },
    { name: 'Canada', code: 'CA', phone_code: '1' },
    { name: 'Germany', code: 'DE', phone_code: '49' },
    { name: 'France', code: 'FR', phone_code: '33' },
    { name: 'Singapore', code: 'SG', phone_code: '65' },
    { name: 'Japan', code: 'JP', phone_code: '81' },
    { name: 'Saudi Arabia', code: 'SA', phone_code: '966' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function SignupPage() {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('India');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const client = new FrappeClient();

    // Redirect if already logged in
    React.useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).is_guest === 0) {
            navigate('/assessments');
        }
    }, [navigate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        
        // Basic phone validation
        if (phone && !/^\+?[\d\s-]{1,}$/.test(phone)) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);

        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
        
        // Get calling code
        const selectedCountry = COMMON_COUNTRIES.find(c => c.name === country);
        const callingCode = selectedCountry?.phone_code ? `+${selectedCountry.phone_code}` : '';
        const fullPhone = `${callingCode} ${phone}`.trim();

        try {
            await client.call('dpdp_compliance.api.signup_user', {
                email,
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                mobile_no: fullPhone,
                phone_code: callingCode,
                phone_only: phone,
                full_name: fullName,
                country: country,
                redirect_to: window.location.origin + '/login'
            });
            // Redirect to set password page instead of showing success state here
            navigate(`/set-password?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Signup failed. Please check your details or try again later.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100 text-center">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900">Registration Successful!</h2>
                    <p className="text-stone-600 leading-relaxed mt-4">
                        We've sent a verification link to <span className="font-bold text-slate-900">{email}</span>. 
                        Please check your email to complete your account setup.
                    </p>
                    <div className="pt-8">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition-all no-underline"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-xl space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100">
                <div className="text-center">
                    <h2 className="mx-auto text-4xl font-serif font-bold tracking-tight text-slate-900">
                        Join DPDP Scorecard
                    </h2>
                    <p className="mt-4 text-sm text-stone-500 font-medium">
                        Create your account to start your compliance journey
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex">
                            <div className="flex-shrink-0 text-red-500">⚠️</div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                                <div className="mt-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="text-left">
                            <label htmlFor="first_name" className="block text-sm font-bold text-slate-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="first_name"
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s-]/g, ''))}
                                className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                placeholder="John"
                            />
                        </div>
                        <div className="text-left">
                            <label htmlFor="middle_name" className="block text-sm font-bold text-slate-700 mb-2">
                                Middle Name <span className="text-stone-400 text-xs">(Optional)</span>
                            </label>
                            <input
                                id="middle_name"
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value.replace(/[^a-zA-Z\s-]/g, ''))}
                                className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                placeholder="Quincy"
                            />
                        </div>
                        <div className="text-left">
                            <label htmlFor="last_name" className="block text-sm font-bold text-slate-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="last_name"
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s-]/g, ''))}
                                className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                placeholder="Doe"
                            />
                        </div>
                        <div className="text-left md:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="block w-48 rounded-lg border border-stone-300 px-3 py-3 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30 text-sm"
                                >
                                    {COMMON_COUNTRIES.map(c => (
                                        <option key={c.name} value={c.name}>
                                            {c.name} (+{c.phone_code})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ''))}
                                    className="block flex-1 rounded-lg border border-stone-300 px-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                    placeholder="1234 567 890"
                                />
                            </div>
                        </div>
                        <div className="text-left md:col-span-2">
                            <label htmlFor="email_address" className="block text-sm font-bold text-slate-700 mb-2">
                                Work Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    id="email_address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-stone-300 pl-10 pr-4 py-3 text-slate-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-stone-50/30"
                                    placeholder="john@company.com"
                                />
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
                                    Creating Account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-stone-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 transition-colors no-underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
