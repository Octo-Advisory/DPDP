import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'DPDP Readiness Scorecard',
  description: 'Enterprise privacy compliance assessment tool.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = require('next/headers').cookies();
  const sid = cookieStore.get('sid')?.value;
  const isLoggedIn = !!sid;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex flex-col bg-stone-50`}>
        {/* Force Single Tab Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('click', function(e) {
                var target = e.target.closest('a');
                if (target) {
                   target.target = '_self';
                }
              }, true);
            `,
          }}
        />

        <Navbar isLoggedIn={isLoggedIn} />

        {/* Main Content */}
        <main className="flex-grow bg-slate-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} DPDP Readiness Scorecard. secure local implementation.
          </div>
        </footer>
      </body>
    </html>
  );
}
