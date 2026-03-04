import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, automationSchema } from '@/lib/validations/admin';

/**
 * GET /api/admin/automations — List all automation rules with stats
 */
export async function GET() {
  const user = await requirePermission('automations.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: rules, error } = await adminClient
    .from('automation_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  // Fetch log counts per rule
  const ruleIds = (rules ?? []).map((r) => r.id);
  const { data: logCounts } = await adminClient
    .from('automation_logs')
    .select('rule_id, status')
    .in('rule_id', ruleIds.length ? ruleIds : ['__none__']);

  const statsMap: Record<string, { total: number; success: number; failed: number }> = {};
  for (const log of logCounts ?? []) {
    if (!statsMap[log.rule_id]) statsMap[log.rule_id] = { total: 0, success: 0, failed: 0 };
    statsMap[log.rule_id].total++;
    if (log.status === 'success') statsMap[log.rule_id].success++;
    if (log.status === 'failed') statsMap[log.rule_id].failed++;
  }

  const enriched = (rules ?? []).map((rule) => ({
    ...rule,
    stats: statsMap[rule.id] ?? { total: 0, success: 0, failed: 0 },
  }));

  return NextResponse.json(enriched);
}

/**
 * POST /api/admin/automations — Create a new automation rule
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('automations.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, automationSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { name, trigger_type, trigger_config, actions, is_active } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await adminClient
    .from('automation_rules')
    .insert({
      name,
      description: null,
      trigger_event: trigger_type,
      conditions: (trigger_config ?? {}) as any,
      actions: (actions ?? []) as any,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
