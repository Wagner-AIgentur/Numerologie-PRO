import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, crmNoteSchema, isValidUUID } from '@/lib/validations/admin';

// GET: All CRM notes for a customer
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('customers.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data, error } = await adminClient
    .from('crm_notes')
    .select('*')
    .eq('profile_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create a new CRM note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requirePermission('customers.edit');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const { data: body, error: validationError } = await validateBody(request, crmNoteSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }
  const { content, type, follow_up_date } = body as any;

  const validTypes = ['note', 'call', 'email', 'follow_up'];
  const noteType = validTypes.includes(type) ? type : 'note';

  const { data, error } = await adminClient
    .from('crm_notes')
    .insert({
      profile_id: id,
      content: content.trim(),
      type: noteType,
      follow_up_date: follow_up_date ?? null,
      created_by: admin.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
