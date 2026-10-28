import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionCard from '../components/QuestionCard';
import { ToastProvider } from '../context/ToastContext';

describe('QuestionCard Component', () => {
  const mockQuestion = {
    id: 'q-1',
    number: 1,
    question: 'How do you design a high-throughput queue using Redis streams?',
    category: 'Technical',
    topic: 'Redis Architecture',
    difficulty: 'Hard',
    question_type: 'Technical',
    suggested_answer: 'Consumer groups, XADD, XREADGROUP, and acknowledgment with XACK.',
    key_concepts: ['Consumer Groups', 'PEL (Pending Entries List)', 'XACK'],
    follow_up_questions: ['How do you handle consumer crash recovery?'],
    max_score: 10,
    evaluation_rubric: [
      {
        criterion_name: 'Architecture',
        description: 'Redis stream mechanics',
        max_points: 10,
        strong_indicators: ['Explains consumer groups'],
        weak_indicators: ['Confuses with pub/sub'],
      },
    ],
    red_flags: ['Assuming Redis streams lose messages on disconnect'],
    estimated_time_minutes: 5,
  };

  const renderComponent = (props = {}) => {
    return render(
      <ToastProvider>
        <QuestionCard
          question={mockQuestion}
          onUpdateQuestion={vi.fn()}
          onDeleteQuestion={vi.fn()}
          onRegenerateQuestion={vi.fn()}
          onSaveEvaluation={vi.fn()}
          {...props}
        />
      </ToastProvider>
    );
  };

  it('renders question prompt, badges, and topic', () => {
    renderComponent();
    expect(
      screen.getByText('How do you design a high-throughput queue using Redis streams?')
    ).toBeInTheDocument();
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('• Redis Architecture')).toBeInTheDocument();
  });

  it('renders key concepts and follow up questions', () => {
    renderComponent();
    expect(screen.getByText('Consumer Groups')).toBeInTheDocument();
    expect(screen.getByText('How do you handle consumer crash recovery?')).toBeInTheDocument();
    expect(
      screen.getByText('Assuming Redis streams lose messages on disconnect')
    ).toBeInTheDocument();
  });

  it('toggles model answer visibility', () => {
    renderComponent();
    const eyeBtn = screen.getByTitle('Hide model answer');
    expect(screen.getByText(/Consumer groups, XADD, XREADGROUP/)).toBeInTheDocument();

    fireEvent.click(eyeBtn);
    expect(screen.queryByText(/Consumer groups, XADD, XREADGROUP/)).not.toBeInTheDocument();
  });
});
