import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Layers,
  Copy,
  Trash2,
  ExternalLink,
  PlusCircle,
  FileDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { downloadBlob, downloadJson } from '../utils/exportHelpers';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [interviewType, setInterviewType] = useState('All');

  // Deletion modal state
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const { addToast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.listInterviews({
        page,
        pageSize: 8,
        search: search.trim() || undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        interviewType: interviewType !== 'All' ? interviewType : undefined,
      });
      setInterviews(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      addToast(err.message || 'Failed to load history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, difficulty, interviewType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDuplicate = async (id) => {
    try {
      const duplicated = await api.duplicateInterview(id);
      addToast('Interview duplicated successfully!', 'success');
      fetchHistory();
    } catch (err) {
      addToast('Failed to duplicate: ' + err.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteInterview(deleteCandidate.id);
      addToast('Interview deleted.', 'info');
      setDeleteCandidate(null);
      fetchHistory();
    } catch (err) {
      addToast('Failed to delete: ' + err.message, 'error');
    }
  };

  const handleExport = async (id, title, type) => {
    try {
      if (type === 'pdf') {
        const blob = await api.exportPdf(id);
        downloadBlob(blob, `${title.replace(/\s+/g, '_')}_Guide.pdf`);
      } else if (type === 'csv') {
        const blob = await api.exportCsv(id);
        downloadBlob(blob, `${title.replace(/\s+/g, '_')}_Guide.csv`);
      } else if (type === 'json') {
        const data = await api.exportJson(id);
        downloadJson(data, `${title.replace(/\s+/g, '_')}_Guide.json`);
      }
      addToast(`Exported ${type.toUpperCase()} successfully`, 'success');
    } catch (err) {
      addToast('Export failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Interview History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View, search, duplicate, and export all previously generated interview sets ({total} total)
          </p>
        </div>

        <Link
          to="/generator"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Generate New</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role, skills, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Mixed">Mixed</option>
          </select>

          <select
            value={interviewType}
            onChange={(e) => {
              setInterviewType(e.target.value);
              setPage(1);
            }}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Technical">Technical</option>
            <option value="Coding">Coding</option>
            <option value="System Design">System Design</option>
            <option value="Behavioral">Behavioral</option>
            <option value="HR">HR</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading interview history...</div>
      ) : interviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {item.experience_level}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.difficulty}
                  </span>
                </div>

                <Link
                  to={`/interviews/${item.id}`}
                  className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1"
                >
                  {item.role_title}
                </Link>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Skills: {item.required_skills}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.question_count} Questions
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60">
                <Link
                  to={`/interviews/${item.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>Open Set</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExport(item.id, item.role_title, 'pdf')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
                    title="Export PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(item.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-500 transition-colors"
                    title="Duplicate Interview"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteCandidate(item)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No interview sets found matching your search.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setDifficulty('All');
              setInterviewType('All');
              setPage(1);
            }}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-bold">"{deleteCandidate?.role_title}"</span>? This will permanently delete all {deleteCandidate?.question_count} questions, rubrics, and saved candidate assessments.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteCandidate(null)}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
