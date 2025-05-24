
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export const metadata: Metadata = {
  title: 'Advanced Image Editor | Wallify',
  description: 'Edit your images with advanced tools: crop, rotate, draw, add text, shapes, filters, and more. Powered by Fabric.js.',
  keywords: ['image editor', 'photo editor', 'fabric.js editor', 'advanced image editing', 'Wallify editor tool', 'crop image', 'rotate image', 'add text to photo'],
  alternates: {
    canonical: `${BASE_URL}editor`,
  },
  openGraph: {
    title: 'Wallify - Advanced Image Editor',
    description: 'Powerful image editing capabilities directly in your browser with Wallify\'s advanced editor.',
    url: `${BASE_URL}editor`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - Advanced Image Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit Images with Wallify\'s Advanced Editor',
    description: 'Explore powerful image editing tools like crop, rotate, filters, text, and drawing on Wallify.',
    images: [`${BASE_URL}twitter-image.png`], 
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
