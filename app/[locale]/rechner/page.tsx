'use client';

import { useState, useEffect, Suspense, useCallback, startTransition, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import BirthdayInput from '@/components/calculator/BirthdayInput';
import MatrixGrid from '@/components/calculator/MatrixGrid';
import MatrixModal from '@/components/calculator/MatrixModal';
import AuthGate from '@/components/calculator/AuthGate';
import LinesAnalysis from '@/components/calculator/LinesAnalysis';
import ShareButtons from '@/components/calculator/ShareButtons';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton from '@/components/ui/CalBookingButton';
import { calculateMatrix, type MatrixResult } from '@/lib/numerology/calculate';
import { createClient } from '@/lib/supabase/client';
import { FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';
import { Download, Loader2, CheckCircle2, Calendar, Mail, ChevronDown, BarChart3 } from 'lucide-react';

/* ── Step indicator ── */
function StepIndicator({ currentStep, locale }: { currentStep: number; locale: 'de' | 'ru' }) {
  const steps = locale === 'de'
    ? ['Geburtsdatum', 'Deine Matrix', 'PDF Analyse']
    : ['Дата рождения', 'Твоя матрица', 'PDF Анализ'];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <div className={`h-px w-6 sm:w-10 transition-colors duration-300 ${isDone ? 'bg-gold' : 'bg-white/10'}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-gold text-white'
                    : isActive
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'bg-white/5 text-white/50'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : stepNum}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:inline transition-colors duration-300 ${
                  isDone || isActive ? 'text-white' : 'text-white/60'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RechnerContent() {
  const t = useTranslations('calculator');
  const locale = useLocale() as 'de' | 'ru';
  const searchParams = useSearchParams();

  const [result, setResult] = useState<MatrixResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfEmailing, setPdfEmailing] = useState(false);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  // Modal state
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showLines, setShowLines] = useState(false);

  // Supabase Auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleCalculate = useCallback((day: number, month: number, year: number) => {
    setIsCalculating(true);
    const bd = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
    setBirthdate(bd);

    setTimeout(() => {
      const matrix = calculateMatrix(day, month, year);
      setResult(matrix);
      setIsCalculating(false);

      const url = new URL(window.location.href);
      url.searchParams.set('d', String(day).padStart(2, '0'));
      url.searchParams.set('m', String(month).padStart(2, '0'));
      url.searchParams.set('y', String(year));
      window.history.replaceState({}, '', url.toString());
    }, 600);
  }, []);

  // Auto-calculate from URL params on mount
  useEffect(() => {
    const d = searchParams.get('d');
    const m = searchParams.get('m');
    const y = searchParams.get('y');

    if (d && m && y) {
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        // Set birthdate first so BirthdayInput shows the value
        const bd = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
        setBirthdate(bd);
        handleCalculate(day, month, year);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build redirect params from current URL state
  const redirectParams = birthdate
    ? `d=${birthdate.split('.')[0]}&m=${birthdate.split('.')[1]}&y=${birthdate.split('.')[2]}`
    : '';

  const handlePdfDownload = async () => {
    if (!result || !birthdate) {
      toast.error(
        locale === 'de'
          ? 'Bitte berechnen Sie zuerst Ihre Matrix'
          : 'Пожалуйста, сначала рассчитайте вашу матрицу'
      );
      return;
    }

    setPdfGenerating(true);

    try {
      const res = await fetch('/api/pdf-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthdate, locale }),
        credentials: 'include', // ✅ Send session cookies
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('[PDF Download] Error Response:', errorData);

        if (res.status === 401) {
          toast.error(
            locale === 'de'
              ? 'Bitte melden Sie sich an, um PDFs herunterzuladen'
              : 'Пожалуйста, войдите, чтобы скачать PDF'
          );
          return;
        }

        throw new Error(errorData.details || `PDF download failed: ${res.status}`);
      }

      // Download the PDF
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `psychomatrix-${birthdate.replace(/\./g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        locale === 'de'
          ? 'PDF erfolgreich heruntergeladen!'
          : 'PDF успешно загружен!'
      );
    } catch (err) {
      console.error('PDF download failed:', err);
      toast.error(
        locale === 'de'
          ? 'Fehler beim Herunterladen. Bitte versuchen Sie es erneut.'
          : 'Ошибка при загрузке. Пожалуйста, попробуйте снова.'
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  const handlePdfEmail = async () => {
    if (!result || !birthdate || !user?.email) return;
    setPdfEmailing(true);

    try {
      const res = await fetch('/api/pdf-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthdate, locale }),
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error(
            locale === 'de'
              ? 'Bitte melden Sie sich an, um PDFs per Email zu erhalten'
              : 'Пожалуйста, войдите, чтобы получить PDF на email'
          );
          return;
        }
        throw new Error('Failed to send PDF');
      }

      toast.success(
        locale === 'de'
          ? `PDF wurde an ${user.email} gesendet!`
          : `PDF отправлен на ${user.email}!`
      );
    } catch (err) {
      console.error('PDF email failed:', err);
      toast.error(
        locale === 'de'
          ? 'Fehler beim Senden. Bitte versuchen Sie es erneut.'
          : 'Ошибка при отправке. Пожалуйста, попробуйте снова.'
      );
    } finally {
      setPdfEmailing(false);
    }
  };

  // Current step for progress indicator
  const currentStep = !result ? 1 : !isAuthenticated ? 2 : 3;

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} locale={locale} />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.12, 0.23, 0.5, 1] }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
            {t('sectionTitle')}{' '}
            <span className="text-shimmer">{t('sectionTitleAccent')}</span>
          </h1>
          <p className="mt-3 text-white/60 text-base max-w-lg mx-auto leading-relaxed">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

        {/* ── Single Column Flow ── */}
        <div className="space-y-4">
          {/* 1. Birthday Input — nur anzeigen wenn noch kein Ergebnis */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6 shadow-card"
            >
              <div className="text-center mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 mb-2">
                  <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75" />
                  </svg>
                </div>
                <h2 className="text-sm font-medium text-white/70 uppercase tracking-widest">
                  {locale === 'de' ? 'Dein Geburtsdatum' : 'Дата рождения'}
                </h2>
              </div>
              <BirthdayInput
                onCalculate={handleCalculate}
                isLoading={isCalculating}
                initialValue={birthdate}
              />
            </motion.div>
          )}

          {/* 2. Matrix + Schicksalszahl (after calculation) */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-card"
              >
                {/* Numerologie-Disclaimer */}
                <p className="text-[10px] text-white/30 leading-relaxed mb-3">
                  {locale === 'de'
                    ? 'Hinweis: Die Beschreibungen basieren auf numerologischer Tradition und dienen der Selbstreflexion. Begriffe wie „Heiler" sind im spirituell-metaphorischen Sinne zu verstehen und stellen keine medizinischen Aussagen dar.'
                    : 'Примечание: описания основаны на нумерологической традиции и служат для саморефлексии. Такие понятия, как «целитель», следует понимать в духовно-метафорическом смысле.'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">{t('yourMatrix')}</h2>
                    {birthdate && <p className="text-xs text-gold/80 mt-0.5">{birthdate}</p>}
                  </div>
                  <div className="flex flex-col items-center rounded-xl border border-gold/25 bg-gold/10 px-4 py-2">
                    <span className="text-[10px] text-white/70 uppercase tracking-wider">
                      {locale === 'de' ? 'Schicksalszahl' : 'Число судьбы'}
                    </span>
                    <span className="text-2xl font-bold text-gold leading-none mt-0.5">
                      {result.workingNumbers[1]}
                    </span>
                  </div>
                </div>

                {/* Clickable Matrix Grid */}
                <MatrixGrid
                  result={result}
                  locale={locale}
                  isAuthenticated={isAuthenticated}
                  freePositions={[1, 2, 3]}
                  onCellClick={(pos) => startTransition(() => setSelectedPosition(pos))}
                  onLockedClick={() => startTransition(() => setShowAuthGate(true))}
                  birthDate={birthdate}
                />

                {/* Hint for clicking */}
                <p className="text-[10px] text-white/60 text-center mt-3">
                  {locale === 'de'
                    ? 'Klicke auf eine Position, um die Interpretation zu sehen'
                    : 'Нажмите на позицию, чтобы увидеть интерпретацию'}
                </p>

                {/* Working Numbers (Zusatzzahlen) */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">
                    {locale === 'de' ? 'Zusatzzahlen' : 'Дополнительные числа'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {[
                      { label: locale === 'de' ? 'I. Zahl' : 'I число', sublabel: locale === 'de' ? 'Weg' : 'Способ' },
                      { label: locale === 'de' ? 'II. Zahl' : 'II число', sublabel: locale === 'de' ? 'Lebensziel' : 'Цель жизни' },
                      { label: locale === 'de' ? 'III. Zahl' : 'III число', sublabel: locale === 'de' ? 'Erbe' : 'Основа' },
                      { label: locale === 'de' ? 'IV. Zahl' : 'IV число', sublabel: locale === 'de' ? 'Ведущее качество' : 'Ведущее качество' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2 overflow-hidden min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-white/60 uppercase tracking-wider truncate max-w-full">{item.label}</span>
                        <span className="text-base sm:text-lg font-bold text-gold leading-none mt-0.5">{result.workingNumbers[i]}</span>
                        <span className="text-[8px] sm:text-[9px] text-white/60 mt-0.5 truncate max-w-full">{item.sublabel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <ShareButtons
                    birthdate={birthdate}
                    schicksalszahl={result.workingNumbers[1]}
                    locale={locale}
                  />
                </div>

                {/* Collapsible Lines Analysis — inside the matrix card */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => setShowLines(!showLines)}
                    className="w-full flex items-center justify-between gap-2 py-2 group"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gold/60" />
                      <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                        {locale === 'de' ? 'Linien-Analyse' : 'Анализ линий'}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: showLines ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-white/30 group-hover:text-white/50 transition-colors" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {showLines && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.12, 0.23, 0.5, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2">
                          <LinesAnalysis result={result} locale={locale} unlocked={isAuthenticated} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Compact Action Bar — PDF + Beratung in einer Zeile */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-card"
              >
                {isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* PDF Download */}
                    <button
                      onClick={handlePdfDownload}
                      disabled={pdfGenerating}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-5 py-2.5 text-sm font-bold text-teal-dark shadow-gold hover:shadow-gold-hover hover:scale-[1.02] transition-all disabled:opacity-50 w-full sm:w-auto"
                    >
                      {pdfGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {locale === 'de' ? 'PDF herunterladen' : 'Скачать PDF'}
                    </button>
                    {/* PDF per Email */}
                    <button
                      onClick={handlePdfEmail}
                      disabled={pdfEmailing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-transparent px-4 py-2 text-xs font-medium text-gold hover:bg-gold/10 transition-all disabled:opacity-50 w-full sm:w-auto"
                    >
                      {pdfEmailing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      {locale === 'de' ? 'Per Email' : 'На email'}
                    </button>
                    {/* Beratung */}
                    <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} variant="outline" size="sm" className="w-full sm:w-auto">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {locale === 'de' ? 'Beratung' : 'Консультация'}
                    </CalBookingButton>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Auth CTA */}
                    <GoldButton onClick={() => setShowAuthGate(true)} size="md" className="flex-1 w-full sm:w-auto">
                      {locale === 'de' ? 'Alle Positionen + PDF freischalten' : 'Открыть все позиции + PDF'}
                    </GoldButton>
                    {/* Beratung */}
                    <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} variant="outline" size="sm" className="w-full sm:w-auto">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {locale === 'de' ? 'Beratung buchen' : 'Записаться'}
                    </CalBookingButton>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state (no result yet) */}
          {!result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center shadow-card"
            >
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-gold/5 animate-pulse-gold scale-150" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <svg className="h-8 w-8 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/70 text-sm max-w-[240px] leading-relaxed">
                {locale === 'de'
                  ? 'Gib dein Geburtsdatum ein, um deine Psychomatrix zu berechnen'
                  : 'Введи дату рождения, чтобы увидеть свою матрицу'}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-1.5 opacity-20">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-7 w-full rounded-lg border border-white/10 bg-white/5" />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {result && (
        <MatrixModal
          position={selectedPosition}
          result={result}
          locale={locale}
          isAuthenticated={isAuthenticated}
          onClose={() => setSelectedPosition(null)}
          onRequestAuth={() => {
            setSelectedPosition(null);
            setShowAuthGate(true);
          }}
        />
      )}

      <AuthGate
        isOpen={showAuthGate}
        locale={locale}
        redirectParams={redirectParams}
        onClose={() => setShowAuthGate(false)}
      />
    </div>
  );
}

export default function RechnerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    }>
      <RechnerContent />
    </Suspense>
  );
}
