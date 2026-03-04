'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar, MessageCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  content_posts: {
    id: string;
    title: string;
    status: string;
    funnel_stage: string;
    content_type: string;
    manychat_enabled: boolean;
    manychat_keyword: string | null;
    target_platforms: string[];
  };
}

const funnelColors: Record<string, string> = {
  tofu: 'bg-blue-500/80 border-blue-400',
  mofu: 'bg-orange-500/80 border-orange-400',
  bofu: 'bg-gold/80 border-gold',
  retention: 'bg-emerald-500/80 border-emerald-400',
};

const funnelBg: Record<string, string> = {
  tofu: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  mofu: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
  bofu: 'bg-gold/10 border-gold/20 text-gold',
  retention: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
};

interface Props {
  locale: string;
  t: Record<string, string>;
}

export default function ContentCalendarShell({ locale, t }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const from = new Date(year, month, 1).toISOString().split('T')[0];
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const res = await fetch(`/api/admin/content/calendar?from=${from}&to=${to}`);
    const data = await res.json();
    setEvents(data.events ?? []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function navigate(dir: -1 | 1) {
    setCurrentDate(new Date(year, month + dir, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Calculate funnel stats for current view
  const funnelStats = {
    tofu: events.filter((e) => e.content_posts?.funnel_stage === 'tofu').length,
    mofu: events.filter((e) => e.content_posts?.funnel_stage === 'mofu').length,
    bofu: events.filter((e) => e.content_posts?.funnel_stage === 'bofu').length,
    retention: events.filter((e) => e.content_posts?.funnel_stage === 'retention').length,
  };

  // Month view helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const dayNames = locale === 'ru'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const monthNames = locale === 'ru'
    ? ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    : ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  function getEventsForDay(day: number): CalendarEvent[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.scheduled_date === dateStr);
  }

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/5">
            <ChevronLeft className="h-4 w-4 text-white/50" />
          </button>
          <h2 className="text-lg font-medium text-white">
            {monthNames[month]} {year}
          </h2>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-white/5">
            <ChevronRight className="h-4 w-4 text-white/50" />
          </button>
          <button onClick={goToday} className="text-xs text-gold hover:text-gold/80 transition-colors ml-2">
            {t.csToday}
          </button>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setView('month')}
            className={cn('px-3 py-1 rounded text-xs transition-colors', view === 'month' ? 'bg-gold/10 text-gold' : 'text-white/40')}
          >
            {t.csCalendarMonth}
          </button>
          <button
            onClick={() => setView('week')}
            className={cn('px-3 py-1 rounded text-xs transition-colors', view === 'week' ? 'bg-gold/10 text-gold' : 'text-white/40')}
          >
            {t.csCalendarWeek}
          </button>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-white/30">{t.csFunnelBalance}:</span>
        <span className="text-blue-400">TOFU: {funnelStats.tofu}</span>
        <span className="text-orange-400">MOFU: {funnelStats.mofu}</span>
        <span className="text-gold">BOFU: {funnelStats.bofu}</span>
        <span className="text-emerald-400">Ret: {funnelStats.retention}</span>
        {funnelStats.bofu === 0 && events.length > 3 && (
          <span className="text-red-400/60">
            {t.csFunnelBalanceWarning?.replace('{stage}', 'BOFU') ?? 'Mehr BOFU-Content erstellen!'}
          </span>
        )}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {dayNames.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-medium text-white/30 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-white/5 bg-white/[0.01]" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);

              return (
                <div
                  key={day}
                  className={cn(
                    'min-h-[80px] border-b border-r border-white/5 p-1',
                    isToday(day) && 'bg-gold/[0.03]',
                  )}
                >
                  <div className={cn(
                    'text-xs mb-1 px-1',
                    isToday(day) ? 'text-gold font-bold' : 'text-white/30',
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded truncate border-l-2',
                          funnelBg[event.content_posts?.funnel_stage ?? 'tofu'],
                        )}
                        title={event.content_posts?.title}
                      >
                        <span className="flex items-center gap-1">
                          {event.content_posts?.title?.substring(0, 20)}
                          {event.content_posts?.manychat_enabled && (
                            <MessageCircle className="h-2.5 w-2.5 shrink-0" />
                          )}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-white/20 px-1">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
