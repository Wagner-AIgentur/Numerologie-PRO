import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.production.local manually
const envFile = readFileSync(resolve(process.cwd(), '.env.production.local'), 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^([A-Z_]+)=["']?(.+?)["']?$/);
  if (match) env[match[1]] = match[2];
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAIL = 'test@example.com';

async function cleanup() {
  console.log(`\n🧹 Cleaning up all data for: ${EMAIL}\n`);

  // 1. Find profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, crm_status, telegram_chat_id')
    .eq('email', EMAIL)
    .maybeSingle();

  // 2. Find lead
  const { data: lead } = await supabase
    .from('leads')
    .select('id, email, email_verified, converted')
    .eq('email', EMAIL)
    .maybeSingle();

  console.log('📋 Found profile:', profile ? `${profile.id} (${profile.crm_status})` : 'NONE');
  console.log('📋 Found lead:', lead ? `${lead.id} (verified: ${lead.email_verified}, converted: ${lead.converted})` : 'NONE');

  if (profile) {
    const pid = profile.id;

    // Delete related data in order (foreign keys)
    const tables = [
      { table: 'automation_logs', filter: { profile_id: pid } },
      { table: 'email_sequence_enrollments', filter: { profile_id: pid } },
      { table: 'activity_feed', filter: { profile_id: pid } },
      { table: 'email_log', filter: { profile_id: pid } },
      { table: 'telegram_messages', filter: { profile_id: pid } },
      { table: 'whatsapp_messages', filter: { profile_id: pid } },
      { table: 'instagram_messages', filter: { profile_id: pid } },
      { table: 'notes', filter: { profile_id: pid } },
      { table: 'custom_field_values', filter: { profile_id: pid } },
      { table: 'deals', filter: { profile_id: pid } },
      { table: 'sessions', filter: { profile_id: pid } },
      { table: 'orders', filter: { profile_id: pid } },
      { table: 'deliverables', filter: { profile_id: pid } },
    ];

    for (const { table, filter } of tables) {
      const [key, val] = Object.entries(filter)[0];
      const { data, error } = await supabase.from(table).delete().eq(key, val).select('id');
      if (error && !error.message.includes('does not exist')) {
        console.log(`  ⚠️  ${table}: ${error.message}`);
      } else {
        const count = data?.length ?? 0;
        if (count > 0) console.log(`  ✅ ${table}: deleted ${count} rows`);
        else console.log(`  ⬚  ${table}: no rows`);
      }
    }

    // Delete profile
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', pid);
    console.log(profileErr ? `  ⚠️  profiles: ${profileErr.message}` : '  ✅ profiles: deleted');

    // Delete auth user
    const { error: authErr } = await supabase.auth.admin.deleteUser(pid);
    console.log(authErr ? `  ⚠️  auth.users: ${authErr.message}` : '  ✅ auth.users: deleted');
  }

  if (lead) {
    const { error } = await supabase.from('leads').delete().eq('id', lead.id);
    console.log(error ? `  ⚠️  leads: ${error.message}` : '  ✅ leads: deleted');
  }

  // Also check contact_submissions
  const { data: contacts } = await supabase.from('contact_submissions').delete().eq('email', EMAIL).select('id');
  console.log(`  ${contacts?.length ? '✅' : '⬚'}  contact_submissions: ${contacts?.length ?? 0} rows`);

  console.log('\n✨ Cleanup complete! Email is ready for fresh registration.\n');
}

cleanup().catch(console.error);
