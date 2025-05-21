
import type { MetadataRoute } from 'next';
import { blogPosts } from '@/config/blog';
export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wallpix.vercel.app/';

// Log the BASE_URL being used for sitemap generation.
// This is helpful for debugging in build logs or local development.
// You might want to remove or conditionalize this log for cleaner production build logs eventually.
console.log('[sitemap.ts] Generating sitemap with BASE_URL:', BASE_URL);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPagesData = [
    { url: '/', changeFrequency: 'daily', priority: 1.0 },
    { url: '/discover', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/what-we-offer', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/generate', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/blog', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/search', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/contact', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { url: '/terms-conditions', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticPages = staticPagesData.map((page) => {
    let pageUrlPath = page.url;
    // Ensure the page path doesn't lead to double slashes if BASE_URL ends with / and page.url starts with /
    if (BASE_URL.endsWith('/') && pageUrlPath.startsWith('/')) {
      pageUrlPath = pageUrlPath.substring(1);
    } else if (!BASE_URL.endsWith('/') && !pageUrlPath.startsWith('/') && pageUrlPath !== '') {
      // Handle cases where pageUrlPath is not root and needs a preceding slash
      pageUrlPath = `/${pageUrlPath}`;
    }
    
    // For the homepage, ensure it's just the BASE_URL (handling trailing slash consistently)
    let finalUrl = page.url === '/' 
      ? (BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`)
      : `${BASE_URL}${pageUrlPath}`;

    // Ensure no double slashes for non-root URLs if BASE_URL ends with / and pageUrlPath is empty (e.g. for root)
    // This specific case is handled by the ternary above, but good to be mindful of general double slash issues.
    // A more generic approach for joining:
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = page.url.startsWith('/') ? page.url : `/${page.url}`;
    finalUrl = page.url === '/' ? `${base}/` : `${base}${path}`;


    return {
      url: finalUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: page.changeFrequency as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: page.priority,
    };
  });

  const blogPostPages = blogPosts.map(post => {
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return {
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date).toISOString(),
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[0]['changeFrequency'],
      priority: 0.7,
    };
  });

  const allSitemapEntries = [...staticPages, ...blogPostPages];

  // Log a sample of generated URLs for debugging
  if (allSitemapEntries.length > 0) {
    console.log('[sitemap.ts] Sample generated sitemap URL (static):', allSitemapEntries[0].url);
    if (allSitemapEntries.length > staticPagesData.length) {
      console.log('[sitemap.ts] Sample generated sitemap URL (blog):', allSitemapEntries[staticPagesData.length].url);
    }
  } else {
    console.log('[sitemap.ts] No sitemap entries generated.');
  }

  return allSitemapEntries;
}
