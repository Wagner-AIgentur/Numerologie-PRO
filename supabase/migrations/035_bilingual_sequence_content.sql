-- ============================================================
-- 035: Bilingual Sequence Content — Russian Translations
-- Adds Russian translations to all 18 sequence steps
-- and Russian message variants to 4 automation rules.
-- ============================================================

-- ── 1. Lead Nurture Sequence (5 Steps) ──

UPDATE public.email_sequence_steps SET
  subject_ru = 'Твои числа говорят — послушай',
  content_html_ru = '<h2 style="color:#D4AF37;">Добро пожаловать в Numerologie PRO</h2><p>Твоя психоматрица рассчитана — и у неё есть что тебе рассказать.</p><p>Каждое число в твоей матрице раскрывает что-то о твоей личности, сильных сторонах и скрытых талантах.</p><p><a href="https://numerologie-pro.com/ru/rechner" style="color:#D4AF37;font-weight:bold;">Посмотри свою матрицу →</a></p><p>С любовью,<br/>Светлана</p>',
  content_telegram_ru = 'Добро пожаловать в Numerologie PRO! Твоя психоматрица рассчитана. Посмотри свои числа: https://numerologie-pro.com/ru/rechner'
WHERE subject = 'Deine Zahlen sprechen — hoer zu';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Что означает твоё число судьбы?',
  content_html_ru = '<h2 style="color:#D4AF37;">Твоё число судьбы</h2><p>Знал(а) ли ты, что твоё число судьбы показывает, какие задачи стоят перед тобой в этой жизни?</p><p>Оно раскрывает:</p><ul><li>Твои природные таланты и сильные стороны</li><li>Твоё жизненное предназначение</li><li>Области, в которых ты можешь расти</li></ul><p>В твоей полной матрице скрыто ещё больше ответов.</p><p><a href="https://numerologie-pro.com/ru/rechner" style="color:#D4AF37;font-weight:bold;">Посмотри полную матрицу →</a></p>',
  content_telegram_ru = 'Твоё число судьбы показывает твоё жизненное предназначение. Открой все 9 позиций своей матрицы: https://numerologie-pro.com/ru/rechner'
WHERE subject = 'Was bedeutet deine Schicksalszahl fuer dich?';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Твой персональный нумерологический отчёт',
  content_html_ru = '<h2 style="color:#D4AF37;">Твоя полная психоматрица в PDF</h2><p>Представь: ты держишь в руках персональный отчёт, который показывает:</p><ul><li>Все 9 позиций твоей психоматрицы с пояснениями</li><li>Твои сильные стороны и зоны роста</li><li>Конкретные рекомендации для отношений, карьеры и здоровья</li></ul><p>Твой персональный PDF-отчёт — создаётся за секунды на основе даты рождения.</p><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Заказать PDF-анализ — всего 9,99 EUR →</a></p>',
  content_telegram_ru = 'Твой персональный нумерологический отчёт — все 9 позиций матрицы с пояснениями. Всего 9,99 EUR: https://numerologie-pro.com/ru/pakete'
WHERE subject = 'Dein persoenlicher Numerologie-Report';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Что говорят мои клиенты',
  content_html_ru = '<h2 style="color:#D4AF37;">Отзывы клиентов об анализе</h2><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"Сначала я скептически относилась, но Светлана увидела то, что не покажет ни один тест. Консультация дала мне ясность."</em><br/>— Людмила К.</p></blockquote><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"PDF-анализ был только началом — персональная сессия изменила всё."</em><br/>— Марина С.</p></blockquote><p>Хочешь тоже получить ясность? Начни с бесплатной консультации.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Записаться на бесплатную 15-мин консультацию →</a></p>'
WHERE subject = 'Das sagen meine Kunden';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Твой отчёт ждёт тебя',
  content_html_ru = '<h2 style="color:#D4AF37;">Я подготовила твой отчёт</h2><p>Твоя психоматрица рассчитана. Твой персональный PDF-отчёт ждёт всего одного клика.</p><p>9 позиций. Твои числа. Твоя история.</p><p><strong>Всего 9,99 EUR</strong> — и ты получишь свой отчёт за несколько секунд.</p><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Заказать PDF-отчёт →</a></p><p>Твои числа ждут. С любовью, Светлана</p>',
  content_telegram_ru = 'Твой PDF-отчёт ждёт! 9 позиций, твоя история. Всего 9,99 EUR: https://numerologie-pro.com/ru/pakete'
WHERE subject = 'Dein Report wartet auf dich';


-- ── 2. PDF Kaeufer Upsell Sequence (4 Steps) ──

UPDATE public.email_sequence_steps SET
  subject_ru = '3 скрытых послания в твоей матрице',
  content_html_ru = '<h2 style="color:#D4AF37;">Что твоя матрица говорит о твоих отношениях</h2><p>Твой PDF-анализ показывает основы психоматрицы. Но знал(а) ли ты, что определённые комбинации чисел содержат скрытые послания?</p><p>На персональной сессии мы вместе откроем:</p><ul><li>Какие партнёры действительно тебе подходят</li><li>Почему определённые отношения всегда заканчиваются неудачей</li><li>Как активно использовать свою матрицу отношений</li></ul><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Заказать матрицу отношений (119 EUR) →</a></p>'
WHERE subject = '3 verborgene Botschaften in deiner Matrix';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Что принесёт тебе 2026 год?',
  content_html_ru = '<h2 style="color:#D4AF37;">Твой годовой прогноз на 2026</h2><p>Каждый год приносит новые энергии — и твои числа раскрывают, что тебя ждёт.</p><p>Годовой прогноз покажет:</p><ul><li>Какие месяцы особенно благоприятны</li><li>Где ждут испытания</li><li>Как оптимально использовать год для себя</li></ul><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Заказать годовой прогноз (119 EUR) →</a></p>'
WHERE subject = 'Was bringt dir 2026?';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Познакомься со Светланой лично',
  content_html_ru = '<h2 style="color:#D4AF37;">Давай поговорим лично</h2><p>PDF — хорошее начало, но персональная сессия идёт в 10 раз глубже.</p><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"PDF был интересным, но только на персональной сессии всё сложилось воедино."</em><br/>— Елена Р.</p></blockquote><p>Запишись на бесплатную 15-минутную консультацию — без обязательств.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Записаться на бесплатную консультацию →</a></p>'
WHERE subject = 'Swetlana persoenlich kennenlernen';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Твой купон на 10% скоро истечёт',
  content_html_ru = '<h2 style="color:#D4AF37;">Последнее напоминание: твой купон</h2><p>Твой купон на 10% скидку на персональную нумерологическую сессию истекает через 7 дней.</p><p>Сессия со Светланой — 90 минут, в которые мы вместе расшифруем твои числа.</p><p><strong>Используй свой купон сейчас, пока он не истёк.</strong></p><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Записаться на сессию →</a></p>'
WHERE subject = 'Dein 10% Gutschein laeuft bald ab';


-- ── 3. Nach-Sitzung Follow-Up Sequence (5 Steps) ──

UPDATE public.email_sequence_steps SET
  subject_ru = 'Спасибо за нашу сессию',
  content_html_ru = '<h2 style="color:#D4AF37;">Спасибо за нашу совместную сессию</h2><p>Мне было приятно открывать твои числа вместе с тобой. Надеюсь, анализ дал тебе новые перспективы.</p><p>Если у тебя есть вопросы, просто ответь на это письмо — я на связи.</p><p>С любовью,<br/>Светлана</p>',
  content_telegram_ru = 'Спасибо за нашу сессию! Надеюсь, анализ открыл для тебя новые перспективы. По вопросам — всегда на связи.'
WHERE subject = 'Danke fuer deine Sitzung';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Поделись впечатлениями',
  content_html_ru = '<h2 style="color:#D4AF37;">Как тебе наша сессия?</h2><p>Твой отзыв помогает мне стать лучше — и показывает другим людям путь к нумерологии.</p><p>Найдёшь 2 минуты?</p><p><a href="https://g.page/r/numerologie-pro/review" style="color:#D4AF37;font-weight:bold;">Написать отзыв в Google →</a></p><p>Или поделись своим опытом в Instagram-Story — я буду рада каждому сообщению!</p>'
WHERE subject = 'Teile deine Erfahrung';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Рекомендуй меня — 15% для тебя',
  content_html_ru = '<h2 style="color:#D4AF37;">Знаешь кого-то, кому стоит узнать свои числа?</h2><p>Рекомендуй Numerologie PRO друзьям и семье — и получи 15% скидку на следующую сессию.</p><p>Как это работает:</p><ol><li>Открой Telegram-бот @NumerologieProBot</li><li>Набери /empfehlen</li><li>Поделись своей персональной ссылкой</li></ol><p>Как только кто-то запишется по твоей ссылке, ты автоматически получишь купон на 15%.</p>',
  content_telegram_ru = 'Рекомендуй меня и получи скидку 15%! Набери /empfehlen в Telegram-боте для получения персональной ссылки.'
WHERE subject = 'Empfiehl mich weiter — 15% fuer dich';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Твой следующий пакет',
  content_html_ru = '<h2 style="color:#D4AF37;">Открой ещё больше о своих числах</h2><p>Наша последняя сессия осветила только часть твоей матрицы. Впереди ещё столько открытий:</p><ul><li><strong>Матрица отношений</strong> — Кто действительно тебе подходит? (119 EUR)</li><li><strong>Денежный канал</strong> — Твой финансовый потенциал (99 EUR)</li><li><strong>Годовой прогноз</strong> — Что принесёт тебе 2026? (119 EUR)</li></ul><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Все пакеты →</a></p>'
WHERE subject = 'Dein naechstes Paket';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Твой ежемесячный нумерологический апдейт',
  content_html_ru = '<h2 style="color:#D4AF37;">Твой месячный апдейт</h2><p>Каждый месяц приносит новые энергии — и твои числа могут показать, на что стоит обратить внимание.</p><p>Получи свой персональный месячный прогноз — компактный, конкретный, основанный на дате твоего рождения.</p><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Заказать месячный прогноз — всего 19 EUR →</a></p>'
WHERE subject = 'Dein monatliches Numerologie-Update';


-- ── 4. Re-Engagement Sequence (3 Steps) ──

UPDATE public.email_sequence_steps SET
  subject_ru = 'Мы скучаем по тебе',
  content_html_ru = '<h2 style="color:#D4AF37;">Давно не виделись...</h2><p>Хотела тебе написать — твои числа меняются со временем, и твоя матрица всегда открывает новые грани.</p><p>Хочешь бесплатную 15-минутную консультацию? Просто поговорить, без обязательств.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Записаться на бесплатную консультацию →</a></p><p>С любовью, Светлана</p>',
  content_telegram_ru = 'Привет! Давно не виделись. Твои числа меняются со временем — хочешь бесплатную мини-консультацию?'
WHERE subject = 'Wir vermissen dich';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Что изменилось в твоей матрице?',
  content_html_ru = '<h2 style="color:#D4AF37;">Новые энергии, новые возможности</h2><p>Знал(а) ли ты, что твои персональные годовые энергии меняются каждый год? То, что было актуально в прошлом году, может уже не действовать.</p><p>Посмотри, что изменилось:</p><p><a href="https://numerologie-pro.com/ru/rechner" style="color:#D4AF37;font-weight:bold;">Открыть калькулятор →</a></p>'
WHERE subject = 'Was hat sich in deiner Matrix veraendert?';

UPDATE public.email_sequence_steps SET
  subject_ru = 'Эксклюзивно для тебя: скидка 20%',
  content_html_ru = '<h2 style="color:#D4AF37;">Особое предложение для тебя</h2><p>Хочу облегчить тебе возвращение — поэтому дарю эксклюзивную скидку 20% на любой пакет.</p><p>Неважно, PDF-анализ, матрица отношений или годовой прогноз — 20% скидка, 100% ясность.</p><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Все пакеты со скидкой 20% →</a></p><p><em>Предложение действует 7 дней.</em></p>'
WHERE subject = 'Exklusiv fuer dich: 20% Rabatt';


-- ── 5. Geburtstags-Kampagne Sequence (1 Step) ──

UPDATE public.email_sequence_steps SET
  subject_ru = 'С днём рождения!',
  content_html_ru = '<h2 style="color:#D4AF37;">С днём рождения!</h2><p>Твой новый год жизни приносит новые энергии — и я хочу, чтобы ты мог(ла) использовать их на полную.</p><p>В подарок — <strong>скидка 20%</strong> на любую сессию в твоём месяце рождения.</p><p>Открой, что новый год приготовил для тебя:</p><p><a href="https://numerologie-pro.com/ru/pakete" style="color:#D4AF37;font-weight:bold;">Записаться со скидкой 20% →</a></p><p>С любовью и наилучшими пожеланиями,<br/>Светлана</p>',
  content_telegram_ru = 'С днём рождения! В подарок — скидка 20% на любую сессию. Запишись: https://numerologie-pro.com/ru/pakete'
WHERE subject = 'Alles Gute zum Geburtstag!';


-- ── 6. Automation Rules — Russian Message Variants ──

-- Rule: PDF Upsell via Telegram
UPDATE public.automation_rules
SET actions = jsonb_set(
  actions,
  '{0,value_ru}',
  '"Спасибо за PDF-анализ! PDF показывает лишь поверхность — на персональной сессии мы откроем скрытые связи твоих чисел. Запишись со скидкой 10%: https://numerologie-pro.com/ru/pakete"'
)
WHERE name = 'PDF Upsell via Telegram';

-- Rule: Empfehlungs-Erinnerung nach Sitzung
UPDATE public.automation_rules
SET actions = jsonb_set(
  actions,
  '{0,value_ru}',
  '"Спасибо за сессию! Понравился анализ? Рекомендуй меня и получи 15% скидку на следующую сессию. Набери /empfehlen"'
)
WHERE name = 'Empfehlungs-Erinnerung nach Sitzung';

-- Rule: Inaktive Lead Reaktivierung (send_email)
UPDATE public.automation_rules
SET actions = jsonb_set(
  actions,
  '{0,value_ru}',
  '"Мы скучаем по тебе! Твои числа изменились с момента твоего последнего визита. Посмотри, что нового в твоей матрице: https://numerologie-pro.com/ru/rechner"'
)
WHERE name = 'Inaktive Lead Reaktivierung';

-- Rule: Geburtstags-Kampagne (send_email)
UPDATE public.automation_rules
SET actions = jsonb_set(
  actions,
  '{0,value_ru}',
  '"С днём рождения! Твой новый год жизни приносит новые энергии. В подарок — скидка 20% на любую сессию в месяце твоего рождения. Запишись: https://numerologie-pro.com/ru/pakete"'
)
WHERE name = 'Geburtstags-Kampagne';
