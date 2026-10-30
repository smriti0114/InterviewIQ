import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  FileText,
  UserCheck,
  Building,
  Languages,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function GeneratorPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Presets
  const rolePresets = [
    { title: 'Python Developer', skills: 'Python, FastAPI, SQL, Docker, AsyncIO', type: 'Technical', diff: 'Medium', exp: 'Mid-Level' },
    { title: 'Frontend Developer', skills: 'React, TypeScript, Next.js, Tailwind CSS, REST APIs', type: 'Technical', diff: 'Medium', exp: 'Mid-Level' },
    { title: 'Backend Architect', skills: 'Go, Microservices, Distributed Systems, Kafka, PostgreSQL', type: 'System Design', diff: 'Hard', exp: 'Senior' },
    { title: 'Data Analyst', skills: 'SQL, Python, Pandas, Tableau, Power BI, Statistics', type: 'Technical', diff: 'Medium', exp: 'Entry Level' },
    { title: 'DevOps Engineer', skills: 'Kubernetes, Terraform, AWS, CI/CD pipelines, Prometheus', type: 'Technical', diff: 'Hard', exp: 'Senior' },
    { title: 'HR Executive', skills: 'Talent Acquisition, STAR Interviewing, Labor Compliance, Conflict Resolution', type: 'HR', diff: 'Medium', exp: 'Mid-Level' },
    { title: 'Fresher Software Engineer', skills: 'Data Structures, OOP, SQL, Java/Python, Git Basics', type: 'Technical', diff: 'Easy', exp: 'Fresher' },
  ];

  // Form State
  const [roleTitle, setRoleTitle] = useState('Python Developer');
  const [requiredSkills, setRequiredSkills] = useState('Python, FastAPI, SQL, Docker, AsyncIO');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [companyOrIndustry, setCompanyOrIndustry] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [language, setLanguage] = useState('English');
  const [jobDescription, setJobDescription] = useState('');
  const [candidateResumeText, setCandidateResumeText] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  // UI helpers
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await api.getConfigStatus();
        setApiStatus(status);
        if (!status.is_configured || status.connection_status === 'missing_key') {
          setDemoMode(true);
        } else {
          setDemoMode(false);
        }
      } catch (err) {
        console.error('Failed to get API status:', err);
      }
    }
    checkStatus();
  }, []);

  const handleApplyPreset = (preset) => {
    setRoleTitle(preset.title);
    setRequiredSkills(preset.skills);
    setInterviewType(preset.type);
    setDifficulty(preset.diff);
    setExperienceLevel(preset.exp);
    addToast(`Applied preset for ${preset.title}`, 'info', 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleTitle.trim()) {
      addToast('Please specify a Job Role / Title.', 'warning');
      return;
    }
    if (!requiredSkills.trim()) {
      addToast('Please specify required skills or technologies.', 'warning');
      return;
    }

    setLoading(true);
    setProgressStep(1);

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const payload = {
        role_title: roleTitle.trim(),
        required_skills: requiredSkills.trim(),
        experience_level: experienceLevel,
        interview_type: interviewType,
        difficulty: difficulty,
        question_count: Number(questionCount),
        duration_minutes: Number(durationMinutes),
        company_or_industry: companyOrIndustry.trim() || null,
        focus_areas: focusAreas.trim() || null,
        language: language,
        job_description: jobDescription.trim() || null,
        candidate_resume_text: candidateResumeText.trim() || null,
        demo_mode: demoMode,
      };

      const interview = await api.generateInterview(payload);
      clearInterval(stepInterval);
      addToast('Interview generated successfully!', 'success');
      navigate(`/interviews/${interview.id}`);
    } catch (err) {
      clearInterval(stepInterval);
      addToast(err.message || 'Failed to generate interview.', 'error', 6000);
    } finally {
      setLoading(false);
      setProgressStep(0);
    }
  };

  const progressMessages = [
    'Analyzing role specifications and skills matrix...',
    'Synthesizing practical questions and model solutions...',
    'Formulating evaluation rubrics and scoring criteria...',
    'Verifying rubric consistency and finalizing output...',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Configure New Interview Set
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Define role requirements, target difficulty, and custom focus areas for automated AI synthesis.
        </p>
      </div>

      {/* API Key Status Notice */}
      {apiStatus && (
        apiStatus.connection_status === 'connected' ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Live AI Mode Active: Powered by {apiStatus.provider || apiStatus.llm_provider} ({apiStatus.model || apiStatus.llm_model})
              </p>
            </div>
            <label className="flex items-center gap-2 font-medium text-emerald-800 dark:text-emerald-300 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span>Force Mock Simulation</span>
            </label>
          </div>
        ) : apiStatus.is_configured && apiStatus.connection_status !== 'missing_key' ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  LLM Connection Alert: {apiStatus.message || 'Error communicating with AI service'}
                </p>
                <p className="text-rose-700 dark:text-rose-300">
                  Requests may fallback to Demo Mode. Check your API key and quota in{' '}
                  <a href="/settings" className="underline font-semibold">Settings</a>.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-200 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="accent-rose-600 rounded"
              />
              <span>Demo Mode</span>
            </label>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  LLM API Key Not Detected in backend/.env
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Demo Mode is automatically enabled to generate instant, realistic mock questions. To connect live Gemini/OpenAI models, configure your key in{' '}
                  <a href="/settings" className="underline font-semibold">Settings</a>.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="accent-amber-600 rounded"
              />
              <span>Demo / Simulation Mode</span>
            </label>
          </div>
        )
      )}

      {/* Quick Role Presets Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
          Quick Start Role Presets:
        </label>
        <div className="flex flex-wrap gap-2">
          {rolePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shadow-sm"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Role Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Target Job Title / Role <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Required Skills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Required Skills & Technologies <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. Python, SQL, REST APIs, Microservices"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Fresher">Fresher (Fundamental mechanics & concepts)</option>
              <option value="Entry Level">Entry Level (0-2 years, practical syntax & tools)</option>
              <option value="Mid-Level">Mid-Level (3-5 years, architecture & debugging)</option>
              <option value="Senior">Senior (6+ years, trade-offs, scaling, failure modes)</option>
            </select>
          </div>

          {/* Interview Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Technical">Technical (Concepts, internals, debugging)</option>
              <option value="Coding">Coding (Algorithms, data structures, constraints)</option>
              <option value="System Design">System Design (Scalability, architecture, sharding)</option>
              <option value="Behavioral">Behavioral (STAR format, leadership, conflict)</option>
              <option value="HR">HR & Cultural (Motivation, collaboration, alignment)</option>
              <option value="Mixed">Mixed (Comprehensive blend across all categories)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Target Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Easy">Easy (Standard core concepts)</option>
              <option value="Medium">Medium (Applied scenario & performance)</option>
              <option value="Hard">Hard (Deep edge cases, scale & distributed trade-offs)</option>
              <option value="Mixed">Mixed (Graduated difficulty from Easy to Hard)</option>
            </select>
          </div>

          {/* Question Count */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Number of Questions
              </label>
              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                {questionCount} Questions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="30"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <input
                type="number"
                min="5"
                max="30"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-16 text-center text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>{showAdvanced ? 'Hide Optional Job Context' : 'Show Optional Job Context (Resume, JD, Duration)'}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Advanced Inputs */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Interview Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Company / Industry
              </label>
              <input
                type="text"
                value={companyOrIndustry}
                onChange={(e) => setCompanyOrIndustry(e.target.value)}
                placeholder="e.g. FinTech, Healthcare, E-Commerce"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Specific Focus Areas
              </label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="e.g. Database tuning, Security, Mentorship"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Language Preference
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="French">French</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Job Description Context (Optional)
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste relevant job description text to align questions with real team responsibilities..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Candidate Resume / Background Text (Optional)
              </label>
              <textarea
                rows={3}
                value={candidateResumeText}
                onChange={(e) => setCandidateResumeText(e.target.value)}
                placeholder="Paste candidate background summary or resume bullet points to generate tailored probing questions..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* Submit Button & Progress Indicator */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {loading && (
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
                  {progressMessages[progressStep] || progressMessages[0]}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((progressStep + 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="accent-brand-600 rounded"
              />
              <span>Force Simulated / Demo Mode (instant local generation)</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-indigo-700 shadow-lg shadow-brand-500/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Questions...' : 'Generate Interview Set'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
