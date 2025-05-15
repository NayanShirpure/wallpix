
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
        hostname: 'images.pexels.com',
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
        hostname: 'images.remotePatterns',
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    // This makes PEXELS_API_KEY available to the client-side code as process.env.NEXT_PUBLIC_PEXELS_API_KEY
    // The server-side code can still access it as process.env.PEXELS_API_KEY
    NEXT_PUBLIC_PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  }
};

export default nextConfig;
