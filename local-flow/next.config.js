/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      // Strip www. prefix — force bare domain
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.localflowhub.com' }],
        destination: 'https://localflowhub.com/:path*',
        permanent: true,
      },
      // Strip index.html at any depth
      {
        source: '/:path*/index.html',
        destination: '/:path*',
        permanent: true,
      },
      // Strip root index.html
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      // Strip .html extension wherever possible
      {
        source: '/:path.html',
        destination: '/:path',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
