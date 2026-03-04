import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, tagRuleSchema } from '@/lib/validations/admin';

/**
 * GET /api/admin/tag-rules — List all tag rules
 */
export async function GET() {
  const user = await requirePermission('tags.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await adminClient
    .from('tag_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/tag-rules — Create a new tag rule
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('tags.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, tagRuleSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { name, conditions, tag, is_active } = body;

  const { data, error } = await adminClient
    .from('tag_rules')
    .insert({
      tag_name: tag,
      description: name,
      condition_type: 'custom',
      condition_value: JSON.stringify(conditions),
      auto_remove: false,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
