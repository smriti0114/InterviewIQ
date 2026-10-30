import { describe, it, expect } from 'vitest';
import { getStatusDisplay } from '../utils/statusHelpers';

describe('getStatusDisplay helper', () => {
  it('returns Checking... when status is null', () => {
    const res = getStatusDisplay(null);
    expect(res.label).toBe('Checking...');
    expect(res.icon).toBe('alert');
  });

  it('returns API Key Unset when key is missing or not configured', () => {
    const res1 = getStatusDisplay({
      api_key_configured: false,
      is_configured: false,
      connection_status: 'missing_key',
      provider: 'gemini',
    });
    expect(res1.label).toBe('API Key Unset');
    expect(res1.badgeColor).toBe('amber');

    const res2 = getStatusDisplay({
      is_configured: false,
      connection_status: 'missing_key',
    });
    expect(res2.label).toBe('API Key Unset');
  });

  it('returns Gemini Connected when connection_status is connected', () => {
    const res = getStatusDisplay({
      api_key_configured: true,
      connection_status: 'connected',
      provider: 'Gemini',
      model: 'gemini-2.5-flash',
    });
    expect(res.label).toBe('Gemini Connected');
    expect(res.badgeColor).toBe('emerald');
    expect(res.icon).toBe('check');
  });

  it('returns Authentication Error when connection_status is authentication_error', () => {
    const res = getStatusDisplay({
      api_key_configured: true,
      connection_status: 'authentication_error',
      provider: 'gemini',
    });
    expect(res.label).toBe('Authentication Error');
    expect(res.badgeColor).toBe('rose');
    expect(res.icon).toBe('error');
  });

  it('returns Quota Exceeded when connection_status is quota_exceeded', () => {
    const res = getStatusDisplay({
      api_key_configured: true,
      connection_status: 'quota_exceeded',
      provider: 'gemini',
    });
    expect(res.label).toBe('Quota Exceeded');
    expect(res.badgeColor).toBe('orange');
  });

  it('returns Invalid Model when connection_status is invalid_model', () => {
    const res = getStatusDisplay({
      api_key_configured: true,
      connection_status: 'invalid_model',
      provider: 'gemini',
    });
    expect(res.label).toBe('Invalid Model');
    expect(res.badgeColor).toBe('rose');
  });

  it('returns Connection Error when connection_status is connection_error', () => {
    const res = getStatusDisplay({
      api_key_configured: true,
      connection_status: 'connection_error',
      provider: 'gemini',
    });
    expect(res.label).toBe('Connection Error');
    expect(res.badgeColor).toBe('rose');
  });

  it('returns Configured when key is set but not yet verified', () => {
    const res = getStatusDisplay({
      api_key_configured: true,
      connection_status: 'configured',
      provider: 'gemini',
    });
    expect(res.label).toBe('Configured');
    expect(res.badgeColor).toBe('blue');
  });
});
