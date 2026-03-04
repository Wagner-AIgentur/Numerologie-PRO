import { getDateLocale } from '@/lib/i18n/admin';

interface CoverPageProps {
  birthdate: string;
  name?: string;
  locale: 'de' | 'ru';
}

export default function CoverPage({ birthdate, name, locale }: CoverPageProps) {
  const title = locale === 'de'
    ? 'Ihre persönliche Numerologie-Analyse'
    : 'Ваш личный нумерологический анализ';

  const subtitle = locale === 'de'
    ? 'Eine tiefgehende Interpretation Ihrer Psychomatrix'
    : 'Глубокая интерпретация вашей психоматрицы';

  const forLabel = locale === 'de' ? 'Für' : 'Для';
  const createdLabel = locale === 'de' ? 'Erstellt am' : 'Создано';

  const displayName = name || (locale === 'de' ? 'Sie' : 'Вас');
  const today = new Date().toLocaleDateString(getDateLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="relative min-h-[297mm] flex flex-col items-center justify-center bg-gradient-to-br from-[#051A24] via-[#0a2533] to-[#051A24] text-white p-16" style={{ pageBreakAfter: 'always' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-12">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold bg-gold/10 backdrop-blur-sm">
          <span className="font-serif text-5xl font-bold text-gold">NP</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="relative z-10 font-serif text-5xl font-bold text-center mb-4 leading-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gold to-white">
          NUMEROLOGIE PRO
        </span>
      </h1>

      {/* Subtitle */}
      <h2 className="relative z-10 font-sans text-2xl text-white/80 text-center mb-16 max-w-2xl">
        {title}
      </h2>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-4 mb-16">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-gold" />
        <div className="h-2 w-2 rounded-full bg-gold" />
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-gold" />
      </div>

      {/* For Name */}
      <div className="relative z-10 text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-white/50 mb-2">{forLabel}</p>
        <p className="font-serif text-4xl font-bold text-gold">{displayName}</p>
      </div>

      {/* Birthdate */}
      <div className="relative z-10 flex items-center justify-center gap-6 mb-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-2">
            {locale === 'de' ? 'Geburtsdatum' : 'Дата рождения'}
          </p>
          <p className="font-mono text-2xl font-bold text-white">{birthdate}</p>
        </div>
      </div>

      {/* Subtitle Text */}
      <p className="relative z-10 text-center text-white/60 max-w-lg text-sm leading-relaxed">
        {subtitle}
      </p>

      {/* Footer */}
      <div className="absolute bottom-12 left-0 right-0 z-10 text-center">
        <p className="text-xs text-white/40">
          {createdLabel} {today}
        </p>
        <p className="text-xs text-white/40 mt-2">
          numerologie-pro.de
        </p>
      </div>
    </div>
  );
}
