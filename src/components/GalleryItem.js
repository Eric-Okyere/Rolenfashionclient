'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mediaUrl, API_URL } from '@/lib/api';
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
export default function GalleryItem({ item, whatsapp, isNew = false }) {
  const [open, setOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
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
  const orderMessage = `Hi Rolen! I'd like to order: ${item.title}${item.price ? ` (GHS ${Number(item.price).toLocaleString()})` : ''}.`;

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
          {item.price && <p className="text-gold-light text-xs">GHS {Number(item.price).toLocaleString()}</p>}
        </div>
        {hasVideo && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">▶ Video</span>
        )}
        {isNew && (
          <span className="absolute top-2 left-2 bg-gold text-ink text-[10px] font-semibold px-2 py-0.5 rounded-full">NEW</span>
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(currentMedia.src)}
                    alt={`${item.title}${hasMultipleMedia ? ` — ${mediaIndex + 1} of ${mediaItems.length}` : ''}`}
                    className="w-full max-h-[70vh] object-contain rounded-lg"
                  />
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
                  {item.description && <p className="text-sm text-cream/70 max-w-md">{item.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {item.price && <p className="text-gold-light font-semibold whitespace-nowrap">GHS {Number(item.price).toLocaleString()}</p>}
                  {orderNumber && (
                    <a
                      href={waHref(orderNumber, orderMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); pingOrderInterest(); }}
                      className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3.5 py-2 rounded-full hover:brightness-105 transition-[filter] whitespace-nowrap"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      Order via WhatsApp
                    </a>
                  )}
                </div>
              </div>
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
