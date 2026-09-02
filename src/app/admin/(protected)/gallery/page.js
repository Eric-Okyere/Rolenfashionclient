'use client';

import { useEffect, useState } from 'react';
import { apiFetch, mediaUrl } from '@/lib/api';

const categories = ['Ready-to-Wear', 'Bridal', 'Accessories', 'Student Work', 'Runway', 'Other'];

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'Other', price: '', isFeatured: false });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await apiFetch('/api/gallery?all=1');
    setItems(data.items);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!imageFile) return setError('Please choose a product photo — it’s required.');
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      if (videoFile) fd.append('video', videoFile);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await apiFetch('/api/gallery', { method: 'POST', body: fd });
      setForm({ title: '', description: '', category: 'Other', price: '', isFeatured: false });
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
          Every product needs a photo. Add a video too if you want to show it in motion — both will appear
          together on the product&apos;s page.
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
              Product Photo <span className="text-gold-dark">*</span>
            </span>
            <input type="file" required accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm" />
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
