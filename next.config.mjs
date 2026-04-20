import { URL } from 'node:url'

function normalizeDevOrigin(origin) {
  const trimmedOrigin = origin.trim()

  if (!trimmedOrigin) {
    return null
  }

  try {
    return new URL(trimmedOrigin).host
  } catch {
    return trimmedOrigin.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map(normalizeDevOrigin)
  .filter(Boolean)

/** @type {import("next").NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  turbopack: {
    root: process.cwd(),
  },
  // Headers configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
          // Add Cache-Control for API responses to avoid no-store
          {
            key: 'Cache-Control',
            value: 'private, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedDevOrigins.length > 0 ? allowedDevOrigins.join(', ') : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // Security headers (X-Frame-Options removed - handled by CSP in middleware)
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
      // Add this block to ensure HTML is not served with no-store
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // Cache manifest.json and PWA assets aggressively (removes them from critical chain)
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // Cache Control for static assets
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // CSP is now handled in middleware.ts with nonce support
    ]
  },
}

export default nextConfig
