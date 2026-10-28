import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Edit3,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Clock,
  UserCheck
} from 'lucide-react';
import RubricTable from './RubricTable';
import CandidateEvaluator from './CandidateEvaluator';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';

export default function QuestionCard({
  question,
  onUpdateQuestion,
  onDeleteQuestion,
  onRegenerateQuestion,
  onSaveEvaluation,
  currentEvaluation,
  isRegenerating = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAnswer, setShowAnswer] = useState(true);
  const [showEvaluator, setShowEvaluator] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedText, setEditedText] = useState(question.question);
  const [editedAnswer, setEditedAnswer] = useState(question.suggested_answer);

  // Regenerate prompt modal state
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [regenFeedback, setRegenFeedback] = useState('');

  // Delete confirm modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { addToast } = useToast();

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'question') {
        setCopiedQuestion(true);
        setTimeout(() => setCopiedQuestion(false), 2000);
        addToast('Question copied to clipboard', 'success', 2000);
      } else {
        setCopiedAnswer(true);
        setTimeout(() => setCopiedAnswer(false), 2000);
        addToast('Model answer copied to clipboard', 'success', 2000);
      }
    } catch {
      addToast('Failed to copy text', 'error');
    }
  };

  const handleSaveEdit = () => {
    onUpdateQuestion({
      ...question,
      question: editedText,
      suggested_answer: editedAnswer,
    });
    setIsEditModalOpen(false);
    addToast('Question updated successfully', 'success');
  };

  const handleConfirmRegenerate = () => {
    setIsRegenModalOpen(false);
    onRegenerateQuestion(question.id, regenFeedback);
    setRegenFeedback('');
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Hard: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  const typeColors = {
    Technical: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Coding: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'System Design': 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Behavioral: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    HR: 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  };

  return (
    <div className="card-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Question Header Bar */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white">
            Q{question.number}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              typeColors[question.question_type] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {question.question_type}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              difficultyColors[question.difficulty] || difficultyColors.Medium
            }`}
          >
            {question.difficulty}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            • {question.topic}
          </span>
        </div>

        {/* Action Controls */}
        <div className="no-print flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 mr-2 text-xs font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>~{question.estimated_time_minutes || 5} min</span>
          </div>

          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={showAnswer ? 'Hide model answer' : 'Show model answer'}
          >
            {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={() => copyToClipboard(question.question, 'question')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Copy question text"
          >
            {copiedQuestion ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Edit question & answer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsRegenModalOpen(true)}
            disabled={isRegenerating}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Regenerate this question with AI"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-brand-500' : ''}`} />
          </button>

          <button
            onClick={() => setShowEvaluator(!showEvaluator)}
            className={`p-1.5 rounded-lg transition-colors ${
              showEvaluator
                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Toggle candidate assessment scoring"
          >
            <UserCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {question.question}
          </h4>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* Model Answer */}
            {showAnswer && (
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                    Model Answer & Ideal Talking Points
                  </span>
                  <button
                    onClick={() => copyToClipboard(question.suggested_answer, 'answer')}
                    className="flex items-center gap-1 hover:underline text-[11px]"
                  >
                    {copiedAnswer ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {question.suggested_answer}
                </p>
              </div>
            )}

            {/* Key Concepts Pills */}
            {question.key_concepts && question.key_concepts.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  Expected Concepts:
                </span>
                {question.key_concepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            )}

            {/* Follow-up Questions */}
            {question.follow_up_questions && question.follow_up_questions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                  Recommended Follow-Up Questions:
                </h5>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                  {question.follow_up_questions.map((fq, i) => (
                    <li key={i}>{fq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags / Misconceptions */}
            {question.red_flags && question.red_flags.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Candidate Red Flags / Common Misconceptions:
                </h5>
                <ul className="space-y-0.5 text-xs text-rose-800 dark:text-rose-300 list-disc list-inside">
                  {question.red_flags.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rubric Criteria Table */}
            <RubricTable rubric={question.evaluation_rubric} maxScore={question.max_score} />

            {/* Candidate Evaluator */}
            {showEvaluator && (
              <CandidateEvaluator
                question={question}
                initialEvaluation={currentEvaluation}
                onSave={onSaveEvaluation}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Question #${question.number}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Text:
            </label>
            <textarea
              rows={3}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Model Answer / Suggested Solution:
            </label>
            <textarea
              rows={6}
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Regenerate Question Modal */}
      <Modal
        isOpen={isRegenModalOpen}
        onClose={() => setIsRegenModalOpen(false)}
        title={`Regenerate Question #${question.number} with AI`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provide optional instructions to guide the AI, or leave blank to generate an alternative question covering this topic.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Refinement Instructions (Optional):
            </label>
            <input
              type="text"
              value={regenFeedback}
              onChange={(e) => setRegenFeedback(e.target.value)}
              placeholder="e.g. Focus on asynchronous concurrency; make it more challenging..."
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsRegenModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRegenerate}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Question
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Question"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete Question #{question.number}? The remaining questions in this interview set will be re-numbered.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                onDeleteQuestion(question.id);
                addToast('Question removed', 'info');
              }}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              Delete Question
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
