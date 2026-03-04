import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, customFieldSchema } from '@/lib/validations/admin';

/**
 * GET /api/admin/custom-fields — List all custom field definitions
 */
export async function GET() {
  const user = await requirePermission('fields.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await adminClient
    .from('custom_field_definitions')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/custom-fields — Create a new custom field definition
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('fields.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, customFieldSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { name, field_type, options, is_required } = body;

  if (field_type === 'select' && (!options || options.length === 0)) {
    return NextResponse.json(
      { error: 'options array is required for select type fields' },
      { status: 400 }
    );
  }

  const { data, error } = await adminClient
    .from('custom_field_definitions')
    .insert({
      field_key: name.toLowerCase().replace(/\s+/g, '_'),
      label_de: name,
      label_ru: name,
      field_type,
      options: field_type === 'select' ? options : null,
      is_required: is_required ?? false,
      sort_order: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
