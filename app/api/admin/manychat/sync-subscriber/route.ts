import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { createSubscriber, addTag, setCustomFields, findSubscriberByEmail } from '@/lib/manychat/api';
import { safeParseJSON } from '@/lib/utils';

/**
 * Sync a CRM profile to ManyChat subscriber.
 * Direction: CRM → ManyChat (CRM is master)
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { email, first_name, last_name, phone, tags, custom_fields } = body as {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    tags?: unknown[];
    custom_fields?: unknown[];
  };

  if (!first_name) {
    return NextResponse.json({ error: 'first_name required' }, { status: 400 });
  }

  try {
    // Check if subscriber already exists
    let subscriber = email ? await findSubscriberByEmail(email) : null;

    if (!subscriber) {
      // Create new subscriber
      subscriber = await createSubscriber({
        first_name,
        last_name,
        email,
        phone,
      });
    }

    // Sync tags
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await addTag(subscriber.id, tagId as number).catch(() => {});
      }
    }

    // Sync custom fields
    if (custom_fields && Array.isArray(custom_fields)) {
      await setCustomFields(subscriber.id, custom_fields as Array<{ field_id: number; field_value: string }>).catch(() => {});
    }

    return NextResponse.json({ success: true, subscriber_id: subscriber.id });
  } catch (err) {
    console.error('[ManyChat Sync]', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
