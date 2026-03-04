# Alle Nachrichten — Zur Prüfung durch Swetlana

> Dieses Dokument enthält ALLE automatischen Nachrichten, die an Kunden gesendet werden.
> Bitte prüfe jeden Text auf Ton, Inhalt und Korrektheit.
> Markiere Änderungswünsche direkt im Text oder schreib Kommentare daneben.

---

## 1. Buchungsbestätigung

*Wird gesendet wenn ein Kunde einen Termin über Cal.com bucht.*

---

### 1a) Email — Buchungsbestätigung

**DEUTSCH**
- Betreff: `Danke für deine Buchung! — Swetlana`
- Vorschau: `Ich freue mich sehr auf unseren Termin!`

> **Danke für deine Buchung!**
>
> Ich freue mich sehr auf unseren gemeinsamen Termin! Hier sind die Details:
>
> **Datum & Uhrzeit:** Montag, 15. März 2026, 14:00
> **Paket:** Lebensbestimmung
> **Plattform:** Zoom
>
> Ich schicke dir 30 Minuten vorher noch eine Erinnerung. Bis bald! 💫 Deine Swetlana
>
> *Alle Details findest du auch in deinem persönlichen Bereich unter "Sitzungen".*
>
> [Button: Mein Dashboard]
> [Button: Meeting beitreten]

---

**RUSSISCH**
- Тема: `Спасибо за запись! — Светлана`
- Превью: `Я очень жду нашу встречу!`

> **Спасибо за запись!**
>
> Я очень жду нашу встречу! Вот детали:
>
> **Дата и время:** Понедельник, 15 марта 2026, 14:00
> **Пакет:** Предназначение
> **Платформа:** Zoom
>
> Я пришлю тебе напоминание за 30 минут. До встречи! 💫 Твоя Светлана
>
> *Все детали также доступны в твоём личном кабинете в разделе "Сессии".*
>
> [Кнопка: Мой кабинет]
> [Кнопка: Войти в встречу]

---

### 1b) Telegram — Buchungsbestätigung

**DEUTSCH**

```
✅ Danke für deine Buchung, ich freue mich sehr auf unseren Termin!

📍 Lebensbestimmung
⏰ Montag, 15. März, 14:00

👉 Dein persönlicher Bereich:
https://numerologie-pro.com/de/dashboard/sitzungen

Bis bald! 💫
Deine Swetlana

[Button: 🔗 Meeting beitreten]
```

**RUSSISCH**

```
✅ Спасибо за запись, я очень жду нашу встречу!

📍 Предназначение
⏰ Понедельник, 15 марта, 14:00

👉 Твой личный кабинет:
https://numerologie-pro.com/ru/dashboard/sitzungen

До встречи! 💫
Твоя Светлана

[Кнопка: 🔗 Войти в встречу]
```

---

### 1c) WhatsApp — Buchungsbestätigung

*Template-Name: `booking_confirmation` (muss in Meta Business Manager eingereicht werden)*

**DEUTSCH** (Template-Text zum Einreichen)

```
✅ Danke für deine Buchung, ich freue mich sehr auf unseren Termin!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Dein persönlicher Bereich: {{4}}
Dort findest du alle Details zu deiner Sitzung.

Bis bald! 💫
Deine Swetlana
```

**RUSSISCH** (Template-Text zum Einreichen)

```
✅ Спасибо за запись, я очень жду нашу встречу!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Твой личный кабинет: {{4}}
Там ты найдёшь все детали по сессии.

До встречи! 💫
Твоя Светлана
```

> **Variablen:** {{1}} = Paketname, {{2}} = Datum/Uhrzeit, {{3}} = Zoom-Link, {{4}} = Dashboard-URL

---
---

## 2. Session-Erinnerung (30 Minuten vor Termin)

*Wird automatisch per Cron-Job gesendet, 30 Minuten vor dem Termin.*

---

### 2a) Email — Session-Erinnerung

**DEUTSCH**
- Betreff: `Unser Termin startet gleich! — Swetlana`
- Vorschau: `Ich freue mich auf dich! Unser Termin beginnt in 30 Minuten.`

> **Gleich geht es los!**
>
> Unser Termin beginnt in 30 Minuten — ich freue mich schon auf dich!
>
> **Datum & Uhrzeit:** Montag, 15. März 2026, 14:00
> **Paket:** Lebensbestimmung
>
> [Button: Jetzt Meeting beitreten]
>
> *Bitte stelle sicher, dass du eine ruhige Umgebung hast und dein Mikrofon & Kamera funktionieren. Deine Swetlana 💫*

---

**RUSSISCH**
- Тема: `Наша встреча скоро! — Светлана`
- Превью: `Я уже жду тебя! Наша консультация начнётся через 30 минут.`

> **Скоро начинаем!**
>
> Наша встреча начнётся через 30 минут — я уже жду тебя!
>
> **Дата и время:** Понедельник, 15 марта 2026, 14:00
> **Пакет:** Предназначение
>
> [Кнопка: Войти в встречу]
>
> *Пожалуйста, убедись, что ты в тихом месте и что твой микрофон и камера работают. Твоя Светлана 💫*

---

### 2b) Telegram — Session-Erinnerung

**DEUTSCH**

```
🗓 Hey! Unser Termin ist heute!

📍 Lebensbestimmung
⏰ Montag, 15. März, 14:00

Ich freue mich auf dich! 💫
Deine Swetlana

[Button: 🔗 Meeting beitreten]
```

**RUSSISCH**

```
🗓 Привет! Наша встреча сегодня!

📍 Предназначение
⏰ Понедельник, 15 марта, 14:00

Жду тебя! 💫
Твоя Светлана

[Кнопка: 🔗 Войти в встречу]
```

---

### 2c) WhatsApp — Session-Erinnerung

*Template-Name: `session_reminder`*

**DEUTSCH**

```
🗓 Hey! Unser Termin ist heute!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Ich freue mich auf dich! 💫
Deine Swetlana
```

**RUSSISCH**

```
🗓 Привет! Наша встреча сегодня!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Жду тебя! 💫
Твоя Светлана
```

> **Variablen:** {{1}} = Paketname, {{2}} = Datum/Uhrzeit, {{3}} = Zoom-Link

---
---

## 3. Stornierung

*Wird gesendet wenn ein Termin über Cal.com storniert wird.*

---

### 3a) Telegram — Stornierung

**DEUTSCH**

```
❌ Schade, dein Termin wurde storniert.

Falls du einen neuen Termin buchen möchtest, schau hier: /pakete

Ich bin jederzeit für dich da! 💛
Deine Swetlana
```

**RUSSISCH**

```
❌ К сожалению, твоя сессия отменена.

Если хочешь записаться снова: /pakete

Я всегда на связи! 💛
Твоя Светлана
```

---

### 3b) WhatsApp — Stornierung

*Template-Name: `booking_cancelled`*

**DEUTSCH**

```
❌ Schade, dein Termin wurde storniert.

Falls du einen neuen Termin buchen möchtest:
{{1}}

Ich bin jederzeit für dich da! 💛
Deine Swetlana
```

**RUSSISCH**

```
❌ К сожалению, твоя сессия отменена.

Если хочешь записаться снова:
{{1}}

Я всегда на связи! 💛
Твоя Светлана
```

> **Variablen:** {{1}} = Link zur Pakete-Seite

---
---

## 4. PDF-Zustellung

*Wird gesendet nachdem der Kunde eine PDF-Analyse gekauft hat und die PDF generiert wurde.*

---

### 4a) Email — PDF-Zustellung

**DEUTSCH**
- Betreff: `Dein PDF ist fertig! — Swetlana`
- Vorschau: `Ich habe deine persönliche Analyse erstellt — schau mal rein!`

> **Dein PDF ist fertig!**
>
> Danke für dein Vertrauen! Ich habe deine persönliche Psychomatrix-Analyse erstellt — du findest sie im Anhang.
>
> **Geburtsdatum:** 15.03.1990
>
> *Deine PDF-Datei ist als Anhang beigefügt. Du kannst sie auch jederzeit in deinem Dashboard unter "Unterlagen" herunterladen.*
>
> [Button: Meine Unterlagen ansehen]
>
> ---
>
> *Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir — ich freue mich darauf! Deine Swetlana 💫*
>
> [Button: Kostenlose Beratung buchen]

---

**RUSSISCH**
- Тема: `Твой PDF готов! — Светлана`
- Превью: `Я подготовила твой персональный анализ — загляни!`

> **Твой PDF готов!**
>
> Спасибо за доверие! Я подготовила твой персональный анализ психоматрицы — он в приложении к письму.
>
> **Дата рождения:** 15.03.1990
>
> *Твой PDF-файл прикреплён к этому письму. Ты также можешь скачать его в любое время в разделе "Документы" в личном кабинете.*
>
> [Кнопка: Мои документы]
>
> ---
>
> *Хочешь обсудить результаты вместе? Запишись на консультацию — буду рада! Твоя Светлана 💫*
>
> [Кнопка: Записаться на бесплатную консультацию]

---

### 4b) Telegram — PDF-Zustellung

**DEUTSCH** *(PDF wird als Datei mitgesendet)*

```
📄 Dein PDF "Psychomatrix PDF-Analyse" ist fertig!

Ich habe es dir auch per E-Mail geschickt. Du kannst es jederzeit in deinem Dashboard herunterladen.

Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir! 💫
Deine Swetlana
```

**RUSSISCH** *(PDF прикреплён как файл)*

```
📄 Твой PDF "PDF-Анализ Психоматрицы" готов!

Я также отправила его на email. Скачать можно в любое время в личном кабинете.

Хочешь обсудить результаты вместе? Запишись на консультацию! 💫
Твоя Светлана
```

---

### 4c) WhatsApp — PDF-Zustellung

*Template-Name: `pdf_delivery`*

**DEUTSCH**

```
📄 Dein PDF "{{1}}" ist fertig!

Ich habe es dir auch per E-Mail geschickt. Du kannst es jederzeit herunterladen:
{{2}}

Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir! 💫
Deine Swetlana
```

**RUSSISCH**

```
📄 Твой PDF "{{1}}" готов!

Я также отправила его на email. Скачать можно в любое время:
{{2}}

Хочешь обсудить результаты вместе? Запишись на консультацию! 💫
Твоя Светлана
```

> **Variablen:** {{1}} = PDF-Titel, {{2}} = Dashboard-URL

---
---

## 5. Bestellbestätigung (nach Zahlung)

*Wird gesendet nachdem die Stripe-Zahlung erfolgreich war.*

---

### 5a) Email — Bestellbestätigung

**DEUTSCH**
- Betreff: `Danke für deine Buchung! — Swetlana`
- Vorschau: `Danke für deine Buchung von Lebensbestimmung!`

> **Vielen Dank, Lisa!**
>
> Deine Zahlung wurde erfolgreich verarbeitet. Ich freue mich, dich auf deiner numerologischen Reise zu begleiten!
>
> **Paket:** Lebensbestimmung
> **Betrag:** 99,00 €
>
> Ich melde mich in Kürze bei dir, um einen Termin zu vereinbaren. Alle Details findest du in deinem persönlichen Bereich.
>
> [Button: Mein Bereich öffnen]
>
> *Bei Fragen schreib mir an info@numerologie-pro.com — ich bin für dich da! 💫 Deine Swetlana*

---

**RUSSISCH**
- Тема: `Спасибо за заказ! — Светлана`
- Превью: `Спасибо за заказ Предназначение!`

> **Спасибо, Lisa!**
>
> Твой платёж успешно обработан. Я рада сопровождать тебя на твоём нумерологическом пути!
>
> **Пакет:** Предназначение
> **Сумма:** 99,00 €
>
> Я свяжусь с тобой в ближайшее время для согласования даты. Все детали доступны в твоём личном кабинете.
>
> [Кнопка: Открыть кабинет]
>
> *По вопросам пиши мне на info@numerologie-pro.com — я на связи! 💫 Твоя Светлана*

---
---

## 6. Kontaktformular-Bestätigung

*Wird gesendet wenn jemand das Kontaktformular auf der Website ausfüllt.*

---

### 6a) Email — Kontaktbestätigung

**DEUTSCH**
- Betreff: `Danke für deine Nachricht! — Swetlana`
- Vorschau: `Hallo Lisa, danke für deine Nachricht!`

> **Danke, Lisa!**
>
> Deine Nachricht ist bei mir angekommen. Ich melde mich innerhalb von **24 Stunden** persönlich bei dir.
>
> Numerologie öffnet eine neue Perspektive auf dein Leben — ich freue mich, dich auf diesem Weg zu begleiten. 💫 Deine Swetlana
>
> *Bei Fragen erreichst du mich unter:*
> info@numerologie-pro.com
>
> [Button: Zur Website]

---

**RUSSISCH**
- Тема: `Спасибо за сообщение! — Светлана`
- Превью: `Привет Lisa, спасибо за сообщение!`

> **Спасибо, Lisa!**
>
> Твоё сообщение получено. Я отвечу тебе лично в течение **24 часов**.
>
> Нумерология открывает новый взгляд на твою жизнь — я рада помочь тебе на этом пути. 💫 Твоя Светлана
>
> *По вопросам вы можете связаться:*
> info@numerologie-pro.com
>
> [Кнопка: На сайт]

---
---

## 7. Lead-Welcome (nach Nutzung des Rechners)

*Wird gesendet wenn ein Besucher den kostenlosen Numerologie-Rechner auf der Website benutzt hat.*

---

### 7a) Email — Lead-Welcome

**DEUTSCH**
- Betreff: `Deine Zahlen haben eine Botschaft — Swetlana`
- Vorschau: `Entdecke, was deine Zahlen über dich verraten.`

> **Deine Zahlen sprechen**
>
> Schön, dass du den Numerologie-Rechner ausprobiert hast! Hinter jedem Geburtsdatum verbirgt sich eine Botschaft — über deine Stärken, dein Potenzial und deinen Lebensweg.
>
> In einer **persönlichen Beratung** gehen wir gemeinsam tiefer: Ich zeige dir, wie deine Zahlen zusammenwirken und welche Chancen sich gerade jetzt öffnen.
>
> [Button: Beratung mit mir buchen]
>
> *Ich freue mich auf dich! 💫 Deine Swetlana*

---

**RUSSISCH**
- Тема: `Твои числа несут послание — Светлана`
- Превью: `Узнай, что твои числа говорят о тебе.`

> **Твои числа говорят**
>
> Рада, что ты воспользовался нумерологическим калькулятором! За каждой датой рождения скрывается послание — о твоих силах, потенциале и жизненном пути.
>
> На **персональной консультации** мы пойдём глубже вместе: я покажу, как твои числа взаимодействуют и какие возможности открываются прямо сейчас.
>
> [Кнопка: Записаться на консультацию]
>
> *Буду рада! 💫 Твоя Светлана*

---
---

## 8. Upsell-Email (48 Stunden nach PDF-Kauf)

*Wird automatisch 48h nach dem PDF-Kauf gesendet, wenn der Kunde noch keine Beratung gebucht hat.*

---

### 8a) Email — Upsell

**DEUTSCH**
- Betreff: `Bereit für den nächsten Schritt? — Swetlana`
- Vorschau: `In einer Live-Beratung gehen wir gemeinsam 10x tiefer.`

> **Bereit für den nächsten Schritt?**
>
> Du hast deine Psychomatrix-PDF erhalten — großartig! Aber die PDF zeigt dir nur die Oberfläche. In einer persönlichen 90-Minuten-Beratung entdecken wir gemeinsam:
>
> - Die verborgenen Zusammenhänge zwischen deinen Zahlen
> - Konkrete Handlungsempfehlungen für dein Leben
> - Antworten auf deine persönlichen Fragen
> - Beziehungs-, Berufs- oder Wachstumsanalyse nach Wahl
>
> *"Ich war zuerst skeptisch, aber Swetlana hat Dinge gesehen, die kein Test zeigen kann. Die Beratung hat mir Klarheit gegeben." — Ljudmila K.*
>
> **Exklusiv für dich: 10% Rabatt**
> Als Dankeschön für deine PDF-Bestellung erhältst du 10% Rabatt auf deine erste Live-Beratung. Nutze den Code beim Checkout:
>
> **MATRIX10**
>
> [Button: Jetzt Beratung buchen (99€ → 89,10€)]
>
> Noch unsicher? Buch dir zuerst eine kostenlose 15-Minuten-Beratung mit mir. Ich freue mich! 💫 Deine Swetlana
>
> [Button: Kostenlose Erstberatung mit mir]

---

**RUSSISCH**
- Тема: `Готов к следующему шагу? — Светлана`
- Превью: `На живой консультации мы погрузимся в матрицу в 10 раз глубже.`

> **Готов к следующему шагу?**
>
> Ты получил свой PDF-анализ психоматрицы — отлично! Но PDF показывает лишь поверхность. На персональной 90-минутной консультации мы вместе откроем:
>
> - Скрытые связи между твоими числами
> - Конкретные рекомендации для твоей жизни
> - Ответы на твои личные вопросы
> - Анализ отношений, карьеры или личностного роста — на выбор
>
> *"Сначала я скептически относилась, но Светлана увидела то, что не покажет ни один тест. Консультация дала мне ясность." — Людмила К.*
>
> **Эксклюзивно для тебя: скидка 10%**
> В благодарность за покупку PDF-анализа — скидка 10% на первую живую консультацию. Используй код при оплате:
>
> **MATRIX10**
>
> [Кнопка: Записаться на консультацию (99€ → 89,10€)]
>
> Ещё не уверен? Запишись на бесплатную 15-минутную консультацию со мной. Буду рада! 💫 Твоя Светлана
>
> [Кнопка: Бесплатная консультация со мной]

---
---

## 9. WhatsApp Auto-Antwort

*Wird gesendet wenn ein Kunde eine Nachricht über WhatsApp schreibt.*

---

**DEUTSCH**

```
Danke für deine Nachricht! Ich melde mich so schnell wie möglich bei dir. 💫 Deine Swetlana
```

**RUSSISCH**

```
Спасибо за сообщение! Я отвечу тебе как можно скорее. 💫 Твоя Светлана
```

---
---

## 10. Telegram Bot — Alle Befehle

*Das sind die Texte die der Telegram-Bot den Nutzern zeigt.*

---

### /start (Neuer Nutzer)

**DEUTSCH**

```
🌟 Willkommen bei Numerologie PRO!

Ich bin Swetlana, deine persönliche Numerologin. Was kann ich für dich tun?
```

**RUSSISCH**

```
🌟 Добро пожаловать в Нумерология PRO!

Я Светлана, твой персональный нумеролог. Чем могу помочь?
```

---

### /start (Bekannter Nutzer)

**DEUTSCH**

```
Willkommen zurück, {Name}! 🌟
Schön, dass du da bist. Was kann ich für dich tun?
Deine Swetlana
```

**RUSSISCH**

```
С возвращением, {Name}! 🌟
Рада тебя видеть. Чем могу помочь?
Твоя Светлана
```

---

### /start (Konto erfolgreich verbunden)

**DEUTSCH**

```
✅ Perfekt, {Name}! Dein Telegram ist jetzt mit deinem Konto verbunden.

Du erhältst ab sofort Erinnerungen und PDFs auch hier.
Deine Swetlana
```

**RUSSISCH**

```
✅ Отлично, {Name}! Твой Telegram теперь привязан к аккаунту.

Теперь ты будешь получать напоминания и PDF также здесь.
Твоя Светлана
```

---

### /start (Bereits verbunden)

**DEUTSCH**

```
✅ Dein Telegram ist bereits verbunden.
Deine Swetlana
```

**RUSSISCH**

```
✅ Твой Telegram уже привязан.
Твоя Светлана
```

---

### /analyse

**DEUTSCH**

```
🔮 Gib mir dein Geburtsdatum (TT.MM.JJJJ) und ich berechne deine Schicksalszahl!

Beispiel: 15.03.1990
```

**RUSSISCH**

```
🔮 Напиши мне дату рождения (ДД.ММ.ГГГГ) и я рассчитаю твоё число судьбы!

Пример: 15.03.1990
```

---

### /analyse (Ergebnis)

**DEUTSCH**

```
🔮 Deine Schicksalszahl: {Zahl}

{Beschreibung}

💫 Möchtest du die vollständige 12-seitige Analyse? Ich erstelle sie persönlich für dich!

[Button: 📄 Vollständige PDF-Analyse für nur 9,99 €]
```

**RUSSISCH**

```
🔮 Твоё число судьбы: {Число}

{Описание}

💫 Хочешь получить полный 12-страничный анализ? Я подготовлю его лично для тебя!

[Кнопка: 📄 Полный PDF-анализ всего за 9,99 €]
```

---

### /analyse (Ungültiges Datum)

**DEUTSCH**

```
❌ Ungültiges Datum. Bitte im Format TT.MM.JJJJ eingeben (z.B. 15.03.1990).
```

**RUSSISCH**

```
❌ Неверная дата. Пожалуйста, введи в формате ДД.ММ.ГГГГ (напр. 15.03.1990).
```

---

### /kompatibel

**DEUTSCH**

```
💕 Gib mir zwei Geburtsdaten, getrennt durch ein Komma, und ich prüfe eure Kompatibilität!

Beispiel: 15.03.1990, 22.07.1988
```

**RUSSISCH**

```
💕 Напиши мне две даты рождения через запятую и я проверю вашу совместимость!

Пример: 15.03.1990, 22.07.1988
```

---

### /kompatibel (Ergebnis)

**DEUTSCH**

```
💕 Kompatibilität: {Score}% ({Level})

{Zusammenfassung}

[Button: 📊 Vollständige Beziehungsmatrix buchen]
```

**РУССКИЙ**

```
💕 Совместимость: {Score}% ({Уровень})

{Описание}

[Кнопка: 📊 Заказать полную матрицу отношений]
```

---

### /heute

**DEUTSCH**

```
✨ Deine persönliche Tageszahl: {Zahl}

{Beschreibung}

Deine Swetlana 💫
```

**RUSSISCH**

```
✨ Твоё личное число дня: {Число}

{Описание}

Твоя Светлана 💫
```

---

### /heute (Kein Geburtsdatum)

**DEUTSCH**

```
❌ Dein Geburtsdatum ist nicht hinterlegt. Verbinde zuerst dein Konto oder nutze /analyse.
```

**RUSSISCH**

```
❌ Твоя дата рождения не указана. Сначала привяжи аккаунт или используй /analyse.
```

---

### /meinepdfs (Keine PDFs)

**DEUTSCH**

```
📂 Du hast noch keine PDFs.

Entdecke meine Analysen und starte deine Numerologie-Reise! 💫
```

**RUSSISCH**

```
📂 У тебя ещё нет PDF.

Открой мои анализы и начни свой нумерологический путь! 💫
```

---

### /meinepdfs (Hat PDFs)

**DEUTSCH**

```
📂 Deine PDFs:

[Liste der PDF-Dateien]
```

**RUSSISCH**

```
📂 Твои PDF:

[Список файлов]
```

---

### /termin (Kein Termin)

**DEUTSCH**

```
📅 Du hast aktuell keinen geplanten Termin.

Buch dir eine Beratung unter /pakete — ich freue mich auf dich!
```

**RUSSISCH**

```
📅 У тебя сейчас нет запланированной сессии.

Запишись на консультацию через /pakete — буду рада!
```

---

### /termin (Hat Termin)

**DEUTSCH**

```
📅 Dein nächster Termin

📍 Lebensbestimmung
⏰ Montag, 15. März, 14:00
🔗 Meeting beitreten

Ich freue mich auf dich! 💫
Deine Swetlana
```

**RUSSISCH**

```
📅 Твоя следующая сессия

📍 Предназначение
⏰ Понедельник, 15 марта, 14:00
🔗 Войти в встречу

Жду тебя! 💫
Твоя Светлана
```

---

### /termin (Noch nicht gebucht)

**DEUTSCH**

```
📅 Lebensbestimmung
⏳ Termin ausstehend — bitte buche deinen Termin, ich freue mich darauf!
```

**RUSSISCH**

```
📅 Предназначение
⏳ Время не назначено — запишись, буду ждать!
```

---

### /pakete

**DEUTSCH**

```
🛍️ Meine Pakete für dich:

Lebensbestimmung — 99,00 €
Deine Lebensaufgabe, Talente und Potenziale

Beziehungsmatrix — 89,00 €
Kompatibilitätsanalyse für Paare

[usw.]
```

**РУССКИЙ**

```
🛍️ Мои пакеты для тебя:

Предназначение — 99,00 €
Твоя жизненная задача, таланты и потенциал

Матрица отношений — 89,00 €
Анализ совместимости для пар

[и т.д.]
```

---

### /empfehlen

**DEUTSCH**

```
🎁 Dein persönlicher Empfehlungs-Link:

https://numerologie-pro.com/?ref={CODE}

Teile ihn mit Freunden — als Dankeschön bekommst du für jede Buchung einen 15%-Gutschein! 🎉

📊 Einladungen: {Anzahl} | Davon gebucht: {Converted}
```

**РУССКИЙ**

```
🎁 Твоя персональная реферальная ссылка:

https://numerologie-pro.com/?ref={КОД}

Поделись с друзьями — в благодарность за каждую покупку ты получишь купон на 15%! 🎉

📊 Приглашений: {Количество} | Из них купили: {Converted}
```

---

### /empfehlen (Nicht verbunden)

**DEUTSCH**

```
❌ Verbinde zuerst dein Konto, um einen Empfehlungs-Link zu erhalten.
```

**РУССКИЙ**

```
❌ Сначала привяжи аккаунт, чтобы получить реферальную ссылку.
```

---

### /hilfe

**DEUTSCH**

```
📋 Was ich für dich tun kann:

/analyse — Kostenlose Mini-Analyse deiner Schicksalszahl
/kompatibel — Beziehungs-Kompatibilitäts-Check
/heute — Deine persönliche Tageszahl
/meinepdfs — Alle deine PDFs erneut senden
/termin — Deinen nächsten Termin anzeigen
/pakete — Meine Pakete mit Preisen
/empfehlen — Dein Empfehlungs-Link
/hilfe — Diese Übersicht

💬 Schreib mir einfach — ich bin für dich da!
Deine Swetlana
```

**РУССКИЙ**

```
📋 Чем я могу тебе помочь:

/analyse — Бесплатный мини-анализ числа судьбы
/kompatibel — Проверка совместимости
/heute — Твоё личное число дня
/meinepdfs — Отправить все твои PDF
/termin — Показать следующую сессию
/pakete — Мои пакеты с ценами
/empfehlen — Твоя реферальная ссылка
/hilfe — Эта справка

💬 Просто напиши мне — я на связи!
Твоя Светлана
```

---

### FAQ / Freitext-Nachricht

**DEUTSCH**

```
📨 Danke für deine Nachricht! Ich melde mich so schnell wie möglich bei dir.
Deine Swetlana
```

**РУССКИЙ**

```
📨 Спасибо за сообщение! Я отвечу тебе как можно скорее.
Твоя Светлана
```

---

### FAQ — Stornierung

**DEUTSCH**

```
📋 Für Stornierungen schreib mir an info@numerologie-pro.com oder nutze den Widerruf-Link in deiner Bestätigungs-E-Mail.
```

**РУССКИЙ**

```
📋 Для отмены напиши мне на info@numerologie-pro.com или используй ссылку отмены в письме-подтверждении.
```

---

### FAQ — Preise

**DEUTSCH**

```
💰 Alle Preise und Pakete findest du unter /pakete oder auf meiner Website:
https://numerologie-pro.com/de/pakete
```

**РУССКИЙ**

```
💰 Все цены и пакеты ты найдёшь через /pakete или на моём сайте:
https://numerologie-pro.com/ru/pakete
```

---

### FAQ — Kontakt

**DEUTSCH**

```
📞 So erreichst du mich:
📧 info@numerologie-pro.com
🌐 https://numerologie-pro.com

Deine Swetlana 💛
```

**РУССКИЙ**

```
📞 Мои контакты:
📧 info@numerologie-pro.com
🌐 https://numerologie-pro.com

Твоя Светлана 💛
```

---

### FAQ — Datenschutz

**DEUTSCH**

```
🔒 Datenschutz: https://numerologie-pro.com/de/datenschutz
```

**РУССКИЙ**

```
🔒 Конфиденциальность: https://numerologie-pro.com/ru/datenschutz
```

---

### Telegram Buttons

| Button | DEUTSCH | РУССКИЙ |
|--------|---------|---------|
| Kostenlose Analyse | 🔮 Kostenlose Analyse | 🔮 Бесплатный анализ |
| Pakete | 🛍️ Pakete ansehen | 🛍️ Посмотреть пакеты |
| Konto verbinden | 🔗 Konto verbinden | 🔗 Привязать аккаунт |
| PDF kaufen | 📄 PDF kaufen (9,99 €) | 📄 Купить PDF (9,99 €) |
| Beratung buchen | 📅 Beratung buchen | 📅 Записаться |
| Meine PDFs | 📂 Meine PDFs | 📂 Мои PDF |

---
---

## 11. Admin-Benachrichtigung (nur intern)

*Wird an info@numerologie-pro.com gesendet wenn ein neuer Termin gebucht wird.*

**Betreff:** `Neuer Termin: Lebensbestimmung (BEZAHLT) — Lisa Müller`

> **Neuer Termin gebucht!**
>
> **Lisa Müller** hat einen Termin gebucht.
>
> **Typ:** BEZAHLT
> **Paket:** Lebensbestimmung
> **Datum:** Montag, 15. März 2026, 14:00
> **E-Mail:** lisa@example.com
> **Meeting:** https://zoom.us/j/...

---

## Referral-Benachrichtigung (Telegram, nur intern)

*Wird an den Empfehler gesendet wenn sein Empfohlener kauft.*

**DEUTSCH**

```
🎉 Deine Empfehlung hat gebucht!

Dein 15%-Gutschein wird erstellt. Danke fürs Weiterempfehlen!
```

**РУССКИЙ**

```
🎉 Твой приглашённый купил!

Твой купон на 15% будет создан. Спасибо за рекомендацию!
```

---
---

## Zusammenfassung Ton-Regeln

| ✅ Richtig | ❌ Falsch |
|-----------|----------|
| "Ich freue mich auf unseren Termin!" | "Swetlana freut sich auf dich!" |
| "Buch dir einen Termin mit mir" | "Buchen Sie einen Termin" |
| "Deine Swetlana" / "Твоя Светлана" | "Das Numerologie PRO Team" |
| "Ich melde mich bei dir" | "Sie werden kontaktiert" |
| Du-Form überall | Sie-Form nirgendwo |
