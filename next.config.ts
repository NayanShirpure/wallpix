
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
      
      // Alias 'canvas' to false for server-side builds as well to prevent errors
      // from libraries like Konva trying to load the native canvas module.
      (config.resolve.alias as Record<string, string | false>)['canvas'] = false;

      // Add handlebars to externals for server builds.
      if (!config.externals) { 
        config.externals = [];
      }
      config.externals.push('handlebars');
    }
    
    // Use fallback for 'canvas' module in client-side bundles to prevent build errors from Konva
    // This is still good practice for client-side, complementing the server-side alias.
    if (!isServer) {
      if (typeof config.resolve.fallback !== 'object' || config.resolve.fallback === null) {
        config.resolve.fallback = {};
      }
      (config.resolve.fallback as Record<string, string | false>)['canvas'] = false; 
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
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
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
