import { useState, useRef } from 'react';
import { exportReportAsPdf } from '../utils/exportPdf';

const CATEGORY_LABELS = {
  clarity: 'Clarity',
  layout: 'Layout',
  navigation: 'Navigation',
  accessibility: 'Accessibility',
  trust: 'Trust',
  design: 'Design',
  performance: 'Performance',
  mobile: 'Mobile',
  content: 'Content',
  conversion: 'Conversion',
};

const SEVERITY_STYLES = {
  high: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: '🔴'
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: '🟠'
  },
  low: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: '🟡'
  },
};

function ScoreGauge({ score }) {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${score * 28.27} 282.7`}
            strokeLinecap="round"
            className={`${getScoreColor(score)} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-surface-500 uppercase tracking-wide">Overall Score</p>
        <p className={`text-lg font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
        <p className="text-sm text-surface-500">out of 10</p>
      </div>
    </div>
  );
}

function IssueCard({ issue }) {
  const severity = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.low;
  
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header with title, severity, category */}
      <div className="p-5 border-b border-surface-100 bg-surface-50/50">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h4 className="font-semibold text-lg text-surface-900 leading-tight flex-1">
            {issue.title}
          </h4>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${severity.bg} ${severity.text}`}>
            <span>{severity.icon}</span>
            <span className="capitalize">{issue.severity}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
            {CATEGORY_LABELS[issue.category] || issue.category}
          </span>
        </div>
      </div>

      {/* Description - "Why this is an issue" */}
      <div className="p-5">
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
            Why this is an issue
          </h5>
          <p className="text-surface-700 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Evidence - "Proof" */}
        {issue.evidence && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Proof / Evidence
            </h5>
            <p className="text-sm text-amber-900 font-mono bg-white/50 rounded p-2">
              {issue.evidence}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BeforeAfterCard({ item, index }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3">
        <h4 className="font-semibold text-white">
          Improvement #{index + 1}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
        {/* Before */}
        <div className="p-5 bg-red-50/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
              ✕
            </span>
            <h5 className="text-sm font-semibold text-red-700 uppercase tracking-wider">
              Before
            </h5>
          </div>
          <p className="text-surface-700 leading-relaxed">
            {item.before}
          </p>
        </div>
        
        {/* After */}
        <div className="p-5 bg-green-50/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <h5 className="text-sm font-semibold text-green-700 uppercase tracking-wider">
              After
            </h5>
          </div>
          <p className="text-surface-700 leading-relaxed">
            {item.after}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewResult({ url, screenshotBase64, review: rawReview }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  const review = rawReview?.review || rawReview;
  const issues = review?.issues || [];
  const beforeAfter = review?.beforeAfter || [];
  const score = review?.score ?? null;
  const summary = review?.summary || '';

  const categories = [...new Set(issues.map((i) => i.category))];
  const filteredIssues = activeCategory === 'all' ? issues : issues.filter((i) => i.category === activeCategory);

  async function handleExportPdf() {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const safeName = url.replace(/^https?:\/\//, '').replace(/[^a-z0-9.-]/gi, '_').slice(0, 40);
      await exportReportAsPdf(reportRef.current, `ux-review-${safeName}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  if (!review || !issues.length) {
    return (
      <div className="text-center py-12 bg-surface-50 rounded-2xl border border-surface-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-surface-500">No review data to display.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === 'all' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
            }`}
          >
            All Issues
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            className="px-4 py-2 rounded-lg bg-surface-800 text-white text-sm font-medium hover:bg-surface-900 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div ref={reportRef} className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        
        {/* Score & Summary Section */}
        {(score != null || summary) && (
          <div className="p-6 md:p-8 border-b border-surface-100 bg-gradient-to-br from-surface-50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {score != null && (
                <div className="shrink-0">
                  <ScoreGauge score={score} />
                </div>
              )}
              {summary && (
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summary
                  </h3>
                  <p className="text-surface-700 leading-relaxed text-lg">
                    {summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screenshot */}
        {screenshotBase64 && (
          <div className="p-6 border-b border-surface-100">
            <p className="text-sm font-medium text-surface-500 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Page Snapshot
            </p>
            <img
              src={`data:image/png;base64,${screenshotBase64}`}
              alt="Website snapshot"
              className="w-full rounded-lg border border-surface-200 max-h-96 object-contain bg-surface-50"
            />
          </div>
        )}

        {/* Issues Section */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-surface-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              UX Issues Found
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-600 text-sm font-medium">
                {filteredIssues.length}
              </span>
            </h3>
          </div>
          
          {filteredIssues.length > 0 ? (
            <div className="grid gap-4">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id || issue.title} issue={issue} />
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-8">
              No issues found for the selected category.
            </p>
          )}
        </div>

        {/* Top UX Improvements - Before/After Section */}
        {beforeAfter.length > 0 && (
          <div className="p-6 md:p-8 border-t border-surface-100 bg-gradient-to-b from-surface-50/50 to-white">
            <h3 className="text-xl font-display font-semibold text-surface-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Top UX Improvements
            </h3>
            <div className="grid gap-6">
              {beforeAfter.map((item, idx) => (
                <BeforeAfterCard key={item.issueId || idx} item={item} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
