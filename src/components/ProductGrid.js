'use client';

import { useState } from 'react';
import GalleryItem from '@/components/GalleryItem';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';

// Eric: "Show load more instead of showing the whole product." The Shop's
// "All Products" grid now shows the first PAGE_SIZE products and a "Load
// more" button that reveals the next batch, instead of rendering the whole
// catalogue at once. Eric then set the batch size: "Show 20 products at a
// time" (five rows of four on desktop, ten rows of two on a phone). All products still arrive in one request (the catalogue is
// small), so "Load more" is instant — no extra loading or spinner.
const PAGE_SIZE = 20;

export default function ProductGrid({ items, whatsapp, newIds = [] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = items.slice(0, visible);
  const remaining = items.length - shown.length;

  return (
    <>
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shown.map((item) => (
          <StaggerItem key={item._id}>
            <GalleryItem item={item} whatsapp={whatsapp} isNew={newIds.includes(item._id)} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-outline">
            Load more
          </button>
          <p className="text-xs text-muted">
            Showing {shown.length} of {items.length} products
          </p>
        </div>
      )}
    </>
  );
}
