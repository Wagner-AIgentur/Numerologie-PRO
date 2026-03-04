import pg from 'pg';
const { Client } = pg;

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  const demoUserId = 'bc3f074e-0a08-42ef-9307-06b95acf3a75';
  const demoEmail = 'demo@wagner-aigentur.com';

  // Insert identity — email column is GENERATED, so omit it
  await client.query(
    `INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
     VALUES ($1, $2::uuid, $3::jsonb, 'email', NOW(), NOW(), NOW())
     ON CONFLICT (provider_id, provider) DO NOTHING`,
    [
      demoUserId,
      demoUserId,
      JSON.stringify({ sub: demoUserId, email: demoEmail, email_verified: true, phone_verified: false }),
    ]
  );

  console.log('Identity created for demo user');

  // Verify
  const { rows } = await client.query(
    'SELECT provider_id, user_id, provider, email FROM auth.identities WHERE user_id = $1::uuid',
    [demoUserId]
  );
  console.log('Verified:', JSON.stringify(rows));

  // Also ensure raw_app_meta_data has the provider
  await client.query(
    `UPDATE auth.users SET raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb WHERE id = $1::uuid`,
    [demoUserId]
  );
  console.log('Updated raw_app_meta_data');

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
