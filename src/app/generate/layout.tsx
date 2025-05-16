
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export const metadata: Metadata = {
  title: 'AI Wallpaper Generator - Create Custom Backgrounds | Wallify',
  description: 'Unleash your creativity with Wallify\'s AI Wallpaper Generator. Enter a text prompt and let our AI generate unique, custom backgrounds for your desktop or smartphone.',
  keywords: ['ai wallpaper generator', 'custom backgrounds', 'generate wallpapers with ai', 'ai image generation tool', 'Wallify ai feature', 'personalized wallpapers', 'text to image wallpaper'],
  alternates: {
    canonical: `${BASE_URL}generate`,
  },
  openGraph: {
    title: 'Wallify AI Wallpaper Generator - Create Your Own Backgrounds',
    description: 'Generate unique, custom wallpapers with AI using text prompts on Wallify. Personalize your devices like never before.',
    url: `${BASE_URL}generate`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - AI Wallpaper Generator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Custom Wallpapers with Wallify\'s AI Generator',
    description: 'Use text prompts to generate unique wallpapers with the AI tool on Wallify.',
    images: [`${BASE_URL}twitter-image.png`], 
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

