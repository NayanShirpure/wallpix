
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wall-pix.netlify.app/';

export const metadata: Metadata = {
  title: 'About Wallify - Our Mission, Story, and Team',
  description: 'Learn about Wallify: our mission to provide stunning Pexels wallpapers, our user-friendly features like AI generation, and the story behind our wallpaper application.',
  keywords: ['about Wallify', 'Wallify mission', 'wallpaper app team', 'Pexels wallpapers', 'AI wallpaper generator', 'digital personalization story', 'Wallify features'],
  alternates: {
    canonical: `${BASE_URL}about`,
  },
  openGraph: {
    title: 'About Wallify - Our Mission, Story, and Features',
    description: 'Discover Wallify: your source for stunning Pexels wallpapers, AI generation, and a personalized digital experience.',
    url: `${BASE_URL}about`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}opengraph-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify - About Us Page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Wallify - Our Story and Mission',
    description: 'Learn more about Wallify, our Pexels-powered wallpaper collection, and our commitment to beautifying your digital space.',
    images: [`${BASE_URL}twitter-image.png`], 
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
