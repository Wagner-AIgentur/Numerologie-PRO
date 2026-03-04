'use client';

import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { img: 32, text: 'text-base' },
  md: { img: 40, text: 'text-xl' },
  lg: { img: 48, text: 'text-2xl' },
};

export default function Logo({ size = 'md' }: LogoProps) {
  const { img, text } = sizeClasses[size];

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <div
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: img, height: img }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Logo_SwetlanaWagner_1080x1080px_weiss_Kreis.png"
          alt="Numerologie PRO"
          width={img}
          height={img}
          className="rounded-full"
        />
      </div>
      <span
        className={cn(
          'font-sans font-bold tracking-tight text-white transition-opacity duration-200 group-hover:opacity-90',
          text
        )}
      >
        Numerologie<span className="text-gold"> PRO</span>
      </span>
    </Link>
  );
}
