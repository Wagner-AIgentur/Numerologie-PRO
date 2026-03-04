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

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const EMAIL = 'danja0411@googlemail.com';

async function main() {
  console.log(`\n🔍 Checking auth status for: ${EMAIL}\n`);

  // 1. Auth user
  const { data: authData, error: authErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) {
    console.log('Auth error:', authErr.message);
    return;
  }
  const user = authData?.users?.find(u => u.email === EMAIL);

  if (user) {
    console.log('✅ AUTH USER:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Confirmed: ${user.email_confirmed_at ? 'YES (' + user.email_confirmed_at + ')' : '❌ NO'}`);
    console.log(`  Created: ${user.created_at}`);
    console.log(`  Last sign in: ${user.last_sign_in_at || 'never'}`);
    console.log(`  Metadata: ${JSON.stringify(user.user_metadata)}`);
  } else {
    console.log('❌ No auth user found');
  }

  // 2. Profile
  const { data: profile } = await sb.from('profiles').select('*').eq('email', EMAIL).maybeSingle();
  if (profile) {
    console.log('\n✅ PROFILE:');
    console.log(`  ID: ${profile.id}`);
    console.log(`  Name: ${profile.full_name}`);
    console.log(`  Status: ${profile.crm_status}`);
    console.log(`  Language: ${profile.language}`);
    console.log(`  Birthdate: ${profile.birthdate}`);
  } else {
    console.log('\n❌ No profile found');
  }

  // 3. Email log
  const { data: emails } = await sb.from('email_log').select('*').eq('to_email', EMAIL).order('created_at', { ascending: false }).limit(5);
  console.log(`\n📧 EMAIL LOG: ${emails?.length ?? 0} entries`);
  emails?.forEach(e => console.log(`  ${e.created_at} | ${e.template} | ${e.status} | ${e.subject}`));

  // 4. If user exists but not confirmed, offer to confirm
  if (user && !user.email_confirmed_at) {
    console.log('\n⚠️  Email NOT confirmed! Confirming now...');
    const { error: confirmErr } = await sb.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (confirmErr) {
      console.log('  ❌ Confirm failed:', confirmErr.message);
    } else {
      console.log('  ✅ Email confirmed manually via admin API!');
    }
  }

  console.log('\nDone.');
}

main().catch(console.error);
