/**
 * Data Export API (Art. 20 DSGVO - Recht auf Datenportabilitaet)
 *
 * GET /api/user/export-data
 * - Exports all personal data as JSON
 * - Requires authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await rateLimit(`export:${user.id}`, { preset: 'strict' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Step 1: Fetch profile first (needed for messaging lookups)
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Step 2: Fetch all remaining data in parallel
  const [
    ordersResult,
    sessionsResult,
    emailLogResult,
    leadsResult,
    contactSubmissionsResult,
    telegramResult,
    instagramResult,
    whatsappResult,
    customFieldsResult,
    sequenceEnrollmentsResult,
  ] = await Promise.all([
    adminClient.from('orders').select('id, amount_cents, currency, status, metadata, created_at').eq('profile_id', user.id).order('created_at', { ascending: false }),
    adminClient.from('sessions').select('id, session_type, status, scheduled_at, duration_min, notes, created_at').eq('profile_id', user.id).order('created_at', { ascending: false }),
    adminClient.from('email_log').select('id, subject, template, status, created_at').eq('profile_id', user.id).order('created_at', { ascending: false }),
    adminClient.from('leads').select('id, email, birthdate, language, source, email_verified, marketing_consent, created_at').eq('email', user.email ?? ''),
    adminClient.from('contact_submissions').select('id, name, email, phone, topic, message, created_at').eq('email', user.email ?? ''),
    // CRM notes excluded from Art. 20 export — internal admin assessments, not user-provided data
    adminClient.from('telegram_messages').select('id, direction, command, created_at').eq('chat_id', profile?.telegram_chat_id ?? -1).order('created_at', { ascending: false }),
    adminClient.from('instagram_messages').select('id, direction, message_text, created_at').eq('sender_id', profile?.instagram_sender_id ?? '').order('created_at', { ascending: false }),
    adminClient.from('whatsapp_messages').select('id, direction, message_text, status, created_at').eq('wa_id', profile?.whatsapp_phone ?? '').order('created_at', { ascending: false }),
    adminClient.from('custom_field_values').select('id, field_id, value, created_at').eq('profile_id', user.id),
    adminClient.from('email_sequence_enrollments').select('id, sequence_id, status, enrolled_at, completed_at').eq('profile_id', user.id),
  ]);

  // Build clean profile data (remove sensitive internal fields)
  const cleanProfile = profile ? {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone,
    birthdate: profile.birthdate,
    language: profile.language,
    source: profile.source,
    tags: profile.tags,
    lead_score: profile.lead_score,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    last_activity_at: profile.last_activity_at,
  } : null;

  const exportData = {
    _meta: {
      exported_at: new Date().toISOString(),
      format: 'DSGVO Art. 20 - Recht auf Datenportabilität',
      user_id: user.id,
      user_email: user.email,
    },
    profile: cleanProfile,
    orders: ordersResult.data ?? [],
    sessions: sessionsResult.data ?? [],
    email_log: emailLogResult.data ?? [],
    leads: leadsResult.data ?? [],
    contact_submissions: contactSubmissionsResult.data ?? [],
    // crm_notes excluded — internal admin data, not user-provided (Art. 20 DSGVO)
    telegram_messages: telegramResult.data ?? [],
    instagram_messages: instagramResult.data ?? [],
    whatsapp_messages: whatsappResult.data ?? [],
    custom_fields: customFieldsResult.data ?? [],
    email_sequence_enrollments: sequenceEnrollmentsResult.data ?? [],
  };

  // Return as downloadable JSON
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="numerologie-pro-daten-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
