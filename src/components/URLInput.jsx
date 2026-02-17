import { useState } from 'react';

export default function URLInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    const trimmed = url.trim();
    
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }
    
    if (!trimmed.startsWith("http")) {
      setError("Enter valid URL starting with http/https");
      return;
    }
    
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:opacity-60"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {loading ? 'Analyzing…' : 'Review UX'}
        </button>
      </div>
    </form>
  );
}
