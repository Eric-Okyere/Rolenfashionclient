'use client';

import { useEffect, useState } from 'react';
import { apiFetch, mediaUrl } from '@/lib/api';
import { resizeImageFile } from '@/lib/imageResize';
import MediaCover from '@/components/MediaCover';

// Same 5 brand lines used on the Gallery form — a slide's CTA can point at
// one of them, or at "None" for a general "shop everything" slide.
const categories = ['Rolen Kente', 'Rolen Bridals', 'Rolen Custom', 'Rolen Ready-to-Wear', 'Rolen Bespoke', 'Lace', 'Custom', 'Wedding Gowns'];

const emptyForm = { title: '', caption: '', linkCategory: '', ctaLabel: 'Shop Now', order: 0, isActive: true };

export default function AdminCarouselPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resizingPhoto, setResizingPhoto] = useState(false);

  async function load() {
    const data = await apiFetch('/api/carousel?all=1');
    setPosts(data.posts);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  // Eric: "let the pic show very nice in the form before post" — preview the
  // chosen file exactly the way it'll actually render on the live carousel
  // (same MediaCover treatment), using a local blob: URL so nothing is
  // uploaded just to preview it. The URL is revoked whenever the selection
  // changes or the form resets, so switching files never leaks the old blob.
  useEffect(() => {
    if (!imageFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the preview when the selection is removed, not derivable at render time
      setImagePreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing a browser object URL to the chosen File, not derivable at render time
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  useEffect(() => {
    if (!videoFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the preview when the selection is removed, not derivable at render time
      setVideoPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(videoFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing a browser object URL to the chosen File, not derivable at render time
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  // See the same-purpose comment on Gallery & Shop's handlePhotosChosen —
  // downscales a large photo in the browser before it's previewed or
  // uploaded, so it clears Cloudinary's 10MB free-plan cap.
  async function handlePhotoChosen(file) {
    if (!file) {
      setImageFile(null);
      return;
    }
    setResizingPhoto(true);
    try {
      setImageFile(await resizeImageFile(file));
    } finally {
      setResizingPhoto(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!imageFile && !videoFile) return setError('Add a photo or a video for this slide.');
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (imageFile) fd.append('image', imageFile);
      if (videoFile) fd.append('video', videoFile);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await apiFetch('/api/carousel', { method: 'POST', body: fd });
      setForm(emptyForm);
      setImageFile(null);
      setVideoFile(null);
      e.target.reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this ad slide?')) return;
    await apiFetch(`/api/carousel/${id}`, { method: 'DELETE' });
    await load();
  }

  async function toggleActive(post) {
    await apiFetch(`/api/carousel/${post._id}`, { method: 'PUT', body: JSON.stringify({ isActive: !post.isActive }) });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Ad Carousel</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        This is the big rotating banner at the very top of the Shop homepage — the advertisement space, kept
        separate from your product catalog so you decide exactly what it shows. Each slide is one photo{' '}
        <em>or</em> one video. For the products themselves (with up to 5 photos), use Gallery &amp; Shop
        instead.
      </p>

      <form onSubmit={handleUpload} className="card p-6 mb-8 space-y-4">
        <h2 className="font-display text-lg">Add a Slide</h2>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Title (optional headline)</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Caption (optional, short)</span>
            <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Links to collection</span>
            <select value={form.linkCategory} onChange={(e) => setForm({ ...form, linkCategory: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5 bg-white">
              <option value="">Whole shop</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Button text</span>
            <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Order (lower shows first)</span>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm flex items-center gap-2 mt-6">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (show on the site now)
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Photo</span>
            <input type="file" accept="image/*" onChange={(e) => handlePhotoChosen(e.target.files[0])} className="w-full text-sm" />
            {resizingPhoto && <p className="text-xs text-muted mt-1">Optimizing photo…</p>}
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Video</span>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full text-sm" />
          </label>
        </div>
        <p className="text-xs text-muted -mt-2">Add a photo or a video — not both. A slide with a video plays it automatically, muted.</p>

        {(imagePreviewUrl || videoPreviewUrl) && (
          <div>
            <span className="block mb-1.5 text-sm font-medium">Preview — this is how it&apos;ll look on the homepage banner</span>
            <MediaCover
              src={imagePreviewUrl || videoPreviewUrl}
              type={videoPreviewUrl ? 'video' : 'image'}
              alt="Slide preview"
              className="w-full aspect-video rounded-lg"
            />
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Uploading…' : 'Add Slide'}</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div key={post._id} className="card overflow-hidden">
            <div className="aspect-video bg-black/5 relative">
              <MediaCover
                src={mediaUrl(post.videoUrl || post.imageUrl)}
                type={post.videoUrl ? 'video' : 'image'}
                poster={post.imageUrl ? mediaUrl(post.imageUrl) : undefined}
                alt={post.title || 'Ad slide'}
                className="absolute inset-0"
              />
              {post.videoUrl && (
                <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">▶ Video</span>
              )}
              {!post.isActive && (
                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">Paused</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{post.title || '(no title)'}</p>
              <p className="text-xs text-muted">{post.linkCategory || 'Whole shop'} · order {post.order}</p>
              <div className="flex justify-between mt-2 text-xs">
                <button onClick={() => toggleActive(post)} className="text-gold-dark hover:underline">
                  {post.isActive ? 'Pause' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {posts.length === 0 && <p className="text-center text-muted py-8">No ad slides yet — add your first one above.</p>}
    </div>
  );
}
