'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Phone,
  Sparkles,
  Heart,
  Calendar,
  BookOpen,
  Globe,
  Shield,
  ArrowRight,
} from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';

// Dynamic import to avoid SSR issues with audio/microphone
const VoiceWidget = dynamic(() => import('./VoiceWidget'), {
  ssr: false,
  loading: () => (
    <div className="rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.4)] border border-gold/20 p-8 h-[350px] flex items-center justify-center shadow-card">
      <div className="text-white/40 font-sans">Lade Voice Agent...</div>
    </div>
  ),
});

const EASE_SMOOTH = [0.12, 0.23, 0.5, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 1, ease: EASE_SMOOTH },
  }),
};

const t = {
  de: {
    badge: 'KI-Assistentin fuer Numerologie',
    heroTitle1: 'Entdecke dein ',
    heroTitleHighlight: 'numerologisches Potenzial',
    heroText1: 'Sprich jetzt mit ',
    heroText2: ', unserer KI-Assistentin. Sie beantwortet deine Fragen zur Psychomatrix nach Pythagoras, hilft dir das passende Beratungspaket zu finden und bucht dein ',
    heroTextFree: 'kostenloses Erstgespraech',
    heroText3: ' mit Swetlana Wagner.',
    stat1: 'Beratungen',
    stat2: 'Zertifikate',
    stat3: 'Jahre Erfahrung',
    featuresTitle: 'Was Lisa fuer dich tun kann',
    featuresSubtitle: 'Unsere KI-Assistentin kennt alle Pakete, Preise und Ablaeufe und hilft dir, den perfekten Einstieg in die Numerologie zu finden.',
    feature1Title: 'Paket-Beratung',
    feature1Desc: 'Lisa erklaert alle Pakete von der Lebenskarte (79 Euro) bis zur Jahresprognose (179 Euro) und empfiehlt das passende fuer dich.',
    feature2Title: 'Persoenliche Empfehlung',
    feature2Desc: 'Ob Beziehung, Beruf, Finanzen oder Kinder — Lisa findet anhand deiner Fragen das ideale Beratungspaket.',
    feature3Title: 'Erstgespraech buchen',
    feature3Desc: 'Lisa bucht direkt dein kostenloses 15-Minuten Erstgespraech mit Swetlana Wagner — ganz unverbindlich.',
    feature4Title: 'Psychomatrix erklaert',
    feature4Desc: 'Erfahre, wie die 9 Positionen der Psychomatrix nach Pythagoras deine Persoenlichkeit, Talente und Potenziale zeigen.',
    feature5Title: 'Deutsch & Russisch',
    feature5Desc: 'Sprich einfach los — Lisa erkennt automatisch deine Sprache und antwortet auf Deutsch oder Russisch.',
    feature6Title: 'DSGVO-konform',
    feature6Desc: 'Lisa identifiziert sich als KI, holt deine Einwilligung ein und du kannst jederzeit zu Swetlana persoenlich wechseln.',
    ctaTitle: 'Kostenloses Erstgespraech buchen',
    ctaText: '15 Minuten mit Swetlana Wagner — lerne die Numerologie kennen und finde heraus, welches Paket zu dir passt. Voellig unverbindlich.',
    ctaBook: 'Termin buchen',
    ctaSpeak: 'Mit Lisa sprechen',
    lisaName: 'Lisa',
  },
  ru: {
    badge: 'ИИ-ассистент по нумерологии',
    heroTitle1: 'Откройте свой ',
    heroTitleHighlight: 'нумерологический потенциал',
    heroText1: 'Поговорите с ',
    heroText2: ', нашим ИИ-ассистентом. Она ответит на ваши вопросы о Психоматрице по Пифагору, поможет выбрать подходящий пакет консультаций и запишет вас на ',
    heroTextFree: 'бесплатную консультацию',
    heroText3: ' со Светланой Вагнер.',
    stat1: 'Консультаций',
    stat2: 'Сертификатов',
    stat3: 'Лет опыта',
    featuresTitle: 'Что Лиза может для вас сделать',
    featuresSubtitle: 'Наш ИИ-ассистент знает все пакеты, цены и процессы и поможет вам найти идеальный вход в нумерологию.',
    feature1Title: 'Консультация по пакетам',
    feature1Desc: 'Лиза расскажет обо всех пакетах — от Карты жизни (79 евро) до Годового прогноза (179 евро) и порекомендует подходящий.',
    feature2Title: 'Персональная рекомендация',
    feature2Desc: 'Отношения, карьера, финансы или дети — Лиза подберёт идеальный пакет консультаций на основе ваших вопросов.',
    feature3Title: 'Запись на консультацию',
    feature3Desc: 'Лиза сразу запишет вас на бесплатную 15-минутную консультацию со Светланой Вагнер — без обязательств.',
    feature4Title: 'Психоматрица',
    feature4Desc: 'Узнайте, как 9 позиций Психоматрицы по Пифагору раскрывают вашу личность, таланты и потенциал.',
    feature5Title: 'Немецкий и русский',
    feature5Desc: 'Просто начните говорить — Лиза автоматически определит ваш язык и ответит на немецком или русском.',
    feature6Title: 'Соответствие DSGVO',
    feature6Desc: 'Лиза представляется как ИИ, получает ваше согласие, и вы можете в любой момент переключиться на Светлану лично.',
    ctaTitle: 'Запишитесь на бесплатную консультацию',
    ctaText: '15 минут со Светланой Вагнер — познакомьтесь с нумерологией и узнайте, какой пакет вам подходит. Совершенно бесплатно.',
    ctaBook: 'Записаться',
    ctaSpeak: 'Поговорить с Лизой',
    lisaName: 'Лизой',
  },
} as const;

const CAL_LINK =
  'https://cal.com/swetlana-wagner-vn81pp/%D0%B1%D0%B5%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D0%BD%D0%B0%D1%8F-%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8F';

interface VoiceAgentLandingProps {
  locale: string;
}

export default function VoiceAgentLanding({ locale }: VoiceAgentLandingProps) {
  const lang = locale === 'ru' ? 'ru' : 'de';
  const l = t[lang];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Subtle gold glow */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-gold/3 rounded-full blur-[100px]" />

        <div className="relative z-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Content */}
            <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.4}
                className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-pill px-5 py-2 text-sm text-gold font-sans tracking-wider uppercase"
              >
                <Sparkles className="w-4 h-4" />
                {l.badge}
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.6}
                className="mt-6 font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-white"
              >
                {l.heroTitle1}
                <span className="text-shimmer">{l.heroTitleHighlight}</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.8}
                className="mt-6 max-w-xl text-lg text-white/70"
              >
                {l.heroText1}
                <span className="text-gold font-semibold">{l.lisaName}</span>
                {l.heroText2}
                <span className="text-gold font-semibold">{l.heroTextFree}</span>
                {l.heroText3}
              </motion.p>

              {/* Quick Stats */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1.0}
                className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md"
              >
                <div className="text-center p-4 rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.3)] border border-gold/10">
                  <p className="text-2xl font-bold text-gold">500+</p>
                  <p className="text-xs text-white/40 mt-1">{l.stat1}</p>
                </div>
                <div className="text-center p-4 rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.3)] border border-gold/10">
                  <p className="text-2xl font-bold text-gold">11</p>
                  <p className="text-xs text-white/40 mt-1">{l.stat2}</p>
                </div>
                <div className="text-center p-4 rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.3)] border border-gold/10">
                  <p className="text-2xl font-bold text-gold">5+</p>
                  <p className="text-xs text-white/40 mt-1">{l.stat3}</p>
                </div>
              </motion.div>
            </div>

            {/* Right: Voice Widget */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.8}
              className="w-full lg:w-[45%]"
            >
              <VoiceWidget locale={lang} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-gold my-8" />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.2}
          className="font-serif font-bold text-3xl md:text-4xl text-center text-white mb-3"
        >
          {l.featuresTitle}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.3}
          className="text-white/50 text-center mb-12 max-w-2xl mx-auto"
        >
          {l.featuresSubtitle}
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={<BookOpen className="w-6 h-6 text-gold" />} title={l.feature1Title} description={l.feature1Desc} delay={0.1} />
          <FeatureCard icon={<Heart className="w-6 h-6 text-gold" />} title={l.feature2Title} description={l.feature2Desc} delay={0.2} />
          <FeatureCard icon={<Calendar className="w-6 h-6 text-gold" />} title={l.feature3Title} description={l.feature3Desc} delay={0.3} />
          <FeatureCard icon={<Sparkles className="w-6 h-6 text-gold" />} title={l.feature4Title} description={l.feature4Desc} delay={0.4} />
          <FeatureCard icon={<Globe className="w-6 h-6 text-gold" />} title={l.feature5Title} description={l.feature5Desc} delay={0.5} />
          <FeatureCard icon={<Shield className="w-6 h-6 text-gold" />} title={l.feature6Title} description={l.feature6Desc} delay={0.6} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.2}
          className="rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.3)] border border-gold/20 p-10 md:p-14 shadow-glow"
        >
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-white mb-4">
            {l.ctaTitle}
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            {l.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoldButton size="lg" pulse>
                {l.ctaBook}
                <ArrowRight className="w-5 h-5 ml-2" />
              </GoldButton>
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gold text-gold font-bold uppercase tracking-wider rounded-pill px-9 py-4 text-base hover:bg-gold/10 hover:scale-[1.02] transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              {l.ctaSpeak}
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      className="rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.2)] border border-gold/20 p-6 hover:border-gold/40 hover:shadow-card-hover transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-[12px] bg-gold/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50">{description}</p>
    </motion.div>
  );
}

