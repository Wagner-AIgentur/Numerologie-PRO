'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, CalendarDays, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAdminT, getDateLocale } from '@/lib/i18n/admin';
import type { CalendarItem, CalendarItemType } from '@/app/[locale]/admin/kalender/page';

/* ── Types ── */
type ViewMode = 'today' | 'week' | 'month';
type T = ReturnType<typeof getAdminT>;

interface Props {
  items: CalendarItem[];
  locale: string;
}

/* ── Constants ── */
const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const TYPE_COLORS: Record<CalendarItemType, { dot: string; stripe: string; bg: string; text: string; badge: string }> = {
  paid: {
    dot: 'bg-gold',
    stripe: 'bg-gold',
    bg: 'bg-gold/10',
    text: 'text-gold',
    badge: 'bg-gold/10 text-gold border border-gold/20',
  },
  free: {
    dot: 'bg-purple-400',
    stripe: 'bg-purple-400',
    bg: 'bg-purple-400/10',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border border-purple-400/20',
  },
  personal: {
    dot: 'bg-white/40',
    stripe: 'bg-white/20',
    bg: 'bg-white/5',
    text: 'text-white/50',
    badge: 'bg-white/5 text-white/50 border border-white/10',
  },
};

/* ── Helpers ── */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getGridStart(monthStart: Date): Date {
  const day = monthStart.getDay();
  const offset = day === 0 ? 6 : day - 1;
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - offset);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildItemsByDay(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const d = new Date(item.start);
    const key = dayKey(d);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

/* ── Sub-components ── */

function TypeBadge({ type, t }: { type: CalendarItemType; t: T }) {
  const colors = TYPE_COLORS[type];
  const label = type === 'paid' ? t.paidSession : type === 'free' ? t.freeSession : t.personalEvent;
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', colors.badge)}>
      {label}
    </span>
  );
}

function AppointmentCard({ item, t, expanded = false }: { item: CalendarItem; t: T; expanded?: boolean }) {
  const colors = TYPE_COLORS[item.type];
  return (
    <div className={cn(
      'flex gap-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-colors',
      expanded ? 'p-4' : 'p-3'
    )}>
      <div className={cn('shrink-0 w-1 rounded-full', colors.stripe)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className={cn('font-medium text-white', expanded ? 'text-base' : 'text-sm')}>
            {item.title}
          </p>
          <TypeBadge type={item.type} t={t} />
        </div>

        <div className="flex items-center gap-3 text-xs text-white/40">
          {!item.allDay ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.5} />
              {formatTime(item.start)}
              {item.end && ` – ${formatTime(item.end)}`}
            </span>
          ) : (
            <span>{t.allDayEvent}</span>
          )}
          {item.durationMinutes && (
            <span>{item.durationMinutes} {t.minutesShort}</span>
          )}
        </div>

        {expanded && (
          <>
            {item.packageType && (
              <p className="text-xs text-white/30 mt-1.5">{item.packageType}</p>
            )}
            {item.platform && (
              <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1">
                <Video className="h-3 w-3" strokeWidth={1.5} />
                {item.platform}
              </p>
            )}
            {item.description && (
              <p className="text-xs text-white/25 mt-2 line-clamp-2 whitespace-pre-line">{item.description}</p>
            )}
            {item.location && (
              <span className="flex items-center gap-1 text-xs text-white/30 mt-1">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                {item.location}
              </span>
            )}
          </>
        )}

        {item.meetingLink && (
          <a
            href={item.meetingLink}
            target="_blank"
            rel="noopener"
            className="text-xs text-gold/70 hover:text-gold transition-colors mt-2 inline-block"
          >
            {t.joinMeetingShort}
          </a>
        )}
      </div>
    </div>
  );
}

function StatsBar({ items, t }: { items: CalendarItem[]; t: T }) {
  const todayItems = items.filter((i) => isToday(new Date(i.start)));
  const paidToday = todayItems.filter((i) => i.type === 'paid').length;
  const freeToday = todayItems.filter((i) => i.type === 'free').length;
  const personalToday = todayItems.filter((i) => i.type === 'personal').length;

  return (
    <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
      <span className="font-semibold text-white text-base">
        {todayItems.length} {t.appointmentsToday}
      </span>
      {paidToday > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold" />
          {paidToday} {t.paidCount}
        </span>
      )}
      {freeToday > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          {freeToday} {t.freeCount}
        </span>
      )}
      {personalToday > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/40" />
          {personalToday} {t.personalCount}
        </span>
      )}
    </div>
  );
}

/* ── Today View ── */
function TodayView({ items, t }: { items: CalendarItem[]; t: T }) {
  const todayItems = items
    .filter((i) => isToday(new Date(i.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (todayItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
        <CalendarDays className="h-10 w-10 text-white/10 mx-auto mb-3" strokeWidth={1} />
        <p className="text-white/30 text-sm">{t.noAppointmentsToday}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todayItems.map((item) => (
        <AppointmentCard key={item.id} item={item} t={t} expanded />
      ))}
    </div>
  );
}

/* ── Week View ── */
function WeekView({
  items,
  weekStart,
  onPrev,
  onNext,
  t,
  locale,
}: {
  items: CalendarItem[];
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  t: T;
  locale: string;
}) {
  const WEEKDAYS = locale === 'ru' ? WEEKDAYS_RU : WEEKDAYS_DE;
  const dateLocale = getDateLocale(locale);
  const itemsByDay = useMemo(() => buildItemsByDay(items), [items]);

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
  );

  const weekEnd = weekDays[6];
  const weekLabel = `${weekStart.getDate()}. ${weekStart.toLocaleDateString(dateLocale, { month: 'short' })} – ${weekEnd.getDate()}. ${weekEnd.toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })}`;

  const hasAnyItems = weekDays.some((d) => (itemsByDay.get(dayKey(d)) ?? []).length > 0);

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <span className="text-sm font-medium text-white">{weekLabel}</span>
        <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {!hasAnyItems ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <CalendarDays className="h-10 w-10 text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/30 text-sm">{t.noAppointmentsThisWeek}</p>
        </div>
      ) : (
        <>
          {/* Desktop: 7-column grid */}
          <div className="hidden md:grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const key = dayKey(day);
              const dayItems = (itemsByDay.get(key) ?? []).sort(
                (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
              );
              const today = isToday(day);
              return (
                <div key={key} className="space-y-2">
                  <div className={cn(
                    'text-center py-2 rounded-lg text-xs font-medium',
                    today ? 'bg-gold/10 text-gold border border-gold/20' : 'text-white/40 bg-white/[0.02]'
                  )}>
                    <span className="block">{WEEKDAYS[idx]}</span>
                    <span className={cn('text-lg font-bold', today ? 'text-gold' : 'text-white/70')}>
                      {day.getDate()}
                    </span>
                  </div>
                  {dayItems.length === 0 ? (
                    <div className="h-12" />
                  ) : (
                    dayItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'rounded-lg p-2 border border-white/5 text-xs',
                          TYPE_COLORS[item.type].bg
                        )}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', TYPE_COLORS[item.type].dot)} />
                          <span className="text-white font-medium truncate">{item.title}</span>
                        </div>
                        {!item.allDay && (
                          <span className="text-white/40">{formatTime(item.start)}</span>
                        )}
                        {item.meetingLink && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener"
                            className="block text-gold/60 hover:text-gold text-[10px] mt-1 transition-colors"
                          >
                            {t.joinMeetingShort}
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: vertical day sections */}
          <div className="md:hidden space-y-4">
            {weekDays.map((day, idx) => {
              const key = dayKey(day);
              const dayItems = (itemsByDay.get(key) ?? []).sort(
                (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
              );
              if (dayItems.length === 0) return null;
              const today = isToday(day);
              return (
                <div key={key}>
                  <h4 className={cn(
                    'text-sm font-medium mb-2',
                    today ? 'text-gold' : 'text-white/60'
                  )}>
                    {WEEKDAYS[idx]} {day.toLocaleDateString(getDateLocale(locale), { day: 'numeric', month: 'short' })}
                    {today && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">
                        {t.viewToday}
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {dayItems.map((item) => (
                      <AppointmentCard key={item.id} item={item} t={t} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Month Grid ── */
function MonthGrid({
  items,
  currentMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
  onGoToday,
  t,
  locale,
}: {
  items: CalendarItem[];
  currentMonth: Date;
  selectedDate: Date;
  onMonthChange: (d: Date) => void;
  onDateSelect: (d: Date) => void;
  onGoToday: () => void;
  t: T;
  locale: string;
}) {
  const WEEKDAYS = locale === 'ru' ? WEEKDAYS_RU : WEEKDAYS_DE;
  const MONTHS = locale === 'ru' ? MONTHS_RU : MONTHS_DE;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const gridDays = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const gridStart = getGridStart(first);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
    }
    return days;
  }, [currentMonth]);

  const itemsByDay = useMemo(() => buildItemsByDay(items), [items]);

  const selectedKey = dayKey(selectedDate);
  const selectedItems = (itemsByDay.get(selectedKey) ?? []).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <>
      {/* Month Grid Card */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMonthChange(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <h2 className="text-lg font-semibold text-white min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => onMonthChange(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <button
            onClick={onGoToday}
            className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            {t.viewToday}
          </button>
        </div>

        {/* Calendar scroll wrapper for mobile */}
        <div className="overflow-x-auto -mx-2 px-2 md:overflow-x-visible md:mx-0 md:px-0">
          <div className="min-w-[336px]">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-white/40 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-px">
          {gridDays.map((day, idx) => {
            const inMonth = day.getMonth() === month;
            const today = isToday(day);
            const selected = isSameDay(day, selectedDate);
            const key = dayKey(day);
            const dayItems = itemsByDay.get(key) ?? [];
            const count = dayItems.length;

            // Count by type for dots
            const hasPaid = dayItems.some((i) => i.type === 'paid');
            const hasFree = dayItems.some((i) => i.type === 'free');
            const hasPersonal = dayItems.some((i) => i.type === 'personal');

            return (
              <button
                key={idx}
                onClick={() => onDateSelect(day)}
                className={cn(
                  'relative flex flex-col items-center py-2 px-1 rounded-lg transition-all min-h-[56px]',
                  inMonth ? 'text-white/80' : 'text-white/20',
                  selected && 'bg-gold/15 border border-gold/30',
                  !selected && 'hover:bg-white/5',
                  today && !selected && 'ring-1 ring-gold/30 bg-gold/[0.05]'
                )}
              >
                {/* Count badge */}
                {count > 0 && (
                  <span className="absolute top-0.5 right-0.5 text-[9px] font-bold text-white/50 bg-white/[0.08] rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}

                <span
                  className={cn(
                    'text-sm font-medium',
                    today && 'text-gold font-bold',
                    selected && 'text-gold'
                  )}
                >
                  {day.getDate()}
                </span>

                {/* Color-coded dots by type */}
                {count > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {hasPaid && <div className={cn('w-1.5 h-1.5 rounded-full', TYPE_COLORS.paid.dot)} />}
                    {hasFree && <div className={cn('w-1.5 h-1.5 rounded-full', TYPE_COLORS.free.dot)} />}
                    {hasPersonal && <div className={cn('w-1.5 h-1.5 rounded-full', TYPE_COLORS.personal.dot)} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
          </div>
        </div>
      </div>

      {/* Selected Day Events */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          {selectedDate.toLocaleDateString(getDateLocale(locale), {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
          {isToday(selectedDate) && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">
              {t.viewToday}
            </span>
          )}
          {selectedItems.length > 0 && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-medium">
              {selectedItems.length} {selectedItems.length === 1
                ? (locale === 'de' ? 'Termin' : 'встреча')
                : (locale === 'de' ? 'Termine' : 'встреч')}
            </span>
          )}
        </h3>

        {selectedItems.length === 0 ? (
          <div className="text-center py-6">
            <CalendarDays className="h-8 w-8 text-white/10 mx-auto mb-2" strokeWidth={1} />
            <p className="text-white/30 text-sm">{t.noAppointmentsDay}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <AppointmentCard key={item.id} item={item} t={t} expanded />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Main Component ── */
export default function CalendarView({ items, locale }: Props) {
  const t = getAdminT(locale);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()));

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'today', label: t.viewToday },
    { key: 'week', label: t.viewWeek },
    { key: 'month', label: t.viewMonth },
  ];

  const goToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
    setSelectedDate(new Date());
    setCurrentWeekStart(getMondayOfWeek(new Date()));
  };

  return (
    <div className="space-y-6">
      {/* Top bar: Stats + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatsBar items={items} t={t} />
        <div className="flex gap-2">
          {viewModes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                viewMode === key
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-white/50 border border-white/10 hover:text-white hover:border-white/20'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          {t.paidSession}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          {t.freeSession}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
          {t.personalEvent}
        </span>
      </div>

      {/* Views */}
      {viewMode === 'today' && <TodayView items={items} t={t} />}

      {viewMode === 'week' && (
        <WeekView
          items={items}
          weekStart={currentWeekStart}
          onPrev={() => setCurrentWeekStart(
            new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() - 7)
          )}
          onNext={() => setCurrentWeekStart(
            new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + 7)
          )}
          t={t}
          locale={locale}
        />
      )}

      {viewMode === 'month' && (
        <MonthGrid
          items={items}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onMonthChange={setCurrentMonth}
          onDateSelect={setSelectedDate}
          onGoToday={goToday}
          t={t}
          locale={locale}
        />
      )}
    </div>
  );
}
