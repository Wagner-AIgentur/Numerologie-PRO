import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('pakete', locale, '/pakete');
}

export default async function PaketeLayout({ children, params }: Props) {
  const { locale } = await params;
  const isDE = locale === 'de';

  return (
    <>
      <LocalBusinessJsonLd locale={locale} />
      <BreadcrumbJsonLd items={[
        { name: isDE ? 'Startseite' : 'Главная', url: `https://numerologie-pro.com/${locale}` },
        { name: isDE ? 'Pakete & Preise' : 'Пакеты и цены', url: `https://numerologie-pro.com/${locale}/pakete` },
      ]} />
      {children}
    </>
  );
}
