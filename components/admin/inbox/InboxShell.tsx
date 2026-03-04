'use client';

import { useState, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { getAdminT } from '@/lib/i18n/admin';
import InboxDetailPanel from './InboxDetailPanel';
import {
  Mail,
  MessageCircle,
  FileText,
  ShoppingBag,
  StickyNote,
  Calendar,
  TrendingUp,
  CheckCheck,
  Loader2,
  ExternalLink,
  Inbox as InboxIcon,
  Instagram,
} from 'lucide-react';

/* ---------- Types ---------- */

interface ProfileInfo {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface FeedItem {
  id: string;
  profile_id: string | null;
  activity_type: string;
  source_table: string;
  source_id: string;
  title: string;
  preview: string | null;
  is_read: boolean | null;
  requires_action: boolean | null;
  created_at: string | null;
  profiles: ProfileInfo | null;
}

interface InboxStats {
  total_unread: number;
  by_type: Record<string, number>;
}

interface Props {
  locale: string;
  initialItems: FeedItem[];
  initialTotal: number;
  initialStats: InboxStats;
}

/* ---------- Constants ---------- */

const ACTIVITY_TYPES = [
  'all',
  'email_received',
  'email_sent',
  'telegram_in',
  'telegram_out',
  'contact_form',
  'order',
  'session',
  'note',
  'deal_update',
  'instagram_dm_in',
  'instagram_dm_out',
  'instagram_lead',
] as const;

type FilterType = (typeof ACTIVITY_TYPES)[number];

const TAB_GROUPS: { key: FilterType; types: string[] }[] = [
  { key: 'all', types: [] },
  { key: 'email_received', types: ['email_received', 'email_sent'] },
  { key: 'telegram_in', types: ['telegram_in', 'telegram_out'] },
  { key: 'contact_form', types: ['contact_form'] },
  { key: 'order', types: ['order', 'session'] },
  { key: 'note', types: ['note', 'deal_update'] },
  { key: 'instagram_dm_in' as FilterType, types: ['instagram_dm_in', 'instagram_dm_out', 'instagram_lead'] },
];

function getIcon(type: string) {
  switch (type) {
    case 'email_received':
    case 'email_sent':
      return Mail;
    case 'telegram_in':
    case 'telegram_out':
      return MessageCircle;
    case 'contact_form':
      return FileText;
    case 'order':
      return ShoppingBag;
    case 'session':
      return Calendar;
    case 'note':
      return StickyNote;
    case 'deal_update':
      return TrendingUp;
    case 'instagram_dm_in':
    case 'instagram_dm_out':
    case 'instagram_lead':
      return Instagram;
    default:
      return InboxIcon;
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'email_received':
    case 'email_sent':
      return 'text-blue-400';
    case 'telegram_in':
    case 'telegram_out':
      return 'text-sky-400';
    case 'contact_form':
      return 'text-yellow-400';
    case 'order':
      return 'text-emerald-400';
    case 'session':
      return 'text-purple-400';
    case 'note':
      return 'text-orange-400';
    case 'deal_update':
      return 'text-pink-400';
    case 'instagram_dm_in':
    case 'instagram_dm_out':
    case 'instagram_lead':
      return 'text-pink-400';
    default:
      return 'text-white/40';
  }
}

/** Relative time like "vor 2h" / "2ч назад" */
function relativeTime(dateStr: string, locale: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const de = locale === 'de';

  if (seconds < 60) return de ? 'gerade eben' : 'только что';
  if (minutes < 60) return de ? `vor ${minutes}m` : `${minutes}м назад`;
  if (hours < 24) return de ? `vor ${hours}h` : `${hours}ч назад`;
  if (days < 7) return de ? `vor ${days}d` : `${days}д назад`;

  return new Date(dateStr).toLocaleDateString(de ? 'de-DE' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
}

/* ---------- Component ---------- */

export default function InboxShell({ locale, initialItems, initialTotal, initialStats }: Props) {
  const t = getAdminT(locale);
  const de = locale === 'de';

  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [total, setTotal] = useState(initialTotal);
  const [stats, setStats] = useState<InboxStats>(initialStats);
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const tabLabels: Record<FilterType, string> = {
    all: de ? 'Alle' : 'Все',
    email_received: de ? 'E-Mails' : 'E-Mail',
    email_sent: de ? 'E-Mails' : 'E-Mail',
    telegram_in: 'Telegram',
    telegram_out: 'Telegram',
    contact_form: de ? 'Kontakte' : 'Контакты',
    order: de ? 'Bestellungen' : 'Заказы',
    session: de ? 'Sitzungen' : 'Сессии',
    note: de ? 'Notizen' : 'Заметки',
    deal_update: de ? 'Deals' : 'Сделки',
    instagram_dm_in: 'Instagram',
    instagram_dm_out: 'Instagram',
    instagram_lead: 'Instagram',
  };

  /* --- Fetch items from API --- */
  const fetchItems = useCallback(
    async (type: FilterType, offset = 0, append = false, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const group = TAB_GROUPS.find((g) => g.key === type);
        const typeParam = group && group.types.length === 1 ? `&type=${group.types[0]}` : '';
        // For grouped tabs with multiple types, fetch all and filter client-side
        const url = `/api/admin/inbox?limit=50&offset=${offset}${typeParam}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();

        let fetched: FeedItem[] = json.items;
        // Client-side filter for multi-type tabs
        if (group && group.types.length > 1) {
          fetched = fetched.filter((i: FeedItem) => group.types.includes(i.activity_type));
        }

        if (append) {
          setItems((prev) => [...prev, ...fetched]);
        } else {
          setItems(fetched);
        }
        setTotal(json.total);
      } catch (err) {
        console.error('Inbox fetch error:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  /* --- Refresh stats --- */
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inbox/stats');
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch {
      // silent
    }
  }, []);

  /* --- Auto-refresh polling (10s) --- */
  useAutoRefresh(async () => {
    await fetchItems(activeTab, 0, false, true);
    await refreshStats();
  }, 10000);

  /* --- Tab change --- */
  const handleTabChange = useCallback(
    (tab: FilterType) => {
      setActiveTab(tab);
      fetchItems(tab);
    },
    [fetchItems]
  );

  /* --- Mark single as read + open detail panel --- */
  const markAsRead = useCallback(
    async (item: FeedItem) => {
      if (!item.is_read) {
        // Optimistic update
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_read: true } : i)));
        setStats((prev) => ({
          ...prev,
          total_unread: Math.max(0, prev.total_unread - 1),
          by_type: {
            ...prev.by_type,
            [item.activity_type]: Math.max(0, (prev.by_type[item.activity_type] ?? 1) - 1),
          },
        }));

        fetch(`/api/admin/inbox/${item.id}/read`, { method: 'PATCH' }).catch(() => {});
      }

      // Open detail panel instead of navigating
      setSelectedId(item.id);
    },
    []
  );

  /* --- Mark all as read --- */
  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      const group = TAB_GROUPS.find((g) => g.key === activeTab);
      const typeParam = group && group.types.length === 1 ? `?type=${group.types[0]}` : '';
      await fetch(`/api/admin/inbox/mark-all-read${typeParam}`, { method: 'POST' });

      // Optimistic update
      setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
      await refreshStats();
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setMarkingAll(false);
    }
  }, [activeTab, refreshStats]);

  /* --- Load more --- */
  const handleLoadMore = useCallback(() => {
    fetchItems(activeTab, items.length, true);
  }, [activeTab, items.length, fetchItems]);

  /* --- Filtered items for multi-type tabs --- */
  const displayItems = items;
  const hasMore = items.length < total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {de ? 'Posteingang' : 'Входящие'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {stats.total_unread > 0
              ? de
                ? `${stats.total_unread} ungelesene Nachrichten`
                : `${stats.total_unread} непрочитанных`
              : de
                ? 'Keine ungelesenen Nachrichten'
                : 'Нет непрочитанных'}
          </p>
        </div>

        {stats.total_unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <CheckCheck className="h-4 w-4" strokeWidth={1.5} />
            )}
            {de ? 'Alle gelesen' : 'Прочитать все'}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TAB_GROUPS.map(({ key }) => {
          const isActive = activeTab === key;
          // Count unread for this tab group
          const group = TAB_GROUPS.find((g) => g.key === key);
          const unreadCount =
            key === 'all'
              ? stats.total_unread
              : (group?.types ?? []).reduce((sum, t) => sum + (stats.by_type[t] ?? 0), 0);

          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tabLabels[key]}
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-bold ${
                    isActive ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feed List */}
      {displayItems.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <InboxIcon className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40">{de ? 'Keine Eintr\u00e4ge.' : 'Нет записей.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item) => {
            const Icon = getIcon(item.activity_type);
            const iconColor = getIconColor(item.activity_type);

            return (
              <button
                key={item.id}
                onClick={() => markAsRead(item)}
                className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 group ${
                  item.is_read
                    ? 'border-white/5 bg-[rgba(15,48,63,0.15)] hover:bg-[rgba(15,48,63,0.25)]'
                    : 'border-white/10 bg-[rgba(15,48,63,0.35)] hover:bg-[rgba(15,48,63,0.45)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Unread dot + Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`p-2 rounded-xl bg-white/5 ${iconColor}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    {!item.is_read && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-[#0a1a24]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm truncate ${
                          item.is_read ? 'text-white/60 font-normal' : 'text-white font-semibold'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-xs text-white/30 shrink-0">
                        {relativeTime(item.created_at ?? '', locale)}
                      </span>
                    </div>

                    {item.preview && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">{item.preview}</p>
                    )}

                    {/* Customer name */}
                    {item.profiles && (
                      <p className="text-xs text-gold/50 mt-1 truncate">
                        {item.profiles.full_name ?? item.profiles.email}
                      </p>
                    )}
                  </div>

                  {/* IONOS Reply */}
                  {(item.activity_type === 'email_received' || item.activity_type === 'email_sent') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://mail.ionos.de', 'ionos-mail', 'width=1200,height=800,left=100,top=100');
                      }}
                      className="shrink-0 mt-1 p-1.5 rounded-lg text-gold/60 hover:text-gold hover:bg-gold/10 transition-all"
                      title={de ? 'In IONOS Webmail öffnen' : 'Открыть в IONOS Webmail'}
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}

                  {/* Action indicator */}
                  {item.requires_action && (
                    <span className="shrink-0 mt-1 text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                      {de ? 'Aktion' : 'Действие'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-white/30" strokeWidth={1.5} />
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            {de ? 'Mehr laden' : 'Загрузить ещё'}
          </button>
        </div>
      )}

      {/* Detail Panel */}
      {selectedId && (
        <InboxDetailPanel
          feedId={selectedId}
          locale={locale}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
