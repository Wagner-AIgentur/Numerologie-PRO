'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';
import { getAdminT } from '@/lib/i18n/admin';
import {
  LayoutDashboard,
  BarChart2,
  Users,
  MessageSquare,
  ShoppingBag,
  Calendar,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Columns3,
  UserPlus,
  Mail,
  CalendarDays,
  Megaphone,
  Sparkles,
  Bot,
  X,
  Zap,
  Tag,
  CheckSquare,
  Inbox,
  TrendingUp,
  Workflow,
  Settings,
  Shield,
  Instagram,
  Users2,
  Brain,
  Library,
  Phone,
} from 'lucide-react';

interface Props {
  locale: string;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ locale, mobileOpen, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const t = getAdminT(locale);

  const navItems = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: t.dashboard },
    { href: `/${locale}/admin/inbox`, icon: Inbox, label: t.inbox },
    { href: `/${locale}/admin/analytics`, icon: BarChart2, label: t.analytics },
    { href: `/${locale}/admin/pipeline`, icon: Columns3, label: t.pipeline },
    { href: `/${locale}/admin/deals`, icon: TrendingUp, label: t.deals },
    { href: `/${locale}/admin/kunden`, icon: Users, label: t.customers },
    { href: `/${locale}/admin/leads`, icon: UserPlus, label: t.leads },
    { href: `/${locale}/admin/kontakte`, icon: MessageSquare, label: t.contacts },
    { href: `/${locale}/admin/bestellungen`, icon: ShoppingBag, label: t.orders },
    { href: `/${locale}/admin/sitzungen`, icon: Calendar, label: t.sessions },
    { href: `/${locale}/admin/kalender`, icon: CalendarDays, label: t.calendar },
    { href: `/${locale}/admin/content`, icon: Sparkles, label: t.contentStudio },
    { href: `/${locale}/admin/sequenzen`, icon: Zap, label: t.sequences },
    { href: `/${locale}/admin/tags`, icon: Tag, label: t.tagRules },
    { href: `/${locale}/admin/automatisierung`, icon: Workflow, label: t.automations },
    { href: `/${locale}/admin/aufgaben`, icon: CheckSquare, label: t.tasks },
    { href: `/${locale}/admin/bot-builder`, icon: Bot, label: t.botBuilder },
    { href: `/${locale}/admin/instagram`, icon: Instagram, label: t.instagram },
    { href: `/${locale}/admin/ai-prompts`, icon: Brain, label: t.aiPrompts },
    { href: `/${locale}/admin/wissensbasis`, icon: Library, label: t.knowledgeBase ?? 'Wissensbasis' },
    { href: `/${locale}/admin/voice-agent`, icon: Phone, label: t.voiceAgent ?? 'Voice Agent' },
    { href: `/${locale}/admin/custom-fields`, icon: Settings, label: t.customFields },
    { href: `/${locale}/admin/team`, icon: Shield, label: t.team },
    { href: `/${locale}/admin/emails`, icon: Mail, label: t.emailLog },
    { href: `/${locale}/admin/gutscheine`, icon: Ticket, label: t.coupons },
    { href: `/${locale}/admin/affiliates`, icon: Users2, label: t.affiliates },
  ];

  const sidebarContent = (
    <>
      <div className={cn('flex items-center p-5 border-b border-white/10', collapsed && !mobileOpen && 'justify-center px-3')}>
        {(!collapsed || mobileOpen) ? (
          <div className="flex items-center justify-between w-full">
            <div>
              <Link href="/"><Logo size="sm" /></Link>
              <p className="text-xs text-gold/60 mt-1 font-medium">{t.adminPanel}</p>
            </div>
            {mobileOpen && onClose && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ) : null}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== `/${locale}/admin` && pathname.startsWith(href));
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

      <div className="p-3 border-t border-white/10">
        <Link
          href={`/${locale}/dashboard`}
          onClick={onClose}
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all mb-2',
            collapsed && !mobileOpen && 'justify-center'
          )}
        >
          {(!collapsed || mobileOpen) && t.customerDashboard}
        </Link>
        {!mobileOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full',
              collapsed && 'justify-center'
            )}
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              : <><ChevronLeft className="h-4 w-4" strokeWidth={1.5} /><span>{t.collapse}</span></>
            }
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-white/10 bg-[rgba(5,26,36,0.9)] backdrop-blur-xl transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay + Sidebar */}
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
