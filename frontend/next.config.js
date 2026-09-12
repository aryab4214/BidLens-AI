/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_PROXY_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bidlens-ai.onrender.com';
    return [
      {
        source: '/audit/:path*',
        destination: `${backendUrl}/audit/:path*`,
      },
      {
        source: '/document/:path*',
        destination: `${backendUrl}/document/:path*`,
      },
      {
        source: '/review/:path*',
        destination: `${backendUrl}/review/:path*`,
      },
      {
        source: '/system/:path*',
        destination: `${backendUrl}/system/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
