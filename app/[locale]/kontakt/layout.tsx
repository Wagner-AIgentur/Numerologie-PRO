import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('kontakt', locale, '/kontakt');
}

export default async function KontaktLayout({ children, params }: Props) {
  const { locale } = await params;
  const isDE = locale === 'de';

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: isDE ? 'Startseite' : 'Главная', url: `https://numerologie-pro.com/${locale}` },
        { name: isDE ? 'Kontakt' : 'Контакт', url: `https://numerologie-pro.com/${locale}/kontakt` },
      ]} />
      {children}
    </>
  );
}
