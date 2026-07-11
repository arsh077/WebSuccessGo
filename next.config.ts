import type { NextConfig } from 'next';

// ─── Security headers applied to every route ──────────────────────────────────
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Allow inline styles (required by many component libraries) and Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Allow scripts from self only; add CDN domains here if needed
      "script-src 'self'",
      // Images: self, data URIs, and the picsum.photos placeholder service
      "img-src 'self' data: https://picsum.photos",
      // Fonts: self and Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Connections: self and the backend API
      "connect-src 'self'",
      // Frame / object restrictions
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify — file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
  // ─── Security headers on every response ──────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // ─── Redirect HTTP → HTTPS in production ─────────────────────────────
  async redirects() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/(.*)',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: `https://${process.env.APP_URL?.replace(/^https?:\/\//, '')}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
