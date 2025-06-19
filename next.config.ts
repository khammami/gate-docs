import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  // Replace 'your-repository-name' with the actual name of your GitHub repository
  // e.g., if your repo URL is https://github.com/user/my-cool-app, basePath should be '/my-cool-app'
  basePath: '/gate-docs', 
  assetPrefix: '/gate-docs', // Also needed for assets to load correctly from the subfolder
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
