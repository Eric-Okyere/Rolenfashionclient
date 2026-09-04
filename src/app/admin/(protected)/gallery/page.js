'use client';

import { useEffect, useState } from 'react';
import { apiFetch, mediaUrl } from '@/lib/api';

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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await apiFetch('/api/gallery?all=1');
    setItems(data.items);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  function handlePhotosChosen(fileList) {
    const files = Array.from(fileList);
    if (files.length > 5) {
      setError('Choose at most 5 photos.');
      setImageFiles(files.slice(0, 5));
      return;
    }
    setError(null);
    setImageFiles(files);
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
            <span className="block mb-1 font-medium">Price (GHS, optional — for items sold)</span>
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
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imageFiles.map((f, i) => (
                  <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 text-xs bg-black/5 rounded-full pl-2.5 pr-1 py-1">
                    {f.name.length > 18 ? `${f.name.slice(0, 15)}…` : f.name}
                    <button type="button" onClick={() => removePhoto(i)} className="w-4 h-4 rounded-full bg-black/10 hover:bg-black/20 text-[10px] leading-4">×</button>
                  </span>
                ))}
              </div>
            )}
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Product Video (optional)</span>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full text-sm" />
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Uploading…' : 'Post Product'}</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item._id} className="card overflow-hidden">
            <div className="aspect-square bg-black/5 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
              {item.videoUrl && (
                <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">▶ Video</span>
              )}
              {item.imageUrls?.length > 1 && (
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">{item.imageUrls.length} photos</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted">{item.category}{item.price ? ` · GHS ${item.price}` : ''}</p>
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
