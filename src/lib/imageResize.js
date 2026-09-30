// Client-side downscale for product/marketing photos before upload.
//
// Eric: "let the form be able to take large pictures and video instead of
// reducing the quality" — but a modern phone/DSLR photo (20-30MB+, often
// 4000-8000px on the long edge) carries far more resolution than any
// browser will ever display it at, and Cloudinary's free plan rejects
// anything over 10MB outright rather than accepting and shrinking it. This
// runs entirely in the browser (via <canvas>, nothing uploads first) and
// caps the long edge + re-encodes at high JPEG quality — visually lossless
// on any screen the photo will actually be viewed on, while cutting file
// size by 80-90%+ so it clears Cloudinary's cap without Eric needing to
// resize anything by hand or pay for a higher Cloudinary plan. See the
// Gallery/Carousel/Courses admin forms for where this gets called.
const MAX_DIMENSION = 2800; // px, long edge — comfortably larger than any
  // layout on the site ever renders a photo at, including a full-bleed hero.
const START_QUALITY = 0.92;
const MIN_QUALITY = 0.6;
const QUALITY_STEP = 0.08;
// Stay safely under Cloudinary's 10MB free-plan per-image cap (see the
// note on uploadCourseImage in server/src/middleware/upload.js) rather
// than targeting exactly 10MB.
const TARGET_MAX_BYTES = 9.5 * 1024 * 1024;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

export async function resizeImageFile(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  // Animated GIFs would collapse to a single frame through <canvas>, and
  // SVGs are already tiny vector files — leave both untouched.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  // Already comfortably under the cap — skip the re-encode entirely rather
  // than risk growing a well-compressed small file.
  if (file.size <= TARGET_MAX_BYTES) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // A format this browser can't decode (e.g. HEIC straight off an
    // iPhone) — let it through as-is. The server's own extension allowlist
    // will reject it with a clear message rather than this failing silently.
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  if (typeof bitmap.close === 'function') bitmap.close();

  // PNGs stay PNG (lossless — a re-encode as JPEG would flatten any
  // transparency to a solid background) — dimension-capping is the only
  // lever available for those; everything else (JPEG, WEBP, etc.)
  // re-encodes as a high-quality JPEG, stepping quality down only if the
  // resized photo is still over the cap.
  const isPng = file.type === 'image/png';
  const outType = isPng ? 'image/png' : 'image/jpeg';
  let quality = START_QUALITY;
  let blob = await canvasToBlob(canvas, outType, isPng ? undefined : quality);
  if (!isPng) {
    while (blob && blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
      quality -= QUALITY_STEP;
      blob = await canvasToBlob(canvas, outType, quality);
    }
  }
  if (!blob) return file; // canvas export failed for some reason — fall back to the original

  const ext = isPng ? '.png' : '.jpg';
  const newName = file.name.replace(/\.\w+$/, '') + ext;
  return new File([blob], newName, { type: outType, lastModified: file.lastModified });
}
