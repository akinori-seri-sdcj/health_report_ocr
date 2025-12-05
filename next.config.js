/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/ui',
        destination: '/ui/index.html',
      },
      {
        source: '/ui/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: 'text/html.*',
          },
        ],
        destination: '/ui/index.html',
      },
    ]
  },
}

module.exports = nextConfig
