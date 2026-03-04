import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, instagramLinkSchema } from '@/lib/validations/admin';

/**
 * POST /api/admin/instagram/link
 * Link an Instagram sender_id to a profile.
 */
export async function POST(request: NextRequest) {
  if (!(await requirePermission('instagram.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, instagramLinkSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { instagram_sender_id, profile_id } = body;

  // 1. Update profile with instagram_sender_id
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ instagram_sender_id })
    .eq('id', profile_id);

  if (profileError) {
    console.error('[Admin Instagram] Profile link error:', profileError.message);
    return NextResponse.json(
      { error: 'Failed to link profile' },
      { status: 500 },
    );
  }

  // 2. Update all messages from this sender to link to the profile
  const { error: messagesError } = await adminClient
    .from('instagram_messages')
    .update({ profile_id })
    .eq('sender_id', instagram_sender_id);

  if (messagesError) {
    console.error('[Admin Instagram] Messages link error:', messagesError.message);
    // Profile was already linked, so we still return ok
  }

  return NextResponse.json({ ok: true });
}
