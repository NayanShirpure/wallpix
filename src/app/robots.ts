
import type { MetadataRoute } from 'next';
export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '',
        // Add disallow rules here if needed for specific paths
        // e.g., disallow: ['/admin/', '/tmp/'],
      },
    ],
    sitemap: `${BASE_URL}sitemap.xml`,
    host: BASE_URL,
    // Optionally, specify a host if your site is accessible via multiple domains
    // host: BASE_URL,
  };
}
