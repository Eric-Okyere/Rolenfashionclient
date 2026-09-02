// Maps an ActivityLog `type` to a small emoji icon and a badge color, so the
// dashboard's Recent Activity panel and the full /admin/activity page render
// events consistently without repeating this table in two places.
const ACTIVITY_META = {
  'application.created': { icon: '📝', badge: 'bg-blue-100 text-blue-800' },
  'application.status_changed': { icon: '🔄', badge: 'bg-amber-100 text-amber-800' },
  'message.received': { icon: '✉️', badge: 'bg-sky-100 text-sky-800' },
  'newsletter.subscribed': { icon: '📧', badge: 'bg-purple-100 text-purple-800' },
  'course.created': { icon: '🎓', badge: 'bg-green-100 text-green-800' },
  'course.updated': { icon: '🎓', badge: 'bg-amber-100 text-amber-800' },
  'course.deleted': { icon: '🎓', badge: 'bg-red-100 text-red-800' },
  'gallery.created': { icon: '🖼️', badge: 'bg-green-100 text-green-800' },
  'gallery.updated': { icon: '🖼️', badge: 'bg-amber-100 text-amber-800' },
  'gallery.deleted': { icon: '🖼️', badge: 'bg-red-100 text-red-800' },
  'testimonial.created': { icon: '💬', badge: 'bg-green-100 text-green-800' },
  'user.login': { icon: '🔑', badge: 'bg-black/5 text-ink/70' },
  'user.created': { icon: '👤', badge: 'bg-green-100 text-green-800' },
};

const DEFAULT_META = { icon: '•', badge: 'bg-black/5 text-ink/70' };

export function activityMeta(type) {
  return ACTIVITY_META[type] || DEFAULT_META;
}
