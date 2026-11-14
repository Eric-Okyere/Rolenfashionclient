import Link from 'next/link';
import { notFound } from 'next/navigation';
import { safeFetch, mediaUrl } from '@/lib/api';
import GalleryItem from '@/components/GalleryItem';

// Eric: "Dress name and description, picture must show in the whatsapp
// message so admin can click and lead to the page." Every product's order
// message links here (see GalleryItem.js's productPageUrl). WhatsApp builds
// its link preview from this page's Open Graph tags, so the photo, name and
// description below are what show up inside the chat, and tapping the
// preview opens this page.
export const revalidate = 60;

async function getProduct(id) {
  const data = await safeFetch('/api/gallery', { items: [] }, { revalidate: 60 });
  return (data.items || []).find((i) => i._id === id && i.isPublished !== false) || null;
}

// WhatsApp skips previews whose image is too heavy, so ask Cloudinary for a
// light ~800px JPEG copy of the cover photo. Non-Cloudinary URLs pass through.
function previewImage(url) {
  const full = mediaUrl(url);
  return full.includes('res.cloudinary.com') && full.includes('/upload/')
    ? full.replace('/upload/', '/upload/c_limit,w_800,q_auto:good,f_jpg/')
    : full;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getProduct(id);
  if (!item) return { title: 'Product' };
  const description = item.description || `${item.title} from Rolen Garments.`;
  const image = previewImage(item.imageUrl);
  return {
    title: { absolute: `${item.title} | Rolen Garments` },
    description,
    alternates: { canonical: `/shop/${item._id}` },
    openGraph: {
      title: item.title,
      description,
      url: `/shop/${item._id}`,
      siteName: 'Rolen Garments',
      type: 'website',
      images: [{ url: image, alt: item.title }],
    },
    twitter: { card: 'summary_large_image', title: item.title, description, images: [image] },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const [item, settingsData] = await Promise.all([
    getProduct(id),
    safeFetch('/api/settings', { settings: {} }, { revalidate: 60 }),
  ]);
  if (!item) return notFound();

  return (
    <div className="container-page py-12 max-w-4xl">
      <Link href="/#collection" className="text-sm text-gold-dark hover:underline">
        ← Back to the Shop
      </Link>
      <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mt-6 mb-2">{item.category}</p>
      <h1 className="font-display text-3xl md:text-4xl mb-6">{item.title}</h1>
      <GalleryItem item={item} whatsapp={settingsData.settings?.whatsapp} inline />
    </div>
  );
}
