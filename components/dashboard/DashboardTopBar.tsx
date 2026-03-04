'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Home, Shield, Menu } from 'lucide-react';

interface Props {
  userName: string;
  locale: string;
  isAdmin?: boolean;
  onMenuToggle?: () => void;
}

export default function DashboardTopBar({ userName, locale, isAdmin, onMenuToggle }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const de = locale === 'de';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[rgba(5,26,36,0.6)] backdrop-blur-xl px-4 sm:px-6 py-4">
      {/* Left */}
      <div className="flex items-center gap-2">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">{de ? 'Zur Webseite' : 'На сайт'}</span>
        </Link>
      </div>

      {/* Right */}
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

        {isAdmin && (
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}

        <Link
          href={`/${locale}/dashboard/profil`}
          className="flex items-center gap-2 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-semibold group-hover:bg-gold/30 transition-colors">
            {initials || <User className="h-4 w-4" strokeWidth={1.5} />}
          </div>
          <span className="text-sm text-white/70 group-hover:text-white transition-colors hidden sm:block">
            {userName}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
          title={de ? 'Abmelden' : 'Выйти'}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">{de ? 'Abmelden' : 'Выйти'}</span>
        </button>
      </div>
    </header>
  );
}
