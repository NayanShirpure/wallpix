
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
  // Removed env mapping for NEXT_PUBLIC_PEXELS_API_KEY as it's no longer needed on client.
  // PEXELS_API_KEY will be used server-side only.
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
    
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
