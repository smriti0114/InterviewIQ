import React, { useState } from 'react';
import { UserCheck, Save, Check } from 'lucide-react';

export default function CandidateEvaluator({ question, initialEvaluation, onSave }) {
  const [candidateAnswer, setCandidateAnswer] = useState(
    initialEvaluation?.candidate_answer || ''
  );
  const [feedback, setFeedback] = useState(initialEvaluation?.feedback || '');
  const [criterionScores, setCriterionScores] = useState(() => {
    const defaultScores = {};
    question.evaluation_rubric?.forEach((c) => {
      const existing = initialEvaluation?.criterion_scores?.find(
        (cs) => cs.criterion_name === c.criterion_name
      );
      defaultScores[c.criterion_name] = existing ? existing.assigned_points : 0;
    });
    return defaultScores;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleScoreChange = (criterionName, value, maxPoints) => {
    const num = Math.min(Math.max(Number(value) || 0, 0), maxPoints);
    setCriterionScores((prev) => ({
      ...prev,
      [criterionName]: num,
    }));
    setSavedSuccess(false);
  };

  const totalAssigned = Object.values(criterionScores).reduce((acc, val) => acc + val, 0);

  const handleSave = () => {
    const scoresList = Object.entries(criterionScores).map(([name, points]) => ({
      criterion_name: name,
      assigned_points: points,
    }));

    onSave({
      question_id: question.id,
      candidate_answer: candidateAnswer,
      criterion_scores: scoresList,
      overall_question_score: totalAssigned,
      feedback: feedback,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border-2 border-indigo-200 dark:border-indigo-900/60 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-950">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
            <UserCheck className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Interviewer Scoring & Candidate Assessment
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Score the candidate's actual answer against each rubric criterion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Assigned: {totalAssigned} / {question.max_score} pts
          </span>
        </div>
      </div>

      {/* Candidate Response / Interview Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Candidate's Response / Live Interview Notes:
        </label>
        <textarea
          rows={3}
          value={candidateAnswer}
          onChange={(e) => {
            setCandidateAnswer(e.target.value);
            setSavedSuccess(false);
          }}
          placeholder="Record key points, code snippets, or quotes from the candidate's answer..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Criteria Sliders / Inputs */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Criterion Score Breakdown:
        </label>
        <div className="space-y-2">
          {question.evaluation_rubric?.map((criterion, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {criterion.criterion_name}
                </p>
                <p className="text-slate-400 text-[11px] truncate">{criterion.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="range"
                  min="0"
                  max={criterion.max_points}
                  value={criterionScores[criterion.criterion_name] || 0}
                  onChange={(e) =>
                    handleScoreChange(criterion.criterion_name, e.target.value, criterion.max_points)
                  }
                  className="w-24 accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    min="0"
                    max={criterion.max_points}
                    value={criterionScores[criterion.criterion_name] || 0}
                    onChange={(e) =>
                      handleScoreChange(criterion.criterion_name, e.target.value, criterion.max_points)
                    }
                    className="w-12 text-center p-1 font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <span className="text-slate-400">/ {criterion.max_points}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Written Feedback Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Interviewer Assessment & Recommendation:
        </label>
        <input
          type="text"
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setSavedSuccess(false);
          }}
          placeholder="E.g., Strong grasp of fundamentals; recommended for technical round 2."
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
            savedSuccess
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Evaluation Saved!
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );
}
