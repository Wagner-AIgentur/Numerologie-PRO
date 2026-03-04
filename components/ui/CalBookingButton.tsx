'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getCalApi } from '@calcom/embed-react';
import { cn } from '@/lib/utils';

interface CalBookingButtonProps {
  /** Cal.com link path, e.g. "swetlana-wagner-vn81pp/бесплатная-консультация" */
  calLink: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Pre-fill guest name */
  name?: string;
  /** Pre-fill guest email */
  email?: string;
}

const sizeClasses = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-7 py-3 text-sm',
  lg: 'px-9 py-4 text-base',
};

const variantClasses = {
  primary: [
    'bg-gold-gradient text-teal-dark font-bold uppercase tracking-wider',
    'shadow-gold hover:shadow-gold-hover hover:scale-[1.02]',
  ].join(' '),
  outline: [
    'bg-transparent border-2 border-gold text-gold font-bold uppercase tracking-wider',
    'hover:bg-gold/10 hover:scale-[1.02]',
  ].join(' '),
};

export default function CalBookingButton({
  calLink,
  children,
  variant = 'primary',
  size = 'md',
  className,
  name,
  email,
}: CalBookingButtonProps) {
  const calRef = useRef<Awaited<ReturnType<typeof getCalApi>> | null>(null);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: 'booking' });
      cal('ui', {
        theme: 'dark',
        styles: { branding: { brandColor: '#D4AF37' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
      calRef.current = cal;
    })();
  }, []);

  const handleClick = useCallback(async () => {
    let cal = calRef.current;
    if (!cal) {
      cal = await getCalApi({ namespace: 'booking' });
      calRef.current = cal;
    }
    const config: Record<string, string> = { layout: 'month_view', theme: 'dark' };
    if (name) config.name = name;
    if (email) config.email = email;
    cal('modal', { calLink, config });
  }, [calLink, name, email]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-pill transition-all duration-200 cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}

/** Extract Cal.com path from full URL, e.g. "https://cal.com/user/event" → "user/event" */
export function calPathFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return url.replace(/^https?:\/\/cal\.com\//, '');
  }
}
