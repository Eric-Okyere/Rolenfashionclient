// Thin fetch wrapper shared by client and server components.
// Always sends cookies (for admin sessions) and throws a friendly Error on failure.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// How long a single request to the API is allowed to hang before we give
// up on it ourselves. Netlify's own Next.js server functions have a much
// shorter hard limit than this — if a fetch sits waiting on a stalled
// connection (a brief network hiccup between Netlify and Render, for
// example) for too long, Netlify kills the whole function outright and a
// real visitor sees a blank "This function has crashed" / "Inactivity
// Timeout" page instead of the site's own graceful empty-state handling.
// Giving up here first, well inside that limit, means safeFetch's catch
// below always gets a chance to run and show its fallback instead.
const REQUEST_TIMEOUT_MS = 8000;

export async function apiFetch(path, options = {}) {
  // `revalidate` (seconds) is our own convention, not a native fetch
  // option — pull it out before spreading the rest onto fetch(). Passing it
  // opts a request into Next.js's server data cache (`next: { revalidate }`)
  // instead of always hitting the network, for public, non-time-critical
  // data (product/course listings, settings, testimonials) where a visitor
  // seeing data that's up to `revalidate` seconds old is unnoticeable. Any
  // caller that omits it keeps the old always-fresh behavior — admin
  // actions and anything payment-related should never pass this.
  const { revalidate, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        ...(fetchOptions.body && !(fetchOptions.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(fetchOptions.headers || {}),
      },
      ...(revalidate !== undefined ? { next: { revalidate } } : { cache: 'no-store' }),
      ...fetchOptions,
      // Spread last and forced — always our own abort signal, so a stalled
      // request can never outlive REQUEST_TIMEOUT_MS regardless of what a
      // caller passes in `options`.
      signal: controller.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      const timeoutError = new Error('Request timed out — the server took too long to respond.');
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
}

// Server-component-safe fetch that never throws — used for public pages that
// should still render gracefully even if the API is unreachable.
export async function safeFetch(path, fallback, options) {
  try {
    return await apiFetch(path, options);
  } catch (e) {
    console.error(`safeFetch(${path}) failed:`, e.message);
    return fallback;
  }
}

export function mediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${API_URL}${pathOrUrl}`;
}
