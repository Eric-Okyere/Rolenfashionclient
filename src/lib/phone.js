// Ghana-focused phone helpers. Settings.phone can hold more than one number
// as "055 339 3254 / 024 344 2262" — these split that into individual
// numbers and build tel:/wa.me links from each so every number is both
// callable and WhatsApp-able from the site.

export function splitNumbers(value) {
  if (!value) return [];
  return value
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

function localDigits(num) {
  // Strip everything but digits, then drop a leading trunk "0" (055... -> 55...)
  return num.replace(/\D/g, '').replace(/^0/, '');
}

export function telHref(num) {
  return `tel:+233${localDigits(num)}`;
}

export function waHref(num, message) {
  const base = `https://wa.me/233${localDigits(num)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
