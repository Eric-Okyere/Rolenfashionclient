'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mediaUrl, API_URL, apiFetch } from '@/lib/api';
import { splitNumbers, waHref } from '@/lib/phone';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import MediaCover from '@/components/MediaCover';

// `whatsapp` (Settings.whatsapp) is optional — pages that just want a plain
// photo/video card (e.g. the School page's small preview strip) can omit it
// and simply won't render the order button. Pages selling the piece (the
// Shop homepage) pass it through so a shopper can go from "I like this" to
// "I've messaged about it" in one tap, without a full checkout flow.
// `isNew` is computed by the caller (a server component, via lib/time's
// isRecent()) from the product's own createdAt timestamp — not an
// admin-set flag, so it's always accurate — rather than here, since calling
// Date.now() during a client component's render is treated as an impure,
// unstable read by this project's lint rules.
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

export default function GalleryItem({ item, whatsapp, isNew = false }) {
  const [open, setOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  // Eric shared a second reference video: hovering a product photo magnifies
  // the part of it under the cursor, so a shopper can inspect fabric/stitch
  // detail without leaving the lightbox. `zoomOrigin` tracks where on the
  // photo the cursor currently is (as a CSS `x% y%` transform-origin);
  // `isZoomed` is only true while the cursor is actually over the photo, so
  // it snaps back to normal the moment the mouse leaves. Photo-only, same as
  // the reference — a playing video has its own controls to magnify with.
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const zoomBoxRef = useRef(null);
  const hasVideo = Boolean(item.videoUrl);
  // Older products saved before the 5-photo field existed just have an empty
  // imageUrls array — fall back to the single imageUrl so they still browse
  // correctly (as one photo, no strip/arrows), same "don't require a
  // migration" pattern used elsewhere in this project.
  const photos = item.imageUrls?.length ? item.imageUrls : [item.imageUrl];
  // Eric shared a reference site (a marketplace quick-view popup) and said
  // "implement this function on the products cards": there, the video isn't
  // behind a separate Photo/Video toggle — it's just the last thumbnail in
  // one strip, and clicking any thumbnail (photo or video) swaps the main
  // preview in place, with the same prev/next arrows working across all of
  // them. `mediaItems` is that single combined list — photos first, video
  // last, matching the reference — so one `mediaIndex` drives everything.
  const mediaItems = hasVideo
    ? [...photos.map((src) => ({ type: 'image', src })), { type: 'video', src: item.videoUrl }]
    : photos.map((src) => ({ type: 'image', src }));
  const hasMultipleMedia = mediaItems.length > 1;
  const currentMedia = mediaItems[mediaIndex];
  const orderNumber = splitNumbers(whatsapp)[0];
  // Only labelled where the piece is actually being sold (the Shop passes
  // `whatsapp`); the School page's plain photo strip omits it and shows no
  // pre-order badge, since nothing is for sale there.
  const isPreOrder = Boolean(whatsapp) && isPreOrderCategory(item.category);
  const orderVerb = isPreOrder ? 'pre-order' : 'order';
  const orderMessage = `Hi Rolen! I'd like to ${orderVerb}: ${item.title}${item.price ? ` (GH¢ ${Number(item.price).toLocaleString()})` : ''}.`;

  // Eric: "Students must pay their fees through Momo on 0209317581", then
  // asked for a way to enter a phone number and have the money deducted
  // directly — extended here to shop orders too, alongside (not instead of)
  // "Order via WhatsApp", since a price is already published on some
  // products. Built via Paystack's Mobile Money checkout (see the server's
  // paymentController.js) — this component only ever collects a name/email
  // to start the checkout; the actual MoMo phone number and PIN approval
  // happen on Paystack's own secure page, never here.
  const [showPayForm, setShowPayForm] = useState(false);
  const [payName, setPayName] = useState('');
  const [payEmail, setPayEmail] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(null);

  async function payWithMomo(e) {
    e.preventDefault();
    e.stopPropagation();
    setPayLoading(true);
    setPayError(null);
    try {
      const data = await apiFetch('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({ type: 'shop_order', galleryItemId: item._id, email: payEmail, name: payName }),
      });
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setPayError(err.message);
      setPayLoading(false);
    }
  }

  function openLightbox() {
    setMediaIndex(0);
    setOpen(true);
  }

  function nextMedia() {
    setMediaIndex((i) => (i + 1) % mediaItems.length);
  }

  function prevMedia() {
    setMediaIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  }

  // Position the magnified view under the cursor. Measured against the
  // photo's own box (`zoomBoxRef`, sized to exactly wrap the <img> — see
  // below), not the wider media area around it, so the percentage lines up
  // with where the cursor actually is on the photo itself.
  function handleZoomMove(e) {
    const box = zoomBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  }

  // Eric: "If a customer wants to buy a product, let admin receives whatsapp
  // notifications" — fired the instant the shopper taps the button below,
  // alongside (not instead of) that same tap opening their own WhatsApp
  // chat to the school. Deliberately not awaited and errors are swallowed:
  // this must never delay or break the shopper opening WhatsApp, it just
  // additionally lets Eric know via a WhatsApp alert (see server's
  // utils/whatsapp.js) without having to watch the chat itself.
  function pingOrderInterest() {
    fetch(`${API_URL}/api/gallery/${item._id}/order-click`, { method: 'POST' }).catch(() => {});
  }

  return (
    <>
      <button
        onClick={openLightbox}
        className="card overflow-hidden group relative aspect-square block w-full text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl motion-reduce:hover:translate-y-0"
      >
        {/* Eric: "work on all the cards and show the full picture in the
            cards" — a plain object-cover fill was cropping tall/portrait
            product photos to fit this square card, the same issue already
            fixed for the carousel. MediaCover shows the whole photo
            uncropped, with a blurred fill behind it so the square never has
            plain empty bars. The hover zoom now scales the whole card
            (photo + backdrop together) instead of just an inner <img>. */}
        <MediaCover
          src={mediaUrl(item.imageUrl)}
          alt={item.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <p className="text-white text-sm font-medium">{item.title}</p>
          {item.price && <p className="text-gold-light text-xs">GH¢ {Number(item.price).toLocaleString()}</p>}
        </div>
        {hasVideo && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">▶ Video</span>
        )}
        {isNew && (
          <span className="absolute top-2 left-2 bg-gold text-ink text-[10px] font-semibold px-2 py-0.5 rounded-full">NEW</span>
        )}
        {isPreOrder && (
          <span className="absolute bottom-2 left-2 bg-ink/85 text-gold-light text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full">
            PRE-ORDER
          </span>
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">1/{photos.length}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {currentMedia.type === 'video' ? (
                  <video
                    key={currentMedia.src}
                    src={mediaUrl(currentMedia.src)}
                    controls
                    autoPlay
                    playsInline
                    className="w-full max-h-[70vh] rounded-lg bg-black"
                  />
                ) : (
                  <div
                    ref={zoomBoxRef}
                    className="overflow-hidden rounded-lg"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseMove={handleZoomMove}
                    onMouseLeave={() => setIsZoomed(false)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(currentMedia.src)}
                      alt={`${item.title}${hasMultipleMedia ? ` — ${mediaIndex + 1} of ${mediaItems.length}` : ''}`}
                      style={isZoomed ? { transformOrigin: zoomOrigin } : undefined}
                      className={`w-full max-h-[70vh] object-contain rounded-lg transition-transform duration-150 ease-out ${
                        isZoomed ? 'scale-[2.2] cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                    />
                  </div>
                )}
                {hasMultipleMedia && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                      aria-label="Previous"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                      aria-label="Next"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      ›
                    </button>
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {mediaIndex + 1}/{mediaItems.length}
                    </span>
                  </>
                )}
              </div>

              {/* Eric's reference site: one thumbnail strip covering photos AND
                  the video together (video last), any thumbnail tap swapping
                  the main preview above — not a separate Photo/Video toggle. */}
              {hasMultipleMedia && (
                <div className="flex gap-2 mt-2 justify-center flex-wrap">
                  {mediaItems.map((m, i) => (
                    <button
                      key={`${m.type}-${m.src}`}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMediaIndex(i); }}
                      aria-label={m.type === 'video' ? 'Play video' : `Photo ${i + 1}`}
                      className={`relative w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                        i === mediaIndex ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {m.type === 'video' ? (
                        <>
                          {/* Browsers commonly show the video's first frame here
                              once metadata loads, but that's not guaranteed
                              everywhere, so the ▶ badge on top is what actually
                              makes it read as "this one's a video" reliably. */}
                          <video src={mediaUrl(m.src)} muted preload="metadata" playsInline className="w-full h-full object-cover bg-ink" />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">▶</span>
                        </>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(m.src)} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-cream mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  {isPreOrder && (
                    <p className="text-xs text-gold-light mt-0.5">
                      Pre-order — ready 3 working days after a 70% deposit is paid.
                    </p>
                  )}
                  {item.description && <p className="text-sm text-cream/70 max-w-md">{item.description}</p>}
                </div>
                <div className="flex items-center flex-wrap gap-3">
                  {item.price && <p className="text-gold-light font-semibold whitespace-nowrap">GH¢ {Number(item.price).toLocaleString()}</p>}
                  {/* Only offered when the product has a published price —
                      there's nothing to charge otherwise, so this button
                      never appears next to a "contact for pricing" item. */}
                  {item.price && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowPayForm((v) => !v); }}
                      className="inline-flex items-center gap-1.5 bg-gold text-ink text-xs font-semibold px-3.5 py-2 rounded-full hover:brightness-105 transition-[filter] whitespace-nowrap"
                    >
                      {isPreOrder ? '💳 Pre-order with MoMo' : '💳 Pay with MoMo'}
                    </button>
                  )}
                  {orderNumber && (
                    <a
                      href={waHref(orderNumber, orderMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); pingOrderInterest(); }}
                      className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3.5 py-2 rounded-full hover:brightness-105 transition-[filter] whitespace-nowrap"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      {isPreOrder ? 'Pre-order via WhatsApp' : 'Order via WhatsApp'}
                    </a>
                  )}
                </div>
              </div>

              {showPayForm && item.price && (
                <form
                  onSubmit={payWithMomo}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 bg-cream/5 border border-cream/15 rounded-lg p-4 space-y-3"
                >
                  <p className="text-cream text-sm font-medium">
                    {isPreOrder ? 'Pre-order: pay' : 'Pay'} GH¢ {Number(item.price).toLocaleString()} for {item.title}
                  </p>
                  <p className="text-cream/60 text-xs">
                    You&apos;ll enter your Mobile Money number and approve the payment on your own phone next.
                  </p>
                  <input
                    required
                    placeholder="Your name"
                    value={payName}
                    onChange={(e) => setPayName(e.target.value)}
                    className="w-full rounded-lg border border-cream/20 bg-transparent text-cream placeholder:text-cream/40 p-2.5 text-sm outline-none focus:border-gold-light"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your email (for a receipt)"
                    value={payEmail}
                    onChange={(e) => setPayEmail(e.target.value)}
                    className="w-full rounded-lg border border-cream/20 bg-transparent text-cream placeholder:text-cream/40 p-2.5 text-sm outline-none focus:border-gold-light"
                  />
                  {payError && <p className="text-red-400 text-xs">{payError}</p>}
                  <button type="submit" disabled={payLoading} className="btn-gold w-full">
                    {payLoading ? 'Starting payment…' : 'Continue to Payment'}
                  </button>
                </form>
              )}

              <button onClick={() => setOpen(false)} className="mt-3 text-cream/70 text-sm underline">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
