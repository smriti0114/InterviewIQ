import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('Auth Login Flow', () => {
  it('renders login form inputs correctly', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('recruiter@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('populates demo credentials on clicking Fill Demo Credentials', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    const demoBtn = screen.getByRole('button', { name: /Fill Demo Credentials/i });
    fireEvent.click(demoBtn);

    const emailInput = screen.getByPlaceholderText('recruiter@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(emailInput.value).toBe('demo@interviewiq.ai');
    expect(passwordInput.value).toBe('demo123456');
  });
});
