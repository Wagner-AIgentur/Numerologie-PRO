import { NextRequest, NextResponse } from 'next/server';
import { triggerAutomations } from '@/lib/automation/engine';
import { safeCompare } from '@/lib/rate-limit';

/**
 * POST /api/admin/automations/trigger
 *
 * Internal endpoint to trigger automation rules from external integrations
 * (ManyChat, n8n, etc.) or internal webhook handlers.
 *
 * Auth: Bearer token via CRON_SECRET (reuse existing infra secret)
 * Body: { trigger: string, data: { profileId?, email?, ...extraData } }
 */
export async function POST(request: NextRequest) {
  // Auth: Accept either CRON_SECRET or MANYCHAT_WEBHOOK_SECRET
  const authHeader = request.headers.get('authorization') ?? '';
  const cronSecret = process.env.CRON_SECRET ?? '';
  const manychatSecret = process.env.MANYCHAT_WEBHOOK_SECRET ?? '';

  const authorized =
    (cronSecret && safeCompare(authHeader, `Bearer ${cronSecret}`)) ||
    (manychatSecret && safeCompare(authHeader, `Bearer ${manychatSecret}`));

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { trigger, data } = body as {
      trigger: string;
      data?: { profile_id?: string; email?: string; [key: string]: unknown };
    };

    if (!trigger) {
      return NextResponse.json({ error: 'trigger is required' }, { status: 400 });
    }

    const result = await triggerAutomations(trigger as Parameters<typeof triggerAutomations>[0], {
      profileId: data?.profile_id ?? null,
      email: data?.email,
      data,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[Automations Trigger] Error:', err);
    return NextResponse.json({ error: 'Trigger failed' }, { status: 500 });
  }
}
