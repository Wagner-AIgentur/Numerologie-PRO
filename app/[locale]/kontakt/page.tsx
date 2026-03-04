'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { Mail, Phone, Calendar, Send, CheckCircle2 } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton from '@/components/ui/CalBookingButton';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import { FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';

export default function KontaktPage() {
  const t = useTranslations('kontakt');
  const router = useRouter();
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const locale = useLocale();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState === 'sending' || !acceptedPrivacy) return;
    setFormState('sending');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language: locale }),
      });
      if (res.ok) {
        router.push('/kontakt/danke');
      } else {
        const body = await res.json().catch(() => null);
        if (res.status === 400 && body?.errors) {
          const fields = body.errors.map((e: { path?: string[] }) => e.path?.[0]).filter(Boolean);
          setErrorDetail(fields.join(', '));
        } else {
          setErrorDetail(null);
        }
        setFormState('error');
      }
    } catch {
      setErrorDetail(null);
      setFormState('error');
    }
  };

  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-white">
              {t('title')}
            </h1>
            <p className="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form - 3 columns */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  {t('formTitle')}
                </h2>

                {formState === 'sent' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-gold" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Nachricht gesendet!
                    </h3>
                    <p className="text-white/60 text-sm">
                      Ich melde mich innerhalb von 24 Stunden bei dir.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1.5">
                        {t('name')}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder={t('namePlaceholder')}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
                        {t('email')}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1.5">
                        {t('phone')}
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                    </div>

                    {/* Topic */}
                    <div>
                      <label htmlFor="topic" className="block text-sm font-medium text-white/80 mb-1.5">
                        {t('topic')}
                      </label>
                      <select
                        id="topic"
                        name="topic"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors appearance-none"
                      >
                        <option value="" disabled className="bg-teal-dark text-white/50">
                          {t('topicPlaceholder')}
                        </option>
                        <option value="beziehungsmatrix" className="bg-teal-dark">
                          {t('topicBeziehungsmatrix')}
                        </option>
                        <option value="lebensbestimmung" className="bg-teal-dark">
                          {t('topicLebensbestimmung')}
                        </option>
                        <option value="wachstumsplan" className="bg-teal-dark">
                          {t('topicWachstumsplan')}
                        </option>
                        <option value="mein_kind" className="bg-teal-dark">
                          {t('topicMeinKind')}
                        </option>
                        <option value="geldkanal" className="bg-teal-dark">
                          {t('topicGeldkanal')}
                        </option>
                        <option value="jahresprognose" className="bg-teal-dark">
                          {t('topicJahresprognose')}
                        </option>
                        <option value="lebenskarte" className="bg-teal-dark">
                          {t('topicLebenskarte')}
                        </option>
                        <option value="pdf_analyse" className="bg-teal-dark">
                          {t('topicPdfAnalyse')}
                        </option>
                        <option value="free_consultation" className="bg-teal-dark">
                          {t('topicFreeConsultation')}
                        </option>
                        <option value="other" className="bg-teal-dark">
                          {t('topicOther')}
                        </option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-1.5">
                        {t('message')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        minLength={10}
                        rows={5}
                        placeholder={t('messagePlaceholder')}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
                      />
                    </div>

                    {/* DSGVO Consent Checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/30 accent-[#D4AF37]"
                      />
                      <label htmlFor="privacy" className="text-xs text-white/60 leading-relaxed">
                        {locale === 'de'
                          ? <>Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                              <a href={`/${locale}/datenschutz`} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">
                                Datenschutzerklärung
                              </a>{' '}zu. Meine Daten werden ausschließlich zur Bearbeitung meiner Anfrage verwendet.</>
                          : <>Я согласен(-на) на обработку моих данных в соответствии с{' '}
                              <a href={`/${locale}/datenschutz`} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">
                                политикой конфиденциальности
                              </a>. Мои данные используются исключительно для обработки моего запроса.</>
                        }
                      </label>
                    </div>

                    {formState === 'error' && (
                      <p className="text-red-400 text-sm">
                        {errorDetail
                          ? (locale === 'de'
                            ? `Bitte prüfe folgende Felder: ${errorDetail}`
                            : `Пожалуйста, проверьте поля: ${errorDetail}`)
                          : (locale === 'de'
                            ? 'Es gab einen Fehler. Bitte versuche es erneut oder schreibe an info@numerologie-pro.com'
                            : 'Произошла ошибка. Попробуйте снова или напишите на info@numerologie-pro.com')}
                      </p>
                    )}

                    {/* Submit */}
                    <GoldButton type="submit" className="w-full" disabled={formState === 'sending' || !acceptedPrivacy}>
                      <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      {formState === 'sending' ? '...' : t('send')}
                    </GoldButton>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right sidebar - 2 columns */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Direct Contact */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t('directContact')}
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/50 mb-1">{t('orEmail')}</p>
                    <a
                      href="mailto:info@numerologie-pro.com"
                      className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
                    >
                      <Mail className="h-4 w-4" strokeWidth={1.5} />
                      <span className="text-sm">info@numerologie-pro.com</span>
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-white/50 mb-1">{t('orCall')}</p>
                    <a
                      href="tel:+4915151668273"
                      className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
                    >
                      <Phone className="h-4 w-4" strokeWidth={1.5} />
                      <span className="text-sm">+49 1515 1668273</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Free Consultation Booking */}
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-gold/20 bg-gold/10 mb-4">
                  <Calendar className="h-6 w-6 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('bookingTitle')}
                </h3>
                <p className="text-sm text-white/60 mb-5">
                  {t('bookingDesc')}
                </p>
                <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} size="md" className="w-full">
                  {t('bookingButton')}
                </CalBookingButton>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
