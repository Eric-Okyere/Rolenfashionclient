'use client';

import { activityMeta } from '@/lib/activity';
import { timeAgo } from '@/lib/time';

export default function ActivityRow({ item, showTime = true }) {
  const { icon, badge } = activityMeta(item.type);

  return (
    <li className="flex items-start gap-3 text-sm border-b border-black/5 pb-3 last:border-0 last:pb-0">
      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${badge}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-ink/80">{item.summary}</p>
        {showTime && <p className="text-xs text-muted mt-0.5">{timeAgo(item.createdAt)}</p>}
      </div>
    </li>
  );
}
