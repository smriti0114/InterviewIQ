const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('interviewiq_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle file downloads (PDF, CSV)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('text/csv'))) {
    if (!response.ok) {
      throw new ApiError('Failed to download export file', response.status);
    }
    const blob = await response.blob();
    return blob;
  }

  // Handle JSON
  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // Empty body
  }

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'An unexpected error occurred';
    if (response.status === 401) {
      localStorage.removeItem('interviewiq_token');
      localStorage.removeItem('interviewiq_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/me', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
  getConfigStatus: () => request('/settings/config-status'),
  testLlmConnection: () => request('/settings/test-llm-connection', { method: 'POST' }),

  // Interviews
  generateInterview: (payload) => request('/interviews/generate', { method: 'POST', body: JSON.stringify(payload) }),
  listInterviews: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('page_size', params.pageSize);
    if (params.search) query.append('search', params.search);
    if (params.difficulty) query.append('difficulty', params.difficulty);
    if (params.interviewType) query.append('interview_type', params.interviewType);
    return request(`/interviews?${query.toString()}`);
  },
  getInterview: (id) => request(`/interviews/${id}`),
  updateInterview: (id, payload) => request(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  regenerateQuestion: (interviewId, payload) =>
    request(`/interviews/${interviewId}/regenerate-question`, { method: 'POST', body: JSON.stringify(payload) }),
  duplicateInterview: (id) => request(`/interviews/${id}/duplicate`, { method: 'POST' }),
  deleteInterview: (id) => request(`/interviews/${id}`, { method: 'DELETE' }),

  // Exports
  exportPdf: (id) => request(`/interviews/${id}/export/pdf`),
  exportCsv: (id) => request(`/interviews/${id}/export/csv`),
  exportJson: (id) => request(`/interviews/${id}/export/json`),

  // Health
  getHealth: () => request('/health'),
};
