'use client';

import { useState, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Phone,
  FileText,
  ShoppingBag,
  Calendar,
  Package,
  MoreHorizontal,
  Circle,
  Save,
  User,
} from 'lucide-react';

interface Task {
  id: string;
  profile_id: string | null;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  due_date: string | null;
  due_time: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  source_type: string | null;
  source_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles: { id: string; full_name: string | null; email: string } | null;
}

interface Props {
  tasks: Task[];
  locale: string;
}

const TASK_TYPES = [
  { value: 'follow_up', de: 'Follow-up', ru: 'Напоминание', icon: Clock },
  { value: 'call_back', de: 'Rückruf', ru: 'Перезвонить', icon: Phone },
  { value: 'send_proposal', de: 'Angebot senden', ru: 'Отправить предложение', icon: FileText },
  { value: 'review_order', de: 'Bestellung prüfen', ru: 'Проверить заказ', icon: ShoppingBag },
  { value: 'prepare_session', de: 'Sitzung vorbereiten', ru: 'Подготовить сессию', icon: Calendar },
  { value: 'send_materials', de: 'Material senden', ru: 'Отправить материалы', icon: Package },
  { value: 'other', de: 'Sonstiges', ru: 'Другое', icon: MoreHorizontal },
];

const PRIORITIES = [
  { value: 'low', de: 'Niedrig', ru: 'Низкий', color: 'text-white/40 bg-white/5 border-white/10' },
  { value: 'medium', de: 'Mittel', ru: 'Средний', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'high', de: 'Hoch', ru: 'Высокий', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { value: 'urgent', de: 'Dringend', ru: 'Срочный', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const STATUS_TABS = [
  { value: 'all', de: 'Alle', ru: 'Все' },
  { value: 'open', de: 'Offen', ru: 'Открытые' },
  { value: 'in_progress', de: 'In Arbeit', ru: 'В работе' },
  { value: 'completed', de: 'Erledigt', ru: 'Завершённые' },
];

export default function TaskListShell({ tasks: initialTasks, locale }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'other',
    priority: 'medium',
    due_date: '',
  });

  const de = locale === 'de';
  const today = new Date().toISOString().split('T')[0];

  // Auto-refresh tasks every 15s
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // silent
    }
  }, []);

  useAutoRefresh(fetchTasks, 15000);

  // Computed stats
  const totalTasks = tasks.length;
  const openTasks = tasks.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(
    (t) => (t.status === 'open' || t.status === 'in_progress') && t.due_date && t.due_date < today
  ).length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  // Filtered tasks
  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  function getTypeLabel(type: string) {
    const tt = TASK_TYPES.find((t) => t.value === type);
    return tt ? (de ? tt.de : tt.ru) : type;
  }

  function getTypeIcon(type: string) {
    const tt = TASK_TYPES.find((t) => t.value === type);
    return tt?.icon ?? ListTodo;
  }

  function getPriorityMeta(priority: string) {
    return PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[1];
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(de ? 'de-DE' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function isOverdue(task: Task) {
    return (task.status === 'open' || task.status === 'in_progress') && task.due_date && task.due_date < today;
  }

  function isDueToday(task: Task) {
    return task.due_date === today && task.status !== 'completed' && task.status !== 'cancelled';
  }

  async function createTask() {
    if (!newTask.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          type: newTask.type,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([data, ...tasks]);
        setShowNew(false);
        setNewTask({ title: '', type: 'other', priority: 'medium', due_date: '' });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function completeTask(task: Task) {
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    }
  }

  async function deleteTask(id: string) {
    if (!confirm(de ? 'Aufgabe wirklich löschen?' : 'Удалить задачу?')) return;
    await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {de ? 'Aufgaben' : 'Задачи'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {de
              ? 'Aufgaben verwalten und nachverfolgen.'
              : 'Управление задачами и отслеживание.'}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {de ? 'Neue Aufgabe' : 'Новая задача'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <ListTodo className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Gesamt' : 'Всего'}
          </div>
          <p className="text-2xl font-bold text-white">{totalTasks}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-blue-400/70 text-xs mb-1">
            <Circle className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Offen' : 'Открытые'}
          </div>
          <p className="text-2xl font-bold text-blue-400">{openTasks}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-red-400/70 text-xs mb-1">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Überfällig' : 'Просроченные'}
          </div>
          <p className="text-2xl font-bold text-red-400">{overdueTasks}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-emerald-400/70 text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Erledigt' : 'Завершённые'}
          </div>
          <p className="text-2xl font-bold text-emerald-400">{completedTasks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {de ? tab.de : tab.ru}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-gold/30 focus:outline-none"
        >
          <option value="all" className="bg-[#0a1a24]">
            {de ? 'Alle Prioritäten' : 'Все приоритеты'}
          </option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value} className="bg-[#0a1a24]">
              {de ? p.de : p.ru}
            </option>
          ))}
        </select>
      </div>

      {/* New Task Form */}
      {showNew && (
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-6 space-y-4">
          <h3 className="text-white font-medium">{de ? 'Neue Aufgabe erstellen' : 'Создать задачу'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Titel' : 'Название'}</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder={de ? 'Aufgabentitel eingeben...' : 'Введите название задачи...'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Typ' : 'Тип'}</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none"
              >
                {TASK_TYPES.map((tt) => (
                  <option key={tt.value} value={tt.value} className="bg-[#0a1a24]">
                    {de ? tt.de : tt.ru}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Priorität' : 'Приоритет'}</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#0a1a24]">
                    {de ? p.de : p.ru}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Fällig am' : 'Дата'}</label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowNew(false)}
              className="rounded-xl px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors"
            >
              {de ? 'Abbrechen' : 'Отмена'}
            </button>
            <button
              onClick={createTask}
              disabled={saving || !newTask.title.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold/10 border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
              {saving ? '...' : de ? 'Erstellen' : 'Создать'}
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-12 text-center">
          <CheckSquare className="h-12 w-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">
            {de ? 'Keine Aufgaben in dieser Kategorie.' : 'Нет задач в этой категории.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const TypeIcon = getTypeIcon(task.type);
            const prio = getPriorityMeta(task.priority);
            const overdue = isOverdue(task);
            const dueToday = isDueToday(task);
            const isCompleted = task.status === 'completed';
            const isCancelled = task.status === 'cancelled';

            return (
              <div
                key={task.id}
                className={`rounded-2xl border bg-white/[0.02] p-4 transition-all ${
                  overdue
                    ? 'border-red-500/30'
                    : dueToday
                      ? 'border-orange-500/20'
                      : isCompleted
                        ? 'border-white/5 opacity-60'
                        : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete button */}
                  <button
                    onClick={() => !isCompleted && !isCancelled && completeTask(task)}
                    disabled={isCompleted || isCancelled}
                    className={`mt-0.5 shrink-0 transition-colors ${
                      isCompleted
                        ? 'text-emerald-400 cursor-default'
                        : 'text-white/20 hover:text-emerald-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Circle className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted ? 'text-white/40 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      {/* Type badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        <TypeIcon className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {getTypeLabel(task.type)}
                      </span>
                      {/* Priority badge */}
                      <span
                        className={`text-[10px] border rounded-full px-2 py-0.5 ${prio.color}`}
                      >
                        {de ? prio.de : prio.ru}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
                      {/* Customer */}
                      {task.profiles && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" strokeWidth={1.5} />
                          {task.profiles.full_name || task.profiles.email}
                        </span>
                      )}
                      {/* Due date */}
                      {task.due_date && (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            overdue
                              ? 'text-red-400'
                              : dueToday
                                ? 'text-orange-400'
                                : ''
                          }`}
                        >
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          {overdue
                            ? de
                              ? 'Überfällig'
                              : 'Просрочено'
                            : dueToday
                              ? de
                                ? 'Heute fällig'
                                : 'Сегодня'
                              : ''}{' '}
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      {/* Status for in_progress */}
                      {task.status === 'in_progress' && (
                        <span className="text-blue-400">
                          {de ? 'In Arbeit' : 'В работе'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
