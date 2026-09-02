import { safeFetch } from '@/lib/api';
import GalleryItem from '@/components/GalleryItem';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';

export const metadata = { title: 'Gallery & Shop' };

const categories = ['All', 'Ready-to-Wear', 'Bridal', 'Accessories', 'Student Work', 'Runway', 'Other'];

export default async function GalleryPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category && params.category !== 'All' ? params.category : undefined;
  const videoOnly = params?.video === '1';
  const qs = new URLSearchParams();
  if (category) qs.set('category', category);
  if (videoOnly) qs.set('video', '1');
  const query = qs.toString() ? `?${qs.toString()}` : '';

  const { items } = await safeFetch(`/api/gallery${query}`, { items: [] });

  return (
    <div className="container-page py-16">
      <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Rolen Garments</Reveal>
      <Reveal as="h1" delay={0.05} className="font-display text-4xl mb-4">Gallery &amp; Shop</Reveal>
      <Reveal as="p" delay={0.1} className="text-ink/70 max-w-2xl mb-10">
        Photos and videos of pieces designed, made and sold by our students and studio — from ready-to-wear to
        bridal. Interested in a piece? Reach out via our contact page.
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = (cat === 'All' && !category) || cat === category;
            const href = cat === 'All' ? '/gallery' : `/gallery?category=${encodeURIComponent(cat)}`;
            return (
              <a
                key={cat}
                href={href}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  active ? 'bg-ink text-cream border-ink' : 'border-black/15 text-ink/70 hover:border-gold-dark'
                }`}
              >
                {cat}
              </a>
            );
          })}
        </div>
        <div className="flex gap-2 text-sm">
          <a
            href={category ? `/gallery?category=${category}` : '/gallery'}
            className={`px-3 py-1.5 rounded-full border transition-colors ${!videoOnly ? 'bg-gold text-ink border-gold' : 'border-black/15 text-ink/70 hover:border-gold-dark'}`}
          >
            All Products
          </a>
          <a
            href={category ? `/gallery?category=${category}&video=1` : '/gallery?video=1'}
            className={`px-3 py-1.5 rounded-full border transition-colors ${videoOnly ? 'bg-gold text-ink border-gold' : 'border-black/15 text-ink/70 hover:border-gold-dark'}`}
          >
            🎥 With Video
          </a>
        </div>
      </div>

      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(items || []).map((item) => (
          <StaggerItem key={item._id}>
            <GalleryItem item={item} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      {(!items || items.length === 0) && (
        <p className="text-center text-muted py-10">No items in this category yet — check back soon.</p>
      )}
    </div>
  );
}
