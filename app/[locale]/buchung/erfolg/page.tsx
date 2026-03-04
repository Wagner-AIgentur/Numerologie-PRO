'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton, { calPathFromUrl } from '@/components/ui/CalBookingButton';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import { PACKAGES, type PackageKey, FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';

const PACKAGE_NAMES: Record<string, { de: string; ru: string }> = {
  beziehungsmatrix: { de: 'Beziehungsmatrix', ru: 'Матрица отношений' },
  lebensbestimmung: { de: 'Lebensbestimmung', ru: 'Предназначение' },
  wachstumsplan: { de: 'Wachstumsplan', ru: 'План роста' },
  mein_kind: { de: 'Mein Kind', ru: 'Мой ребёнок' },
  geldkanal: { de: 'Geldkanal', ru: 'Денежный канал' },
  jahresprognose: { de: 'Jahresprognose', ru: 'Прогноз на год' },
  jahresprognose_pdf: { de: 'Jahresprognose + PDF', ru: 'Прогноз на год + PDF' },
  monatsprognose: { de: 'Monatsprognose', ru: 'Прогноз на месяц' },
  tagesprognose: { de: 'Tagesprognose', ru: 'Прогноз на день' },
  lebenskarte: { de: 'Lebenskarte', ru: 'Карта жизни' },
};

interface SessionData {
  paid: boolean;
  package_key: string;
  cal_link: string;
  customer_email: string;
  customer_name: string;
}

export default function BookingSuccessPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const de = locale === 'de';

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paid) {
          setSessionData(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <>
        <BackgroundOrbs />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      </>
    );
  }

  if (!sessionData?.paid) {
    return (
      <>
        <BackgroundOrbs />
        <div className="min-h-screen pt-32 pb-20">
          <div className="mx-auto max-w-lg px-4 text-center">
            <h1 className="font-serif text-2xl font-bold text-white">
              {de ? 'Sitzung nicht gefunden' : 'Сессия не найдена'}
            </h1>
            <p className="mt-3 text-white/60">
              {de
                ? 'Die Zahlungssitzung konnte nicht verifiziert werden.'
                : 'Платежная сессия не может быть подтверждена.'}
            </p>
            <div className="mt-8">
              <GoldButton href={`/${locale}/pakete`}>
                {de ? 'Zurück zu den Paketen' : 'Вернуться к пакетам'}
              </GoldButton>
            </div>
          </div>
        </div>
      </>
    );
  }

  const pkgNames = PACKAGE_NAMES[sessionData.package_key];
  const pkgName = pkgNames ? pkgNames[locale as keyof typeof pkgNames] : sessionData.package_key;

  // Extract Cal.com path for popup embed (fall back to generic booking link)
  const calPath = sessionData.cal_link
    ? calPathFromUrl(sessionData.cal_link)
    : FREE_CONSULTATION_CAL_PATH;

  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-4">
          {/* Success card */}
          <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.4)] backdrop-blur-sm p-8 md:p-12 text-center">
            {/* Checkmark */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
            </div>

            <h1 className="mt-6 font-serif text-2xl md:text-3xl font-bold text-white">
              {de ? 'Zahlung erfolgreich!' : 'Оплата прошла успешно!'}
            </h1>

            <p className="mt-3 text-white/60">
              {de
                ? `Vielen Dank für deinen Kauf des Pakets "${pkgName}". Buche jetzt deinen persönlichen Beratungstermin mit Swetlana.`
                : `Спасибо за покупку пакета «${pkgName}». Теперь запишись на персональную консультацию со Светланой.`}
            </p>

            {/* Cal.com booking CTA */}
            <div className="mt-8 rounded-xl border border-gold/20 bg-gold/5 p-6">
              <Calendar className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
              <h2 className="mt-3 text-lg font-semibold text-white">
                {de ? 'Termin buchen' : 'Записаться на встречу'}
              </h2>
              <p className="mt-2 text-sm text-white/50">
                {de
                  ? 'Wähle einen passenden Termin — Swetlana freut sich auf dich!'
                  : 'Выбери удобное время — Светлана ждёт тебя!'}
              </p>
              <div className="mt-5">
                <CalBookingButton
                  calLink={calPath}
                  size="md"
                  name={sessionData.customer_name}
                  email={sessionData.customer_email}
                >
                  <Calendar className="h-4 w-4 mr-2" strokeWidth={2} />
                  {de ? 'Jetzt Termin buchen' : 'Записаться сейчас'}
                </CalBookingButton>
              </div>
            </div>

            {/* Dashboard link */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <GoldButton href={`/${locale}/dashboard`} variant="outline" size="md">
                {de ? 'Zum Dashboard' : 'В личный кабинет'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </GoldButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
