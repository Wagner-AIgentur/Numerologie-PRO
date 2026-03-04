/**
 * Purge Deleted Accounts Cron Job (Art. 17 DSGVO)
 *
 * Runs daily at 3:30 AM.
 * Deletes all data for profiles where deletion_requested_at is older than 30 days.
 * Cascading deletion of all associated personal data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { safeCompare } from '@/lib/rate-limit';

const GRACE_PERIOD_DAYS = 30;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoffDate = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Find profiles marked for deletion past the grace period
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, email, telegram_chat_id, instagram_sender_id, whatsapp_phone')
    .not('deletion_requested_at', 'is', null)
    .lte('deletion_requested_at', cutoffDate)
    .limit(50); // Process max 50 per run to prevent timeout — cron drains the queue over days

  if (!profiles?.length) {
    return NextResponse.json({ purged: 0, message: 'No accounts to purge' });
  }

  let purgedCount = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    try {
      const pid = profile.id;

      // Delete all associated data in order (respecting foreign keys)
      await Promise.all([
        adminClient.from('custom_field_values').delete().eq('profile_id', pid),
        adminClient.from('email_sequence_enrollments').delete().eq('profile_id', pid),
        adminClient.from('broadcast_recipients').delete().eq('profile_id', pid),
        adminClient.from('crm_notes').delete().eq('profile_id', pid),
        adminClient.from('email_log').delete().eq('profile_id', pid),
        adminClient.from('activity_feed').delete().eq('profile_id', pid),
        adminClient.from('automation_logs').delete().eq('profile_id', pid),
      ]);

      // Delete deals
      await adminClient.from('deals').delete().eq('profile_id', pid);

      // Delete sessions
      await adminClient.from('sessions').delete().eq('profile_id', pid);

      // Anonymize orders (§ 147 AO: 10 years retention for tax records)
      // Keep amount, currency, status, stripe IDs, timestamps — remove PII
      await adminClient
        .from('orders')
        .update({
          profile_id: null,
          customer_email: 'geloescht@anonymisiert.local',
          metadata: null,
        })
        .eq('profile_id', pid);

      // Delete tasks related to profile
      await adminClient.from('tasks').delete().eq('profile_id', pid);

      // Delete messaging data
      if (profile.telegram_chat_id) {
        await adminClient.from('telegram_messages').delete().eq('chat_id', profile.telegram_chat_id);
      }
      if (profile.instagram_sender_id) {
        await adminClient.from('instagram_messages').delete().eq('sender_id', profile.instagram_sender_id);
      }
      if (profile.whatsapp_phone) {
        await adminClient.from('whatsapp_messages').delete().eq('wa_id', profile.whatsapp_phone);
      }

      // Delete Meta CAPI events
      await adminClient.from('meta_capi_events').delete().eq('profile_id', pid);

      // Delete contact submissions by email
      if (profile.email) {
        await adminClient.from('contact_submissions').delete().eq('email', profile.email);
        await adminClient.from('leads').delete().eq('email', profile.email);
      }

      // Delete the profile itself
      await adminClient.from('profiles').delete().eq('id', pid);

      // Delete auth user from Supabase Auth
      await adminClient.auth.admin.deleteUser(pid);

      purgedCount++;
      console.log(`[DSGVO Purge] Deleted profile ${pid}`);
    } catch (err) {
      const msg = `Failed to purge ${profile.id}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[DSGVO Purge] ${msg}`);
      errors.push(msg);
    }
  }

  return NextResponse.json({
    purged: purgedCount,
    errors: errors.length > 0 ? errors : undefined,
    checked: profiles.length,
  });
}
