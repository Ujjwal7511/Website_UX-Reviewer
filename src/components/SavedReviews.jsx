import { useState, useEffect } from 'react';
import { getSavedReviews, deleteSavedReview } from '../services/storage';

export default function SavedReviews({ onSelectReview }) {
  const [reviews, setReviews] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getSavedReviews();
        setReviews(data);
      } catch (e) {
        console.error('Failed to load reviews:', e);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  function handleDelete(e, id) {
    e.stopPropagation();
    deleteSavedReview(id);
    setReviews(getSavedReviews());
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-surface-500 text-sm">
        No saved reviews yet. Run a review and it will be automatically saved.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="bg-white rounded-xl border border-surface-200 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpenId(openId === r.id ? null : r.id)}
            className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-surface-50 transition-colors"
          >
            <span className="truncate text-sm font-medium text-surface-900">{r.url}</span>
            <div className="flex items-center gap-2 shrink-0">
              {r.review?.score != null && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  r.review.score >= 8 ? 'bg-green-100 text-green-700' :
                  r.review.score >= 6 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {r.review.score}/10
                </span>
              )}
              <span className="text-xs text-surface-500">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
              </span>
            </div>
          </button>
          {openId === r.id && (
            <div className="px-4 pb-4 pt-0 border-t border-surface-100">
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onSelectReview(r)}
                  className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, r.id)}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
