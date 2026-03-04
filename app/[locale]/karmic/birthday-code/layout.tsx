import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('karmic-birthday-code', locale, '/karmic/birthday-code');
}

export default function BirthdayCodeLayout({ children }: Props) {
  return children;
}
