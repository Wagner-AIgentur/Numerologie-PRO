'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';
import { type CookiePreferences, getStoredConsent } from '@/components/ui/CookieConsent';

const CONSENT_KEY = 'numerologie-cookie-consent';

export function AnalyticsScripts({ locale }: { locale?: string }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const yandexMetricaId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;
  const [consent, setConsent] = useState<CookiePreferences>({ analytics: false, marketing: false });

  useEffect(() => {
    // Check initial consent
    const stored = getStoredConsent();
    if (stored) setConsent(stored);

    // Listen for consent changes (fired by CookieConsent component)
    const handleConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail as CookiePreferences;
      setConsent(detail);
    };

    window.addEventListener('cookie-consent-change', handleConsent);
    return () => window.removeEventListener('cookie-consent-change', handleConsent);
  }, []);

  return (
    <>
      {/* Google Analytics 4 — only with analytics consent */}
      {consent.analytics && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}

      {/* Yandex.Metrica — only with analytics consent AND only on /ru/ locale */}
      {consent.analytics && yandexMetricaId && locale === 'ru' && (
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${yandexMetricaId}, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:false,
              trackHash:true
            });
          `}
        </Script>
      )}

      {/* Meta (Facebook) Pixel — only with marketing consent */}
      {consent.marketing && metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

// Helper to track custom events (use in client components)
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const consent = getStoredConsent();
  if (!consent) return;

  // GA4 — only if analytics consent
  if (consent.analytics && 'gtag' in window) {
    (window as any).gtag('event', eventName, params);
  }
  // Yandex.Metrica — only if analytics consent
  if (consent.analytics && 'ym' in window) {
    (window as any).ym(process.env.NEXT_PUBLIC_YANDEX_METRICA_ID, 'reachGoal', eventName, params);
  }
  // Meta Pixel — only if marketing consent
  if (consent.marketing && 'fbq' in window) {
    (window as any).fbq('trackCustom', eventName, params);
  }
}
