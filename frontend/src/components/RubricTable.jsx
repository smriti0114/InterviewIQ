import React from 'react';
import { Award, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RubricTable({ rubric, maxScore = 10 }) {
  if (!rubric || rubric.length === 0) {
    return <p className="text-xs text-slate-400 italic">No explicit rubric configured.</p>;
  }

  const totalPoints = rubric.reduce((acc, c) => acc + (c.max_points || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="w-4 h-4 text-brand-500" />
          Evaluation Rubric Breakdown
        </span>
        <span className="bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
          Total: {totalPoints} / {maxScore} pts
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/80">
        {rubric.map((criterion, idx) => (
          <div key={idx} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h5 className="font-medium text-sm text-slate-800 dark:text-slate-100">
                  {criterion.criterion_name}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {criterion.description}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {criterion.max_points} pts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              {/* Strong Indicators */}
              {criterion.strong_indicators && criterion.strong_indicators.length > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Strong Answer Signals:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {criterion.strong_indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weak Indicators */}
              {criterion.weak_indicators && criterion.weak_indicators.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Partial / Weak Signals:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {criterion.weak_indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
