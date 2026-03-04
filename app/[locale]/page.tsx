import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo/metadata';
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import Hero from '@/components/sections/Hero';
import KarmicProducts from '@/components/sections/KarmicProducts';
import CalculatorTeaser from '@/components/sections/CalculatorTeaser';
import HowItWorks from '@/components/sections/HowItWorks';
import PackagesOverview from '@/components/sections/PackagesOverview';
import Testimonials from '@/components/sections/Testimonials';
import AboutPreview from '@/components/sections/AboutPreview';
import TrustBadges from '@/components/sections/TrustBadges';
import CTASection from '@/components/sections/CTASection';
import FAQ from '@/components/sections/FAQ';
import SectionDivider from '@/components/ui/SectionDivider';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata('home', locale, '');
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isDE = locale === 'de';

  return (
    <>
      <LocalBusinessJsonLd locale={locale} />
      <BreadcrumbJsonLd items={[
        { name: isDE ? 'Startseite' : 'Главная', url: `https://numerologie-pro.com/${locale}` },
      ]} />
      <BackgroundOrbs />
      <Hero />
      <SectionDivider />
      <KarmicProducts />
      <SectionDivider />
      <CalculatorTeaser />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <PackagesOverview />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <AboutPreview />
      <SectionDivider />
      <TrustBadges />
      <SectionDivider />
      <FAQ />
      <SectionDivider />
      <CTASection />
    </>
  );
}
