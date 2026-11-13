import Link from 'next/link';
import { safeFetch, mediaUrl } from '@/lib/api';
import { splitNumbers, waHref } from '@/lib/phone';
import { isRecent } from '@/lib/time';
import GalleryItem from '@/components/GalleryItem';
import TestimonialCard from '@/components/TestimonialCard';
import HeroCarousel from '@/components/HeroCarousel';
import MediaCover from '@/components/MediaCover';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';
import HeroVisual from '@/components/motion/HeroVisual';
import HeroUnderline from '@/components/motion/HeroUnderline';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

// The Shop is now the site's homepage — Eric: "let the shop be the main
// page and the school in the navbar so that everyone who visits the page
// will see all the fashion products the business sells." The school's old
// homepage content moved to /school (see that file) and is reachable from
// the navbar; this page owns "/". The public shop URL used to be /gallery —
// that route now redirects here (preserving ?category/&video) so old links
// and bookmarks still work, see app/gallery/page.js.
// Eric: "Let the shop page name be Rolen Fashion and Design" — this is what
// shows as the browser tab title and the name used when the page is shared
// (search results, link previews). The root layout's generateMetadata()
// sets a title *template* ("%s | <school name>") that every page's title
// normally gets appended to — using `absolute` here bypasses that so the
// tab reads exactly "Rolen Fashion and Design", not doubled up with the
// school's own name.
export const metadata = { title: { absolute: 'Rolen Fashion and Design' } };

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
  {
    key: 'Lace',
    blurb: 'Fine lace, finished with simply elegance.',
  },
  {
    key: 'Custom',
    blurb: 'Made to your own specifications, simply elegance.',
  },
  {
    key: 'Wedding Gowns',
    blurb: 'Your big day, simply elegance.',
  },
];

const FILTER_CHIPS = ['All', ...CATEGORIES.map((c) => c.key), 'Other'];

// Maps admin-managed ad slides (CarouselPost — see server/src/models/
// CarouselPost.js) to the shape HeroCarousel renders. This is deliberately
// NOT auto-derived from the product catalog — Eric: "Carousel post should be
// different from product post... Carousels should be very big to be used
// for advertisement" — so what shows in the big homepage banner is exactly
// what he posts to the Ad Carousel admin page, in the order he sets.
function buildAdSlides(posts) {
  return (posts || [])
    .filter((p) => p.imageUrl || p.videoUrl)
    .map((p) => ({
      id: p._id,
      type: p.videoUrl ? 'video' : 'image',
      src: p.videoUrl ? mediaUrl(p.videoUrl) : mediaUrl(p.imageUrl),
      poster: p.imageUrl ? mediaUrl(p.imageUrl) : undefined,
      title: p.title,
      caption: p.caption,
      ctaLabel: p.ctaLabel || 'Shop Now',
      href: p.linkCategory ? `/?category=${encodeURIComponent(p.linkCategory)}#collection` : '#collection',
    }));
}

// One representative photo per category card — Eric: "every collection
// must have picture or video." A product's photo is required by the
// Gallery schema (the video is only ever an optional companion), so this
// always has a real image to show whenever the category has any published
// product at all; a category with no products yet gets an honest "coming
// soon" placeholder instead of a broken image.
function buildCategoryCovers(items) {
  const covers = new Map();
  for (const cat of CATEGORIES) {
    const catItems = (items || []).filter((i) => i.category === cat.key && i.imageUrl);
    covers.set(cat.key, catItems.find((i) => i.isFeatured) || catItems[0] || null);
  }
  return covers;
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category && params.category !== 'All' ? params.category : undefined;
  const videoOnly = params?.video === '1';
  const qs = new URLSearchParams();
  if (category) qs.set('category', category);
  if (videoOnly) qs.set('video', '1');
  const query = qs.toString() ? `?${qs.toString()}` : '';

  const [{ items }, settingsData, testimonialsData, carouselData] = await Promise.all([
    safeFetch(`/api/gallery${query}`, { items: [] }, { revalidate: 60 }),
    safeFetch('/api/settings', { settings: {} }, { revalidate: 60 }),
    safeFetch('/api/testimonials', { testimonials: [] }, { revalidate: 60 }),
    safeFetch('/api/carousel', { posts: [] }, { revalidate: 60 }),
  ]);

  const settings = settingsData.settings || {};
  const whatsapp = settings.whatsapp;
  const orderNumber = splitNumbers(whatsapp)[0];
  const testimonials = (testimonialsData.testimonials || []).slice(0, 3);
  const heroSlides = buildAdSlides(carouselData.posts);

  // The category-showcase cover photos are page furniture that should
  // always reflect the FULL catalog, not just the active filter — reuse
  // `items` directly when the view is already unfiltered (the common case,
  // and avoids a redundant second request), and only fetch the unfiltered
  // set separately when a category/video filter is active and `items` is
  // just that narrower slice.
  const showcaseItems = !category && !videoOnly ? items || [] : (await safeFetch('/api/gallery', { items: [] }, { revalidate: 60 })).items || [];

  // The "Featured" strip only makes sense on the unfiltered view (it's a
  // curated cross-section of every category) — it hides itself below when
  // a filter is active.
  const featured = !category && !videoOnly ? showcaseItems.filter((i) => i.isFeatured).slice(0, 4) : [];
  const coverByCategory = buildCategoryCovers(showcaseItems);

  return (
    <div>
      {/* Hero — a big advertisement carousel (Eric: "Carousels should be
          very big to be used for advertisement"), kept as a clean
          media-only showcase with no text drawn over it. Eric shared a
          reference site's banner and said "look at how this is appearing
          well... don't show any writings on the carousel" — so the site's
          headline/CTA now sit in their own band directly below the media,
          instead of layered on top of it. Eric later asked to "show 3
          products in the carousel at a time" — HeroCarousel now renders up
          to 3 cards side by side (1 on phones, 2 on tablets) instead of one
          full-bleed slide, so the box height below was brought down from
          the previous single-slide sizing (which ran up to 920px tall) to
          something proportioned for 3 cards in a row. Eric then asked to
          "increase the height of the carousel on a bigger screen" — mobile/
          tablet sizing is unchanged, but `lg`/`xl`/`2xl` now each step up
          further so the cards genuinely grow with screen size instead of
          plateauing at 520px on any wide desktop or large monitor. Still
          full-width; MediaCover guarantees every photo renders fully
          uncropped inside its card at any of these heights. */}
      <section className="bg-ink text-cream">
        <div className="relative overflow-hidden h-[420px] sm:h-[440px] md:h-[480px] lg:h-[600px] xl:h-[680px] 2xl:h-[760px]">
          <HeroCarousel slides={heroSlides} fallbackSrc="/images/rolen-logo.png" />
        </div>
        <div className="container-page py-12 md:py-16">
          {/* Eric: change the headline to the business slogan "Simply
              Elegance" and show the logo at the right, in the empty space
              this dark band always had beside the left-aligned text block. */}
          <div className="flex items-center justify-between gap-10">
            <div className="max-w-md">
              <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-light mb-4">
                Rolen Studio &middot; {settings.city || 'Accra'}, {settings.country || 'Ghana'}
              </Reveal>
              <Reveal as="h1" delay={0.08} className="font-display text-4xl md:text-5xl leading-tight mb-3">
                Simply <span className="gold-gradient-text">Elegant</span>.
              </Reveal>
              {/* Eric: "Add a cool animation to this" — a thin gold rule
                  that draws itself in under the headline, once, right after
                  it fades up (see HeroUnderline.js). */}
              <HeroUnderline className="w-24 mb-6" />
              <Reveal as="p" delay={0.16} className="text-cream/85 mb-8 max-w-md">
                Kente ceremonial wear, bridal gowns, custom couture and our signature ready-to-wear lines —
                every piece designed and made in our own studio, by the same house that trains Ghana&apos;s
                next fashion designers.
              </Reveal>
              <Reveal delay={0.24} className="flex flex-wrap gap-4">
                {/* Eric: "Add a cool animation to this" — a light sweeps
                    across each button on hover (hero-cta-shine, see
                    globals.css), scoped to just these two hero buttons
                    rather than every btn-gold/btn-outline site-wide. */}
                <a href="#collection" className="btn-gold hero-cta-shine">Shop the Collection</a>
                {orderNumber && (
                  <a
                    href={waHref(orderNumber, "Hi Rolen! I'd like to ask about a custom order.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline hero-cta-shine !border-cream/40 !text-cream hover:!bg-cream hover:!text-ink"
                  >
                    Custom Orders
                  </a>
                )}
              </Reveal>
            </div>
            {/* Eric: "Add a cool animation to this" — the logo now floats
                with a soft pulsing glow behind it (HeroVisual, already used
                on the /school hero) instead of sitting static. Sized to fit
                this narrower slot beside the text block via HeroVisual's
                overridable sizing props. */}
            <div className="hidden md:block shrink-0">
              <HeroVisual
                src="/images/rolen-logo.png"
                alt="Rolen"
                width={280}
                height={280}
                imgClassName="relative w-40 lg:w-52 xl:w-60 h-auto object-contain"
                center={false}
              />
            </div>
          </div>
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

      {/* How ordering works */}
      <section className="bg-white border-b border-black/5">
        <div className="container-page py-20">
          <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3 text-center">
            Simple &amp; Direct
          </Reveal>
          <Reveal as="h2" delay={0.05} className="font-display text-3xl text-center mb-12">
            How Ordering Works
          </Reveal>
          <StaggerGroup className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Browse the Collection',
                body: 'Explore our lines below and open any piece you love — photos and video, right in the shop.',
              },
              {
                step: '2',
                title: 'Message Us on WhatsApp',
                body: "Tap “Order via WhatsApp” on the piece — we'll confirm pricing, sizing and timeline with you directly.",
              },
              {
                step: '3',
                title: 'Collect Your Piece',
                body: "Once it's ready, visit the studio to collect it — or ask us about custom fittings along the way.",
              },
            ].map((s) => (
              <StaggerItem key={s.step}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gold text-ink font-display text-lg flex items-center justify-center mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-ink/70">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
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
          {CATEGORIES.map((cat) => {
            const cover = coverByCategory.get(cat.key);
            return (
              <StaggerItem key={cat.key} className="h-full">
                <a
                  href={`/?category=${encodeURIComponent(cat.key)}#collection`}
                  className="card group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gold-light/10">
                    {cover ? (
                      // Eric: "show the full picture in the cards" — full
                      // uncropped photo via MediaCover instead of a plain
                      // object-cover fill.
                      <MediaCover
                        src={mediaUrl(cover.imageUrl)}
                        alt={cat.key}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-ink/40 uppercase tracking-wide">Photos coming soon</span>
                      </div>
                    )}
                    {cover?.videoUrl && (
                      <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">
                        ▶ Video
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-8">
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
                  </div>
                </a>
              </StaggerItem>
            );
          })}
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
                  <GalleryItem item={item} whatsapp={whatsapp} isNew={isRecent(item.createdAt)} />
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
        <Reveal as="h2" delay={0.05} className="font-display text-3xl mb-4">
          {category ? category : 'All Products'}
        </Reveal>
        <Reveal as="p" delay={0.08} className="text-sm text-ink/60 mb-10">
          Pre-order pieces take 3 working days to prepare after a 70% deposit is paid.
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
              <GalleryItem item={item} whatsapp={whatsapp} isNew={isRecent(item.createdAt)} />
            </StaggerItem>
          ))}
        </StaggerGroup>
        {(!items || items.length === 0) && (
          <p className="text-center text-muted py-10">No items in this category yet — check back soon.</p>
        )}
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-gold-light/10 border-y border-black/5">
          <div className="container-page py-20">
            <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3 text-center">
              Voices
            </Reveal>
            <Reveal as="h2" delay={0.08} className="font-display text-3xl text-center mb-10">
              What People Say
            </Reveal>
            <StaggerGroup className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <StaggerItem key={t._id} className="h-full">
                  <TestimonialCard testimonial={t} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

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
          <div className="flex flex-wrap md:justify-end gap-4">
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
