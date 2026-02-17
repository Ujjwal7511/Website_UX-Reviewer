import { useState } from 'react';
import URLInput from '../components/URLInput';
import ReviewResult from '../components/ReviewResult';
import SavedReviews from '../components/SavedReviews';
import LoadingState from '../components/LoadingState';
import { fetchPage, getReview, saveReviewToBackend } from '../services/api';

export default function Review() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('');
  const [savedRefresher, setSavedRefresher] = useState(0);
  const [tab, setTab] = useState('review'); // 'review' | 'saved'

  async function handleSubmit(url) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      setStep('Fetching page…');
      const { html, screenshotBase64 } = await fetchPage(url);

      setStep('Requesting review from backend…');
      const data = await getReview(html, screenshotBase64, url);
      const review = data?.review ?? data;

      // Auto-save the review to backend
      try {
        await saveReviewToBackend(url, review, screenshotBase64);
        // Refresh the saved reviews list after auto-save
        setSavedRefresher((n) => n + 1);
      } catch (saveError) {
        console.warn('Auto-save failed:', saveError);
        // Continue showing the review even if save fails
      }

      setResult({ url, html, screenshotBase64, review });
      setTab('review');
    } catch (e) {
      let message = 'Something went wrong';
      if (e instanceof Error && e.message) message = e.message;
      else if (typeof e === 'string') message = e;
      setError(message);
    } finally {
      setLoading(false);
      setStep('');
    }
  }

  function handleSelectSaved(saved) {
    setResult({
      url: saved.url,
      screenshotBase64: saved.screenshotBase64,
      review: saved.review,
    });
    setTab('review');
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="font-display font-bold text-xl text-surface-900">
            Website UX Reviewer
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Paste a website URL to generate a UX review
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <URLInput onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm animate-slide-up">
            {error}
          </div>
        )}

        {loading && <LoadingState step={step} />}

        {!loading && result && (
          <div className="mt-8 animate-slide-up">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTab('review')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'review' ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-700'}`}
              >
                Current review
              </button>
              <button
                type="button"
                onClick={() => setTab('saved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'saved' ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-700'}`}
              >
                Saved reviews
              </button>
            </div>
            {tab === 'review' ? (
              <ReviewResult
                url={result.url}
                screenshotBase64={result.screenshotBase64}
                review={result.review}
              />
            ) : (
              <SavedReviews key={savedRefresher} onSelectReview={handleSelectSaved} />
            )}
          </div>
        )}

        {!loading && !result && (
          <div className="mt-12 flex gap-4">
            <section className="flex-1 min-w-0">
              <h2 className="font-display font-semibold text-surface-900 mb-3">Saved reviews</h2>
              <SavedReviews key={savedRefresher} onSelectReview={handleSelectSaved} />
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-surface-200 py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-surface-500">
        </div>
      </footer>
    </div>
  );
}
