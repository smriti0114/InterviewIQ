import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Award,
  Layers,
  FileDown,
  CheckCircle2,
  Clock,
  Shield,
  Code2,
  Users,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import RubricTable from '../components/RubricTable';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('technical');

  const sampleQuestions = {
    technical: {
      number: 1,
      category: 'Technical',
      difficulty: 'Medium',
      question_type: 'Technical',
      topic: 'PostgreSQL Indexing & Optimization',
      max_score: 10,
      question:
        'When diagnosing a slow query on a table with 50 million rows, how do you interpret EXPLAIN (ANALYZE, BUFFERS) output, and when would a BRIN or Partial Index be preferable over a standard B-Tree index?',
      suggested_answer:
        'A comprehensive answer addresses: 1) Analyzing the actual execution time vs planned estimates, identifying sequential scans on large tables, nested loop bottlenecks, and disk reads vs shared buffer hits; 2) B-Trees index every key in balanced order, ideal for high cardinality columns; 3) BRIN (Block Range Index) is extraordinarily lightweight for append-only, naturally correlated physical order data (e.g. timestamps or auto-incrementing IDs), saving huge RAM; 4) Partial indexes reduce index size and maintenance cost by indexing only active rows (e.g., WHERE status = "pending").',
      key_concepts: ['EXPLAIN ANALYZE', 'Buffer Cache Hits', 'B-Tree vs BRIN', 'Partial Indexes'],
      follow_up_questions: [
        'How does table bloat affect index scan performance, and how would you resolve it?',
        'What are the trade-offs of using covering indexes with INCLUDE clauses?'
      ],
      red_flags: [
        'Believing indexes improve INSERT/UPDATE write performance',
        'Inability to read buffer cache or execution nodes in EXPLAIN output'
      ],
      rubric: [
        {
          criterion_name: 'Query Plan Deconstruction',
          description: 'Ability to accurately read and diagnose EXPLAIN output',
          max_points: 4,
          strong_indicators: ['Identifies disk I/O vs cache', 'Spots node cost variances'],
          weak_indicators: ['Only looks at total execution time without node breakdown']
        },
        {
          criterion_name: 'Index Architecture Selection',
          description: 'Understanding appropriate trade-offs between B-Tree, BRIN, and Partial',
          max_points: 3,
          strong_indicators: ['Explains physical block correlation for BRIN', 'Mentions storage footprint'],
          weak_indicators: ['Assumes B-Trees are always optimal for every scenario']
        },
        {
          criterion_name: 'Production Operational Awareness',
          description: 'Considers write overhead, index maintenance, and memory bloat',
          max_points: 3,
          strong_indicators: ['Discusses maintenance overhead on writes', 'Mentions autovacuum/bloat'],
          weak_indicators: ['Neglects write performance consequences']
        }
      ]
    },
    behavioral: {
      number: 2,
      category: 'Behavioral',
      difficulty: 'Medium',
      question_type: 'Behavioral',
      topic: 'Technical Disagreement & Consensus',
      max_score: 10,
      question:
        'Tell me about a time when your team was deeply split on a core architecture or technology choice. How did you structure the debate, evaluate alternatives objectively, and drive alignment without eroding morale?',
      suggested_answer:
        'Uses STAR framework: 1) Context: Team debating microservices vs monolithic modular architecture for new billing engine; 2) Task: Prevent prolonged analysis paralysis and align before sprint kickoff; 3) Action: Established concrete evaluation matrix (latency, deployment complexity, operational overhead, rollback safety), built quick time-boxed spike benchmarks, actively facilitated retrospectives; 4) Result: Unanimously agreed on modular monolith with event-driven boundaries, shipping on time with zero regressions.',
      key_concepts: ['STAR Framework', 'Objective Decision Matrix', 'Timeboxed Spikes', 'Disagreement & Commitment'],
      follow_up_questions: [
        'How did you support colleagues whose proposal was not selected?',
        'If new production data later invalidated the chosen path, how would you address it?'
      ],
      red_flags: [
        'Belittling teammates with differing opinions',
        'Forcing unilateral decisions without measurable evidence'
      ],
      rubric: [
        {
          criterion_name: 'STAR Structure & Clarity',
          description: 'Structured narrative demonstrating personal responsibility',
          max_points: 4,
          strong_indicators: ['Crisp situation, distinct actions, quantifiable outcomes'],
          weak_indicators: ['Vague, rambling story focusing on team rather than personal impact']
        },
        {
          criterion_name: 'Objective Decision Framework',
          description: 'De-escalating emotion using metrics, benchmarks, and spikes',
          max_points: 3,
          strong_indicators: ['Created shared evaluation criteria with team'],
          weak_indicators: ['Relied on authority or loud arguments']
        },
        {
          criterion_name: 'Team Health & Empathy',
          description: 'Maintaining trust and commitment post-decision',
          max_points: 3,
          strong_indicators: ['Followed up with dissenting teammates, ensured mutual respect'],
          weak_indicators: ['Indifferent to team friction or lingering resentment']
        }
      ]
    }
  };

  const currentSample = sampleQuestions[activeTab];

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs sm:text-sm font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Next-Generation AI Interview Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Generate Role-Specific Interviews with{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            AI-Engineered Rubrics
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          InterviewIQ empowers engineering leaders and talent recruiters to generate tailored technical,
          coding, and HR interview sets with model answers, expected concepts, follow-ups, and
          granular scoring rubrics.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
          >
            <span>Start Generating Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/generator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all"
          >
            <span>Launch Generator</span>
          </Link>
        </div>

        {/* Key Highlights Bar */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Structured Rubrics</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Hallucinations</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>PDF, CSV & JSON Export</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>8GB RAM Laptop Ready</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
            Enterprise Architecture
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            Everything Required for High-Impact Interviews
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Replace disorganized questions with standardized, objective rubrics and role-calibrated technical depth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Real AI Engine</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Integrates with Google Gemini and OpenAI models to synthesize questions uniquely tailored to specific seniorities, skills, and domains.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Granular Rubrics</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every question delivers criteria-specific maximum points, strong indicators, and partial signal warnings for fair, non-biased candidate evaluation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Multi-Category Coverage</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate Technical, Coding, System Design, Behavioral, and HR questions with one click or blend them seamlessly into a mixed interview.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <FileDown className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Professional Exports</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export complete interview guides as styled PDF reports, CSV spreadsheets, or JSON payloads for your applicant tracking system.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Sample Preview Section */}
      <section id="sample" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
            Interactive Output Preview
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Inspect the Generated Interview Quality
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Toggle categories to preview real questions, ideal answer outlines, and point-allocated rubrics.
          </p>
        </div>

        {/* Category Switcher */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'technical'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            Technical & Architecture Question
          </button>
          <button
            onClick={() => setActiveTab('behavioral')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'behavioral'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            Behavioral (STAR) Question
          </button>
        </div>

        {/* Sample Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white">
                Q{currentSample.number}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {currentSample.category}
              </span>
              <span className="text-xs font-medium text-slate-400">• {currentSample.topic}</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Max Score: {currentSample.max_score} pts
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {currentSample.question}
            </h4>

            {/* Model Answer Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                Ideal Model Answer Outline:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentSample.suggested_answer}
              </p>
            </div>

            {/* Rubric Breakdown */}
            <div className="pt-2">
              <RubricTable rubric={currentSample.rubric} maxScore={currentSample.max_score} />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
            How It Works
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            Structured Hiring in Four Simple Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-mono text-xl font-black text-brand-600">01</span>
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">Configure Role</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select job title, seniority level, required technologies, question count, and optional candidate resume.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-mono text-xl font-black text-brand-600">02</span>
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">Synthesize AI Set</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The LLM constructs targeted questions, follow-ups, common misconceptions, and point rubrics.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-mono text-xl font-black text-brand-600">03</span>
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">Review & Refine</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit question texts, regenerate single questions with custom prompts, or reorder questions.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center sm:text-left">
            <span className="font-mono text-xl font-black text-brand-600">04</span>
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">Conduct & Export</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Score candidates live with the built-in evaluator and export comprehensive PDF, CSV, or JSON guides.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 text-white text-center space-y-6 shadow-2xl">
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Standardize Your Engineering Hiring?
          </h3>
          <p className="max-w-xl mx-auto text-purple-100 text-sm sm:text-base">
            Create consistent, role-calibrated interviews today. Runs completely on your laptop with zero heavy dependencies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-bold bg-white text-brand-800 hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-semibold text-white/90 hover:text-white border border-white/20 hover:bg-white/10 transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
