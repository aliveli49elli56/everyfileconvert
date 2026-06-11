/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },

  // BU BÖLÜMÜ EKLE:
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap/0.xml', 
      },
    ];
  },
};

module.exports = nextConfig;
