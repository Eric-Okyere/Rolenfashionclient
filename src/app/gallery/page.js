import { redirect } from 'next/navigation';

// The Shop moved from /gallery to the site root (see app/page.js) — this
// route stays in place purely so any bookmark, external link, or search
// result pointing at the old /gallery URL still lands somewhere real,
// preserving ?category=/&video= filters instead of just dropping them.
export default async function GalleryRedirect({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.video) qs.set('video', params.video);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  redirect(`/${query}#collection`);
}
