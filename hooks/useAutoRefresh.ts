'use client';

import { useEffect, useRef } from 'react';

/**
 * Reusable polling hook for admin components.
 * Calls fetchFn at a regular interval and pauses when the tab is not visible.
 */
export function useAutoRefresh(
  fetchFn: () => Promise<void> | void,
  intervalMs: number = 10000,
  enabled: boolean = true
) {
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (!timer) {
        timer = setInterval(() => fnRef.current(), intervalMs);
      }
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        // Fetch immediately when tab becomes visible again
        fnRef.current();
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs, enabled]);
}
