// Formats a date as a short "time ago" string (e.g. "2m ago", "3h ago",
// "5d ago") for compact activity feeds. Falls back to a plain date once
// something is old enough that "ago" stops being useful.
export function timeAgo(date) {
  const d = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// True if `date` is within the last `days` days — used for a "NEW" badge on
// recently posted products. Deliberately called from server components
// (Date.now() there is a one-time, per-request read, not a render-time
// impurity issue) rather than inside the client-side GalleryItem card, so
// the value is computed once and passed down as a plain prop.
export function isRecent(date, days = 14) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return Date.now() - d.getTime() < days * 24 * 60 * 60 * 1000;
}
