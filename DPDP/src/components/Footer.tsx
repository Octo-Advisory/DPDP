
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 font-sans">
        &copy; {new Date().getFullYear()} DPDP Readiness Scorecard. Secure local implementation.
      </div>
    </footer>
  );
}
