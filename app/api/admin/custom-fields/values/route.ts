import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, customFieldValueSchema } from '@/lib/validations/admin';

/**
 * GET /api/admin/custom-fields/values?profile_id=xxx — Get all custom field values for a profile
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('fields.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = request.nextUrl.searchParams.get('profile_id');
  if (!profileId) {
    return NextResponse.json({ error: 'profile_id query parameter is required' }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('custom_field_values')
    .select('*, custom_field_definitions(*)')
    .eq('profile_id', profileId);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/custom-fields/values — Upsert a custom field value
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('fields.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, customFieldValueSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { profile_id, field_id, value } = body;

  const { data, error } = await adminClient
    .from('custom_field_values')
    .upsert(
      {
        profile_id,
        field_id,
        value: value ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,field_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}
