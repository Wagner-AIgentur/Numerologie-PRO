import { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { getDateLocale } from '@/lib/i18n/admin';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === 'de';

  return {
    title: isDE
      ? 'Numerologie Blog — Wissen, Tipps & Insights'
      : 'Блог нумерологии — Знания, советы и инсайты',
    description: isDE
      ? 'Lerne alles über Numerologie, Psychomatrix und Persönlichkeitsentwicklung. Expertenwissen von Swetlana Wagner.'
      : 'Узнайте всё о нумерологии, психоматрице и развитии личности. Экспертные знания от Светланы Вагнер.',
    alternates: {
      canonical: `https://numerologie-pro.com/${locale}/blog`,
      languages: {
        de: 'https://numerologie-pro.com/de/blog',
        ru: 'https://numerologie-pro.com/ru/blog',
        uk: 'https://numerologie-pro.com/ru/blog',
        'x-default': 'https://numerologie-pro.com/de/blog',
      },
    },
    openGraph: {
      title: isDE
        ? 'Numerologie Blog — Wissen, Tipps & Insights'
        : 'Блог нумерологии — Знания, советы и инсайты',
      description: isDE
        ? 'Lerne alles über Numerologie, Psychomatrix und Persönlichkeitsentwicklung. Expertenwissen von Swetlana Wagner.'
        : 'Узнайте всё о нумерологии, психоматрице и развитии личности. Экспертные знания от Светланы Вагнер.',
      locale: isDE ? 'de_DE' : 'ru_RU',
      alternateLocale: isDE ? ['ru_RU', 'uk_UA'] : ['de_DE', 'uk_UA'],
      siteName: 'Numerologie PRO',
      type: 'website',
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = getBlogPosts(locale);
  const isDE = locale === 'de';

  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: isDE ? 'Startseite' : 'Главная', url: `https://numerologie-pro.com/${locale}` },
      { name: 'Blog', url: `https://numerologie-pro.com/${locale}/blog` },
    ]} />
    <CollectionPageJsonLd locale={locale} posts={posts} />
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-sm font-medium mb-6">
            {isDE ? 'Wissen & Insights' : 'Знания и инсайты'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {isDE ? 'Numerologie ' : 'Блог '}
            <span className="text-[#d4af37]">{isDE ? 'Blog' : 'нумерологии'}</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {isDE
              ? 'Expertenwissen rund um Pythagoras Psychomatrix, Persönlichkeitsentwicklung und die Kraft der Zahlen.'
              : 'Экспертные знания о психоматрице Пифагора, развитии личности и силе чисел.'}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg mb-4">
              {isDE
                ? 'Erste Artikel kommen bald...'
                : 'Первые статьи скоро появятся...'}
            </p>
            <Link
              href={`/${locale}/rechner`}
              className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#F4D06F] transition-colors"
            >
              {isDE ? 'Zum kostenlosen Rechner' : 'К бесплатному калькулятору'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-[#d4af37]/30 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="flex items-center gap-3 text-sm text-white/40 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString(getDateLocale(locale), {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readingTime}
                  </span>
                </div>

                <h2 className="font-serif text-xl font-semibold text-white group-hover:text-[#d4af37] transition-colors mb-2">
                  {post.title}
                </h2>

                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  {post.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-[#d4af37] text-sm font-medium group-hover:gap-2.5 transition-all">
                  {isDE ? 'Weiterlesen' : 'Читать далее'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  );
}
