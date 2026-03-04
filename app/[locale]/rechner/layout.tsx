import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';
import { WebApplicationJsonLd } from '@/components/seo/JsonLd';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('rechner', locale, '/rechner');
}

export default async function RechnerLayout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <>
      <WebApplicationJsonLd locale={locale} />
      {children}
    </>
  );
}
