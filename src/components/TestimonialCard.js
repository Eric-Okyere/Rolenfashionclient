export default function TestimonialCard({ testimonial }) {
  return (
    <div className="card p-6 flex flex-col h-full">
      <div className="text-gold mb-3" aria-hidden="true">
        {'★'.repeat(testimonial.rating || 5)}
        <span className="text-black/10">{'★'.repeat(5 - (testimonial.rating || 5))}</span>
      </div>
      <p className="text-sm text-ink/80 flex-1 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
      <div>
        <p className="font-semibold text-sm">{testimonial.name}</p>
        {testimonial.role && <p className="text-xs text-muted">{testimonial.role}</p>}
      </div>
    </div>
  );
}
