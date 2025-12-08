/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      // アイコンなどの静的配信を /icons にフォールバック
      {
        source: '/ui/icons/:path*',
        destination: '/icons/:path*',
      },
      {
        source: '/ui',
        destination: '/ui/index.html',
      },
      {
        // 拡張子を含まない /ui/* を SPA として index にフォールバック
        source: '/ui/:path((?!.*\\.).*)',
        destination: '/ui/index.html',
      },
    ]
  },
}

module.exports = nextConfig
