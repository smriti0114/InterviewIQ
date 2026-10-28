import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RubricTable from '../components/RubricTable';

describe('RubricTable Component', () => {
  const sampleRubric = [
    {
      criterion_name: 'Technical Depth',
      description: 'Understanding of internal execution mechanics',
      max_points: 6,
      strong_indicators: ['Mentions execution plan buffers'],
      weak_indicators: ['Cannot explain indexes'],
    },
    {
      criterion_name: 'Practical Application',
      description: 'Real-world problem solving',
      max_points: 4,
      strong_indicators: ['Gives production examples'],
      weak_indicators: ['Only quotes theory'],
    },
  ];

  it('renders rubric criteria names and descriptions correctly', () => {
    render(<RubricTable rubric={sampleRubric} maxScore={10} />);

    expect(screen.getByText('Technical Depth')).toBeInTheDocument();
    expect(screen.getByText('Understanding of internal execution mechanics')).toBeInTheDocument();
    expect(screen.getByText('Practical Application')).toBeInTheDocument();
    expect(screen.getByText('6 pts')).toBeInTheDocument();
    expect(screen.getByText('4 pts')).toBeInTheDocument();
  });

  it('renders total score breakdown badge', () => {
    render(<RubricTable rubric={sampleRubric} maxScore={10} />);
    expect(screen.getByText('Total: 10 / 10 pts')).toBeInTheDocument();
  });

  it('renders strong and weak behavioral indicators', () => {
    render(<RubricTable rubric={sampleRubric} maxScore={10} />);
    expect(screen.getByText('Mentions execution plan buffers')).toBeInTheDocument();
    expect(screen.getByText('Cannot explain indexes')).toBeInTheDocument();
  });
});
