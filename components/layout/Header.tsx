'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';
import { Menu, X, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';
import GoldButton from '@/components/ui/GoldButton';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/rechner', key: 'calculator' },
  { href: '/pakete', key: 'packages' },
  { href: '/ueber-mich', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/zertifikate', key: 'certificates' },
  { href: '/kontakt', key: 'contact' },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const switchLocale = (newLocale: 'de' | 'ru') => {
    router.replace(pathname, { locale: newLocale });
  };

  // Hide main header on dashboard and admin routes (they have their own navigation)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-header">
      <nav
        className={cn(
          'mx-auto max-w-[1400px] rounded-2xl px-5 py-3',
          'bg-[rgba(5,26,36,0.85)] backdrop-blur-[20px]',
          'border border-white/10',
          'shadow-lg shadow-black/20'
        )}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  'text-sm font-medium whitespace-nowrap transition-colors duration-200',
                  pathname === link.href
                    ? 'text-gold'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Right Side: Language Switcher + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-sm" role="group" aria-label={locale === 'de' ? 'Sprache wählen' : 'Выбрать язык'}>
              <button
                onClick={() => switchLocale('de')}
                className={cn(
                  'px-2 py-1 rounded transition-colors duration-200',
                  locale === 'de'
                    ? 'text-gold font-semibold'
                    : 'text-white/50 hover:text-white/80'
                )}
                aria-label="Deutsch"
                aria-current={locale === 'de' ? 'true' : undefined}
              >
                DE
              </button>
              <span className="text-white/30" aria-hidden="true">|</span>
              <button
                onClick={() => switchLocale('ru')}
                className={cn(
                  'px-2 py-1 rounded transition-colors duration-200',
                  locale === 'ru'
                    ? 'text-gold font-semibold'
                    : 'text-white/50 hover:text-white/80'
                )}
                aria-label="Русский"
                aria-current={locale === 'ru' ? 'true' : undefined}
              >
                RU
              </button>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm font-medium text-gold hover:bg-gold/10 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
                  {locale === 'de' ? 'Mein Bereich' : 'Кабинет'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/40 hover:text-white/70 transition-colors"
                  title={locale === 'de' ? 'Abmelden' : 'Выйти'}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium whitespace-nowrap text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  {locale === 'de' ? 'Anmelden' : 'Войти'}
                </Link>
                <GoldButton href="/auth/register" size="sm" className="whitespace-nowrap">
                  {locale === 'de' ? 'Konto erstellen' : 'Регистрация'}
                </GoldButton>
              </div>
            )}
          </div>

          {/* Mobile: Login/Dashboard + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <Link
                href="/dashboard"
                className="p-2 text-gold hover:text-gold/80 transition-colors"
                aria-label={locale === 'de' ? 'Mein Bereich' : 'Кабинет'}
              >
                <LayoutDashboard size={22} strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="p-2 text-gold hover:text-gold/80 transition-colors"
                aria-label={locale === 'de' ? 'Anmelden' : 'Войти'}
              >
                <UserCircle size={22} strokeWidth={1.5} />
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label={mobileOpen ? (locale === 'de' ? 'Menü schließen' : 'Закрыть меню') : (locale === 'de' ? 'Menü öffnen' : 'Открыть меню')}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          id="mobile-nav"
          role="navigation"
          aria-label={locale === 'de' ? 'Mobile Navigation' : 'Мобильная навигация'}
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileOpen ? 'max-h-[80vh] mt-4 pb-4 overflow-y-auto' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-sm font-medium py-2 transition-colors duration-200',
                  pathname === link.href
                    ? 'text-gold'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex items-center gap-2 py-2 text-sm" role="group" aria-label={locale === 'de' ? 'Sprache wählen' : 'Выбрать язык'}>
              <button
                onClick={() => {
                  switchLocale('de');
                  setMobileOpen(false);
                }}
                className={cn(
                  'px-3 py-1 rounded transition-colors duration-200',
                  locale === 'de'
                    ? 'text-gold font-semibold'
                    : 'text-white/50 hover:text-white/80'
                )}
                aria-label="Deutsch"
                aria-current={locale === 'de' ? 'true' : undefined}
              >
                DE
              </button>
              <span className="text-white/30" aria-hidden="true">|</span>
              <button
                onClick={() => {
                  switchLocale('ru');
                  setMobileOpen(false);
                }}
                className={cn(
                  'px-3 py-1 rounded transition-colors duration-200',
                  locale === 'ru'
                    ? 'text-gold font-semibold'
                    : 'text-white/50 hover:text-white/80'
                )}
                aria-label="Русский"
                aria-current={locale === 'ru' ? 'true' : undefined}
              >
                RU
              </button>
            </div>

            {/* Mobile Auth */}
            {user ? (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm font-medium text-gold"
                >
                  <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
                  {locale === 'de' ? 'Mein Bereich' : 'Кабинет'}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white/80"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  {locale === 'de' ? 'Abmelden' : 'Выйти'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-white/70 border border-white/10 rounded-xl hover:bg-white/5"
                >
                  {locale === 'de' ? 'Anmelden' : 'Войти'}
                </Link>
                <GoldButton href="/auth/register" size="sm" className="w-full">
                  {locale === 'de' ? 'Konto erstellen' : 'Регистрация'}
                </GoldButton>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
