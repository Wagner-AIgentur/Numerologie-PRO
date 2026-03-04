import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://numerologie-pro.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Numerologie PRO | Swetlana Wagner — Pythagoras Psychomatrix',
    template: '%s | Numerologie PRO',
  },
  description:
    'Entdecke deine Psychomatrix nach Pythagoras. Kostenloser Numerologie-Rechner + professionelle Beratung von Swetlana Wagner. 500+ zufriedene Klienten.',
  keywords: [
    'Numerologie',
    'Psychomatrix',
    'Pythagoras',
    'Numerologie Beratung',
    'Geburtsdatum Analyse',
    'Numerologie Rechner',
    'Persönlichkeitsanalyse',
    'Swetlana Wagner',
    'нумерология',
    'психоматрица',
    'нумерология по дате рождения',
    'психоматрица Пифагора',
    'нумеролог онлайн',
    'расчёт психоматрицы',
    'нумерологическая консультация',
    'квадрат Пифагора',
    'матрица судьбы',
    'Светлана Вагнер нумеролог',
    'нумерологія',
    'психоматриця',
  ],
  authors: [{ name: 'Swetlana Wagner', url: BASE_URL }],
  creator: 'Wagner AIgentur',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Numerologie PRO | Pythagoras Psychomatrix Beratung',
    description:
      'Berechne deine Psychomatrix kostenlos und entdecke, was dein Geburtsdatum über dich verrät. 500+ zufriedene Klienten.',
    url: BASE_URL,
    siteName: 'Numerologie PRO',
    locale: 'de_DE',
    alternateLocale: ['ru_RU', 'uk_UA'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Numerologie PRO | Pythagoras Psychomatrix',
    description:
      'Berechne deine Psychomatrix kostenlos. Professionelle Numerologie-Beratung von Swetlana Wagner.',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'de': `${BASE_URL}/de`,
      'ru': `${BASE_URL}/ru`,
      'uk': `${BASE_URL}/ru`,
      'x-default': `${BASE_URL}/de`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: '4c7a8472f3a9ef6b',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
