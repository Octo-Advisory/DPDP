
// import React, { useEffect } from 'react';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

// export default function MainLayout({ children }: { children: React.ReactNode }) {
//     useEffect(() => {
//         // Replicate the "Force Single Tab" flow from layout.tsx
//         const handleLinkClick = (e: MouseEvent) => {
//             const target = (e.target as HTMLElement).closest('a');
//             if (target) {
//                 target.target = '_self';
//             }
//         };

//         document.addEventListener('click', handleLinkClick, true);
//         return () => document.removeEventListener('click', handleLinkClick, true);
//     }, []);

//     return (
//         <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
//             <Navbar />
//             <main className="flex-grow bg-slate-50">
//                 {children}
//             </main>
//             <Footer />
//         </div>
//     );
// }
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Replicate the "Force Single Tab" flow from layout.tsx
        const handleLinkClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (target) {
                target.target = '_self';
            }
        };

        document.addEventListener('click', handleLinkClick, true);
        return () => document.removeEventListener('click', handleLinkClick, true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
            <div className="flex-none z-[100] w-full sticky top-0">
                <Navbar />
            </div>
            <main className="flex-grow bg-slate-50">
                {children}
            </main>
            <div className="flex-none">
                <Footer />
            </div>
        </div>
    );
}