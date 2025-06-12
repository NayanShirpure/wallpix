/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://wall-pix.netlify.app/',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/api' }, // Disallow crawling of API routes
    ],
    // You can add additional sitemaps if needed, e.g., for a separate blog on a subdomain
    // additionalSitemaps: [
    //   'https://blog.example.com/sitemap.xml',
    // ],
  },
  // Exclude specific routes from the sitemap
  exclude: [
    '/api/*', // Exclude all API routes
    // You can add other paths to exclude, e.g., '/admin/*'
  ],
  // Optional: For dynamically generated pages that next-sitemap might not find automatically,
  // or to add more details like lastmod, changefreq, priority.
  // For App Router, dynamic routes with generateStaticParams are often found.
  // If your blog posts are not being picked up, you might need to configure them here.
  // additionalPaths: async (config) => {
  //   // Example: Fetch blog posts from your config/blog.ts
  //   // (This requires making blogPosts available here, e.g., by reading the file or an API)
  //   // const { blogPosts } = require('./src/config/blog'); // Adjust path as needed
  //   // const paths = blogPosts.map(post => ({
  //   //   loc: `/blog/${post.slug}`,
  //   //   lastmod: new Date(post.date).toISOString(),
  //   //   changefreq: 'weekly',
  //   //   priority: 0.7,
  //   // }));
  //   // return paths;
  //   return [];
  // },
  generateIndexSitemap: false, // Set to false to generate a single sitemap file
};
