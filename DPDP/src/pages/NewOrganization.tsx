
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FrappeClient } from '../../lib/frappe/client';
import CountryPicker from '../components/CountryPicker';

export default function NewOrganization() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const client = new FrappeClient();

    React.useEffect(() => {
        const fetchCountries = async () => {
            try {
                // Fetch both name and code for the flag display
                const list = await client.getList('Country', undefined, ['name', 'code'], 300);
                const sorted = list.sort((a: any, b: any) => a.name.localeCompare(b.name));
                setCountries(sorted);
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };
        fetchCountries();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await client.createDoc('Organization_dpdp', {
                organization_name: formData.get('name'),
                industry: formData.get('industry'),
                country: selectedCountry || formData.get('country'),
            });
            navigate('/organizations');
        } catch (error: any) {
            console.error(error);
            alert('Failed to create organization: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 font-serif tracking-tight">Create New Organization</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Organization Name</label>
                    <input 
                        name="name" 
                        type="text" 
                        required 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                        placeholder="Acme Privacy Corp" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Industry</label>
                        <select name="industry" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none">
                            <option>Technology</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase tracking-widest">Country</label>
                        <CountryPicker 
                            countries={countries} 
                            value={selectedCountry} 
                            onChange={setSelectedCountry}
                            placeholder="Search and select country"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Organization'}
                    </button>
                </div>
            </form>
        </div>
    );
}
