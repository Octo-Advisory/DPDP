
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FrappeClient } from '../../lib/frappe/client';

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const client = new FrappeClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [orgsData, assessmentsData] = await Promise.all([
                    client.getList<any>('Organization_dpdp', undefined, ['*'], 100),
                    client.getList<any>('Assessment_dpdp', undefined, ['organization'], 1000)
                ]);

                // Calculate counts
                const counts = new Map<string, number>();
                assessmentsData.forEach((a: any) => {
                    counts.set(a.organization, (counts.get(a.organization) || 0) + 1);
                });

                const mapped = orgsData.map((org: any) => ({
                    id: org.name,
                    name: org.organization_name || org.name,
                    industry: org.industry || 'Unknown',
                    country: org.country || org.geography || 'India',
                    assessmentCount: counts.get(org.name) || 0
                }));

                setOrganizations(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20 animate-pulse text-slate-400 font-serif italic">
            Fetching organizations...
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight text-left">Organizations</h1>
                <Link to="/organizations/new" className="bg-slate-900 text-white px-6 py-3 rounded-lg text-base font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 no-underline">
                    + New Organization
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                    <div key={org.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-600 group text-left">
                        <h3 className="text-xl font-bold text-slate-900 mb-1 font-serif tracking-tight">{org.name}</h3>
                        <div className="text-base text-stone-500 mb-4 flex gap-2 items-center">
                            <span className="bg-stone-50 px-2 py-0.5 rounded text-sm font-medium border border-stone-100">{org.industry}</span>
                            <span>•</span>
                            <span className="text-sm">{org.country}</span>
                        </div>
                        <div className="mt-4 flex justify-between items-center border-t border-stone-100 pt-4">
                            <span className="text-sm font-semibold text-slate-600 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                {org.assessmentCount} Assessment{org.assessmentCount !== 1 ? 's' : ''}
                            </span>
                            <Link to={`/organizations/${org.id}`} className="text-amber-700 text-sm font-bold hover:text-amber-900 flex items-center gap-1 group-hover:underline decoration-amber-300 underline-offset-4 transition-all no-underline">
                                View Details <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                ))}
                {organizations.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-stone-200 font-serif italic">
                        No organizations found. Create your first profile to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
