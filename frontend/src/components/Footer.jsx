import React from 'react';
import { Sparkles, Cpu, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-10 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">InterviewIQ</span>
            <span>— AI-Based Interview Question Generator</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-brand-500" />
              <span>Optimized for 8GB RAM Laptops</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Enterprise API & JWT Auth</span>
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} InterviewIQ. Built with FastAPI, React, and Gemini/OpenAI LLM Integration.</p>
          <p className="flex items-center gap-1">
            Engineered for fair, structured, and consistent candidate evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
}
