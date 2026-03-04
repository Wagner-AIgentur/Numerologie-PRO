'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, ArrowRight, Sparkles } from 'lucide-react';
import { calculateCompatibility, getCompatibilityInterpretation, getOverallText } from '@/lib/numerology/compatibility';
import type { CompatibilityResult } from '@/lib/numerology/compatibility';
import GoldButton from '@/components/ui/GoldButton';

// ── Texts ──────────────────────────────────────────────────────────────────────
const texts = {
    de: {
        badge: 'Neu · Kostenlos',
        title: 'Partnerschafts-',
        titleAccent: 'Kompatibilität',
        subtitle: 'Vergleiche zwei Psychomatrizen und entdecke, wie gut ihr auf den 9 Lebensebenen harmoniert.',
        person1: 'Person 1',
        person2: 'Person 2',
        placeholder: 'TT.MM.JJJJ',
        label1: 'Dein Geburtsdatum',
        label2: 'Geburtsdatum des Partners',
        calculate: 'Kompatibilität berechnen',
        calculating: 'Berechne...',
        overall: 'Gesamt-Kompatibilität',
        dimensions: 'Detaillierte Analyse',
        excellent: 'Hervorragend',
        good: 'Gut',
        moderate: 'Moderat',
        challenging: 'Herausfordernd',
        ctaTitle: 'Möchtest du tiefer gehen?',
        ctaDesc: 'Buche ein persönliches Beziehungs-Reading für eine tiefgehende Analyse eurer Partnerschaft mit konkreten Handlungsempfehlungen.',
        ctaButton: 'Beziehungskarte buchen',
        backToCalc: 'Zurück zum Matrix-Rechner',
        errorFormat: 'Format: TT.MM.JJJJ (z.B. 15.03.1990)',
        errorDay: 'Ungültiger Tag (1-31)',
        errorMonth: 'Ungültiger Monat (1-12)',
        errorYear: 'Ungültiges Jahr (1900-2030)',
        vs: 'vs.',
    },
    ru: {
        badge: 'Новинка · Бесплатно',
        title: 'Совместимость ',
        titleAccent: 'партнёров',
        subtitle: 'Сравните две психоматрицы и узнайте, как вы гармонируете на 9 уровнях жизни.',
        person1: 'Персона 1',
        person2: 'Персона 2',
        placeholder: 'ДД.ММ.ГГГГ',
        label1: 'Ваша дата рождения',
        label2: 'Дата рождения партнёра',
        calculate: 'Рассчитать совместимость',
        calculating: 'Рассчитываем...',
        overall: 'Общая совместимость',
        dimensions: 'Подробный анализ',
        excellent: 'Отлично',
        good: 'Хорошо',
        moderate: 'Умеренно',
        challenging: 'Непросто',
        ctaTitle: 'Хотите узнать больше?',
        ctaDesc: 'Закажите персональный разбор отношений для глубокого анализа вашего партнёрства с конкретными рекомендациями.',
        ctaButton: 'Заказать карту отношений',
        backToCalc: 'Назад к калькулятору матрицы',
        errorFormat: 'Формат: ДД.ММ.ГГГГ (напр. 15.03.1990)',
        errorDay: 'Неверный день (1-31)',
        errorMonth: 'Неверный месяц (1-12)',
        errorYear: 'Неверный год (1900-2030)',
        vs: 'vs.',
    },
};

// ── Helpers ─────────────────────────────────────────────────────────────────────
function formatDateInput(raw: string): string {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

function parseDate(value: string, t: typeof texts.de): { day: number; month: number; year: number } | string {
    const parts = value.split('.');
    if (parts.length !== 3) return t.errorFormat;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!d || d < 1 || d > 31) return t.errorDay;
    if (!m || m < 1 || m > 12) return t.errorMonth;
    if (!y || y < 1900 || y > 2030) return t.errorYear;
    return { day: d, month: m, year: y };
}

const levelColors: Record<string, string> = {
    excellent: 'text-emerald-400',
    good: 'text-gold',
    moderate: 'text-amber-400',
    challenging: 'text-rose-400',
};

const levelBgColors: Record<string, string> = {
    excellent: 'bg-emerald-400',
    good: 'bg-gold',
    moderate: 'bg-amber-400',
    challenging: 'bg-rose-400',
};

const STRIPE_BEZIEHUNG = 'https://buy.stripe.com/cNi6oJ1Ox43i7vOcsYgMw08';

// ── Page Component ─────────────────────────────────────────────────────────────
export default function CompatibilityPage() {
    const locale = useLocale() as 'de' | 'ru';
    const t = texts[locale];

    const [person1Value, setPerson1Value] = useState('');
    const [person2Value, setPerson2Value] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState<CompatibilityResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const parsed1 = parseDate(person1Value, t);
        if (typeof parsed1 === 'string') { setError(`Person 1: ${parsed1}`); return; }

        const parsed2 = parseDate(person2Value, t);
        if (typeof parsed2 === 'string') { setError(`Person 2: ${parsed2}`); return; }

        setIsLoading(true);
        // Slight delay for animation
        setTimeout(() => {
            const compatibility = calculateCompatibility(parsed1, parsed2);
            setResult(compatibility);
            setIsLoading(false);
        }, 600);
    };

    const person1Complete = person1Value.length === 10;
    const person2Complete = person2Value.length === 10;
    const bothComplete = person1Complete && person2Complete;

    return (
        <main className="min-h-screen pt-28 pb-20 px-4">
            <div className="mx-auto max-w-4xl">
                {/* ── Header ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium uppercase tracking-widest mb-6">
                        <Heart className="h-3.5 w-3.5" />
                        {t.badge}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t.title}<span className="text-gold">{t.titleAccent}</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-base md:text-lg">
                        {t.subtitle}
                    </p>
                </motion.div>

                {/* ── Input Form ─────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {!result && (
                        <motion.form
                            key="form"
                            onSubmit={handleCalculate}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Person 1 */}
                                <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-gold" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{t.person1}</p>
                                            <p className="text-white/40 text-xs">{t.label1}</p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={t.placeholder}
                                        value={person1Value}
                                        onChange={(e) => setPerson1Value(formatDateInput(e.target.value))}
                                        maxLength={10}
                                        className="w-full rounded-xl border border-gold/15 bg-[rgba(5,26,36,0.6)] px-5 py-4 text-center text-2xl font-bold text-white placeholder-white/20 backdrop-blur-sm focus:outline-none focus:border-gold/40 transition-colors tracking-[0.12em]"
                                        style={{ caretColor: '#D4AF37' }}
                                    />
                                </div>

                                {/* Person 2 */}
                                <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                            <Heart className="h-5 w-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{t.person2}</p>
                                            <p className="text-white/40 text-xs">{t.label2}</p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={t.placeholder}
                                        value={person2Value}
                                        onChange={(e) => setPerson2Value(formatDateInput(e.target.value))}
                                        maxLength={10}
                                        className="w-full rounded-xl border border-gold/15 bg-[rgba(5,26,36,0.6)] px-5 py-4 text-center text-2xl font-bold text-white placeholder-white/20 backdrop-blur-sm focus:outline-none focus:border-gold/40 transition-colors tracking-[0.12em]"
                                        style={{ caretColor: '#D4AF37' }}
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-400 text-center"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={isLoading || !bothComplete}
                                whileHover={bothComplete && !isLoading ? { scale: 1.02 } : {}}
                                whileTap={bothComplete && !isLoading ? { scale: 0.98 } : {}}
                                className={`w-full max-w-md mx-auto flex items-center justify-center gap-3 rounded-pill px-8 py-4 text-base font-bold uppercase tracking-widest transition-all duration-300 ${bothComplete && !isLoading
                                        ? 'bg-gold-gradient text-teal-dark shadow-gold hover:shadow-gold-hover cursor-pointer btn-pulse-glow'
                                        : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-dark border-t-transparent" />
                                        {t.calculating}
                                    </span>
                                ) : (
                                    <>
                                        <Heart className="h-5 w-5" />
                                        {t.calculate}
                                    </>
                                )}
                            </motion.button>

                            {/* Back link */}
                            <div className="text-center">
                                <GoldButton href="/rechner" variant="outline" size="sm">
                                    {t.backToCalc}
                                </GoldButton>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* ── Results ────────────────────────────────────────────── */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-10"
                        >
                            {/* Overall Score */}
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                    className="inline-flex flex-col items-center"
                                >
                                    <div className="relative mb-4">
                                        {/* Animated ring */}
                                        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                            <motion.circle
                                                cx="60" cy="60" r="52" fill="none"
                                                stroke={result.overallLevel === 'excellent' ? '#34d399' : result.overallLevel === 'good' ? '#D4AF37' : result.overallLevel === 'moderate' ? '#fbbf24' : '#fb7185'}
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 52}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.overallScore / 100) }}
                                                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1 }}
                                                className={`text-3xl sm:text-4xl font-bold ${levelColors[result.overallLevel]}`}
                                            >
                                                {result.overallScore}%
                                            </motion.span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-1">{t.overall}</h2>
                                    <span className={`text-sm font-semibold uppercase tracking-wider ${levelColors[result.overallLevel]}`}>
                                        {t[result.overallLevel]}
                                    </span>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-6 text-white/60 max-w-xl mx-auto text-sm leading-relaxed"
                                >
                                    {getOverallText(result.overallLevel, locale)}
                                </motion.p>
                            </div>

                            {/* Detailed Dimensions */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-gold" />
                                    {t.dimensions}
                                </h3>

                                <div className="space-y-3">
                                    {result.dimensions.map((dim, idx) => {
                                        const interp = getCompatibilityInterpretation(dim, locale);
                                        return (
                                            <motion.div
                                                key={dim.position}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx + 0.5 }}
                                                className="rounded-xl border border-white/8 bg-[rgba(15,48,63,0.2)] backdrop-blur-sm p-4 md:p-5"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gold/50 w-5">{dim.position}</span>
                                                        <span className="text-sm font-semibold text-white">{interp.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold font-bold">{interp.person1Label}</span>
                                                        <span className="text-white/30">{t.vs}</span>
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-400/10 text-rose-400 font-bold">{interp.person2Label}</span>
                                                    </div>
                                                </div>

                                                {/* Score bar */}
                                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${dim.score}%` }}
                                                        transition={{ duration: 0.8, delay: 0.1 * idx + 0.6 }}
                                                        className={`absolute inset-y-0 left-0 rounded-full ${levelBgColors[dim.level]}`}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-white/50 leading-relaxed flex-1 pr-4">{interp.description}</p>
                                                    <span className={`text-xs font-bold whitespace-nowrap ${levelColors[dim.level]}`}>
                                                        {dim.score}% · {t[dim.level]}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="rounded-2xl border border-gold/30 bg-[rgba(15,48,63,0.3)] backdrop-blur-xl p-8 text-center"
                            >
                                <Heart className="h-8 w-8 text-gold mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{t.ctaTitle}</h3>
                                <p className="text-white/60 text-sm mb-6 max-w-lg mx-auto">{t.ctaDesc}</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <GoldButton href={STRIPE_BEZIEHUNG} size="md">
                                        {t.ctaButton}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </GoldButton>
                                    <GoldButton
                                        variant="outline"
                                        size="md"
                                        onClick={() => { setResult(null); setPerson1Value(''); setPerson2Value(''); }}
                                    >
                                        {locale === 'de' ? 'Nochmal berechnen' : 'Рассчитать снова'}
                                    </GoldButton>
                                </div>
                            </motion.div>

                            {/* Back link */}
                            <div className="text-center">
                                <GoldButton href="/rechner" variant="outline" size="sm">
                                    {t.backToCalc}
                                </GoldButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
