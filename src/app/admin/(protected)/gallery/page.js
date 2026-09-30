'use client';

import { useEffect, useState } from 'react';
import { apiFetch, mediaUrl } from '@/lib/api';
import { resizeImageFile } from '@/lib/imageResize';
import MediaCover from '@/components/MediaCover';

// The shop's current brand-line structure. Older values (Nuptials, Kente,
// Exclusives, Melange by Rolen, Ready-to-Wear, Bridal, etc.) still work for
// any product already saved with one of them — they're just not offered
// here any more since the shop now organizes around these five lines
// instead (see Gallery.js for why the server enum still lists every set).
const categories = ['Rolen Kente', 'Rolen Bridals', 'Rolen Custom', 'Rolen Ready-to-Wear', 'Rolen Bespoke', 'Other'];

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'Other', price: '', isFeatured: false });
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // True only while chosen photos are being downscaled in the browser (see
  // imageResize.js) — a distinct flag from `loading` (which covers the
  // actual upload) since this happens the moment files are picked, before
  // "Post Product" is ever clicked.
  const [resizingPhotos, setResizingPhotos] = useState(false);

  async function load() {
    const data = await apiFetch('/api/gallery?all=1');
    setItems(data.items);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  // Eric: "let the pic show very nice in the form before post" — preview
  // every chosen photo (and the video, if any) the same uncropped way the
  // product's own lightbox will show it, using local blob: URLs so nothing
  // uploads just to preview. Recreated whenever the file selection changes,
  // with the previous batch of URLs revoked so nothing leaks.
  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing browser object URLs to the chosen Files, not derivable at render time
    setImagePreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imageFiles]);
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

  // Eric: "let the form be able to take large pictures... instead of
  // reducing the quality" — each chosen photo is downscaled to web-display
  // size (imageResize.js) right here, before it ever reaches the preview
  // or the upload, so a 25MB camera photo clears Cloudinary's 10MB
  // free-plan cap without Eric needing to resize anything by hand.
  async function handlePhotosChosen(fileList) {
    let files = Array.from(fileList);
    if (files.length > 5) {
      setError('Choose at most 5 photos.');
      files = files.slice(0, 5);
    } else {
      setError(null);
    }
    setResizingPhotos(true);
    try {
      const resized = await Promise.all(files.map((f) => resizeImageFile(f)));
      setImageFiles(resized);
    } finally {
      setResizingPhotos(false);
    }
  }

  function removePhoto(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!imageFiles.length) return setError('Please choose at least one product photo — it’s required.');
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      imageFiles.forEach((f) => fd.append('images', f));
      if (videoFile) fd.append('video', videoFile);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await apiFetch('/api/gallery', { method: 'POST', body: fd });
      setForm({ title: '', description: '', category: 'Other', price: '', isFeatured: false });
      setImageFiles([]);
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
    if (!confirm('Delete this product?')) return;
    await apiFetch(`/api/gallery/${id}`, { method: 'DELETE' });
    await load();
  }

  async function togglePublish(item) {
    await apiFetch(`/api/gallery/${item._id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !item.isPublished }) });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Gallery &amp; Shop</h1>

      <form onSubmit={handleUpload} className="card p-6 mb-8 space-y-4">
        <h2 className="font-display text-lg">Post a Product</h2>
        <p className="text-sm text-muted -mt-2">
          Every product needs at least one photo — add up to 5 so shoppers can browse the piece from every
          angle. Add a video too if you want to show it in motion — all of it will appear together on the
          product&apos;s page.
        </p>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5 bg-white">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Price (GH¢, optional — for items sold)</span>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm flex items-center gap-2 mt-6">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Feature on homepage
          </label>
        </div>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Description</span>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm block">
            <span className="block mb-1 font-medium">
              Product Photos (1–5) <span className="text-gold-dark">*</span>
            </span>
            <input
              type="file"
              required={imageFiles.length === 0}
              multiple
              accept="image/*"
              onChange={(e) => handlePhotosChosen(e.target.files)}
              className="w-full text-sm"
            />
            {resizingPhotos && <p className="text-xs text-muted mt-1">Optimizing photo(s)…</p>}
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imageFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="relative w-20 h-20 shrink-0">
                    <MediaCover src={imagePreviewUrls[i]} alt={f.name} className="w-full h-full rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={`Remove ${f.name}`}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-white text-xs leading-5 hover:bg-black"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-full">Cover</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Product Video (optional)</span>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full text-sm" />
            {videoPreviewUrl && (
              <MediaCover src={videoPreviewUrl} type="video" alt="Video preview" className="w-full aspect-video rounded-lg mt-2" />
            )}
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Uploading…' : 'Post Product'}</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item._id} className="card overflow-hidden">
            <div className="aspect-square bg-black/5 relative">
              {/* Matches the public product card — full uncropped photo,
                  not a cropped object-cover fill. */}
              <MediaCover src={mediaUrl(item.imageUrl)} alt={item.title} className="w-full h-full" />
              {item.videoUrl && (
                <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">▶ Video</span>
              )}
              {item.imageUrls?.length > 1 && (
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">{item.imageUrls.length} photos</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted">{item.category}{item.price ? ` · GH¢ ${item.price}` : ''}</p>
              <div className="flex justify-between mt-2 text-xs">
                <button onClick={() => togglePublish(item)} className="text-gold-dark hover:underline">
                  {item.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-muted py-8">No products yet — post your first one above.</p>}
    </div>
  );
}
