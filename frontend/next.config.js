/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BMSOLAR_STANDALONE === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  experimental: { cpus: 2 },
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  images: {
    remotePatterns: [
 {protocol:'https',hostname:'images.bizmallgroup.com',pathname:'/**'},
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.bmsolar.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.bmsolar.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/home', destination: '/' },
      { source: '/trang-chu', destination: '/' },
      { source: '/about', destination: '/gioi-thieu' },
      { source: '/solutions', destination: '/giai-phap' },
      { source: '/solutions/:slug*', destination: '/giai-phap/:slug*' },
      { source: '/products', destination: '/san-pham' },
      { source: '/products/:slug*', destination: '/san-pham/:slug*' },
      { source: '/projects', destination: '/du-an' },
      { source: '/projects/:slug*', destination: '/du-an/:slug*' },
      { source: '/news', destination: '/tin-tuc' },
      { source: '/news/:slug*', destination: '/tin-tuc/:slug*' },
      { source: '/contact', destination: '/lien-he' },
    ];
  },
};

module.exports = nextConfig;
