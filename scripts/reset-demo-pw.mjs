import pg from 'pg';
const { Client } = pg;

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  // Use cost factor 6 to match the existing working user hash format
  await client.query(
    "UPDATE auth.users SET encrypted_password = crypt($1, gen_salt('bf', 6)) WHERE email = 'demo@wagner-aigentur.com'",
    ['YOUR_DEMO_PASSWORD']
  );

  // Verify
  const { rows } = await client.query(
    "SELECT substring(encrypted_password, 1, 10) as prefix, encrypted_password = crypt($1, encrypted_password) as match FROM auth.users WHERE email = 'demo@wagner-aigentur.com'",
    ['YOUR_DEMO_PASSWORD']
  );
  console.log('Hash prefix:', rows[0].prefix, '| Match:', rows[0].match);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
