import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, automationUpdateSchema, isValidUUID } from '@/lib/validations/admin';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/automations/[id] — Get a single rule with recent logs
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const user = await requirePermission('automations.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data: rule, error } = await adminClient
    .from('automation_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch last 50 logs for this rule
  const { data: logs } = await adminClient
    .from('automation_logs')
    .select('*')
    .eq('rule_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ ...rule, logs: logs ?? [] });
}

/**
 * PATCH /api/admin/automations/[id] — Update a rule
 */
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const user = await requirePermission('automations.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data: body, error: validationError } = await validateBody(request, automationUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.trigger_type !== undefined) updates.trigger_event = body.trigger_type;
  if (body.trigger_config !== undefined) updates.conditions = body.trigger_config;
  if (body.actions !== undefined) updates.actions = body.actions;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const { data, error } = await adminClient
    .from('automation_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/automations/[id] — Delete a rule and its logs
 */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const user = await requirePermission('automations.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { error } = await adminClient
    .from('automation_rules')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ success: true });
}
