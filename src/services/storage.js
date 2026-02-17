import { saveReviewToBackend, getRecentReviews } from './api';

// Local storage fallback for offline mode
const STORAGE_KEY = 'ux-reviewer-saved-reviews';
const MAX_REVIEWS = 5;

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_REVIEWS)));
}

// Save review to backend API (with local fallback)
export async function saveReview(review) {
  const entry = {
    id: crypto.randomUUID(),
    url: review.url,
    screenshotBase64: review.screenshotBase64,
    review: review.review,
    createdAt: new Date().toISOString(),
  };

  // Try to save to backend API
  try {
    await saveReviewToBackend(review.url, review.review, review.screenshotBase64);
  } catch (e) {
    console.warn('Failed to save to backend, using local storage:', e);
    // Fallback to local storage if backend fails
    const list = getStored();
    const next = [entry, ...list].slice(0, MAX_REVIEWS);
    setStored(next);
  }

  return entry;
}

// Get saved reviews from backend API (with local fallback)
export async function getSavedReviews() {
  try {
    const reviews = await getRecentReviews();
    // Update local storage with fresh data
    setStored(reviews);
    return reviews;
  } catch (e) {
    console.warn('Failed to fetch from backend, using local storage:', e);
    // Fallback to local storage if backend fails
    return getStored();
  }
}

export function deleteSavedReview(id) {
  const list = getStored().filter((r) => r.id !== id);
  setStored(list);
}
