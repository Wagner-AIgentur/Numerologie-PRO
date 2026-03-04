'use client';

import { getAdminT } from '@/lib/i18n/admin';
import { usePathname } from 'next/navigation';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/ru') ? 'ru' : 'de';
  const t = getAdminT(locale);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <h2 className="text-white text-lg font-medium">{t.errorTitle}</h2>
        <p className="text-white/40 text-sm">{error.message || t.errorDefault}</p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors text-sm"
        >
          {t.errorRetry}
        </button>
      </div>
    </div>
  );
}
