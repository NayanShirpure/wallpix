
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Rss } from 'lucide-react'; 
// ThemeToggle removed, it's in global Header now.
// import { ThemeToggle } from '@/components/theme-toggle';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nayanshirpure.github.io/Wallify/';

export const metadata: Metadata = {
  title: 'Wallify Blog - Trends, Tips, and Inspiration',
  description: 'Explore the Wallify blog for the latest wallpaper trends, design tips, how-to guides, and inspiration to personalize your digital space.',
  keywords: ['Wallify blog', 'wallpaper trends', 'design tips', 'wallpaper guides', 'digital art', 'desktop backgrounds', 'smartphone wallpapers', 'personalization ideas'],
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': `${BASE_URL}blog/rss.xml`,
    },
  },
  openGraph: {
    title: 'Wallify Blog - Trends, Tips, and Inspiration',
    description: 'Stay updated with wallpaper trends, design insights, and personalization tips from the Wallify blog.',
    url: `${BASE_URL}blog`,
    type: 'website', 
    images: [
      {
        url: `${BASE_URL}blog/og-blog-main.png`, 
        width: 1200,
        height: 630,
        alt: 'Wallify Blog',
      },
    ],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden"> {/* z-index lower than global header */}
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <Link href="/" className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors" aria-label="Back to Wallify homepage">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="hidden sm:inline">
              Back to Wallify
            </span>
             <span className="sm:hidden">Home</span>
          </Link>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap px-2">
            Wallify Blog
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/blog/rss.xml" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors" aria-label="RSS Feed">
              <Rss className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
            {/* ThemeToggle removed from here */}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto max-w-5xl p-4 py-8 md:p-6 md:py-12">
        {children}
      </main>
    </>
  );
}
