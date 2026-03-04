/**
 * Telegram Bot — Bilingual Texts (DE / RU)
 *
 * All user-facing bot messages live here for easy editing.
 * Functions accept locale ('de' | 'ru') and return the translated string.
 */

type Locale = 'de' | 'ru';

const t = (de: string, ru: string) => (locale: Locale) => locale === 'de' ? de : ru;

// ── /start ──────────────────────────────────────────────────────────────

export const startWelcomeLinked = (name: string) => t(
  `Willkommen zurück, ${name}! 🌟\nSchön, dass du da bist. Was kann ich für dich tun?\nSwetlana`,
  `С возвращением, ${name}! 🌟\nРада тебя видеть. Чем могу помочь?\nСветлана`,
);

export const startWelcomeNew = t(
  '🌟 Willkommen bei Numerologie PRO!\n\nIch bin Swetlana, deine persönliche Numerologin. Was kann ich für dich tun?',
  '🌟 Добро пожаловать в Нумерология PRO!\n\nЯ Светлана, твой персональный нумеролог. Чем могу помочь?',
);

export const startLinkedSuccess = (name: string) => t(
  `✅ Perfekt, ${name}! Dein Telegram ist jetzt mit deinem Konto verbunden.\n\nDu erhältst ab sofort Erinnerungen und PDFs auch hier.\nSwetlana`,
  `✅ Отлично, ${name}! Твой Telegram теперь привязан к аккаунту.\n\nТеперь ты будешь получать напоминания и PDF также здесь.\nСветлана`,
);

export const startAlreadyLinked = t(
  '✅ Dein Telegram ist bereits verbunden.\nSwetlana',
  '✅ Твой Telegram уже привязан.\nСветлана',
);

// ── /analyse ────────────────────────────────────────────────────────────

export const analyseAsk = t(
  '🔮 Gib mir dein Geburtsdatum (TT.MM.JJJJ) und ich berechne deine Schicksalszahl!\n\nBeispiel: 15.03.1990',
  '🔮 Напиши мне дату рождения (ДД.ММ.ГГГГ) и я рассчитаю твоё число судьбы!\n\nПример: 15.03.1990',
);

export const analyseResult = (destinyNumber: number, description: string) => t(
  `🔮 <b>Deine Schicksalszahl: ${destinyNumber}</b>\n\n${description}\n\n💫 Möchtest du die vollständige 12-seitige Analyse? Ich erstelle sie persönlich für dich!`,
  `🔮 <b>Твоё число судьбы: ${destinyNumber}</b>\n\n${description}\n\n💫 Хочешь получить полный 12-страничный анализ? Я подготовлю его лично для тебя!`,
);

export const analyseInvalidDate = t(
  '❌ Ungültiges Datum. Bitte im Format TT.MM.JJJJ eingeben (z.B. 15.03.1990).',
  '❌ Неверная дата. Пожалуйста, введи в формате ДД.ММ.ГГГГ (напр. 15.03.1990).',
);

export const analyseBuyPdf = t(
  '📄 Vollständige PDF-Analyse für nur 9,99 €',
  '📄 Полный PDF-анализ всего за 9,99 €',
);

// ── /kompatibel ─────────────────────────────────────────────────────────

export const compatAsk = t(
  '💕 Gib mir zwei Geburtsdaten, getrennt durch ein Komma, und ich prüfe eure Kompatibilität!\n\nBeispiel: 15.03.1990, 22.07.1988',
  '💕 Напиши мне две даты рождения через запятую и я проверю вашу совместимость!\n\nПример: 15.03.1990, 22.07.1988',
);

export const compatResult = (score: number, level: string, summary: string) => t(
  `💕 <b>Kompatibilität: ${score}%</b> (${level})\n\n${summary}`,
  `💕 <b>Совместимость: ${score}%</b> (${level})\n\n${summary}`,
);

export const compatBuy = t(
  '📊 Vollständige Beziehungsmatrix buchen',
  '📊 Заказать полную матрицу отношений',
);

// ── /heute ───────────────────────────────────────────────────────────────

export const heuteNoBirthdate = t(
  '❌ Dein Geburtsdatum ist nicht hinterlegt. Verbinde zuerst dein Konto oder nutze /analyse.',
  '❌ Твоя дата рождения не указана. Сначала привяжи аккаунт или используй /analyse.',
);

export const heuteResult = (dayNumber: number, description: string) => t(
  `✨ <b>Deine persönliche Tageszahl: ${dayNumber}</b>\n\n${description}\n\nSwetlana 💫`,
  `✨ <b>Твоё личное число дня: ${dayNumber}</b>\n\n${description}\n\nСветлана 💫`,
);

// ── /meinepdfs ──────────────────────────────────────────────────────────

export const pdfsNone = t(
  '📂 Du hast noch keine PDFs.\n\nEntdecke meine Analysen und starte deine Numerologie-Reise! 💫',
  '📂 У тебя ещё нет PDF.\n\nОткрой мои анализы и начни свой нумерологический путь! 💫',
);

export const pdfsHeader = t(
  '📂 <b>Deine PDFs:</b>\n',
  '📂 <b>Твои PDF:</b>\n',
);

// ── /termin ─────────────────────────────────────────────────────────────

export const terminNone = t(
  '📅 Du hast aktuell keinen geplanten Termin.\n\nBuch dir eine Beratung unter /pakete — ich freue mich auf dich!',
  '📅 У тебя сейчас нет запланированной сессии.\n\nЗапишись на консультацию через /pakete — буду рада!',
);

export const terminInfo = (packageType: string, dateStr: string, meetingLink: string | null) => t(
  `📅 <b>Dein nächster Termin</b>\n\n📍 ${packageType}\n⏰ ${dateStr}${meetingLink ? `\n🔗 <a href="${meetingLink}">Meeting beitreten</a>` : ''}\n\nIch freue mich auf dich! 💫\nSwetlana`,
  `📅 <b>Твоя следующая сессия</b>\n\n📍 ${packageType}\n⏰ ${dateStr}${meetingLink ? `\n🔗 <a href="${meetingLink}">Войти в встречу</a>` : ''}\n\nЖду тебя! 💫\nСветлана`,
);

export const terminPending = (packageType: string) => t(
  `📅 <b>${packageType}</b>\n⏳ Termin ausstehend — bitte buche deinen Termin, ich freue mich darauf!`,
  `📅 <b>${packageType}</b>\n⏳ Время не назначено — запишись, буду ждать!`,
);

// ── /pakete ─────────────────────────────────────────────────────────────

export const paketeHeader = t(
  '🛍️ <b>Meine Pakete für dich:</b>\n',
  '🛍️ <b>Мои пакеты для тебя:</b>\n',
);

export const paketeItem = (name: string, price: string, desc: string) => t(
  `\n<b>${name}</b> — ${price}\n${desc}`,
  `\n<b>${name}</b> — ${price}\n${desc}`,
);

// ── /empfehlen (Referral) ───────────────────────────────────────────────

export const referralCode = (code: string, count: number, converted: number) => t(
  `🎁 <b>Dein persönlicher Empfehlungs-Link:</b>\n\nhttps://numerologie-pro.com/?ref=${code}\n\nTeile ihn mit Freunden — als Dankeschön bekommst du für jede Buchung einen 15%-Gutschein! 🎉\n\n📊 Einladungen: ${count} | Davon gebucht: ${converted}`,
  `🎁 <b>Твоя персональная реферальная ссылка:</b>\n\nhttps://numerologie-pro.com/?ref=${code}\n\nПоделись с друзьями — в благодарность за каждую покупку ты получишь купон на 15%! 🎉\n\n📊 Приглашений: ${count} | Из них купили: ${converted}`,
);

export const referralNotLinked = t(
  '❌ Verbinde zuerst dein Konto, um einen Empfehlungs-Link zu erhalten.',
  '❌ Сначала привяжи аккаунт, чтобы получить реферальную ссылку.',
);

// ── /hilfe ──────────────────────────────────────────────────────────────

export const hilfe = t(
  `📋 <b>Was ich für dich tun kann:</b>

🔮 <b>Analyse</b> — Kostenlose Mini-Analyse deiner Schicksalszahl
💕 <b>Kompatibilität</b> — Beziehungs-Check für zwei Personen
✨ <b>Tageszahl</b> — Deine persönliche Energie für heute
📂 <b>Meine PDFs</b> — Alle deine Analysen erneut senden
🛍️ <b>Pakete</b> — Meine Angebote mit Preisen
📅 <b>Termin</b> — Deinen nächsten Termin anzeigen
🎁 <b>Empfehlen</b> — Dein persönlicher Empfehlungs-Link
🔗 <b>Konto verbinden</b> — Telegram mit deinem Profil verknüpfen
🌐 <b>Sprache</b> — Bot-Sprache wechseln

Wähle unten eine Option oder schreib mir einfach 💬\nSwetlana`,
  `📋 <b>Чем я могу тебе помочь:</b>

🔮 <b>Анализ</b> — Бесплатный мини-анализ числа судьбы
💕 <b>Совместимость</b> — Проверка для двух людей
✨ <b>Число дня</b> — Твоя персональная энергия на сегодня
📂 <b>Мои PDF</b> — Отправить все твои анализы
🛍️ <b>Пакеты</b> — Мои предложения с ценами
📅 <b>Сессия</b> — Показать следующий сеанс
🎁 <b>Рекомендовать</b> — Твоя персональная реферальная ссылка
🔗 <b>Привязать аккаунт</b> — Связать Telegram с профилем
🌐 <b>Язык</b> — Сменить язык бота

Выбери опцию ниже или просто напиши мне 💬\nСветлана`,
);

// ── FAQ / Freitext ──────────────────────────────────────────────────────

export const faqForwarded = t(
  '📨 Danke für deine Nachricht! Ich melde mich so schnell wie möglich bei dir.\nSwetlana',
  '📨 Спасибо за сообщение! Я отвечу тебе как можно скорее.\nСветлана',
);

export const faqCancel = t(
  '📋 Für Stornierungen schreib mir an info@numerologie-pro.com oder nutze den Widerruf-Link in deiner Bestätigungs-E-Mail.',
  '📋 Для отмены напиши мне на info@numerologie-pro.com или используй ссылку отмены в письме-подтверждении.',
);

export const faqPricing = t(
  '💰 Alle Preise und Pakete findest du unter /pakete oder auf meiner Website:\nhttps://numerologie-pro.com/de/pakete',
  '💰 Все цены и пакеты ты найдёшь через /pakete или на моём сайте:\nhttps://numerologie-pro.com/ru/pakete',
);

export const faqContact = t(
  '📞 So erreichst du mich:\n📧 info@numerologie-pro.com\n🌐 https://numerologie-pro.com\n\nSwetlana 💛',
  '📞 Мои контакты:\n📧 info@numerologie-pro.com\n🌐 https://numerologie-pro.com\n\nСветлана 💛',
);

export const faqPrivacy = t(
  '🔒 Datenschutz: https://numerologie-pro.com/de/datenschutz',
  '🔒 Конфиденциальность: https://numerologie-pro.com/ru/datenschutz',
);

// ── /verbinden ─────────────────────────────────────────────────────────

export const verbindenAskEmail = t(
  '📧 Schick mir deine E-Mail-Adresse, mit der du dich bei Numerologie PRO registriert hast.\n\nWenn du noch kein Konto hast, erstelle ich eins für dich!',
  '📧 Напиши мне свой email, с которым ты зарегистрирован(а) в Нумерология PRO.\n\nЕсли у тебя ещё нет аккаунта — я создам его для тебя!',
);

export const verbindenAlreadyLinked = (name: string) => t(
  `✅ Dein Telegram ist bereits mit deinem Konto verbunden, ${name}!\n\nSwetlana`,
  `✅ Твой Telegram уже привязан к аккаунту, ${name}!\n\nСветлана`,
);

export const verbindenCodeSent = (email: string) => t(
  `📨 Ich habe dir einen 6-stelligen Code an <b>${email}</b> gesendet.\n\nBitte schick mir den Code hier im Chat.\n\n⏳ Der Code ist 10 Minuten gültig.`,
  `📨 Я отправила 6-значный код на <b>${email}</b>.\n\nПожалуйста, отправь мне код здесь в чате.\n\n⏳ Код действителен 10 минут.`,
);

export const verbindenInvalidEmail = t(
  '❌ Das sieht nicht wie eine gültige E-Mail-Adresse aus. Bitte versuche es erneut.',
  '❌ Это не похоже на правильный email. Попробуй ещё раз.',
);

export const verbindenInvalidCode = t(
  '❌ Falscher Code. Bitte prüfe den Code in deiner E-Mail und versuche es erneut.',
  '❌ Неверный код. Проверь код в письме и попробуй снова.',
);

export const verbindenExpired = t(
  '⏰ Der Code ist abgelaufen. Bitte starte erneut mit /verbinden.',
  '⏰ Код истёк. Попробуй снова с помощью /verbinden.',
);

export const verbindenSuccess = (name: string) => t(
  `🎉 Perfekt, ${name}! Dein Telegram ist jetzt mit deinem Konto verbunden.\n\nDu erhältst ab sofort Erinnerungen, PDFs und Benachrichtigungen auch hier! 💫\nSwetlana`,
  `🎉 Отлично, ${name}! Твой Telegram привязан к аккаунту.\n\nТеперь ты будешь получать напоминания, PDF и уведомления также здесь! 💫\nСветлана`,
);

export const verbindenNewAccount = (name: string) => t(
  `🎉 Willkommen, ${name}! Ich habe ein Konto für dich erstellt und dein Telegram verknüpft.\n\n📧 Prüfe dein E-Mail-Postfach — dort findest du einen Link, um dein Passwort zu setzen und dein Dashboard zu öffnen.\n\nSwetlana 💫`,
  `🎉 Добро пожаловать, ${name}! Я создала для тебя аккаунт и привязала Telegram.\n\n📧 Проверь почту — там ссылка для установки пароля и входа в личный кабинет.\n\nСветлана 💫`,
);

export const verbindenEmailFailed = t(
  '❌ Die E-Mail konnte leider nicht gesendet werden. Bitte versuche es später erneut.',
  '❌ К сожалению, не удалось отправить email. Попробуй позже.',
);

// ── /sprache ──────────────────────────────────────────────────────────

export const spracheAsk = t(
  '🌐 <b>Sprache wählen / Выберите язык:</b>',
  '🌐 <b>Выберите язык / Sprache wählen:</b>',
);

export const spracheChanged = t(
  '✅ Sprache auf <b>Deutsch</b> umgestellt! 🇩🇪\n\nAlle Nachrichten erscheinen jetzt auf Deutsch.\nSwetlana',
  '✅ Язык изменён на <b>Русский</b>! 🇷🇺\n\nВсе сообщения теперь будут на русском.\nСветлана',
);

// ── Inline Buttons ──────────────────────────────────────────────────────

export const btnFreeAnalysis = t('🔮 Kostenlose Analyse', '🔮 Бесплатный анализ');
export const btnPackages = t('🛍️ Pakete ansehen', '🛍️ Посмотреть пакеты');
export const btnLinkAccount = t('🔗 Konto verbinden', '🔗 Привязать аккаунт');
export const btnBuyPdf = t('📄 PDF kaufen (9,99 €)', '📄 Купить PDF (9,99 €)');
export const btnBookConsultation = t('📅 Beratung buchen', '📅 Записаться');
export const btnMyPdfs = t('📂 Meine PDFs', '📂 Мои PDF');
