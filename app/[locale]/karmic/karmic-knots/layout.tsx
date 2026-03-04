import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('karmic-knots', locale, '/karmic/karmic-knots');
}

export default function KarmicKnotsLayout({ children }: Props) {
  return children;
}
