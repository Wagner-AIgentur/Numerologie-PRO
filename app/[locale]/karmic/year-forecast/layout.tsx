import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('karmic-year-forecast', locale, '/karmic/year-forecast');
}

export default function YearForecastLayout({ children }: Props) {
  return children;
}
