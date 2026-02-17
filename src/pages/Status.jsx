import { useState, useEffect } from 'react';

export default function Status() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/status`);
        const data = await response.json();
        setStatus(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="font-display font-bold text-xl text-surface-900">
            Website UX Reviewer
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <h2 className="font-display font-bold text-2xl text-surface-900 mb-6">
          System Status
        </h2>

        {loading && (
          <div className="text-surface-600">Loading status...</div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            Error: {error}
          </div>
        )}

        {status && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 border border-surface-200">
              <span className="font-medium text-surface-700 w-32">Backend:</span>
              <span className={`font-bold ${status.backend === 'running' ? 'text-green-600' : 'text-red-600'}`}>
                {status.backend}
              </span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 border border-surface-200">
              <span className="font-medium text-surface-700 w-32">LLM:</span>
              <span className={`font-bold ${status.llm === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                {status.llm}
              </span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 border border-surface-200">
              <span className="font-medium text-surface-700 w-32">Database:</span>
              <span className="font-bold text-surface-600">
                {status.database}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
