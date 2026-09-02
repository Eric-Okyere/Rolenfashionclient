import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import { safeFetch } from '@/lib/api';

const defaultSettings = {
  schoolName: 'Rolen School of Fashion and Design',
  tagline: "Shaping Africa's next generation of fashion talent",
};

export async function generateMetadata() {
  const data = await safeFetch('/api/settings', { settings: defaultSettings });
  const settings = data.settings || defaultSettings;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: `${settings.schoolName} | Fashion Education & Design`,
      template: `%s | ${settings.schoolName}`,
    },
    description: settings.tagline || settings.aboutText,
    // No explicit `icons` here on purpose — Next.js auto-detects favicon.ico,
    // icon.png, and apple-icon.png from the app/ directory and wires up the
    // right <link> tags itself. Setting `icons` here would override that.
    openGraph: {
      title: settings.schoolName,
      description: settings.tagline,
      images: settings.logoUrl ? [settings.logoUrl] : ['/images/rolen-logo.png'],
    },
  };
}

export default async function RootLayout({ children }) {
  const data = await safeFetch('/api/settings', { settings: defaultSettings });
  const settings = data.settings || defaultSettings;

  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <SiteChrome settings={settings}>{children}</SiteChrome>
      </body>
    </html>
  );
}
