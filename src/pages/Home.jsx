import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import URLInput from '../components/URLInput';
import ReviewResult from '../components/ReviewResult';
import { isAuthenticated, getCurrentUser, logout, fetchPage, getReview } from '../services/api';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth status
    const user = getCurrentUser();
    setAuth({
      isAuthenticated: isAuthenticated(),
      user
    });
  }, []);

  function handleLogout() {
    logout();
    setAuth({
      isAuthenticated: false,
      user: null
    });
    navigate('/');
  }

  async function handleAnalyze(url) {
    // Check if user is authenticated
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setCurrentUrl(url);

    try {
      // Step 1: Fetch the page HTML and screenshot
      const { html, screenshotBase64 } = await fetchPage(url);

      // Step 2: Get the UX review from the backend
      const data = await getReview(html, screenshotBase64, url);
      
      // Extract the review from the response
      const review = data?.review ?? data;

      setResults({
        url,
        screenshotBase64,
        review
      });
    } catch (e) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
          <h1 className="font-display font-bold text-xl text-surface-900">
            Website UX Reviewer
          </h1>
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/status"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                System Status
              </Link>
              <span className="text-sm text-surface-600">
                Hello, {auth.user?.name || 'User'}
              </span>
              <Link
                to="/review"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-surface-600 hover:text-surface-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/status"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                System Status
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* URL Input Section */}
        <div className="mb-8">
          <URLInput onSubmit={handleAnalyze} loading={loading} />
        </div>

        {/* Loading/Status Bar */}
        {loading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-surface-700">Analyzing {currentUrl}...</span>
              <span className="text-sm text-surface-500">Please wait</span>
            </div>
            <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 animate-pulse rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <ReviewResult
            url={results.url}
            screenshotBase64={results.screenshotBase64}
            review={results.review}
          />
        )}

        {/* Landing Content - Show when no results */}
        {!loading && !results && (
          <div className="prose max-w-none">
            <h2 className="font-display font-bold text-2xl text-surface-900 mb-6">
              AI-Powered Website UX Analysis
            </h2>
            
            <p className="text-surface-600 mb-8">
              Website UX Reviewer uses artificial intelligence to analyze any website's 
              user experience and provide actionable insights to improve your site's usability.
            </p>

            <h3 className="font-display font-semibold text-lg text-surface-900 mb-4">
              How It Works
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">Paste URL</h4>
                  <p className="text-surface-600 text-sm">
                    Enter the URL of the website you want to analyze
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">Fetch HTML & Screenshot</h4>
                  <p className="text-surface-600 text-sm">
                    Our system grabs the page content and takes a visual snapshot
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">AI UX Analysis</h4>
                  <p className="text-surface-600 text-sm">
                    Groq AI analyzes the page for usability issues across multiple categories
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">View Score & Issues</h4>
                  <p className="text-surface-600 text-sm">
                    Get a detailed UX score (1-10) with categorized issues and recommendations
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-50 rounded-xl p-6 border border-surface-200">
              <h3 className="font-display font-semibold text-surface-900 mb-3">
                Analysis Categories
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-sm text-surface-600">
                <li>• Clarity</li>
                <li>• Layout</li>
                <li>• Navigation</li>
                <li>• Accessibility</li>
                <li>• Trust & Credibility</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
