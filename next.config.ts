
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
        hostname: 'images.pexels.com', // Added Pexels image hostname
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  },
  webpack: (config, { isServer, webpack }) => {
    // For server-side builds, if @opentelemetry/exporter-jaeger is causing issues,
    // we can alias it to false to prevent the bundler from trying to resolve it.
    // This is useful if it's an optional dependency of a library (e.g., OpenTelemetry SDK used by Genkit)
    // that you don't intend to use or haven't installed.
    if (isServer) {
      // Ensure config.resolve.alias exists and is an object
      if (typeof config.resolve.alias !== 'object' || config.resolve.alias === null) {
        config.resolve.alias = {};
      }
      // Alias the problematic module to false
      (config.resolve.alias as Record<string, string | false>)['@opentelemetry/exporter-jaeger'] = false;
    }
    
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
