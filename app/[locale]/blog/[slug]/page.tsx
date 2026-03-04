import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { getDateLocale } from '@/lib/i18n/admin';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import { BlogPostJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const locales = ['de', 'ru'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const posts = getBlogPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);

  if (!post) return {};

  const otherLocale = locale === 'de' ? 'ru' : 'de';

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://numerologie-pro.com/${locale}/blog/${slug}`,
      languages: {
        de: `https://numerologie-pro.com/de/blog/${slug}`,
        ru: `https://numerologie-pro.com/ru/blog/${slug}`,
        uk: `https://numerologie-pro.com/ru/blog/${slug}`,
        'x-default': `https://numerologie-pro.com/de/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'Numerologie PRO',
      locale: locale === 'de' ? 'de_DE' : 'ru_RU',
      alternateLocale: locale === 'de' ? ['ru_RU', 'uk_UA'] : ['de_DE', 'uk_UA'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);

  if (!post) notFound();

  const isDE = locale === 'de';

  const breadcrumbItems = [
    { name: isDE ? 'Startseite' : 'Главная', url: `https://numerologie-pro.com/${locale}` },
    { name: 'Blog', url: `https://numerologie-pro.com/${locale}/blog` },
    { name: post.title, url: `https://numerologie-pro.com/${locale}/blog/${slug}` },
  ];

  return (
    <section className="relative py-24 px-4">
      <BlogPostJsonLd post={post} locale={locale} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#d4af37] transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {isDE ? 'Zurück zum Blog' : 'Назад к блогу'}
        </Link>

        {/* Header */}
        <header className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-xs font-medium mb-4">
            {post.category}
          </span>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString(getDateLocale(locale), {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-white prose-p:text-white/70 prose-a:text-[#d4af37] prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:text-white/70 prose-blockquote:border-[#d4af37]/30 prose-blockquote:text-white/50">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-center">
          <h3 className="font-serif text-2xl font-bold text-white mb-3">
            {isDE
              ? 'Neugierig auf deine Zahlen?'
              : 'Интересно узнать о своих числах?'}
          </h3>
          <p className="text-white/60 mb-6">
            {isDE
              ? 'Berechne deine persönliche Psychomatrix kostenlos in 30 Sekunden.'
              : 'Рассчитайте свою персональную психоматрицу бесплатно за 30 секунд.'}
          </p>
          <Link
            href={`/${locale}/rechner`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ECC558] to-[#D4AF37] text-[#051a24] font-semibold hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
          >
            {isDE ? 'Jetzt Matrix berechnen' : 'Рассчитать матрицу'}
          </Link>
        </div>
      </article>
    </section>
  );
}
