'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  FileDown,
  User,
  Gift,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface Props {
  locale: string;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ locale, mobileOpen, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const de = locale === 'de';

  const navItems = [
    { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: de ? 'Übersicht' : 'Обзор' },
    { href: `/${locale}/dashboard/bestellungen`, icon: ShoppingBag, label: de ? 'Bestellungen' : 'Заказы' },
    { href: `/${locale}/dashboard/sitzungen`, icon: Calendar, label: de ? 'Sitzungen' : 'Сессии' },
    { href: `/${locale}/dashboard/unterlagen`, icon: FileDown, label: de ? 'Unterlagen' : 'Материалы' },
    { href: `/${locale}/dashboard/empfehlungen`, icon: Gift, label: de ? 'Empfehlungen' : 'Рекомендации' },
    { href: `/${locale}/dashboard/profil`, icon: User, label: de ? 'Profil' : 'Профиль' },
  ];

  const sidebarContent = (
    <>
      <div className={cn('flex items-center p-5 border-b border-white/10', collapsed && !mobileOpen && 'justify-center px-3')}>
        {(!collapsed || mobileOpen) ? (
          <div className="flex items-center justify-between w-full">
            <Link href="/"><Logo size="sm" /></Link>
            {mobileOpen && onClose && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ) : null}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
                collapsed && !mobileOpen && 'justify-center px-2'
              )}
              title={collapsed && !mobileOpen ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!mobileOpen && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full',
              collapsed && 'justify-center'
            )}
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              : <><ChevronLeft className="h-4 w-4" strokeWidth={1.5} /><span>{de ? 'Einklappen' : 'Свернуть'}</span></>
            }
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-white/10 bg-[rgba(5,26,36,0.8)] backdrop-blur-xl transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-72 flex flex-col bg-[rgba(5,26,36,0.98)] backdrop-blur-xl z-50 lg:hidden border-r border-white/10">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
