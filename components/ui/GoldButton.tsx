'use client';

import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';

interface GoldButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  pulse?: boolean;
  disabled?: boolean;
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

export default function GoldButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  pulse = false,
  disabled = false,
}: GoldButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-pill transition-colors transition-transform duration-200 cursor-pointer select-none',
    variantClasses[variant],
    sizeClasses[size],
    pulse && variant === 'primary' && 'btn-pulse-glow',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      {children}
    </button>
  );
}
