import Link from 'next/link';
import { safeFetch, mediaUrl } from '@/lib/api';
import { splitNumbers, waHref } from '@/lib/phone';
import GalleryItem from '@/components/GalleryItem';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';
import HeroVisual from '@/components/motion/HeroVisual';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

// The Shop is now the site's homepage — Eric: "let the shop be the main
// page and the school in the navbar so that everyone who visits the page
// will see all the fashion products the business sells." The school's old
// homepage content moved to /school (see that file) and is reachable from
// the navbar; this page owns "/". The public shop URL used to be /gallery —
// that route now redirects here (preserving ?category/&video) so old links
// and bookmarks still work, see app/gallery/page.js.
export const metadata = { title: 'Shop' };

// Eric's finalized brand-line structure — names, taglines and sub-lines
// given directly by him. The server's Gallery model keeps every older
// category value too (see Gallery.js) purely so an already-saved product
// never fails validation — but these five (plus a catch-all "Other") are
// the only ones shown here and in the admin "Post a Product" form, since
// this is how the business organizes its collection now. `tags` are
// sub-collections shown as small labels on the card (not yet a separate
// filterable field — see the delivery note for why); `subBrands` is for
// Ready-to-Wear's two named lines, each with their own tagline.
const CATEGORIES = [
  {
    key: 'Rolen Kente',
    blurb: 'Tradition tailored into simply elegance.',
    tags: ['Corseted Beaded', 'Corseted Plain', 'Rolen Kente Gowns'],
  },
  {
    key: 'Rolen Bridals',
    blurb: 'Where dreams walk down the aisle, and every vow simply meets elegance.',
    tags: ['Classic Bridal', 'Modern Bridal', 'Custom Bridal'],
  },
  {
    key: 'Rolen Custom',
    blurb: 'Your vision, our simply elegance.',
    tags: ['Bespoke Gowns', 'One-of-One Exclusives', 'Consultation Process'],
  },
  {
    key: 'Rolen Ready-to-Wear',
    blurb: 'Everyday style, simply elegance.',
    subBrands: [
      { name: 'Ewuraba', blurb: 'Grace for every day.' },
      { name: 'Aba Bryan', blurb: 'Bold style, effortless chic.' },
    ],
  },
  {
    key: 'Rolen Bespoke',
    blurb: 'One-of-one, simply elegance.',
    tags: ['Tailored Couture Gowns & Suits', 'Premium Fittings'],
  },
];

const FILTER_CHIPS = ['All', ...CATEGORIES.map((c) => c.key), 'Other'];

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category && params.category !== 'All' ? params.category : undefined;
  const videoOnly = params?.video === '1';
  const qs = new URLSearchParams();
  if (category) qs.set('category', category);
  if (videoOnly) qs.set('video', '1');
  const query = qs.toString() ? `?${qs.toString()}` : '';

  const [{ items }, settingsData] = await Promise.all([
    safeFetch(`/api/gallery${query}`, { items: [] }),
    safeFetch('/api/settings', { settings: {} }),
  ]);

  const settings = settingsData.settings || {};
  const whatsapp = settings.whatsapp;
  const orderNumber = splitNumbers(whatsapp)[0];

  // The "Featured" strip only makes sense on the unfiltered view (it's a
  // curated cross-section of every category) — reuse the already-fetched
  // `items` rather than firing a second request; when a filter is active,
  // items *is* that unfiltered set's absence, so featured is simply empty
  // and the section hides itself below.
  const featured = !category && !videoOnly ? (items || []).filter((i) => i.isFeatured).slice(0, 4) : [];
  const heroImage = featured[0] || (items || [])[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink to-[#241c10] text-cream">
        <div className="container-page py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-light mb-4">
              Rolen Studio &middot; {settings.city || 'Accra'}, {settings.country || 'Ghana'}
            </Reveal>
            <Reveal as="h1" delay={0.08} className="font-display text-4xl md:text-5xl leading-tight mb-6">
              Wear the story <span className="gold-gradient-text">we craft</span>.
            </Reveal>
            <Reveal as="p" delay={0.16} className="text-cream/75 mb-8 max-w-md">
              Kente ceremonial wear, bridal gowns, custom couture and our signature ready-to-wear lines —
              every piece designed and made in our own studio, by the same house that trains Ghana&apos;s
              next fashion designers.
            </Reveal>
            <Reveal delay={0.24} className="flex flex-wrap gap-4">
              <a href="#collection" className="btn-gold">Shop the Collection</a>
              {orderNumber && (
                <a
                  href={waHref(orderNumber, "Hi Rolen! I'd like to ask about a custom order.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !border-cream/40 !text-cream hover:!bg-cream hover:!text-ink"
                >
                  Custom Orders
                </a>
              )}
            </Reveal>
          </div>
          <HeroVisual src={heroImage ? mediaUrl(heroImage.imageUrl) : '/images/rolen-logo.png'} alt={heroImage?.title || 'Rolen'} />
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-gold-light/10 border-y border-black/5">
        <div className="container-page py-6 flex flex-wrap justify-center gap-x-10 gap-y-3 text-center">
          {[
            'Handcrafted in Accra, Ghana',
            'Custom Fittings on Request',
            'Order Directly via WhatsApp',
            'By the Studio That Trains Our Designers',
          ].map((line) => (
            <p key={line} className="text-xs md:text-sm text-ink/70 font-medium">
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* Category showcase */}
      <section className="container-page py-20">
        <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3 text-center">
          Our Lines
        </Reveal>
        <Reveal as="h2" delay={0.05} className="font-display text-3xl text-center mb-12">
          Shop by Collection
        </Reveal>
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.key} className="h-full">
              <a
                href={`/?category=${encodeURIComponent(cat.key)}#collection`}
                className="card group flex flex-col h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0"
              >
                <h3 className="font-display text-2xl mb-2 group-hover:text-gold-dark transition-colors">{cat.key}</h3>
                <p className="text-sm italic text-ink/70 mb-4">&ldquo;{cat.blurb}&rdquo;</p>

                {cat.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-gold-light/15 text-ink/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {cat.subBrands && (
                  <div className="space-y-2 mb-4">
                    {cat.subBrands.map((sub) => (
                      <div key={sub.name} className="text-sm">
                        <span className="font-semibold text-ink/80">{sub.name}</span>
                        <span className="text-ink/60 italic"> — &ldquo;{sub.blurb}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-sm font-semibold text-gold-dark mt-auto">Shop {cat.key} →</span>
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Featured */}
      {featured.length > 0 && !category && !videoOnly && (
        <section className="bg-white border-y border-black/5">
          <div className="container-page py-20">
            <Reveal className="flex items-end justify-between mb-10">
              <div>
                <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Handpicked</p>
                <h2 className="font-display text-3xl">Featured Pieces</h2>
              </div>
            </Reveal>
            <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((item) => (
                <StaggerItem key={item._id}>
                  <GalleryItem item={item} whatsapp={whatsapp} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Full collection */}
      <section id="collection" className="container-page py-20 scroll-mt-20">
        <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">
          The Collection
        </Reveal>
        <Reveal as="h2" delay={0.05} className="font-display text-3xl mb-10">
          {category ? category : 'All Products'}
        </Reveal>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map((cat) => {
              const active = (cat === 'All' && !category) || cat === category;
              const href = cat === 'All' ? '/#collection' : `/?category=${encodeURIComponent(cat)}#collection`;
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
              href={category ? `/?category=${category}#collection` : '/#collection'}
              className={`px-3 py-1.5 rounded-full border transition-colors ${!videoOnly ? 'bg-gold text-ink border-gold' : 'border-black/15 text-ink/70 hover:border-gold-dark'}`}
            >
              All Products
            </a>
            <a
              href={category ? `/?category=${category}&video=1#collection` : '/?video=1#collection'}
              className={`px-3 py-1.5 rounded-full border transition-colors ${videoOnly ? 'bg-gold text-ink border-gold' : 'border-black/15 text-ink/70 hover:border-gold-dark'}`}
            >
              🎥 With Video
            </a>
          </div>
        </div>

        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(items || []).map((item) => (
            <StaggerItem key={item._id}>
              <GalleryItem item={item} whatsapp={whatsapp} />
            </StaggerItem>
          ))}
        </StaggerGroup>
        {(!items || items.length === 0) && (
          <p className="text-center text-muted py-10">No items in this category yet — check back soon.</p>
        )}
      </section>

      {/* Order help / cross-sell to the school */}
      <section className="container-page pb-20">
        <Reveal className="rounded-2xl bg-ink text-cream p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl mb-3">Not sure what you&apos;re looking for?</h2>
            <p className="text-cream/70">
              Message us on WhatsApp with what you have in mind — fabric, fit, occasion — and we&apos;ll help you
              find or create the right piece.
            </p>
          </div>
          <div className="flex md:justify-end gap-4">
            {orderNumber ? (
              <a
                href={waHref(orderNumber, 'Hi Rolen! I have a question about a product.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Chat With Us
              </a>
            ) : (
              <Link href="/contact" className="btn-gold">Contact Us</Link>
            )}
            <Link href="/school" className="btn-outline !border-cream/40 !text-cream hover:!bg-cream hover:!text-ink">
              Learn the Craft
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
