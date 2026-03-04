import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { safeCompare } from '@/lib/rate-limit';

/**
 * GET /api/cron/task-reminders
 *
 * Daily cron: Sends reminders for overdue and due-today tasks via Telegram.
 * Secured via CRON_SECRET bearer token.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  // Fetch overdue + due-today open tasks with profile info
  const { data: tasks } = await adminClient
    .from('tasks')
    .select('id, title, priority, due_date, profile_id, profiles!inner(telegram_chat_id, language)')
    .in('status', ['open', 'in_progress'])
    .lte('due_date', today)
    .not('due_date', 'is', null);

  let sent = 0;

  for (const task of tasks ?? []) {
    const profile = task.profiles as unknown as { telegram_chat_id: number | null; language: string } | null;
    if (!profile?.telegram_chat_id) continue;

    const isOverdue = task.due_date! < today;
    const de = (profile.language ?? 'de') === 'de';

    const priorityEmoji = task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : '🟡';
    const statusText = isOverdue
      ? (de ? '⚠️ Überfällig' : '⚠️ Просрочено')
      : (de ? '📅 Heute fällig' : '📅 Сегодня');

    const text = `${priorityEmoji} <b>${statusText}</b>\n\n${task.title}\n${de ? 'Fällig' : 'Срок'}: ${task.due_date}`;

    try {
      const { sendMessage } = await import('@/lib/telegram/bot');
      await sendMessage({ chat_id: profile.telegram_chat_id, text });
      sent++;
    } catch {
      // Silently skip — Telegram might be unavailable
    }
  }

  console.log(`[Task-Reminders Cron] Sent ${sent} reminders for ${tasks?.length ?? 0} due tasks`);

  return NextResponse.json({ tasks_found: tasks?.length ?? 0, reminders_sent: sent });
}
