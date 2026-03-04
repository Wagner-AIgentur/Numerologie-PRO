import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('karmic-selfrealization', locale, '/karmic/selfrealization');
}

export default function SelfrealizationLayout({ children }: Props) {
  return children;
}
