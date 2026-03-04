import { sendMessage, inlineKeyboard, button } from '@/lib/telegram/bot';
import { PACKAGES } from '@/lib/stripe/products';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /pakete — Show all packages with prices and checkout links
 */
export async function handlePakete(chatId: number, locale: 'de' | 'ru') {
  const baseUrl = `https://numerologie-pro.com/${locale}/pakete`;

  let text = i18n.paketeHeader(locale);

  const packageList = Object.values(PACKAGES);
  for (const pkg of packageList) {
    const name = locale === 'de' ? pkg.name_de : pkg.name_ru;
    const price = `${(pkg.price_cents / 100).toFixed(2)} €`;
    const desc = pkg.is_consultation
      ? (locale === 'de' ? `${pkg.duration_minutes} Min. Beratung` : `${pkg.duration_minutes} мин. консультация`)
      : (locale === 'de' ? 'PDF-Analyse per E-Mail' : 'PDF-анализ по e-mail');

    text += i18n.paketeItem(name, price, desc)(locale);
  }

  await sendMessage({
    chat_id: chatId,
    text,
    reply_markup: inlineKeyboard([
      button(
        locale === 'de' ? '🛍️ Jetzt buchen' : '🛍️ Забронировать',
        { url: baseUrl },
      ),
      button(
        locale === 'de' ? '📞 Kostenlose Beratung' : '📞 Бесплатная консультация',
        { url: `https://numerologie-pro.com/${locale}#kontakt` },
      ),
    ]),
  });
}
