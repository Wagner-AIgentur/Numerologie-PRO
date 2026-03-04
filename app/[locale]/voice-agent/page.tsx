import { Metadata } from 'next';
import VoiceAgentLanding from '@/components/voice-agent/VoiceAgentLanding';

const BASE_URL = 'https://numerologie-pro.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const routePath = '/voice-agent';

  const title =
    locale === 'ru'
      ? 'Лиза — ИИ-ассистент по нумерологии'
      : 'Lisa — KI-Assistentin für Numerologie';

  const description =
    locale === 'ru'
      ? 'Поговорите с Лизой, нашим ИИ-ассистентом по нумерологии. Узнайте всё о пакетах Психоматрицы, ценах и запишитесь на бесплатную консультацию со Светланой Вагнер.'
      : 'Sprich mit Lisa, unserer KI-Assistentin für Numerologie. Erfahre alles über Psychomatrix-Pakete, Preise und buche dein kostenloses Erstgespräch mit Swetlana Wagner.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}${routePath}`,
      languages: {
        de: `${BASE_URL}/de${routePath}`,
        ru: `${BASE_URL}/ru${routePath}`,
        uk: `${BASE_URL}/ru${routePath}`,
        'x-default': `${BASE_URL}/de${routePath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}${routePath}`,
      siteName: 'Numerologie PRO',
      locale: locale === 'de' ? 'de_DE' : 'ru_RU',
      alternateLocale: locale === 'de' ? ['ru_RU', 'uk_UA'] : ['de_DE', 'uk_UA'],
      type: 'website',
    },
  };
}

export default async function VoiceAgentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <VoiceAgentLanding locale={locale} />;
}
