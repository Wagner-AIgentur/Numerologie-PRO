/**
 * One-time script: Upsert Stripe price IDs into Supabase products table.
 *
 * Usage:  npx tsx scripts/seed-stripe-prices.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually (before createClient)
function loadEnv() {
  // Try .env.production.local first (has Supabase vars), fallback to .env.local
  const prodPath = resolve(process.cwd(), '.env.production.local');
  const localPath = resolve(process.cwd(), '.env.local');
  let envPath: string;
  try { readFileSync(prodPath); envPath = prodPath; } catch { envPath = localPath; }
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
loadEnv();

const PRICES = [
  {
    package_key: 'geldkanal',
    stripe_product_id: 'prod_U1qjaBeLutOkRw',
    stripe_price_id: 'price_1T3n2WRwHYv01b52pGCIIboA',
    name_de: 'Geldkanal',
    name_ru: 'Денежный канал',
    price_cents: 9900,
  },
  {
    package_key: 'jahresprognose',
    stripe_product_id: 'prod_U1r6IgBFLkmHxX',
    stripe_price_id: 'price_1T3nOXRwHYv01b52hdMljmKV',
    name_de: 'Jahresprognose',
    name_ru: 'Прогноз на год',
    price_cents: 11900,
  },
  {
    package_key: 'jahresprognose_pdf',
    stripe_product_id: 'prod_U1r7RieM4xSQsr',
    stripe_price_id: 'price_1T3nPIRwHYv01b52vB8SBf7A',
    name_de: 'Jahresprognose + PDF',
    name_ru: 'Прогноз на год + PDF',
    price_cents: 17900,
  },
  {
    package_key: 'monatsprognose',
    stripe_product_id: 'prod_U1rElK8shuTwC3',
    stripe_price_id: 'price_1T3nWSRwHYv01b52Vrnwd1OW',
    name_de: 'Monatsprognose',
    name_ru: 'Прогноз на месяц',
    price_cents: 1900,
  },
  {
    package_key: 'tagesprognose',
    stripe_product_id: 'prod_U1rGoLlr0U6I3u',
    stripe_price_id: 'price_1T3nXXRwHYv01b52Ys4jjNKx',
    name_de: 'Tagesprognose',
    name_ru: 'Прогноз на день',
    price_cents: 1400,
  },
  {
    package_key: 'lebenskarte',
    stripe_product_id: 'prod_U1rIJyfRyzrtSu',
    stripe_price_id: 'price_1T3nZsRwHYv01b52nien0zQU',
    name_de: 'Lebenskarte – Basisanalyse',
    name_ru: 'Карта жизни — базовый разбор',
    price_cents: 7900,
  },
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  for (const p of PRICES) {
    // Try update first (by package_key)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('package_key', p.package_key)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update({
          stripe_product_id: p.stripe_product_id,
          stripe_price_id: p.stripe_price_id,
          price_cents: p.price_cents,
        })
        .eq('package_key', p.package_key);

      if (error) {
        console.error(`UPDATE failed for ${p.package_key}:`, error.message);
      } else {
        console.log(`UPDATED ${p.package_key}`);
      }
    } else {
      // Insert new row
      const { error } = await supabase.from('products').insert({
        package_key: p.package_key,
        stripe_product_id: p.stripe_product_id,
        stripe_price_id: p.stripe_price_id,
        name_de: p.name_de,
        name_ru: p.name_ru,
        price_cents: p.price_cents,
        currency: 'eur',
        is_active: true,
        is_featured: false,
        sort_order: 0,
      });

      if (error) {
        console.error(`INSERT failed for ${p.package_key}:`, error.message);
      } else {
        console.log(`INSERTED ${p.package_key}`);
      }
    }
  }

  console.log('\nDone!');
}

main();
