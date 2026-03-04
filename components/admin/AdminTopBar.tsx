'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Shield, Menu } from 'lucide-react';
import { getAdminT } from '@/lib/i18n/admin';

interface Props {
  userName: string;
  locale: string;
  onMenuToggle?: () => void;
}

export default function AdminTopBar({ userName, locale, onMenuToggle }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const t = getAdminT(locale);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[rgba(5,26,36,0.7)] backdrop-blur-xl px-4 sm:px-6 py-4">
      <div className="flex items-center gap-2">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
        <Shield className="h-4 w-4 text-gold/60" strokeWidth={1.5} />
        <span className="text-xs font-medium text-gold/60 uppercase tracking-wider">{t.admin}</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Locale Switcher */}
        <div className="flex gap-0.5 rounded-lg border border-white/10 p-0.5">
          <button
            onClick={() => switchLocale('de')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
              locale === 'de' ? 'bg-gold/20 text-gold' : 'text-white/40 hover:text-white/70'
            }`}
          >
            DE
          </button>
          <button
            onClick={() => switchLocale('ru')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
              locale === 'ru' ? 'bg-gold/20 text-gold' : 'text-white/40 hover:text-white/70'
            }`}
          >
            RU
          </button>
        </div>

        <span className="text-sm text-white/60 hidden sm:block">{userName}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">{t.logout}</span>
        </button>
      </div>
    </header>
  );
}
