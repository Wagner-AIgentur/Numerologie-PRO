import pg from 'pg';
const { Client } = pg;

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  // 1. Check demo account in auth.users
  const { rows: authUsers } = await client.query(
    "SELECT id, email, created_at FROM auth.users WHERE email = 'demo@wagner-aigentur.com'"
  );
  console.log('=== AUTH USER ===');
  console.log(JSON.stringify(authUsers, null, 2));

  // 2. Check profile + team role
  if (authUsers.length > 0) {
    const userId = authUsers[0].id;
    const { rows: profile } = await client.query(
      'SELECT id, email, full_name, crm_status, team_role_id FROM profiles WHERE id = $1',
      [userId]
    );
    console.log('\n=== PROFILE ===');
    console.log(JSON.stringify(profile, null, 2));

    if (profile.length > 0 && profile[0].team_role_id) {
      const { rows: role } = await client.query(
        'SELECT name, permissions FROM team_roles WHERE id = $1',
        [profile[0].team_role_id]
      );
      console.log('\n=== TEAM ROLE ===');
      console.log(JSON.stringify(role, null, 2));
    }
  }

  // 3. Count demo data
  const queries = [
    ['voice_calls (is_demo)', "SELECT COUNT(*) as cnt FROM voice_calls WHERE is_demo = true"],
    ['voice_leads (is_demo)', "SELECT COUNT(*) as cnt FROM voice_leads WHERE is_demo = true"],
    ['voice_call_analyses (is_demo)', "SELECT COUNT(*) as cnt FROM voice_call_analyses WHERE is_demo = true"],
    ['voice_appointments (is_demo)', "SELECT COUNT(*) as cnt FROM voice_appointments WHERE is_demo = true"],
    ['voice_call_events (demo calls)', "SELECT COUNT(*) as cnt FROM voice_call_events WHERE call_id IN (SELECT id FROM voice_calls WHERE is_demo = true)"],
    ['voice_calls TOTAL', "SELECT COUNT(*) as cnt FROM voice_calls"],
    ['voice_leads TOTAL', "SELECT COUNT(*) as cnt FROM voice_leads"],
    ['voice_call_analyses TOTAL', "SELECT COUNT(*) as cnt FROM voice_call_analyses"],
    ['voice_appointments TOTAL', "SELECT COUNT(*) as cnt FROM voice_appointments"],
  ];

  console.log('\n=== DEMO DATA COUNTS ===');
  for (const [label, sql] of queries) {
    try {
      const { rows } = await client.query(sql);
      console.log(`${label}: ${rows[0].cnt}`);
    } catch (e) {
      console.log(`${label}: ERROR - ${e.message}`);
    }
  }

  // 4. Check RLS policies on voice tables
  const { rows: policies } = await client.query("SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE policyname LIKE '%demo%' ORDER BY tablename");
  console.log('\n=== DEMO RLS POLICIES ===');
  policies.forEach(p => console.log(`${p.tablename} | ${p.policyname} | ${p.cmd}`));

  // 5. Show demo calls details
  const { rows: demoCalls } = await client.query(
    "SELECT id, language, duration_seconds, status, summary, created_at FROM voice_calls WHERE is_demo = true ORDER BY created_at"
  );
  console.log('\n=== DEMO CALLS ===');
  demoCalls.forEach(c => console.log(`${c.id} | ${c.language} | ${c.duration_seconds}s | ${c.status} | ${(c.summary || '').substring(0, 60)}`));

  // 6. Show demo leads details
  const { rows: demoLeads } = await client.query(
    "SELECT id, name, email, score, grade, status, created_at FROM voice_leads WHERE is_demo = true ORDER BY created_at"
  );
  console.log('\n=== DEMO LEADS ===');
  demoLeads.forEach(l => console.log(`${l.id} | ${l.name} | ${l.grade} | ${l.score} | ${l.status}`));

  // 7. Show demo analyses details
  const { rows: demoAnalyses } = await client.query(
    "SELECT id, kategorie, interessiertes_paket, kaufbereitschaft, status, zusammenfassung FROM voice_call_analyses WHERE is_demo = true ORDER BY created_at"
  );
  console.log('\n=== DEMO ANALYSES ===');
  demoAnalyses.forEach(a => console.log(`${a.id} | ${a.kategorie} | ${a.interessiertes_paket} | ${a.kaufbereitschaft} | ${(a.zusammenfassung || '').substring(0, 60)}`));

  // 8. Show demo appointments details
  const { rows: demoAppts } = await client.query(
    "SELECT id, attendee_name, attendee_email, scheduled_at, status FROM voice_appointments WHERE is_demo = true ORDER BY created_at"
  );
  console.log('\n=== DEMO APPOINTMENTS ===');
  demoAppts.forEach(a => console.log(`${a.id} | ${a.attendee_name} | ${a.attendee_email} | ${a.scheduled_at} | ${a.status}`));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
