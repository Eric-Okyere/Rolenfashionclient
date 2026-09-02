'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mediaUrl } from '@/lib/api';

export default function GalleryItem({ item }) {
  const [open, setOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState('image');
  const hasVideo = Boolean(item.videoUrl);

  function openLightbox() {
    setActiveMedia('image');
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={openLightbox}
        className="card overflow-hidden group relative aspect-square block w-full text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl motion-reduce:hover:translate-y-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(item.imageUrl)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <p className="text-white text-sm font-medium">{item.title}</p>
          {item.price && <p className="text-gold-light text-xs">GHS {Number(item.price).toLocaleString()}</p>}
        </div>
        {hasVideo && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">▶ Video</span>
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
              {hasVideo && (
                <div className="flex gap-2 mb-3 justify-center">
                  <button
                    onClick={() => setActiveMedia('image')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      activeMedia === 'image' ? 'bg-gold text-ink border-gold' : 'border-cream/30 text-cream/80'
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => setActiveMedia('video')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      activeMedia === 'video' ? 'bg-gold text-ink border-gold' : 'border-cream/30 text-cream/80'
                    }`}
                  >
                    Video
                  </button>
                </div>
              )}

              {activeMedia === 'video' && hasVideo ? (
                <video src={mediaUrl(item.videoUrl)} controls autoPlay className="w-full max-h-[70vh] rounded-lg" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(item.imageUrl)} alt={item.title} className="w-full max-h-[70vh] object-contain rounded-lg" />
              )}

              <div className="text-cream mt-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.description && <p className="text-sm text-cream/70">{item.description}</p>}
                </div>
                {item.price && <p className="text-gold-light font-semibold">GHS {Number(item.price).toLocaleString()}</p>}
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
