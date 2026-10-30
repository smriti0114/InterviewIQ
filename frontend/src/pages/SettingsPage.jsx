import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  AlertCircle,
  Save,
  Check,
  Sliders,
  Terminal,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { getStatusDisplay } from '../utils/statusHelpers';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Default Preferences
  const [defaultDifficulty, setDefaultDifficulty] = useState(
    user?.default_preferences?.default_difficulty || 'Medium'
  );
  const [defaultInterviewType, setDefaultInterviewType] = useState(
    user?.default_preferences?.default_interview_type || 'Technical'
  );
  const [defaultQuestionCount, setDefaultQuestionCount] = useState(
    user?.default_preferences?.default_question_count || 10
  );
  const [defaultLanguage, setDefaultLanguage] = useState(
    user?.default_preferences?.default_language || 'English'
  );

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySaving, setSecuritySaving] = useState(false);

  // API Config Status
  const [apiStatus, setApiStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await api.getConfigStatus();
        setApiStatus(status);
        window.dispatchEvent(new CustomEvent('interviewiq:llm_status_updated', { detail: status }));
      } catch (err) {
        console.error('Failed to load API status:', err);
      } finally {
        setStatusLoading(false);
      }
    }
    loadStatus();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await api.testLlmConnection();
      setApiStatus(res);
      window.dispatchEvent(new CustomEvent('interviewiq:llm_status_updated', { detail: res }));
      if (res.connection_status === 'connected') {
        addToast(res.message || 'LLM connection verified successfully!', 'success');
      } else if (res.connection_status === 'missing_key') {
        addToast(res.message || 'API key is not configured in backend/.env', 'warning');
      } else {
        addToast(res.message || `LLM connection issue: ${res.connection_status}`, 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to test LLM connection', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        default_preferences: {
          default_difficulty: defaultDifficulty,
          default_interview_type: defaultInterviewType,
          default_question_count: Number(defaultQuestionCount),
          default_language: defaultLanguage,
        },
      });
      updateUser(updated);
      addToast('Profile & preferences updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'warning');
      return;
    }

    setSecuritySaving(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      addToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast('Password change failed: ' + err.message, 'error');
    } finally {
      setSecuritySaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your account profile, generation preferences, theme, and API credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Profile & Defaults
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Security & Password
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'api'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          LLM Engine Status
        </button>
      </div>

      {/* Tab 1: Profile & Defaults */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Personal Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Theme Preference */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Appearance Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred visual style. Light mode is enabled by default.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  !isDark
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Theme</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? 'border-brand-500 bg-brand-950 text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-purple-400" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* Default Generation Preferences */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              Default Generator Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Difficulty
                </label>
                <select
                  value={defaultDifficulty}
                  onChange={(e) => setDefaultDifficulty(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Interview Type
                </label>
                <select
                  value={defaultInterviewType}
                  onChange={(e) => setDefaultInterviewType(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Technical">Technical</option>
                  <option value="Coding">Coding</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="HR">HR</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Question Count
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={defaultQuestionCount}
                  onChange={(e) => setDefaultQuestionCount(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default Language
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile & Preferences'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            Change Account Password
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Passwords are encrypted with industry-standard bcrypt hashing.
          </p>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password (Minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={securitySaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{securitySaving ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      )}

      {/* Tab 3: API & LLM Status */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Large Language Model (LLM) Engine Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Secure server-side API integration. Keys are never transmitted to the browser.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {apiStatus && (() => {
                  const statusInfo = getStatusDisplay(apiStatus);
                  return (
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                    >
                      {statusInfo.icon === 'check' ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      ) : statusInfo.icon === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      ) : statusInfo.icon === 'info' ? (
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{statusInfo.label}</span>
                    </span>
                  );
                })()}

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection || statusLoading}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 transition-colors"
                >
                  {testingConnection ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Status Feedback Message Banner */}
            {apiStatus?.message && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  apiStatus.connection_status === 'connected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : apiStatus.connection_status === 'missing_key'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {apiStatus.connection_status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{apiStatus.message}</p>
                  {apiStatus.connection_status === 'authentication_error' && (
                    <p className="text-[11px] opacity-90">
                      Google AI Studio rejected the API key. Please verify that your Gemini API key in <code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded font-mono">backend/.env</code> has no extra spaces or quotes.
                    </p>
                  )}
                  {apiStatus.connection_status === 'quota_exceeded' && (
                    <p className="text-[11px] opacity-90">
                      Your Gemini API rate limit or free quota has been exhausted. Check your usage on Google AI Studio.
                    </p>
                  )}
                  {apiStatus.connection_status === 'invalid_model' && (
                    <p className="text-[11px] opacity-90">
                      The specified model is not supported or recognized. Try <code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded font-mono">gemini-2.5-flash</code>.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Provider Details Grid */}
            {apiStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Configured Provider</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 capitalize">
                    {apiStatus.provider || apiStatus.llm_provider}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Active Inference Model</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 font-mono">
                    {apiStatus.model || apiStatus.llm_model}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">API Key Status</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                    {apiStatus.api_key_configured ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Configured & Stored</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Not Configured</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Operating Mode</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                    {apiStatus.mode === 'live' ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-brand-500" />
                        <span className="text-brand-600 dark:text-brand-400">Live AI Mode</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-amber-600 dark:text-amber-400">Simulated / Demo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Environment Configuration Guide */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800">
                <Terminal className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-white">How to Set Your LLM API Key</span>
              </div>
              <p className="text-slate-300">
                Open <span className="text-brand-300 font-bold">backend/.env</span> and insert your API key:
              </p>
              <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 overflow-x-auto text-[11px]">
{`# Google Gemini (Recommended - Free Tier Available)
LLM_PROVIDER=gemini
LLM_API_KEY=your_actual_gemini_api_key_here
LLM_MODEL=gemini-2.5-flash

# OR OpenAI / Groq
# LLM_PROVIDER=openai
# LLM_API_KEY=sk-...
# LLM_MODEL=gpt-4o-mini`}
              </pre>
              <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-400">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-brand-400 hover:underline"
                >
                  <span>Get Google Gemini Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-brand-400 hover:underline"
                >
                  <span>Get OpenAI Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
