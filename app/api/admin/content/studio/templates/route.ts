import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, promptTemplateCreateSchema } from '@/lib/validations/admin';

export async function GET() {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from('ai_prompt_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, promptTemplateCreateSchema);
  if (validationError) return NextResponse.json(zodErrorResponse(validationError), { status: 400 });

  const { data, error } = await adminClient
    .from('ai_prompt_templates')
    .insert(body)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Template slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
