
import type {NextConfig} from 'next';
import path from 'path'; // Ensure path is imported

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
      if (typeof config.resolve.alias !== 'object' || config.resolve.alias === null) {
        config.resolve.alias = {};
      }
      // Alias @opentelemetry/exporter-jaeger to false to prevent module not found errors
      (config.resolve.alias as Record<string, string | false>)['@opentelemetry/exporter-jaeger'] = false;
      
      // Alias 'canvas' to false for server-side builds as well
      (config.resolve.alias as Record<string, string | false>)['canvas'] = false;

      // Add handlebars to externals for server builds.
      if (!config.externals) { 
        config.externals = [];
      }
      config.externals.push('handlebars');
    }
    
    // Use fallback for 'canvas' module in client-side bundles
    // This is often more appropriate than an alias for optional browser dependencies.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        canvas: false, 
      };
    }
    
    // Important: return the modified config
    return config;
  },
  // Removed custom headers for /sitemap.xml as next-sitemap generates a static file
  productionBrowserSourceMaps: true,
};

export default nextConfig;
