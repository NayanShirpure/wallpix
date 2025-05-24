
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // For server-side builds
    if (isServer) {
      // Ensure config.resolve.alias exists and is an object
      if (typeof config.resolve.alias !== 'object' || config.resolve.alias === null) {
        config.resolve.alias = {};
      }
      // Alias @opentelemetry/exporter-jaeger to false to prevent module not found errors
      // for this optional dependency.
      (config.resolve.alias as Record<string, string | false>)['@opentelemetry/exporter-jaeger'] = false;

      // Add handlebars to externals for server builds.
      // This prevents webpack from processing its internals which might use `require.extensions`,
      // a deprecated Node.js feature that webpack doesn't support.
      // By making it external, Node.js will handle the `require('handlebars')` at runtime.
      if (!config.externals) { // Next.js typically initializes config.externals as an array
        config.externals = [];
      }
      config.externals.push('handlebars');
    }
    
    // Alias 'canvas' to false for client-side bundles to prevent build errors from Konva
    if (!isServer) {
      if (typeof config.resolve.alias !== 'object' || config.resolve.alias === null) {
        config.resolve.alias = {};
      }
      (config.resolve.alias as Record<string, string | false>)['canvas'] = false; 
    }
    
    // Important: return the modified config
    return config;
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            // This is a strong set of directives to prevent caching.
            // no-store: Don't store any part of the response.
            // no-cache: Revalidate with the origin server before using a cached copy.
            // must-revalidate: Indicates that once it's stale, it must not be used.
            // proxy-revalidate: Same as must-revalidate, but for shared caches (proxies).
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            // Pragma: no-cache is an HTTP/1.0 header for backwards compatibility.
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            // Expires: 0 tells caches the content is already expired.
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  productionBrowserSourceMaps: true,
};

export default nextConfig;
