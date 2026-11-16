// Product helpers shared by the Shop (client components), the product page
// (a server component) and the admin pages. Kept out of GalleryItem.js
// because that file is 'use client', and a server component can't call
// functions exported from a client module.
// Eric: "All products except ready categories must be pre-order." Only the
// Ready-to-Wear line is in stock to buy as-is; every other line (Kente,
// Bridals, Custom, Bespoke, Lace, Wedding Gowns, …) is made to order. Derived
// from the category itself rather than a stored flag, so every existing and
// future product is labelled correctly with no data migration. The legacy
// 'Ready-to-Wear' value is kept for products saved under the old taxonomy.
const READY_CATEGORIES = ['Rolen Ready-to-Wear', 'Ready-to-Wear'];

export function isPreOrderCategory(category) {
  return !READY_CATEGORIES.includes(category);
}

// Eric: "Allow MoMo pay for pre-order. They have to pay some amount. It
// varies but ready to wear price is fixed." Ready-to-Wear pays its full
// price; pre-order pays a deposit — the product's own `depositAmount` if an
// admin set one, otherwise 70% of the price (the rule already stated on the
// Shop page). Mirrors the server's utils/preorder.js, which is what actually
// decides the charge; this copy only decides what the button shows.
export function payableAmount(item) {
  if (!isPreOrderCategory(item.category)) return item.price || null;
  if (item.depositAmount) return Number(item.depositAmount);
  if (item.price) return Math.round(Number(item.price) * 0.7);
  return null;
}

// Eric: "Dress name and description, picture must show in the whatsapp
// message so admin can click and lead to the page." WhatsApp can't attach a
// photo to a pre-filled message, but it does show a picture preview for any
// link in the message — so every product now has its own page (/shop/<id>,
// whose link preview carries the product photo, name and description), and
// the order message includes that link. Built from the site's configured
// public URL rather than window.location so the message is identical on the
// server and in the browser (the product page renders this on the server).
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rolengh.com').replace(/\/$/, '');

// Eric: "Add a name field … separate the product name from the product
// description." A product now has its own `name` (e.g. "Aba Dress") shown as
// the headline, with `title` as the descriptive style line beneath it.
// Products whose name was typed into the title before this field existed —
// "Aba Dress. Navy Corset Maxi Dress …" — are split at that first ". " so
// they display correctly with no re-typing; saving one through Admin → Edit
// then stores the name in its own field.
export function productNames(item) {
  if (item.name) return { name: item.name, subtitle: item.title || '' };
  const match = /^([^.]{2,40})\.\s+(.+)$/.exec(item.title || '');
  return match ? { name: match[1].trim(), subtitle: match[2].trim() } : { name: item.title || '', subtitle: '' };
}

export function productPageUrl(item) {
  return `${SITE_URL}/shop/${item._id}`;
}

