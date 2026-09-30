import Link from 'next/link';
import { mediaUrl } from '@/lib/api';
import MediaCover from '@/components/MediaCover';

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course.slug}`} className="card overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl motion-reduce:hover:translate-y-0">
      <div className="h-44 bg-gradient-to-br from-gold-light/30 to-gold-dark/20 relative overflow-hidden">
        {course.image ? (
          // Eric: "show the full picture in the cards" — MediaCover shows
          // the whole course photo uncropped instead of a plain
          // object-cover fill cutting off the top/bottom of a tall shot.
          <MediaCover
            src={mediaUrl(course.image)}
            alt={course.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold-dark font-display text-lg">
            {course.category}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-ink/85 text-cream text-[11px] px-2.5 py-1 rounded-full">
          {course.category}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg font-semibold mb-1">{course.title}</h3>
        <p className="text-sm text-muted mb-3 line-clamp-2">{course.summary}</p>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="text-ink/70">{course.duration}</span>
          <span className="font-semibold text-gold-dark">
            {course.fee ? `${course.feeCurrency || 'GH¢'} ${Number(course.fee).toLocaleString()}` : 'Contact us'}
          </span>
        </div>
      </div>
    </Link>
  );
}
