import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission, adminRateLimit, isDemoReviewer } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, customerUpdateSchema, isValidUUID } from '@/lib/validations/admin';

// GET: Full customer profile with related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('customers.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Demo reviewers cannot access individual customer data
  if (await isDemoReviewer()) {
    return NextResponse.json({ error: 'Customer data not available in demo mode' }, { status: 403 });
  }

  if (!await adminRateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const [profileRes, notesRes, emailsRes, ordersRes, sessionsRes] =
    await Promise.all([
      adminClient.from('profiles').select('*').eq('id', id).single(),
      adminClient
        .from('crm_notes')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false }),
      adminClient
        .from('email_log')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false }),
      adminClient
        .from('orders')
        .select('*, products(name_de, package_key)')
        .eq('profile_id', id)
        .order('created_at', { ascending: false }),
      adminClient
        .from('sessions')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false }),
    ]);

  if (profileRes.error) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Fetch contact submissions by email (since contact_submissions don't have profile_id)
  const { data: contacts } = await adminClient
    .from('contact_submissions')
    .select('*')
    .eq('email', profileRes.data.email)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    profile: profileRes.data,
    notes: notesRes.data ?? [],
    emails: emailsRes.data ?? [],
    orders: ordersRes.data ?? [],
    sessions: sessionsRes.data ?? [],
    contacts: contacts ?? [],
  });
}

// PATCH: Update customer profile fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('customers.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const { data: body, error: validationError } = await validateBody(request, customerUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  // Only allow safe fields to be updated
  const allowedFields = ['tags', 'notes', 'phone', 'full_name', 'language'];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      updates[key] = (body as Record<string, unknown>)[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE: Soft-delete customer (DSGVO-konform)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('customers.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Soft delete: set deletion_requested_at + deactivate
  const { error } = await adminClient
    .from('profiles')
    .update({
      deletion_requested_at: new Date().toISOString(),
      crm_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }

  // Cleanup activity feed entries
  await adminClient
    .from('activity_feed')
    .delete()
    .eq('profile_id', id);

  return NextResponse.json({ success: true });
}
