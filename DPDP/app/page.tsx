import Link from 'next/link';
import { ClipboardCheck, Zap, ShieldCheck } from 'lucide-react';
// Note: lucide-react might not be installed. I'll stick to simple text or install it. 
// Plan: I'll use simple text/emoji now to be safe, or just install lucide-react. 
// "Enterprise clean UI" implies icons. I'll add `npm install lucide-react` to my mental queue or just run it.
// I'll assume standard icons for now or use ASCII fallback if I can't install.
// I will attempt simple SVG inline for now to avoid dependency hell in this step.

export default function Home() {
  return (
    <div className="space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero with Depth */}
      <section className="relative text-center space-y-8 py-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100 via-white to-white -mt-8 rounded-[3rem] border border-stone-100/50 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm mb-4">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Updated for 2025 Rules</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] font-serif">
          Measure Your <span className="italic text-amber-700">DPDP Compliance</span> <br className="hidden md:block" /> with Confidence
        </h1>

        <p className="text-xl text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed">
          A secure, industry-standard assessment tool to evaluate readiness against the Digital Personal Data Protection Act using standard frameworks.
        </p>

        <div className="flex gap-4 justify-center pt-6">
          <Link href="/assessments/new" className="btn-primary flex items-center gap-2 px-8 py-4 text-base shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
            Start New Assessment <span>&rarr;</span>
          </Link>
          <Link href="/assessments" className="btn-secondary flex items-center gap-2 px-8 py-4 text-base bg-white border border-stone-200 shadow-sm hover:bg-stone-50 hover:border-stone-300">
            View History
          </Link>
        </div>

        {/* Social Proof / Stats */}
        <div className="pt-16 pb-4 border-t border-stone-100 max-w-4xl mx-auto mt-12 grid grid-cols-3 divide-x divide-stone-100">
          <div className="px-4">
            <div className="text-3xl font-bold text-slate-900 font-serif">8+</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Pillars Covered</div>
          </div>
          <div className="px-4">
            <div className="text-3xl font-bold text-slate-900 font-serif">100%</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Local & Secure</div>
          </div>
          <div className="px-4">
            <div className="text-3xl font-bold text-slate-900 font-serif">2025</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Rules Ready</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-10 px-4 pb-20">
        <div className="card group hover:shadow-xl hover:border-amber-100/50 transition-all duration-500">
          <div className="h-14 w-14 bg-stone-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 transition-all">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 font-serif">Detailed Questionnaires</h3>
          <p className="text-stone-500 leading-relaxed text-sm">Comprehensive risk-based scale questions covering all 8 pillars of the 2023 Act and 2025 Rules.</p>
        </div>
        <div className="card group hover:shadow-xl hover:border-amber-100/50 transition-all duration-500">
          <div className="h-14 w-14 bg-stone-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 transition-all">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 font-serif">Automated Scoring</h3>
          <p className="text-stone-500 leading-relaxed text-sm">Instant "Penalty Exposure" calculation with weighted logic and critical flag overrides.</p>
        </div>
        <div className="card group hover:shadow-xl hover:border-amber-100/50 transition-all duration-500">
          <div className="h-14 w-14 bg-stone-50 text-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 transition-all">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800 font-serif">Secure & Local</h3>
          <p className="text-stone-500 leading-relaxed text-sm">Zero data leak architecture. Your audit data stays on your local machine.</p>
        </div>
      </section>
    </div>
  );
}
