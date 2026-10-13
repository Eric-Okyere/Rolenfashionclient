import Link from 'next/link';
import { notFound } from 'next/navigation';
import { safeFetch, mediaUrl } from '@/lib/api';
import Reveal from '@/components/motion/Reveal';

// Statically cached and regenerated at most once every 60 seconds (ISR) —
// this page doesn't read searchParams/cookies/headers, so Next.js can serve
// it straight from cache for repeat visits instead of re-running this route
// as a Netlify serverless function every time. Eric: cut function-invocation
// usage after the site's traffic blew past Netlify's free-plan function
// limit and paused every project on the team.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await safeFetch(`/api/courses/${slug}`, null, { revalidate: 60 });
  if (!data?.course) return { title: 'Course' };
  return { title: data.course.title, description: data.course.summary };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const data = await safeFetch(`/api/courses/${slug}`, null, { revalidate: 60 });
  if (!data?.course) return notFound();
  const course = data.course;

  return (
    <div className="container-page py-16 grid md:grid-cols-3 gap-12">
      <Reveal as="div" className="md:col-span-2">
        <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">{course.category}</p>
        <h1 className="font-display text-4xl mb-4">{course.title}</h1>
        <p className="text-ink/70 text-lg mb-8">{course.summary}</p>

        {course.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(course.image)} alt={course.title} className="w-full h-72 object-cover rounded-2xl mb-8" />
        )}

        <h2 className="font-display text-2xl mb-3">Program Overview</h2>
        <p className="text-ink/70 whitespace-pre-line mb-8">{course.description}</p>

        {course.curriculum?.length > 0 && (
          <>
            <h2 className="font-display text-2xl mb-3">What You&apos;ll Learn</h2>
            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {course.curriculum.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink/70">
                  <span className="text-gold-dark mt-0.5">●</span> {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </Reveal>

      <aside className="md:col-span-1">
        <div className="card p-6 sticky top-24 space-y-4">
          <Row label="Duration" value={course.duration} />
          <Row label="Level" value={course.level} />
          <Row
            label="Tuition"
            value={course.fee ? `${course.feeCurrency || 'GH¢'} ${Number(course.fee).toLocaleString()}` : 'Contact us for pricing'}
          />
          {course.intakePeriods?.length > 0 && <Row label="Intakes" value={course.intakePeriods.join(', ')} />}
          <Link href={`/admissions?course=${course._id}`} className="btn-gold w-full mt-2">
            Apply for this Course
          </Link>
          <Link href="/contact" className="btn-outline w-full">
            Ask a Question
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm border-b border-black/5 pb-3 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
