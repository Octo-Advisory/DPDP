
// import React, { useState } from 'react';
// import { ChevronRight, ChevronLeft } from 'lucide-react';
// import { FrappeClient } from '../../lib/frappe/client';

// export default function Wizard({ assessment }: { assessment: any }) {
//     const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//     const [answers, setAnswers] = useState<Record<string, any>>({});
//     const [calculatedRole, setCalculatedRole] = useState<string | null>(assessment.identified_role || null);
//     const [isConfirmed, setIsConfirmed] = useState(!!assessment.identified_role);
//     const [flags, setFlags] = useState({
//         children: assessment.process_children_data || false,
//         cross_border: assessment.has_cross_border_transfers || false
//     });

//     const allSections = assessment.version_details?.sections || [];
//     const client = new FrappeClient();

//     const handleConfirm = async () => {
//         try {
//             await client.updateDoc('Assessment_dpdp', assessment.name, {
//                 identified_role: calculatedRole,
//                 process_children_data: flags.children ? 1 : 0,
//                 has_cross_border_transfers: flags.cross_border ? 1 : 0,
//                 status: 'Draft'
//             });
            
//             setIsConfirmed(true);
//             setCurrentSectionIndex(0); 
//         } catch (error: any) {
//             console.error(error);
//             alert(error.message || 'Failed to confirm selection.');
//         }
//     };

//     const sections = allSections.filter((section: any) => {
//         const isDiscovery = section.target_select === 'None' || !section.target_select;
        
//         // 1. PHASE 1: Discovery Logic (Before Confirmation)
//         if (!isConfirmed) {
//             if (!isDiscovery) return false; // Hide all functional sections
            
//             // "Role Identification" is always visible
//             if (section.title === 'Role Identification') return true;
            
//             // Check current selection in Role Identification
//             const riSection = allSections.find((s: any) => s.title === 'Role Identification');
//             const riQuestionId = riSection?.questions[0]?.id || riSection?.questions[0]?.name;
//             const q1Val = answers[riQuestionId]?.value;

//             // "Role Clarification" only visible if "Not sure"
//             if (section.title === 'Role Clarification') {
//                 return q1Val === 'Not sure';
//             }
            
//             // "Applicability" visible if ANY selection is made
//             if (section.title === 'Applicability') {
//                 return !!q1Val;
//             }

//             // Hide any other discovery sections not mentioned in the core flow
//             return false;
//         }

//         // 2. PHASE 2: Functional Logic (After Confirmation)
//         if (isDiscovery) return false; // Hide all discovery sections
//         if (section.target_select !== calculatedRole) return false; // Only show sections for identified role

//         // Sustainability/Optional filters
//         if (section.applicability_trigger === 'process_children_data' && !flags.children) return false;
//         if (section.applicability_trigger === 'cross_border_transfer' && !flags.cross_border) return false;

//         return true;
//     }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

//     const currentSection = sections[currentSectionIndex];

//     const handleNext = () => {
//         if (currentSectionIndex < sections.length - 1) {
//             setCurrentSectionIndex(currentSectionIndex + 1);
//         }
//     };

//     const handleBack = () => {
//         if (currentSectionIndex > 0) {
//             setCurrentSectionIndex(currentSectionIndex - 1);
//         }
//     };

//     const handleAnswer = (question: any, value: any) => {
//         const questionId = question.id || question.name;
//         setAnswers(prev => {
//             const newAnswers = { ...prev, [questionId]: { value: value } };
            
//             if (question.updates_role) {
//                 setCalculatedRole(value && value !== 'Not sure' ? value : null);
//             }

//             if (question.updates_flag === 'process_children_data') {
//                 setFlags(f => ({ ...f, children: value?.startsWith('A.') || false }));
//             }
//             if (question.updates_flag === 'cross_border_transfer') {
//                 setFlags(f => ({ ...f, cross_border: value?.startsWith('A.') || false }));
//             }

//             return newAnswers;
//         });
//     };

//     if (sections.length === 0 || !currentSection) {
//         return (
//             <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
//                 <p className="text-xl font-medium text-center px-4">Loading your questionnaire...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="flex h-screen bg-white">
//             <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
//                 <div className="p-8 border-b border-slate-200 bg-white">
//                     <h2 className="text-xl font-serif font-bold text-slate-900 leading-none">Assessment</h2>
//                     <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">Navigation</p>
//                 </div>
                
//                 <div className="flex-1 overflow-y-auto p-4 space-y-1 text-left">
//                     {sections.map((section: any, idx: number) => {
//                         const isCurrent = currentSection?.name === section.name;

//                         return (
//                             <button
//                                 key={section.name}
//                                 onClick={() => {
//                                     setCurrentSectionIndex(idx);
//                                 }}
//                                 className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
//                                     isCurrent 
//                                     ? 'bg-amber-600 text-white shadow-md' 
//                                     : 'text-slate-500 hover:bg-slate-200'
//                                 }`}
//                             >
//                                 <span className="text-[10px] font-bold block opacity-60 uppercase mb-0.5">Section {idx + 1}</span>
//                                 <span className="text-sm font-bold truncate block">{section.title}</span>
//                             </button>
//                         );
//                     })}
//                 </div>
//             </div>

//             <div className="flex-1 flex flex-col relative overflow-hidden">
//                 <header className="h-20 bg-white border-b border-slate-100 px-12 flex items-center justify-between z-10 shrink-0">
//                     <div>
//                         <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">Framework: DPDP</span>
//                         <h2 className="text-lg font-serif font-bold text-slate-900">{currentSection?.title}</h2>
//                     </div>
//                 </header>

//                 <main className="flex-1 overflow-y-auto px-12 py-16">
//                     <div className="max-w-3xl mx-auto space-y-16 pb-32">
//                         {currentSection.questions && currentSection.questions.map((question: any, qIdx: number) => {
//                             const options = JSON.parse(question.options || '[]');
//                             const questionId = question.id || question.name;
//                             const currentVal = answers[questionId]?.value;

//                             return (
//                                 <div key={questionId} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                                     <div className="flex gap-8 mb-8 items-start">
//                                         <div className="text-5xl font-serif italic text-slate-100 select-none leading-none">
//                                             {(qIdx + 1).toString().padStart(2, '0')}
//                                         </div>
//                                         <h3 className="text-2xl font-medium text-slate-800 leading-relaxed pt-1">
//                                             {question.text}
//                                         </h3>
//                                     </div>

//                                     <div className="ml-20 space-y-3">
//                                         {question.type === 'Scale 1-5' ? (
//                                             <div className="flex gap-3">
//                                                 {[1, 2, 3, 4, 5].map((val) => (
//                                                     <button
//                                                         key={val}
//                                                         onClick={() => handleAnswer(question, val)}
//                                                         className={`w-14 h-14 rounded-xl font-bold border-2 text-lg transition-all ${
//                                                             currentVal === val 
//                                                             ? 'border-amber-600 bg-amber-50 text-amber-600' 
//                                                             : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
//                                                         }`}
//                                                     >
//                                                         {val}
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         ) : (
//                                             options.map((opt: any) => (
//                                                 <button
//                                                     key={opt}
//                                                     onClick={() => handleAnswer(question, opt)}
//                                                     className={`w-full text-left px-8 py-5 rounded-xl border-2 text-lg transition-all ${
//                                                         currentVal === opt 
//                                                         ? 'border-amber-600 bg-amber-50 text-amber-600 font-bold' 
//                                                         : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
//                                                     }`}
//                                                 >
//                                                     {opt}
//                                                 </button>
//                                             ))
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </main>

//                 <footer className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between z-10 shrink-0">
//                     <button 
//                         onClick={handleBack} 
//                         disabled={currentSectionIndex === 0} 
//                         className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
//                     >
//                         <ChevronLeft className="w-5 h-5" /> Back
//                     </button>
                    
//                     <div className="flex items-center gap-4">
//                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//                             {currentSectionIndex + 1} of {sections.length}
//                         </span>
//                         <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden">
//                             <div 
//                                 className="h-full bg-amber-600 transition-all duration-700 ease-out" 
//                                 style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }} 
//                             />
//                         </div>
//                     </div>

//                     {(() => {
//                         const isAllAnswered = currentSection.questions?.every((q: any) => {
//                             const val = answers[q.id || q.name]?.value;
//                             return val !== undefined && val !== null && val !== '';
//                         });

//                         // For the final "Confirm Selection", we must ensure ALL discovery sections are complete, 
//                         // not just the current page.
//                         const isDiscoveryComplete = sections.every(s => 
//                             s.questions?.every((q: any) => {
//                                 const val = answers[q.id || q.name]?.value;
//                                 return val !== undefined && val !== null && val !== '';
//                             })
//                         );

//                         return (!isConfirmed && currentSection.title === 'Applicability') ? (
//                             <button 
//                                 onClick={handleConfirm}
//                                 disabled={!isDiscoveryComplete}
//                                 className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
//                             >
//                                 Confirm Selection <ChevronRight className="w-5 h-5" />
//                             </button>
//                         ) : (
//                             <button 
//                                 onClick={() => {
//                                     if (currentSection.title === 'Role Clarification') {
//                                         const role = (() => {
//                                             const rcSection = allSections.find((s: any) => s.title === 'Role Clarification');
//                                             if (!rcSection) return null;
//                                             const q1 = answers[rcSection.questions[0].name]?.value;
//                                             const q2 = answers[rcSection.questions[1].name]?.value;
//                                             const q3 = answers[rcSection.questions[2].name]?.value;
//                                             const q4 = answers[rcSection.questions[3].name]?.value;
//                                             const isA = (v: string) => v?.startsWith('A.');
//                                             const isB = (v: string) => v?.startsWith('B.');
//                                             if (isA(q1) && (isA(q4) || isB(q4))) return 'Significant Data Fiduciary';
//                                             if (isA(q1)) return 'Data Fiduciary';
//                                             if (isB(q1) && (isA(q2) || isB(q2)) && (isA(q3) || isB(q3))) return 'Data Processor';
//                                             return 'Data Fiduciary'; 
//                                         })();
//                                         if (role) setCalculatedRole(role);
//                                     }
//                                     handleNext();
//                                 }} 
//                                 disabled={currentSectionIndex === sections.length - 1 || !isAllAnswered} 
//                                 className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
//                             >
//                                 Next Section <ChevronRight className="w-5 h-5" />
//                             </button>
//                         );
//                     })()}
//                 </footer>
//             </div>
//         </div>
//     );
// }
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { FrappeClient } from '../../lib/frappe/client';

export default function Wizard({ assessment }: { assessment: any }) {
    const navigate = useNavigate();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [calculatedRole, setCalculatedRole] = useState<string | null>(assessment.identified_role || null);
    const [isConfirmed, setIsConfirmed] = useState(!!assessment.identified_role);
    const [flags, setFlags] = useState({
        children: assessment.process_children_data || false,
        cross_border: assessment.has_cross_border_transfers || false
    });

    const allSections = assessment.version_details?.sections || [];
    const client = new FrappeClient();

    const handleConfirm = async (roleOverride?: string) => {
        try {
            const finalRole = roleOverride || calculatedRole;
            await client.updateDoc('Assessment_dpdp', assessment.name, {
                identified_role: finalRole,
                process_children_data: flags.children ? 1 : 0,
                has_cross_border_transfers: flags.cross_border ? 1 : 0,
                status: 'Draft'
            });
            
            if (roleOverride) setCalculatedRole(roleOverride);
            setIsConfirmed(true);
            setCurrentSectionIndex(0); 
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to confirm selection.');
        }
    };

    const sections = allSections.filter((section: any) => {
        const isDiscovery = section.target_select === 'None' || !section.target_select;
        
        // 1. PHASE 1: Discovery Logic (Before Confirmation)
        if (!isConfirmed) {
            if (!isDiscovery) return false; // Hide all functional sections
            
            // "Role Identification" is always visible
            if (section.title === 'Role Identification') return true;
            
            // Check current selection in Role Identification
            const riSection = allSections.find((s: any) => s.title === 'Role Identification');
            const riQuestionId = riSection?.questions[0]?.id || riSection?.questions[0]?.name;
            const q1Val = answers[riQuestionId]?.value;

            // "Role Clarification" only visible if "Not sure"
            if (section.title === 'Role Clarification') {
                return q1Val === 'Not sure';
            }
            
            // "Applicability Questions" visible if ANY selection is made
            if (section.title === 'Applicability Questions') {
                return !!q1Val;
            }

            // Hide any other discovery sections not mentioned in the core flow
            return false;
        }

        // 2. PHASE 2: Functional Logic (After Confirmation)
        if (isDiscovery) return false; // Hide all discovery sections
        if (section.target_select !== calculatedRole) return false; // Only show sections for identified role

        // Sustainability/Optional filters
        if (section.applicability_trigger === 'process_children_data' && !flags.children) return false;
        if (section.applicability_trigger === 'cross_border_transfer' && !flags.cross_border) return false;

        return true;
    }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const currentSection = sections[currentSectionIndex];

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
        const questionId = question.id || question.name;
        setAnswers(prev => {
            // Check if already selected (deselect)
            if (prev[questionId]?.value === value) {
                const newAnswers = { ...prev };
                delete newAnswers[questionId];

                // Reset role/flags if necessary
                if (question.updates_role) {
                    setCalculatedRole(null);
                }
                if (question.updates_flag === 'process_children_data') {
                    setFlags(f => ({ ...f, children: false }));
                }
                if (question.updates_flag === 'cross_border_transfer') {
                    setFlags(f => ({ ...f, cross_border: false }));
                }

                return newAnswers;
            }

            const newAnswers = { ...prev, [questionId]: { value: value } };
            
            if (question.updates_role) {
                setCalculatedRole(value && value !== 'Not sure' ? value : null);
            }

            if (question.updates_flag === 'process_children_data') {
                setFlags(f => ({ ...f, children: value?.startsWith('A.') || value === 'Yes' || false }));
            }
            if (question.updates_flag === 'cross_border_transfer') {
                setFlags(f => ({ ...f, cross_border: value?.startsWith('A.') || value === 'Yes' || false }));
            }

            return newAnswers;
        });
    };

    if (sections.length === 0 || !currentSection) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
                <p className="text-xl font-medium text-center px-4">Loading your questionnaire...</p>
            </div>
        );
    }

    return (
        <div className="flex bg-white">
            <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <h2 className="text-xl font-serif font-bold text-slate-900 leading-none">Assessment</h2>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">Navigation</p>
                </div>
                
                <div className="p-3 space-y-1 text-left">
                    {sections.map((section: any, idx: number) => {
                        const isCurrent = currentSection?.name === section.name;

                        return (
                            <button
                                key={section.name}
                                onClick={() => {
                                    setCurrentSectionIndex(idx);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                                    isCurrent 
                                    ? 'bg-amber-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                <span className="text-[10px] font-bold block opacity-60 uppercase mb-0.5 tracking-wider">SEC {idx + 1}</span>
                                <span className="text-sm font-bold truncate block">{section.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 flex flex-col relative">
                <header className="h-16 bg-white border-b border-slate-100 px-10 flex items-center justify-between z-10 shrink-0">
                    <div>
                        <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block mb-0.5">Framework: DPDP</span>
                        <h2 className="text-base font-serif font-bold text-slate-900 leading-none">{currentSection?.title}</h2>
                    </div>
                </header>

                <main className="flex-1 px-10 py-10">
                    <div className="max-w-2xl mx-auto space-y-12 pb-24">
                        {currentSection.questions && currentSection.questions.map((question: any, qIdx: number) => {
                            const options = JSON.parse(question.options || '[]');
                            const questionId = question.id || question.name;
                            const currentVal = answers[questionId]?.value;

                            return (
                                <div key={questionId} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex gap-5 mb-6 items-start">
                                        <div className="text-4xl font-serif italic text-slate-100 select-none leading-none pt-1">
                                            {(qIdx + 1).toString().padStart(2, '0')}
                                        </div>
                                        <h3 className="text-xl font-medium text-slate-800 leading-snug pt-0.5">
                                            {question.text}
                                        </h3>
                                    </div>

                                    <div className="ml-14 space-y-2.5">
                                        {question.type === 'Scale 1-5' ? (
                                            <div className="flex gap-2.5">
                                                {[1, 2, 3, 4, 5].map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAnswer(question, val)}
                                                        className={`w-12 h-12 rounded-xl font-bold border-2 text-base transition-all ${
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
                                                    className={`w-full text-left px-6 py-4 rounded-xl border-2 text-base transition-all ${
                                                        currentVal === opt 
                                                        ? 'border-amber-600 bg-amber-50 text-amber-600 font-bold' 
                                                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                                                    }`}
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

                <footer className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between z-10 shrink-0">
                    <button 
                        onClick={handleBack} 
                        disabled={currentSectionIndex === 0} 
                        className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
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

                    {(() => {
                        const isAllAnswered = currentSection.questions?.every((q: any) => {
                            const val = answers[q.id || q.name]?.value;
                            return val !== undefined && val !== null && val !== '';
                        });

                        // For the final "Confirm Selection", we must ensure ALL discovery sections are complete, 
                        // not just the current page.
                        const isDiscoveryComplete = sections.every(s => 
                            s.questions?.every((q: any) => {
                                const val = answers[q.id || q.name]?.value;
                                return val !== undefined && val !== null && val !== '';
                            })
                        );

                        const isLastDiscoverySection = !isConfirmed && currentSectionIndex === sections.length - 1;

                        return isLastDiscoverySection ? (
                            <button 
                                onClick={async () => {
                                    let roleToConfirm = calculatedRole;
                                    
                                    // Always re-calculate if missing or if we want to be sure
                                    const rcSection = allSections.find((s: any) => s.title === 'Role Clarification');
                                    if (rcSection && rcSection.questions?.length >= 1) {
                                        const q1 = answers[rcSection.questions[0].name]?.value || answers[rcSection.questions[0].id]?.value;
                                        if (q1) {
                                            const q2 = answers[rcSection.questions[1]?.name]?.value || answers[rcSection.questions[1]?.id]?.value;
                                            const q3 = answers[rcSection.questions[2]?.name]?.value || answers[rcSection.questions[2]?.id]?.value;
                                            const q4 = answers[rcSection.questions[3]?.name]?.value || answers[rcSection.questions[3]?.id]?.value;
                                            
                                            const isA = (v: any) => v && (String(v).startsWith('A.') || String(v) === 'Yes');
                                            const isB = (v: any) => v && (String(v).startsWith('B.') || String(v) === 'No');
                                            
                                            if (isA(q1) && (isA(q4) || (q4 && String(q4).includes('Possibly')))) {
                                                roleToConfirm = 'Significant Data Fiduciary';
                                            } else if (isA(q1)) {
                                                roleToConfirm = 'Data Fiduciary';
                                            } else if (isB(q1)) {
                                                roleToConfirm = 'Data Processor';
                                            }
                                        }
                                    }
                                    
                                    // Default to Data Fiduciary if still nothing
                                    if (!roleToConfirm) roleToConfirm = 'Data Fiduciary';
                                    
                                    handleConfirm(roleToConfirm);
                                }}
                                disabled={!isDiscoveryComplete}
                                className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Confirm Choices <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button 
                                onClick={async () => {
                                    if (currentSection.title === 'Role Clarification') {
                                        const rcSection = allSections.find((s: any) => s.title === 'Role Clarification');
                                        if (rcSection && rcSection.questions?.length >= 4) {
                                            const q1 = answers[rcSection.questions[0].name]?.value;
                                            const q2 = answers[rcSection.questions[1].name]?.value;
                                            const q3 = answers[rcSection.questions[2].name]?.value;
                                            const q4 = answers[rcSection.questions[3].name]?.value;
                                            const isA = (v: string) => v?.startsWith('A.');
                                            const isB = (v: string) => v?.startsWith('B.');
                                            
                                            let role = 'Data Fiduciary';
                                            if (isA(q1) && (isA(q4) || q4?.includes('Possibly'))) {
                                                role = 'Significant Data Fiduciary';
                                            } else if (isA(q1)) {
                                                role = 'Data Fiduciary';
                                            } else if (isB(q1) && (isA(q2) || isB(q2)) && (isA(q3) || isB(q3))) {
                                                role = 'Data Processor';
                                            }
                                            setCalculatedRole(role);
                                        }
                                    }

                                    if (currentSectionIndex === sections.length - 1) {
                                        setSubmitting(true);
                                        try {
                                            await client.call('dpdp_compliance.api.submit_assessment', {
                                                assessment_name: assessment.name,
                                                answers: answers
                                            });
                                            navigate(`/assessments/${assessment.name}/results`);
                                        } catch (error: any) {
                                            console.error(error);
                                            alert(error.message || 'Failed to submit assessment.');
                                        } finally {
                                            setSubmitting(false);
                                        }
                                        return;
                                    }
                                    handleNext();
                                }} 
                                disabled={currentSectionIndex === sections.length - 1 && !isAllAnswered} 
                                className={`flex items-center gap-2 px-10 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                                    currentSectionIndex === sections.length - 1
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                {currentSectionIndex === sections.length - 1 ? (
                                    <>
                                        {submitting ? 'Calculating Score...' : 'Submit Assessment'} <ChevronRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        Next Section <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        );
                    })()}
                </footer>
            </div>
        </div>
    );
}