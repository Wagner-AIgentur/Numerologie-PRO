'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getStoredConsent } from '@/components/ui/CookieConsent';

// ---------------------------------------------------------------------------
// Click event types
// ---------------------------------------------------------------------------

interface ClickEvent {
  page_path: string;
  element_tag: string;
  element_text: string | null;
  element_id: string | null;
  element_href: string | null;
  section: string | null;
  x_percent: number;
  y_percent: number;
  viewport_w: number;
}

const BATCH_INTERVAL = 5000; // flush every 5 seconds
const MAX_TEXT_LENGTH = 100;

function generateSessionId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function getSection(el: HTMLElement): string | null {
  const closest = el.closest('[data-section]');
  return closest?.getAttribute('data-section') ?? null;
}

function getElementText(el: HTMLElement): string | null {
  const text =
    el.getAttribute('aria-label') ??
    el.innerText?.trim() ??
    el.getAttribute('alt') ??
    null;
  if (!text) return null;
  return text.slice(0, MAX_TEXT_LENGTH);
}

function getHref(el: HTMLElement): string | null {
  const anchor = el.closest('a');
  return anchor?.getAttribute('href') ?? null;
}

// ---------------------------------------------------------------------------
// UTM parameter extraction
// ---------------------------------------------------------------------------

function getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  if (source) result.utm_source = source;
  if (medium) result.utm_medium = medium;
  if (campaign) result.utm_campaign = campaign;
  return result;
}

// ---------------------------------------------------------------------------
// Send helper (beacon with fetch fallback)
// ---------------------------------------------------------------------------

function sendPayload(url: string, data: unknown) {
  const payload = JSON.stringify(data);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, payload);
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClickTracker() {
  const buffer = useRef<ClickEvent[]>([]);
  const sessionId = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pageViewCount = useRef(0);
  const pageLoadTime = useRef(0);
  const lastPagePath = useRef('');

  // Flush click events
  const flush = useCallback(() => {
    if (buffer.current.length === 0) return;

    const consent = getStoredConsent();
    if (!consent?.analytics) {
      buffer.current = [];
      return;
    }

    const events = buffer.current;
    buffer.current = [];

    sendPayload('/api/track/clicks', {
      session_id: sessionId.current,
      events,
    });
  }, []);

  // Send duration update for current page
  const sendDuration = useCallback(() => {
    if (!lastPagePath.current || !pageLoadTime.current) return;

    const consent = getStoredConsent();
    if (!consent?.analytics) return;

    const duration = Date.now() - pageLoadTime.current;
    if (duration < 1000) return; // ignore sub-second visits

    sendPayload('/api/track/pageview', {
      type: 'duration',
      session_id: sessionId.current,
      page_path: lastPagePath.current,
      duration_ms: Math.min(duration, 3600000),
    });
  }, []);

  // Send page view event
  const trackPageView = useCallback(() => {
    const consent = getStoredConsent();
    if (!consent?.analytics) return;

    if (window.location.pathname.includes('/admin')) return;

    const pagePath = window.location.pathname;

    // Avoid duplicate tracking for same path
    if (pagePath === lastPagePath.current) return;

    // Send duration for previous page before tracking new one
    if (lastPagePath.current) {
      sendDuration();
    }

    lastPagePath.current = pagePath;
    pageLoadTime.current = Date.now();
    pageViewCount.current += 1;

    const utm = getUTMParams();

    sendPayload('/api/track/pageview', {
      type: 'view',
      session_id: sessionId.current,
      page_path: pagePath,
      referrer: document.referrer || undefined,
      ...utm,
      screen_w: window.screen?.width,
      screen_h: window.screen?.height,
      viewport_w: window.innerWidth,
      language: navigator.language?.slice(0, 10),
    });
  }, [sendDuration]);

  useEffect(() => {
    sessionId.current = generateSessionId();

    // Track initial page view
    trackPageView();

    // Click handler
    const handleClick = (e: MouseEvent) => {
      const consent = getStoredConsent();
      if (!consent?.analytics) return;

      const target = e.target as HTMLElement;
      if (!target?.tagName) return;

      if (window.location.pathname.includes('/admin')) return;

      const pageHeight = document.documentElement.scrollHeight;
      const absoluteY = e.pageY;

      const event: ClickEvent = {
        page_path: window.location.pathname,
        element_tag: target.tagName.toLowerCase(),
        element_text: getElementText(target),
        element_id: target.id || null,
        element_href: getHref(target),
        section: getSection(target),
        x_percent: Math.round((e.clientX / window.innerWidth) * 100),
        y_percent: pageHeight > 0 ? Math.round((absoluteY / pageHeight) * 100) : 0,
        viewport_w: window.innerWidth,
      };

      buffer.current.push(event);
    };

    document.addEventListener('click', handleClick, { passive: true });

    // Periodic click flush
    timerRef.current = setInterval(flush, BATCH_INTERVAL);

    // Track SPA navigation (Next.js App Router uses popstate for back/forward)
    const handlePopState = () => {
      trackPageView();
    };
    window.addEventListener('popstate', handlePopState);

    // Observe URL changes for client-side navigation (pushState)
    const originalPushState = history.pushState.bind(history);
    history.pushState = function (...args) {
      originalPushState(...args);
      // Delay to let React update pathname
      setTimeout(() => trackPageView(), 50);
    };

    // Flush on page hide/leave
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush();
        sendDuration();
      }
    };
    const handleBeforeUnload = () => {
      flush();
      sendDuration();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      if (timerRef.current) clearInterval(timerRef.current);
      flush();
      sendDuration();
    };
  }, [flush, sendDuration, trackPageView]);

  return null; // Invisible tracking component
}
