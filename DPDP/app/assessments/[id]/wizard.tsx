'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function QuestionnaireWizard({ assessment }: { assessment: any }) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [calculatedRole, setCalculatedRole] = useState<string | null>(assessment.identified_role || null);
    const [isConfirmed, setIsConfirmed] = useState(!!assessment.identified_role);
    const [flags, setFlags] = useState({
        children: assessment.process_children_data || false,
        cross_border: assessment.has_cross_border_transfers || false
    });

    const allSections = assessment.version.sections || [];

    const handleConfirm = async () => {
        try {
            // Persist the identified role and flags to the backend
            const response = await fetch(`/api/assessments/${assessment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identified_role: calculatedRole,
                    process_children_data: flags.children ? 1 : 0,
                    has_cross_border_transfers: flags.cross_border ? 1 : 0,
                    status: 'Draft' // Match Frappe Doctype options
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save confirmation');
            }
            
            setIsConfirmed(true);
            setCurrentSectionIndex(0); // Start the Audit phase at the first audit section
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to confirm selection. Please check your connection.');
        }
    };

    // FILTER SECTIONS BASED ON MIRO FLOWCHART LOGIC
    const sections = allSections.filter((section: any) => {
        const isDiscovery = section.target_select === 'None' || !section.target_select;
        
        // Phase 1: If NOT confirmed, only show Discovery sections
        if (!isConfirmed) {
            if (!isDiscovery) return false;
            
            if (section.title === 'Role Clarification') {
                const riSection = allSections.find((s: any) => s.title === 'Role Identification');
                const q1Val = answers[riSection?.questions[0].id]?.value;
                return q1Val === 'Not sure';
            }
            if (section.title === 'Applicability') {
                const riSection = allSections.find((s: any) => s.title === 'Role Identification');
                const q1Val = answers[riSection?.questions[0].id]?.value;
                return !!q1Val;
            }
            return true;
        }

        // Phase 2: If CONFIRMED, hide Discovery and show matched Audit role
        if (isDiscovery) return false; // Hide all Phase 1 sections

        if (section.target_select !== calculatedRole) return false;

        // Flag-based triggers
        if (section.applicability_trigger === 'process_children_data' && !flags.children) return false;
        if (section.applicability_trigger === 'cross_border_transfer' && !flags.cross_border) return false;

        return true;
    }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const currentSection = sections[currentSectionIndex];
    const isDiscoveryPhase = currentSection?.target_select === 'None' || !currentSection?.target_select;
    const isLocked = isConfirmed && isDiscoveryPhase;

    const handleNext = () => {
        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        }
    };

    const handleBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    const handleAnswer = (question: any, value: any) => {
        const currentVal = answers[question.id]?.value;
        const newValue = currentVal === value ? null : value;

        setAnswers(prev => {
            const newAnswers = { ...prev, [question.id]: { value: newValue } };
            
            // Trigger role update if it's the identification question
            if (question.updates_role) {
                // If it was 'Not sure' and now null, or a specific role and now null
                setCalculatedRole(newValue && newValue !== 'Not sure' ? newValue : null);
            }

            // Trigger flag updates
            if (question.updates_flag === 'process_children_data') {
                setFlags(f => ({ ...f, children: newValue?.startsWith('A.') || false }));
            }
            if (question.updates_flag === 'cross_border_transfer') {
                setFlags(f => ({ ...f, cross_border: newValue?.startsWith('A.') || false }));
            }

            return newAnswers;
        });
    };

    if (sections.length === 0 || !currentSection) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
                <p className="text-xl font-medium">Loading sections...</p>
                <button onClick={() => window.location.reload()} className="text-sm mt-4 text-amber-600 underline">
                    Refresh Page
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <h2 className="text-xl font-serif font-bold text-slate-900 leading-none">Assessment</h2>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">Navigation</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map((section: any, idx: number) => (
                        <button
                            key={section.id}
                            onClick={() => setCurrentSectionIndex(idx)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                idx === currentSectionIndex 
                                ? 'bg-amber-600 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            <span className="text-[10px] font-bold block opacity-60 uppercase mb-0.5">Section {idx + 1}</span>
                            <span className="text-sm font-bold truncate block">{section.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-100 px-12 flex items-center justify-between z-10">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Framework: DPDP</span>
                        <h2 className="text-lg font-serif font-bold text-slate-900">{currentSection?.title}</h2>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-12 py-16">
                    <div className="max-w-3xl mx-auto space-y-16 pb-32">
                        {currentSection.questions.map((question: any, qIdx: number) => {
                            const options = JSON.parse(question.options || '[]');
                            const currentVal = answers[question.id]?.value;

                            return (
                                <div key={question.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex gap-8 mb-8 items-start">
                                        <div className="text-5xl font-serif italic text-slate-100 select-none leading-none">
                                            {(qIdx + 1).toString().padStart(2, '0')}
                                        </div>
                                        <h3 className="text-2xl font-medium text-slate-800 leading-relaxed pt-1">
                                            {question.text}
                                        </h3>
                                    </div>

                                    <div className="ml-20 space-y-3">
                                        {question.type === 'Scale 1-5' ? (
                                            <div className="flex gap-3">
                                                {[1, 2, 3, 4, 5].map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAnswer(question.id, val)}
                                                        className={`w-14 h-14 rounded-xl font-bold border-2 text-lg transition-all ${
                                                            currentVal === val 
                                                            ? 'border-amber-600 bg-amber-50 text-amber-600' 
                                                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                        }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            options.map((opt: any) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleAnswer(question, opt)}
                                                        disabled={isLocked}
                                                        className={`w-full text-left px-8 py-5 rounded-xl border-2 text-lg transition-all ${
                                                            currentVal === opt 
                                                            ? 'border-amber-600 bg-amber-50 text-amber-600 font-bold' 
                                                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {opt}
                                                    </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                <footer className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between z-10">
                    <button 
                        onClick={handleBack} 
                        disabled={currentSectionIndex === 0} 
                        className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {currentSectionIndex + 1} of {sections.length}
                        </span>
                        <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-600 transition-all duration-700 ease-out" 
                                style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }} 
                            />
                        </div>
                    </div>

                    {(!isConfirmed && currentSection.title === 'Applicability') ? (
                        <button 
                            onClick={handleConfirm}
                            className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            Confirm Selection <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                // Calculate role if we are coming from Clarification
                                if (currentSection.title === 'Role Clarification') {
                                    // Local helper definition to keep it self-contained
                                    const role = (() => {
                                        const rcSection = allSections.find((s: any) => s.title === 'Role Clarification');
                                        if (!rcSection) return null;
                                        const q1 = answers[rcSection.questions[0].id]?.value;
                                        const q2 = answers[rcSection.questions[1].id]?.value;
                                        const q3 = answers[rcSection.questions[2].id]?.value;
                                        const q4 = answers[rcSection.questions[3].id]?.value;
                                        const isA = (v: string) => v?.startsWith('A.');
                                        const isB = (v: string) => v?.startsWith('B.');
                                        if (isA(q1) && (isA(q4) || isB(q4))) return 'Significant Data Fiduciary';
                                        if (isA(q1)) return 'Data Fiduciary';
                                        if (isB(q1) && (isA(q2) || isB(q2)) && (isA(q3) || isB(q3))) return 'Data Processor';
                                        return 'Data Fiduciary'; // default
                                    })();
                                    if (role) setCalculatedRole(role);
                                }
                                handleNext();
                            }} 
                            disabled={currentSectionIndex === sections.length - 1} 
                            className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            Next Section <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}
