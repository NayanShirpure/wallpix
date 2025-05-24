
import type { MetadataRoute } from 'next';
import { blogPosts } from '@/config/blog';

export const dynamic = 'force-static';

const BASE_URL_FROM_ENV = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

console.log('[sitemap.ts] Generating sitemap with BASE_URL from environment:', BASE_URL_FROM_ENV);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPagesData = [
    { url: '/', changeFrequency: 'daily', priority: 1.0 },
    { url: '/discover', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/what-we-offer', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/generate', changeFrequency: 'monthly', priority: 0.7 },
    // { url: '/editor', changeFrequency: 'monthly', priority: 0.6 }, // Editor removed
    { url: '/blog', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/search', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/contact', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/terms-conditions', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const effectiveBaseUrl = BASE_URL_FROM_ENV.endsWith('/')
    ? BASE_URL_FROM_ENV.slice(0, -1)
    : BASE_URL_FROM_ENV;

  if (!effectiveBaseUrl.startsWith('https://') && !effectiveBaseUrl.startsWith('http://localhost')) {
    console.warn(`[sitemap.ts] WARNING: effectiveBaseUrl "${effectiveBaseUrl}" does not start with https (and is not localhost). This might cause issues with search engines.`);
  }


  const staticPages = staticPagesData.map((page) => {
    let finalUrl;
    if (page.url === '/') {
      finalUrl = `${effectiveBaseUrl}/`;
    } else {
      const pathSegment = page.url.startsWith('/') ? page.url : `/${page.url}`;
      finalUrl = `${effectiveBaseUrl}${pathSegment}`;
    }

    return {
      url: finalUrl,
      lastModified: new Date().toISOString(), 
      changeFrequency: page.changeFrequency as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: page.priority,
    };
  });

  const blogPostPages = blogPosts.map(post => {
    let lastModifiedDate: string;
    const parsedDate = new Date(post.date);

    if (!isNaN(parsedDate.getTime())) { 
      lastModifiedDate = parsedDate.toISOString();
    } else {
      console.warn(`[sitemap.ts] Invalid date format for blog post slug: ${post.slug} (date: "${post.date}"). Using current date as fallback.`);
      lastModifiedDate = new Date().toISOString();
    }

    return {
      url: `${effectiveBaseUrl}/blog/${post.slug}`,
      lastModified: lastModifiedDate,
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.7,
    };
  });

  const allSitemapEntries = [...staticPages, ...blogPostPages];

  if (allSitemapEntries.length > 0) {
    console.log('[sitemap.ts] Effective Base URL for sitemap:', effectiveBaseUrl);
    console.log('[sitemap.ts] Sample generated sitemap URL (static):', allSitemapEntries[0].url);
    if (blogPostPages.length > 0) {
      console.log('[sitemap.ts] Sample generated sitemap URL (blog):', blogPostPages[0].url);
    }
  } else {
    console.warn('[sitemap.ts] No sitemap entries generated.');
  }

  const urls = new Set<string>();
  for (const entry of allSitemapEntries) {
    if (urls.has(entry.url)) {
      console.warn(`[sitemap.ts] Duplicate URL found in sitemap: ${entry.url}`);
    }
    urls.add(entry.url);
  }

  return allSitemapEntries;
}
