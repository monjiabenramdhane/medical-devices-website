/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // Enable gzip compression

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats for better compression
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@prisma/client'],
  },
};

module.exports = nextConfig;