import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Printer,
  FileDown,
  Eye,
  EyeOff,
  Search,
  Filter,
  Layers,
  ChevronDown,
  Copy,
  Clock,
  Calendar,
  Share2
} from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import { QuestionCardSkeleton } from '../components/Skeleton';
import { api } from '../services/api';
import { downloadBlob, downloadJson } from '../utils/exportHelpers';
import { useToast } from '../context/ToastContext';

export default function InterviewResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchInterview() {
      try {
        const data = await api.getInterview(id);
        setInterview(data);
      } catch (err) {
        addToast(err.message || 'Failed to load interview.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id, navigate, addToast]);

  const handleUpdateQuestion = async (updatedQ) => {
    if (!interview) return;
    const updatedQuestions = interview.questions.map((q) =>
      q.id === updatedQ.id ? updatedQ : q
    );

    try {
      const saved = await api.updateInterview(interview.id, {
        questions: updatedQuestions,
      });
      setInterview(saved);
    } catch (err) {
      addToast('Failed to save question edit: ' + err.message, 'error');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!interview) return;
    const updatedQuestions = interview.questions.filter((q) => q.id !== questionId);
    try {
      const saved = await api.updateInterview(interview.id, {
        questions: updatedQuestions,
      });
      setInterview(saved);
    } catch (err) {
      addToast('Failed to delete question: ' + err.message, 'error');
    }
  };

  const handleRegenerateQuestion = async (questionId, feedback) => {
    setRegeneratingId(questionId);
    try {
      const updated = await api.regenerateQuestion(interview.id, {
        question_id: questionId,
        feedback: feedback || null,
      });
      setInterview(updated);
      addToast('Question regenerated successfully with AI!', 'success');
    } catch (err) {
      addToast('Regeneration failed: ' + err.message, 'error');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleSaveEvaluation = async (evaluationData) => {
    if (!interview) return;
    const evaluations = { ...(interview.evaluations || {}) };
    evaluations[evaluationData.question_id] = evaluationData;

    try {
      const saved = await api.updateInterview(interview.id, {
        evaluations: evaluations,
      });
      setInterview(saved);
      addToast('Candidate assessment saved.', 'success');
    } catch (err) {
      addToast('Failed to save assessment: ' + err.message, 'error');
    }
  };

  const handleExport = async (type) => {
    if (!interview) return;
    setExportLoading(true);
    try {
      if (type === 'pdf') {
        const blob = await api.exportPdf(interview.id);
        downloadBlob(blob, `${interview.role_title.replace(/\s+/g, '_')}_Interview.pdf`);
        addToast('PDF Guide downloaded successfully', 'success');
      } else if (type === 'csv') {
        const blob = await api.exportCsv(interview.id);
        downloadBlob(blob, `${interview.role_title.replace(/\s+/g, '_')}_Interview.csv`);
        addToast('CSV Sheet downloaded successfully', 'success');
      } else if (type === 'json') {
        const data = await api.exportJson(interview.id);
        downloadJson(data, `${interview.role_title.replace(/\s+/g, '_')}_Interview.json`);
        addToast('JSON data downloaded successfully', 'success');
      }
    } catch (err) {
      addToast('Export failed: ' + err.message, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <QuestionCardSkeleton />
        <QuestionCardSkeleton />
        <QuestionCardSkeleton />
      </div>
    );
  }

  if (!interview) return null;

  // Filtered Questions
  const filteredQuestions = interview.questions.filter((q) => {
    const matchCategory =
      categoryFilter === 'All' ||
      q.category === categoryFilter ||
      q.question_type === categoryFilter;
    const matchSearch =
      searchTerm === '' ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.suggested_answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const uniqueCategories = [
    'All',
    ...new Set(interview.questions.map((q) => q.question_type || q.category)),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="no-print flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Guide</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5 text-brand-500" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Interview Hero Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {interview.experience_level}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {interview.interview_type}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Difficulty: {interview.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(interview.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {interview.duration_minutes || 45} mins
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {interview.role_title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Core Skills: <span className="font-semibold text-slate-700 dark:text-slate-200">{interview.required_skills}</span>
          </p>
        </div>

        {interview.company_or_industry && (
          <p className="text-xs text-slate-400">
            Target Focus: {interview.company_or_industry}
          </p>
        )}
      </div>

      {/* Filter and Search Navigation Bar */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onRegenerateQuestion={handleRegenerateQuestion}
              onSaveEvaluation={handleSaveEvaluation}
              currentEvaluation={interview.evaluations?.[q.id]}
              isRegenerating={regeneratingId === q.id}
            />
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No questions match your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
