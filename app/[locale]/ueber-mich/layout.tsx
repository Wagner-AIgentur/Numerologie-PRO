import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';
import { PersonJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('ueber-mich', locale, '/ueber-mich');
}

export default async function UeberMichLayout({ children, params }: Props) {
  const { locale } = await params;
  const isDE = locale === 'de';

  const breadcrumbItems = [
    { name: isDE ? 'Startseite' : 'Главная', url: `https://numerologie-pro.com/${locale}` },
    { name: isDE ? 'Über mich' : 'Обо мне', url: `https://numerologie-pro.com/${locale}/ueber-mich` },
  ];

  return (
    <>
      <PersonJsonLd locale={locale} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
