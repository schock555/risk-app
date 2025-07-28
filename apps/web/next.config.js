/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@risk-dashboard/ui', '@risk-dashboard/db', '@risk-dashboard/core-api'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
    ],
  },
}

module.exports = nextConfig