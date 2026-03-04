import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission, isDemoReviewer } from '@/lib/auth/admin-guard';

/**
 * GET /api/admin/instagram/conversations
 * Returns grouped conversations (latest message per sender_id).
 */
export async function GET() {
  if (!(await requirePermission('instagram.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Demo reviewers: return empty (no real customer DMs)
  if (await isDemoReviewer()) {
    return NextResponse.json([]);
  }

  const { data: messages, error } = await adminClient
    .from('instagram_messages')
    .select('*, profiles:profile_id(id, full_name, email, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Admin Instagram] Conversations fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }

  // Group by sender_id in-memory, take latest message per sender
  const convMap = new Map<
    string,
    {
      sender_id: string;
      profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
      lastMessage: {
        id: string;
        message_text: string | null;
        direction: string;
        created_at: string;
      };
      messageCount: number;
    }
  >();

  for (const msg of messages ?? []) {
    if (!convMap.has(msg.sender_id)) {
      convMap.set(msg.sender_id, {
        sender_id: msg.sender_id,
        profile: msg.profiles ?? null,
        lastMessage: {
          id: msg.id,
          message_text: msg.message_text,
          direction: msg.direction,
          created_at: msg.created_at ?? '',
        },
        messageCount: 0,
      });
    }
    convMap.get(msg.sender_id)!.messageCount++;
  }

  // Sort by most recent first
  const conversations = Array.from(convMap.values()).sort(
    (a, b) =>
      new Date(b.lastMessage.created_at).getTime() -
      new Date(a.lastMessage.created_at).getTime(),
  );

  return NextResponse.json({ conversations });
}
