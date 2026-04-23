
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Zap, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    // Check if the user is a guest (1) or logged in (0)
    if (window.is_guest !== 0) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero with Depth */}
      <section className="relative text-center space-y-8 py-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100 via-white to-white -mt-8 rounded-[3rem] border border-stone-100/50 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm mb-4">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Updated for 2025 Rules</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] font-serif text-center">
          Measure Your <span className="italic text-amber-700">DPDP Compliance</span> <br className="hidden md:block" /> with Confidence
        </h1>

        <p className="text-xl text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed text-center">
          A secure, industry-standard assessment tool to evaluate readiness against the Digital Personal Data Protection Act using standard frameworks.
        </p>

        <div className="flex gap-4 justify-center pt-6">
          <button 
            onClick={() => handleAction('/assessments/new')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-amber-600 text-white shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all no-underline cursor-pointer"
          >
            Start New Assessment <span>&rarr;</span>
          </button>
          <button 
            onClick={() => handleAction('/assessments')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white border border-stone-200 shadow-sm hover:bg-stone-50 hover:border-stone-300 no-underline text-slate-900 cursor-pointer"
          >
            View History
          </button>
        </div>

        {/* Social Proof / Stats */}
        <div className="pt-16 pb-4 border-t border-stone-100 max-w-4xl mx-auto mt-12 grid grid-cols-3 divide-x divide-stone-100">
          <div className="px-4 text-center">
            <div className="text-3xl font-bold text-slate-900 font-serif">8+</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Pillars Covered</div>
          </div>
          <div className="px-4 text-center">
            <div className="text-3xl font-bold text-slate-900 font-serif">100%</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Local & Secure</div>
          </div>
          <div className="px-4 text-center">
            <div className="text-3xl font-bold text-slate-900 font-serif">2025</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Rules Ready</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-10 px-4 pb-20">
        <div className="p-8 bg-white border border-stone-100 rounded-[2rem] shadow-sm group hover:shadow-xl transition-all duration-500 text-left">
          <div className="h-14 w-14 bg-stone-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-amber-50">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 font-serif">Detailed Questionnaires</h3>
          <p className="text-stone-500 leading-relaxed text-sm">Comprehensive risk-based scale questions covering all 8 pillars of the 2023 Act and 2025 Rules.</p>
        </div>
        <div className="p-8 bg-white border border-stone-100 rounded-[2rem] shadow-sm group hover:shadow-xl transition-all duration-500 text-left">
          <div className="h-14 w-14 bg-stone-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-amber-50">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 font-serif">Automated Scoring</h3>
          <p className="text-stone-500 leading-relaxed text-sm">Instant "Penalty Exposure" calculation with weighted logic and critical flag overrides.</p>
        </div>
        <div className="p-8 bg-white border border-stone-100 rounded-[2rem] shadow-sm group hover:shadow-xl transition-all duration-500 text-left">
          <div className="h-14 w-14 bg-stone-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-amber-50">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 font-serif">Secure & Local</h3>
          <p className="text-stone-500 leading-relaxed text-sm">Zero data leak architecture. Your audit data stays on your local machine.</p>
        </div>
      </section>
    </div>
  );
}
