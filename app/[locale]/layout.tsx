import type { Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Montserrat, Cormorant_Garamond } from 'next/font/google';
import { routing } from '@/lib/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/ui/CookieConsent';
import BackToTop from '@/components/ui/BackToTop';
import GlobalBackground from '@/components/ui/GlobalBackground';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';
import { AnalyticsScripts } from '@/components/seo/Analytics';
import ClickTracker from '@/components/tracking/ClickTracker';
import { Toaster } from 'sonner';

import VercelAnalytics from '@/components/seo/VercelAnalytics';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'de' | 'ru')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${montserrat.variable} ${cormorant.variable}`}>
      <head>
        <WebSiteJsonLd locale={locale} />
        <link rel="alternate" type="text/plain" href={`https://numerologie-pro.com/llms${locale === 'ru' ? '-ru' : ''}.txt`} title="LLMs.txt" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <GlobalBackground />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-teal-dark focus:font-semibold focus:text-sm focus:shadow-lg"
          >
            {locale === 'ru' ? 'Перейти к содержимому' : 'Zum Inhalt springen'}
          </a>
          <Header />
          <main id="main-content" className="relative z-10 min-h-screen">{children}</main>
          <Footer />
          <CookieConsent />
          <BackToTop />
          <VercelAnalytics />
          <AnalyticsScripts locale={locale} />
          <ClickTracker />
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
