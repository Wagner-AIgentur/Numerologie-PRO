import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/webp'],
  },
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', '@google-analytics/data'],
  outputFileTracingIncludes: {
    '/api/karmic/birthday-code': ['./public/images/**/*', './node_modules/@sparticuz/chromium/bin/**/*'],
    '/api/karmic/karmic-knots': ['./public/images/**/*', './node_modules/@sparticuz/chromium/bin/**/*'],
    '/api/karmic/selfrealization': ['./public/images/**/*', './node_modules/@sparticuz/chromium/bin/**/*'],
    '/api/karmic/year-forecast': ['./public/images/**/*', './node_modules/@sparticuz/chromium/bin/**/*'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' blob: https://www.googletagmanager.com https://connect.facebook.net https://app.cal.com https://mc.yandex.ru",
              "style-src 'self' 'unsafe-inline' https://app.cal.com",
              "img-src 'self' data: https:",
              "font-src 'self' https:",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://region1.analytics.google.com https://stats.g.doubleclick.net https://www.google.de https://api.stripe.com https://app.cal.com https://api.elevenlabs.io wss://api.elevenlabs.io https://mc.yandex.ru https://mc.yandex.com https://www.facebook.com",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              "frame-src https://js.stripe.com https://checkout.stripe.com https://app.cal.com https://www.facebook.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
