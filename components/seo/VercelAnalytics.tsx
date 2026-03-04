'use client';

import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { type CookiePreferences, getStoredConsent } from '@/components/ui/CookieConsent';

const CONSENT_KEY = 'numerologie-cookie-consent';

export default function VercelAnalytics() {
  const [consent, setConsent] = useState<CookiePreferences>({ analytics: false, marketing: false });

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) setConsent(stored);

    const handleConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail as CookiePreferences;
      setConsent(detail);
    };

    window.addEventListener('cookie-consent-change', handleConsent);
    return () => window.removeEventListener('cookie-consent-change', handleConsent);
  }, []);

  if (!consent.analytics) return null;

  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
