'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';

const CONSENT_KEY = 'numerologie-cookie-consent';

export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

/** Parse stored consent — backward-compatible with old 'all'/'essential' values */
export function getStoredConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return null;

  // Backward compatibility
  if (stored === 'all') return { analytics: true, marketing: true };
  if (stored === 'essential') return { analytics: false, marketing: false };

  try {
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const t = useTranslations('cookie');
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({ analytics: false, marketing: false });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = (preferences: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    setVisible(false);

    // Notify Analytics component
    window.dispatchEvent(
      new CustomEvent('cookie-consent-change', { detail: preferences })
    );
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const acceptEssential = () => save({ analytics: false, marketing: false });
  const saveSelection = () => save(prefs);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-cookie p-4 sm:p-6"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-gold/20 bg-[rgba(5,26,36,0.95)] backdrop-blur-xl shadow-card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                <Cookie className="h-5 w-5 text-gold" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {t('title')}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed mb-3">
                  {t('description')}{' '}
                  <a
                    href={`/${locale}/datenschutz`}
                    className="text-gold/80 hover:text-gold underline transition-colors"
                  >
                    {t('privacyLink')}
                  </a>
                </p>

                {/* Details toggle */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white/70 transition-colors mb-3"
                >
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {t('customize')}
                </button>

                {/* Granular options */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="space-y-2 border border-white/10 rounded-xl p-3">
                        {/* Essential — always on */}
                        <label className="flex items-center gap-3 cursor-default">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="h-4 w-4 rounded border-white/20 accent-[#D4AF37] opacity-60"
                          />
                          <div>
                            <span className="text-xs font-medium text-white/90">{t('catEssential')}</span>
                            <p className="text-[10px] text-white/40">{t('catEssentialDesc')}</p>
                          </div>
                        </label>

                        {/* Analytics */}
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.analytics}
                            onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#D4AF37]"
                          />
                          <div>
                            <span className="text-xs font-medium text-white/90">{t('catAnalytics')}</span>
                            <p className="text-[10px] text-white/40">{t('catAnalyticsDesc')}</p>
                          </div>
                        </label>

                        {/* Marketing */}
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.marketing}
                            onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#D4AF37]"
                          />
                          <div>
                            <span className="text-xs font-medium text-white/90">{t('catMarketing')}</span>
                            <p className="text-[10px] text-white/40">{t('catMarketingDesc')}</p>
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons — DSGVO: Ablehnen gleichwertig zu Akzeptieren (BGH 2025, EDPB) */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center justify-center rounded-pill border border-gold/40 bg-gold/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/20 active:scale-[0.98] transition-all duration-200"
                  >
                    {t('acceptAll')}
                  </button>
                  {showDetails ? (
                    <button
                      onClick={saveSelection}
                      className="inline-flex items-center justify-center rounded-pill border border-gold/40 bg-gold/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/20 active:scale-[0.98] transition-all duration-200"
                    >
                      {t('saveSelection')}
                    </button>
                  ) : (
                    <button
                      onClick={acceptEssential}
                      className="inline-flex items-center justify-center rounded-pill border border-gold/40 bg-gold/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/20 active:scale-[0.98] transition-all duration-200"
                    >
                      {t('essentialOnly')}
                    </button>
                  )}
                </div>
              </div>

              {/* Close = essential only */}
              <button
                onClick={acceptEssential}
                className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
