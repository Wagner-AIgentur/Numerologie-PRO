import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { isValidUUID } from '@/lib/validations/admin';

/**
 * GET /api/admin/inbox/[id]
 * Load activity_feed entry + related source data for the detail panel.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('inbox.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Load the activity feed entry with profile info
  const { data: entry, error } = await adminClient
    .from('activity_feed')
    .select('*, profiles(id, full_name, email, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Load source data based on source_table
  let sourceData: Record<string, unknown> | null = null;

  if (entry.source_table && entry.source_id) {
    const table = entry.source_table as string;
    const sourceId = entry.source_id as string;

    switch (table) {
      case 'contact_submissions': {
        const { data } = await adminClient
          .from('contact_submissions')
          .select('*')
          .eq('id', sourceId)
          .single();
        sourceData = data;
        break;
      }
      case 'email_log': {
        const { data } = await adminClient
          .from('email_log')
          .select('*')
          .eq('id', sourceId)
          .single();
        sourceData = data;
        break;
      }
      case 'crm_notes': {
        const { data } = await adminClient
          .from('crm_notes')
          .select('*')
          .eq('id', sourceId)
          .single();
        sourceData = data;
        break;
      }
      case 'orders': {
        const { data } = await adminClient
          .from('orders')
          .select('*, products(name_de, package_key)')
          .eq('id', sourceId)
          .single();
        sourceData = data;
        break;
      }
      case 'sessions': {
        const { data } = await adminClient
          .from('sessions')
          .select('*')
          .eq('id', sourceId)
          .single();
        sourceData = data;
        break;
      }
      case 'instagram_messages': {
        const { data } = await adminClient
          .from('instagram_messages')
          .select('*')
          .eq('id', sourceId)
          .single();
        sourceData = data;
        break;
      }
    }
  }

  return NextResponse.json({ entry, sourceData });
}
