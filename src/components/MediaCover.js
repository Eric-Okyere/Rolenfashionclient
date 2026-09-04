'use client';

// Shared "show the whole photo/video, never crop it" treatment. A plain
// `object-cover` box crops hard to fill its frame — fine for a square photo,
// but it was cutting heads and key detail off tall/portrait shots (a full
// gown, a standing couple) wherever a wide, short box was used, most
// visibly the homepage's big Ad Carousel banner (Eric: "the pictures in the
// carousel is not showing well"). This renders a blurred, scaled-up copy of
// the same image as a backdrop that fills the frame edge-to-edge, with the
// real photo/video sitting on top *uncropped* (`object-contain`) — so the
// whole shot is always fully visible no matter its aspect ratio, with no
// plain empty letterbox bars either. Used both for the live public carousel
// and for admin upload-preview boxes, so what an admin sees while choosing a
// photo/video matches what visitors will actually see.
export default function MediaCover({ src, type = 'image', poster, alt = '', className = '' }) {
  const backdrop = poster || (type === 'image' ? src : undefined);

  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-70"
        />
      )}
      {type === 'video' ? (
        <video src={src} poster={poster} muted loop playsInline autoPlay className="relative w-full h-full object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="relative w-full h-full object-contain" />
      )}
    </div>
  );
}
