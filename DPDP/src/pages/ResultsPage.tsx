import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FrappeClient } from '../../lib/frappe/client';
import { 
    ShieldCheck, 
    AlertTriangle, 
    TrendingUp, 
    ChevronRight, 
    Download, 
    FileText, 
    ArrowLeft,
    CheckCircle2,
    Activity
} from 'lucide-react';

export default function ResultsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const client = new FrappeClient();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await client.call('dpdp_compliance.api.get_assessment_results', {
                    assessment_name: id
                });
                setResults(res);
            } catch (error) {
                console.error('Failed to fetch results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchResults();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xl font-medium">Generating your DPDP Scorecard...</p>
            </div>
        );
    }

    if (!results) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-600';
        if (score >= 50) return 'from-amber-400 to-orange-600';
        return 'from-rose-500 to-red-600';
    };

    const handleExportPdf = () => {
        if (!id) return;
        // Redirect to the whitelist method which handles the file response
        window.location.href = `/api/method/dpdp_compliance.api.download_report?assessment_name=${id}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/assessments')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-slate-900">DPDP Compliance Scorecard</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-8 pt-12 space-y-10">
                {/* Hero Score Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex items-center gap-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700">
                            <ShieldCheck size={200} />
                        </div>
                        
                        <div className="relative shrink-0">
                            <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    {/* Background Circle */}
                                    <circle 
                                        cx="96" cy="96" r="88" 
                                        fill="none" stroke="#f1f5f9" strokeWidth="12"
                                    />
                                    {/* Progress Circle */}
                                    <circle 
                                        cx="96" cy="96" r="88" 
                                        fill="none" stroke="currentColor" strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 88} 
                                        strokeDashoffset={2 * Math.PI * 88 * (1 - results.overall_score / 100)}
                                        strokeLinecap="round"
                                        className={`transition-all duration-1000 ease-out ${getScoreColor(results.overall_score).split(' ')[0]}`}
                                    />
                                </svg>
                                <div className="text-center z-10">
                                    <span className="text-5xl font-serif font-bold text-slate-900 block">{Math.round(results.overall_score)}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getScoreColor(results.overall_score)}`}>
                                {results.overall_score >= 80 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                {results.overall_score >= 80 ? 'Highly Compliant' : results.overall_score >= 50 ? 'Needs Improvement' : 'Action Required'}
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900">
                                {results.overall_score >= 80 
                                    ? 'Strong compliance posture. Maintain ongoing monitoring.' 
                                    : 'Significant gaps identified in your DPDP framework.'}
                            </h2>
                            <p className="text-slate-500 leading-relaxed max-w-md">
                                Based on your role as a <span className="font-bold text-slate-700">{results.identified_role}</span>, we've identified key areas requiring immediate attention to mitigate regulatory risks.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-10 shadow-lg text-white space-y-8 relative overflow-hidden">
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-serif font-bold">Risk Exposure</h3>
                            <Activity className="text-amber-400" size={24} />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    <span>Data Privacy Risk</span>
                                    <span>{100 - Math.round(results.overall_score)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-500 transition-all duration-1000"
                                        style={{ width: `${100 - results.overall_score}%` }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    <span className="text-amber-400 font-bold">Pro Tip:</span> Focus on high-impact gaps first to reduce immediate liability under the DPDP Act.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-serif font-bold text-slate-900">Category Scores</h3>
                            <TrendingUp size={20} className="text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            {Object.entries(results.section_scores).map(([title, score]: [string, any]) => (
                                <div key={title} className="group cursor-default">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{title}</span>
                                        <span className={`text-sm font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{score}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r transition-all duration-1000 ${getScoreGradient(score)}`}
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-serif font-bold text-slate-900">Urgent Gaps</h3>
                            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-lg border border-rose-100">
                                {results.gaps.length} Items Found
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[400px] scrollbar-thin">
                            {results.gaps.length > 0 ? (
                                results.gaps.map((gap: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-all">
                                        <div className="flex gap-4">
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${gap.impact === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800 leading-snug">{gap.question}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You Answered:</span>
                                                    <span className="text-[10px] font-bold text-rose-500 uppercase">{gap.response}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                    <p className="font-medium">No critical gaps identified!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
