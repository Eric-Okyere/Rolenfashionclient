import { safeFetch } from '@/lib/api';
import CourseCard from '@/components/CourseCard';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';

export const metadata = { title: 'Courses' };

const categories = ['All', 'Fashion Design', 'Tailoring', 'Textiles', 'Business', 'Short Course'];

export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category && params.category !== 'All' ? params.category : undefined;
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const { courses } = await safeFetch(`/api/courses${query}`, { courses: [] }, { revalidate: 60 });

  return (
    <div className="container-page py-16">
      <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Programs</Reveal>
      <Reveal as="h1" delay={0.05} className="font-display text-4xl mb-6">Courses at Rolen</Reveal>
      <Reveal as="p" delay={0.1} className="text-ink/70 max-w-2xl mb-10">
        Hands-on, studio-based training in fashion theory, textiles, pattern drafting and garment construction —
        pick the program that fits where you are in your fashion journey.
      </Reveal>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => {
          const active = (cat === 'All' && !category) || cat === category;
          return (
            <a
              key={cat}
              href={cat === 'All' ? '/courses' : `/courses?category=${encodeURIComponent(cat)}`}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                active ? 'bg-ink text-cream border-ink' : 'border-black/15 text-ink/70 hover:border-gold-dark'
              }`}
            >
              {cat}
            </a>
          );
        })}
      </div>

      <StaggerGroup className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(courses || []).map((c) => (
          <StaggerItem key={c._id} className="h-full">
            <CourseCard course={c} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      {(!courses || courses.length === 0) && (
        <p className="text-center text-muted py-10">No courses published in this category yet.</p>
      )}
    </div>
  );
}
