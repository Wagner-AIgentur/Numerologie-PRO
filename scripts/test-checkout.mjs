import { readFileSync } from 'fs';
import Stripe from 'stripe';

// Load env
const env = readFileSync('.env.production.local', 'utf-8');
for (const line of env.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  process.env[k] = v;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

try {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: 'price_1T3nZsRwHYv01b52nien0zQU', quantity: 1 }],
    customer_email: 'test@example.com',
    metadata: { package_key: 'lebenskarte', locale: 'ru' },
    success_url: 'https://numerologie-pro.com/ru/buchung/erfolg?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://numerologie-pro.com/ru/pakete?payment=cancelled',
    locale: 'ru',
  });
  console.log('SUCCESS:', session.url);
} catch (e) {
  console.error('ERROR:', e.message);
}
