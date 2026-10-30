export function getStatusDisplay(apiStatus) {
  if (!apiStatus) {
    return {
      label: 'Checking...',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      badgeColor: 'slate',
      icon: 'alert',
    };
  }

  const connStatus = apiStatus.connection_status;
  const isKeySet = apiStatus.api_key_configured ?? apiStatus.is_configured;
  const provider = apiStatus.provider || apiStatus.llm_provider || 'Gemini';

  if (!isKeySet || connStatus === 'missing_key') {
    return {
      label: 'API Key Unset',
      color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      badgeColor: 'amber',
      icon: 'alert',
    };
  }

  switch (connStatus) {
    case 'connected':
      return {
        label: `${provider} Connected`,
        color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        badgeColor: 'emerald',
        icon: 'check',
      };
    case 'authentication_error':
      return {
        label: 'Authentication Error',
        color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        badgeColor: 'rose',
        icon: 'error',
      };
    case 'quota_exceeded':
      return {
        label: 'Quota Exceeded',
        color: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        badgeColor: 'orange',
        icon: 'alert',
      };
    case 'invalid_model':
      return {
        label: 'Invalid Model',
        color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        badgeColor: 'rose',
        icon: 'error',
      };
    case 'connection_error':
      return {
        label: 'Connection Error',
        color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        badgeColor: 'rose',
        icon: 'error',
      };
    case 'configured':
    default:
      return {
        label: 'Configured',
        color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        badgeColor: 'blue',
        icon: 'info',
      };
  }
}
