import Link from 'next/link';
import { safeFetch } from '@/lib/api';
import CourseCard from '@/components/CourseCard';
import TestimonialCard from '@/components/TestimonialCard';
import GalleryItem from '@/components/GalleryItem';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';
import HeroVisual from '@/components/motion/HeroVisual';
import Counter from '@/components/motion/Counter';

export default async function Home() {
  const [coursesData, testimonialsData, galleryData, settingsData] = await Promise.all([
    safeFetch('/api/courses', { courses: [] }),
    safeFetch('/api/testimonials', { testimonials: [] }),
    safeFetch('/api/gallery', { items: [] }),
    safeFetch('/api/settings', { settings: {} }),
  ]);

  const courses = (coursesData.courses || []).slice(0, 3);
  const testimonials = (testimonialsData.testimonials || []).slice(0, 3);
  const gallery = (galleryData.items || []).slice(0, 6);
  const settings = settingsData.settings || {};

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink to-[#241c10] text-cream">
        <div className="container-page py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-light mb-4">
              {settings.city || 'Accra'}, {settings.country || 'Ghana'}
            </Reveal>
            <Reveal as="h1" delay={0.08} className="font-display text-4xl md:text-5xl leading-tight mb-6">
              Craft your future in <span className="gold-gradient-text">fashion</span>.
            </Reveal>
            <Reveal as="p" delay={0.16} className="text-cream/75 mb-8 max-w-md">
              {settings.tagline ||
                'Rolen School of Fashion and Design trains the designers, tailors and stylists shaping the industry — hands-on, industry-led, portfolio-driven.'}
            </Reveal>
            <Reveal delay={0.24} className="flex flex-wrap gap-4">
              <Link href="/admissions" className="btn-gold">Apply for Admission</Link>
              <Link href="/courses" className="btn-outline !border-cream/40 !text-cream hover:!bg-cream hover:!text-ink">
                Explore Courses
              </Link>
            </Reveal>
          </div>
          <HeroVisual src="/images/rolen-logo.png" alt="Rolen" />
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-gold-light/10 border-y border-black/5">
        <StaggerGroup className="container-page py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ['5', 'Programs Offered'],
            ['100%', 'Hands-on Studio Time'],
            ['6', 'Months per Program'],
            ['∞', 'Creative Possibilities'],
          ].map(([num, label]) => (
            <StaggerItem key={label}>
              <p className="font-display text-2xl md:text-3xl text-gold-dark">
                <Counter value={num} />
              </p>
              <p className="text-xs md:text-sm text-muted mt-1">{label}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* About snippet */}
      <section className="container-page py-20 grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">About the School</p>
          <h2 className="font-display text-3xl mb-4">Where craft meets ambition</h2>
          <p className="text-ink/70 mb-6">
            {settings.aboutText ||
              'Rolen School of Fashion and Design trains designers, tailors and stylists with hands-on, industry-led programs — from pattern making and draping to collection development and fashion entrepreneurship.'}
          </p>
          <Link href="/about" className="btn-outline">Learn More</Link>
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 gap-4">
          {gallery.slice(0, 4).map((item) => (
            <StaggerItem key={item._id} className="h-full">
              <GalleryItem item={item} />
            </StaggerItem>
          ))}
          {gallery.length === 0 && (
            <div className="col-span-2 card p-10 text-center text-sm text-muted">
              Gallery photos and videos will appear here once the admin team uploads them.
            </div>
          )}
        </StaggerGroup>
      </section>

      {/* Courses */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page py-20">
          <Reveal className="flex items-end justify-between mb-10">
            <div>
              <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Programs</p>
              <h2 className="font-display text-3xl">Popular Courses</h2>
            </div>
            <Link href="/courses" className="text-sm font-semibold text-gold-dark hover:underline hidden md:inline">
              View all courses →
            </Link>
          </Reveal>
          <StaggerGroup className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <StaggerItem key={c._id} className="h-full">
                <CourseCard course={c} />
              </StaggerItem>
            ))}
          </StaggerGroup>
          {courses.length === 0 && (
            <p className="text-center text-muted">Courses will appear here once published from the admin dashboard.</p>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link href="/courses" className="text-sm font-semibold text-gold-dark hover:underline">
              View all courses →
            </Link>
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section className="container-page py-20">
        <Reveal className="rounded-2xl bg-ink text-cream p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl mb-3">Ready to apply?</h2>
            <p className="text-cream/70">
              Submit your application online, track its status any time, and download your signed admission letter
              the moment you&apos;re admitted.
            </p>
          </div>
          <div className="flex md:justify-end gap-4">
            <Link href="/admissions" className="btn-gold">Start Application</Link>
            <Link href="/admissions/status" className="btn-outline !border-cream/40 !text-cream hover:!bg-cream hover:!text-ink">
              Track Status
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-gold-light/10 border-y border-black/5">
          <div className="container-page py-20">
            <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3 text-center">Voices</Reveal>
            <Reveal as="h2" delay={0.08} className="font-display text-3xl text-center mb-10">What our students say</Reveal>
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
    </div>
  );
}
