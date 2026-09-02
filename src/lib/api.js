// Thin fetch wrapper shared by client and server components.
// Always sends cookies (for admin sessions) and throws a friendly Error on failure.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
    ...options,
  });

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
export async function safeFetch(path, fallback) {
  try {
    return await apiFetch(path);
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
