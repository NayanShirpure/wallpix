
import type { MetadataRoute } from 'next';
export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'], // Explicitly disallow crawling API routes
      },
    ],
    sitemap: `${BASE_URL}sitemap.xml`,
    // Optionally, specify a host if your site is accessible via multiple domains
    // host: BASE_URL, // Host directive is deprecated by Google but still read by some crawlers like Yandex.
  };
}
