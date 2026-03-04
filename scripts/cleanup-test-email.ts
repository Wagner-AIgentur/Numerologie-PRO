/**
 * Cleanup: Remove all data for a test email address
 * Usage: npx tsx scripts/cleanup-test-email.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

const scriptDir = typeof __dirname !== 'undefined' ? __dirname : dirname(new URL(import.meta.url).pathname);
function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* skip */ }
}
loadEnvFile(resolve(scriptDir, '../.env.production.local'));
loadEnvFile(resolve(scriptDir, '../.env.local'));

const EMAIL = 'test@example.com';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log(`\n🧹 Cleaning up all data for: ${EMAIL}\n`);

  // 1. email_log
  const { data: el } = await sb.from('email_log').delete().eq('to_email', EMAIL).select('id');
  console.log(`  email_log: ${el?.length ?? 0} gelöscht`);

  // 2. email_sequence_enrollments
  const { data: ese } = await sb.from('email_sequence_enrollments').delete().eq('email', EMAIL).select('id');
  console.log(`  enrollments: ${ese?.length ?? 0} gelöscht`);

  // 3. leads
  const { data: ld } = await sb.from('leads').delete().eq('email', EMAIL).select('id');
  console.log(`  leads: ${ld?.length ?? 0} gelöscht`);

  // 4. orders
  const { data: od } = await sb.from('orders').delete().eq('customer_email', EMAIL).select('id');
  console.log(`  orders: ${od?.length ?? 0} gelöscht`);

  // 5. coupon_usages (may not have email column, try profile_id)
  try {
    const { data: cu } = await sb.from('coupon_usages').delete().eq('email', EMAIL).select('id');
    console.log(`  coupon_usages: ${cu?.length ?? 0} gelöscht`);
  } catch { console.log(`  coupon_usages: skip`); }

  // 6. Profile + profile-linked data
  const { data: profile } = await sb.from('profiles').select('id').eq('email', EMAIL).maybeSingle();
  if (profile) {
    console.log(`  Profile gefunden: ${profile.id}`);
    const profileTables = ['activity_feed', 'sessions', 'deliverables', 'contact_notes', 'tasks'];
    for (const t of profileTables) {
      try {
        const { data: d } = await sb.from(t).delete().eq('profile_id', profile.id).select('id');
        console.log(`  ${t}: ${d?.length ?? 0} gelöscht`);
      } catch { console.log(`  ${t}: skip`); }
    }

    try {
      const { data: refs } = await sb.from('referrals').delete()
        .or(`referrer_profile_id.eq.${profile.id},referred_profile_id.eq.${profile.id}`)
        .select('id');
      console.log(`  referrals: ${refs?.length ?? 0} gelöscht`);
    } catch { console.log(`  referrals: skip`); }

    // Profile itself
    const { error: pErr } = await sb.from('profiles').delete().eq('id', profile.id);
    if (pErr) console.log(`  profile: ${pErr.message} (FK zu auth.users — normal)`);
    else console.log(`  profile: gelöscht`);

    // Auth user
    const { error: authErr } = await sb.auth.admin.deleteUser(profile.id);
    if (authErr) console.log(`  auth user: ${authErr.message}`);
    else console.log(`  auth user: gelöscht`);
  } else {
    console.log(`  Kein Profil gefunden für diese Email`);

    // Still try to delete auth user by email
    const { data: authData } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authData?.users?.find(u => u.email === EMAIL);
    if (authUser) {
      const { error: authErr } = await sb.auth.admin.deleteUser(authUser.id);
      if (authErr) console.log(`  auth user: ${authErr.message}`);
      else console.log(`  auth user: gelöscht (${authUser.id})`);
    } else {
      console.log(`  Kein Auth-User gefunden`);
    }
  }

  console.log(`\n✅ Alle Daten für ${EMAIL} bereinigt!\n`);
}

main().catch(console.error);
