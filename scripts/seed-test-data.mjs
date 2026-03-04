/**
 * Standalone seed script — runs directly against PostgreSQL.
 * Usage: node scripts/seed-test-data.mjs
 *
 * Creates test data for info@wagner-aigentur.com so all features can be tested.
 * Safe to re-run (cleans up previous test data first).
 */
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.cyjxsgrtcllckgmqchwe.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'N^XEBo68xNrb67$P@26X',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  // 1. Fix sessions_status_check constraint if needed
  const { rows: constraints } = await client.query(`
    SELECT pg_get_constraintdef(oid) as def
    FROM pg_constraint
    WHERE conname = 'sessions_status_check'
    AND conrelid = 'public.sessions'::regclass
  `);

  if (constraints.length > 0) {
    console.log('Current sessions_status_check:', constraints[0].def);
    if (!constraints[0].def.includes("'scheduled'")) {
      console.log('Fixing sessions_status_check to include scheduled/rescheduled...');
      await client.query('ALTER TABLE public.sessions DROP CONSTRAINT sessions_status_check');
      await client.query(`
        ALTER TABLE public.sessions
        ADD CONSTRAINT sessions_status_check
        CHECK (status IN ('pending', 'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'))
      `);
      console.log('Fixed sessions_status_check');
    }
  }

  // 2. Find admin profile
  const { rows: profiles } = await client.query(
    "SELECT id, email, full_name FROM public.profiles WHERE email = 'info@wagner-aigentur.com'"
  );
  if (profiles.length === 0) {
    console.error('Admin profile not found!');
    process.exit(1);
  }
  const profile = profiles[0];
  console.log(`Found admin profile: ${profile.id} (${profile.email})`);

  // 3. Find products
  const { rows: products } = await client.query(
    "SELECT id, package_key, name_de, price_cents FROM public.products WHERE package_key IN ('beziehungsmatrix', 'lebensbestimmung', 'pdf_analyse', 'wachstumsplan')"
  );
  const productMap = Object.fromEntries(products.map(p => [p.package_key, p]));
  console.log(`Found ${products.length} products:`, products.map(p => p.package_key).join(', '));

  // 4. Clean up existing test data
  // First find test orders
  const { rows: existingOrders } = await client.query(
    "SELECT id FROM public.orders WHERE profile_id = $1 AND stripe_checkout_session_id LIKE 'cs_test_%'",
    [profile.id]
  );
  if (existingOrders.length > 0) {
    const orderIds = existingOrders.map(o => o.id);
    // Find sessions linked to these orders
    const { rows: linkedSessions } = await client.query(
      'SELECT id FROM public.sessions WHERE order_id = ANY($1)', [orderIds]
    );
    if (linkedSessions.length > 0) {
      const sessionIds = linkedSessions.map(s => s.id);
      // Delete deliverables linked to sessions
      await client.query('DELETE FROM public.deliverables WHERE session_id = ANY($1)', [sessionIds]);
    }
    // Delete sessions and orders
    await client.query('DELETE FROM public.sessions WHERE order_id = ANY($1)', [orderIds]);
    await client.query('DELETE FROM public.orders WHERE id = ANY($1)', [orderIds]);
    console.log(`Cleaned up ${orderIds.length} existing test orders + related data`);
  }
  // Clean up free test sessions
  await client.query(
    "DELETE FROM public.sessions WHERE profile_id = $1 AND session_type = 'free' AND package_type = 'kostenlose_beratung'",
    [profile.id]
  );
  // Clean up orphan test deliverables
  await client.query(
    "DELETE FROM public.deliverables WHERE profile_id = $1 AND (title LIKE '%Karmische%' OR title LIKE '%Numerologische Analyse%' OR title LIKE '%Aufzeichnung%')",
    [profile.id]
  );
  console.log('Cleanup complete');

  // 5. Create test orders
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  threeDaysFromNow.setHours(14, 0, 0, 0);

  const orderInsertSQL = `
    INSERT INTO public.orders (profile_id, customer_email, product_id,
      stripe_checkout_session_id, stripe_payment_intent_id,
      amount_cents, currency, status, payment_method, paid_at, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, product_id, amount_cents, status
  `;

  const order1 = await client.query(orderInsertSQL, [
    profile.id, profile.email, productMap['beziehungsmatrix']?.id,
    'cs_test_beziehungsmatrix_001', 'pi_test_beziehungsmatrix_001',
    productMap['beziehungsmatrix']?.price_cents ?? 9900, 'eur', 'paid', 'card',
    twoDaysAgo.toISOString(),
    JSON.stringify({ package_key: 'beziehungsmatrix', locale: 'de', test: true }),
  ]);

  const order2 = await client.query(orderInsertSQL, [
    profile.id, profile.email, productMap['lebensbestimmung']?.id,
    'cs_test_lebensbestimmung_001', 'pi_test_lebensbestimmung_001',
    productMap['lebensbestimmung']?.price_cents ?? 9900, 'eur', 'paid', 'card',
    tenDaysAgo.toISOString(),
    JSON.stringify({ package_key: 'lebensbestimmung', locale: 'de', test: true }),
  ]);

  const order3 = await client.query(orderInsertSQL, [
    profile.id, profile.email, productMap['pdf_analyse']?.id,
    'cs_test_pdf_analyse_001', 'pi_test_pdf_analyse_001',
    productMap['pdf_analyse']?.price_cents ?? 999, 'eur', 'paid', 'card',
    fiveDaysAgo.toISOString(),
    JSON.stringify({ package_key: 'pdf_analyse', locale: 'de', test: true }),
  ]);

  const orders = [order1.rows[0], order2.rows[0], order3.rows[0]];
  console.log(`Created ${orders.length} orders`);

  // 6. Create test sessions
  // Actual columns: id, profile_id, order_id, title, scheduled_at, duration_min,
  //   status, meeting_url, recording_url, notes, created_at, updated_at,
  //   session_type, cal_event_slug, reminder_sent_at, cal_booking_id,
  //   meeting_link, platform, package_type, duration_minutes, admin_notes
  const sessionInsertSQL = `
    INSERT INTO public.sessions (profile_id, order_id, title, package_type,
      scheduled_at, duration_minutes, platform, meeting_link, status,
      cal_booking_id, cal_event_slug, session_type, recording_url, admin_notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, package_type, status, session_type
  `;

  // Upcoming session (Beziehungsmatrix)
  const session1 = await client.query(sessionInsertSQL, [
    profile.id, orders[0].id, 'Beziehungsmatrix Beratung', 'beziehungsmatrix',
    threeDaysFromNow.toISOString(), 90, 'zoom',
    'https://zoom.us/j/1234567890?pwd=testmeeting',
    'scheduled', 'cal_test_booking_001', 'карта-отношении',
    'paid', null, 'Test-Session: Beziehungsmatrix Beratung',
  ]);

  // Completed session (Lebensbestimmung)
  const session2 = await client.query(sessionInsertSQL, [
    profile.id, orders[1].id, 'Lebensbestimmung Beratung', 'lebensbestimmung',
    fiveDaysAgo.toISOString(), 90, 'zoom',
    'https://zoom.us/j/9876543210?pwd=testcomplete',
    'completed', 'cal_test_booking_002', 'предназначение-и-реализация',
    'paid', 'https://zoom.us/rec/share/test-recording-lebensbestimmung',
    'Test-Session: Lebensbestimmung (abgeschlossen)',
  ]);

  // Free consultation
  const session3 = await client.query(sessionInsertSQL, [
    profile.id, null, 'Kostenlose Erstberatung', 'kostenlose_beratung',
    null, 30, null, null,
    'scheduled', null, null,
    'free', null, 'Kostenlose Erstberatung — Termin noch nicht gebucht',
  ]);

  const sessions = [session1.rows[0], session2.rows[0], session3.rows[0]];
  console.log(`Created ${sessions.length} sessions`);

  // 7. Create test deliverables
  // Actual columns: id, profile_id, session_id, title, file_url, file_type, expires_at, created_at
  const delivInsertSQL = `
    INSERT INTO public.deliverables (profile_id, session_id, title, file_url, file_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, file_type
  `;

  const deliv1 = await client.query(delivInsertSQL, [
    profile.id, null,
    'Numerologische Analyse — PDF',
    'https://cyjxsgrtcllckgmqchwe.supabase.co/storage/v1/object/public/pdfs/test-numerologie-analyse.pdf',
    'pdf',
  ]);

  const deliv2 = await client.query(delivInsertSQL, [
    profile.id, sessions[1].id,
    'Aufzeichnung — Lebensbestimmung',
    'https://zoom.us/rec/share/test-recording-lebensbestimmung',
    'video',
  ]);

  const deliv3 = await client.query(delivInsertSQL, [
    profile.id, null,
    'Karmische Analyse — Geburtstagscode',
    'https://cyjxsgrtcllckgmqchwe.supabase.co/storage/v1/object/public/pdfs/test-karmic-birthday-code.pdf',
    'pdf',
  ]);

  const deliverables = [deliv1.rows[0], deliv2.rows[0], deliv3.rows[0]];
  console.log(`Created ${deliverables.length} deliverables`);

  // 8. Summary
  console.log('\n========================================');
  console.log('  SEED COMPLETE');
  console.log('========================================');
  console.log(`Profile:      ${profile.email} (${profile.id})`);
  console.log(`\nOrders (${orders.length}):`);
  orders.forEach((o, i) => console.log(`  ${i+1}. ${o.id} — ${o.amount_cents} cents (${o.status})`));
  console.log(`\nSessions (${sessions.length}):`);
  sessions.forEach((s, i) => console.log(`  ${i+1}. ${s.id} — ${s.package_type} (${s.status}, ${s.session_type})`));
  console.log(`\nDeliverables (${deliverables.length}):`);
  deliverables.forEach((d, i) => console.log(`  ${i+1}. ${d.id} — ${d.title} (${d.file_type})`));
  console.log('\nDu kannst jetzt im Dashboard alle Funktionen testen!');

  await client.end();
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
