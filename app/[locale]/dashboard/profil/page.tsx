'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, Save, Calendar, Download, Trash2, Loader2, Bell, MessageCircle, Send, Unlink, ExternalLink } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';

export default function ProfilPage() {
  const locale = useLocale();
  const de = locale === 'de';
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');


  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');

  // Messaging states
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waPhoneOriginal, setWaPhoneOriginal] = useState('');
  const [channel, setChannel] = useState<'email' | 'telegram' | 'whatsapp'>('email');
  const [savingWa, setSavingWa] = useState(false);
  const [waSuccess, setWaSuccess] = useState(false);
  const [waError, setWaError] = useState('');
  const [unlinkingTg, setUnlinkingTg] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');
      setUserId(user.id);

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, birthdate, telegram_chat_id, whatsapp_phone, preferred_channel')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setBirthdate(data.birthdate ?? '');
        setTelegramLinked(!!data.telegram_chat_id);
        setWaPhone(data.whatsapp_phone ?? '');
        setWaPhoneOriginal(data.whatsapp_phone ?? '');
        setChannel((data.preferred_channel as 'email' | 'telegram' | 'whatsapp') ?? 'email');
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        birthdate: birthdate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleUnlinkTelegram = async () => {
    setUnlinkingTg(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateData: Record<string, unknown> = { telegram_chat_id: null };
    if (channel === 'telegram') {
      updateData.preferred_channel = 'email';
      setChannel('email');
    }

    await supabase.from('profiles').update(updateData).eq('id', user.id);
    setTelegramLinked(false);
    setUnlinkingTg(false);
  };

  const handleSaveWhatsApp = async () => {
    const trimmed = waPhone.trim();
    setWaError('');
    setWaSuccess(false);

    if (trimmed && !/^\+[1-9]\d{1,14}$/.test(trimmed)) {
      setWaError(de ? 'Bitte im Format +49... eingeben.' : 'Формат: +49...');
      return;
    }

    setSavingWa(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateData: Record<string, unknown> = {
      whatsapp_phone: trimmed || null,
    };
    if (!trimmed && channel === 'whatsapp') {
      updateData.preferred_channel = 'email';
      setChannel('email');
    }

    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);

    if (error) {
      setWaError(de ? 'Nummer wird bereits verwendet.' : 'Номер уже используется.');
    } else {
      setWaPhoneOriginal(trimmed);
      setWaSuccess(true);
      setTimeout(() => setWaSuccess(false), 3000);
    }
    setSavingWa(false);
  };

  const handleChannelChange = async (newChannel: 'email' | 'telegram' | 'whatsapp') => {
    if (newChannel === 'telegram' && !telegramLinked) return;
    if (newChannel === 'whatsapp' && !waPhoneOriginal) return;

    setSavingChannel(true);
    setChannel(newChannel);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ preferred_channel: newChannel }).eq('id', user.id);
    }
    setSavingChannel(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">
          {de ? 'Mein Profil' : 'Мой профиль'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {de ? 'Persönliche Informationen verwalten.' : 'Управление личными данными.'}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
            <User className="h-7 w-7 text-gold" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {fullName || (de ? 'Kein Name hinterlegt' : 'Имя не указано')}
            </h2>
            <p className="text-sm text-white/50 truncate">{email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <span className="text-xs text-white/40 uppercase tracking-wide">E-Mail</span>
            </div>
            <p className="text-sm text-white/70 truncate">{email || '—'}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <span className="text-xs text-white/40 uppercase tracking-wide">{de ? 'Telefon' : 'Телефон'}</span>
            </div>
            <p className="text-sm text-white/70">{phone || '—'}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <span className="text-xs text-white/40 uppercase tracking-wide">{de ? 'Geburtstag' : 'Дата рождения'}</span>
            </div>
            <p className="text-sm text-white/70">
              {birthdate
                ? new Date(birthdate).toLocaleDateString(de ? 'de-DE' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h2 className="text-base font-semibold text-white mb-5">
          {de ? 'Daten bearbeiten' : 'Редактировать данные'}
        </h2>
        <form onSubmit={handleSave} className="space-y-5">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-white/5 bg-white/3 pl-10 pr-4 py-3 text-sm text-white/40 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-white/30 mt-1">
              {de ? 'E-Mail kann nicht geändert werden.' : 'Email нельзя изменить.'}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              {de ? 'Vollständiger Name' : 'Полное имя'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={de ? 'Dein Name' : 'Ваше имя'}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              {de ? 'Telefon' : 'Телефон'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49..."
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>
          </div>

          {/* Birthdate */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              {de ? 'Geburtsdatum' : 'Дата рождения'}
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
            />
          </div>

          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {de ? 'Gespeichert!' : 'Сохранено!'}
            </div>
          )}

          <GoldButton type="submit" disabled={saving} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" strokeWidth={1.5} />
            {saving ? '...' : (de ? 'Speichern' : 'Сохранить')}
          </GoldButton>
        </form>
      </div>

      {/* Notifications / Messaging Channels */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
            <Bell className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              {de ? 'Benachrichtigungen' : 'Уведомления'}
            </h2>
            <p className="text-xs text-white/40">
              {de ? 'Verknüpfe deine Kanäle für Erinnerungen & PDFs.' : 'Подключи каналы для напоминаний и PDF.'}
            </p>
          </div>
        </div>

        {/* Telegram */}
        <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#26A5E4]/10 border border-[#26A5E4]/20">
            <Send className="h-5 w-5 text-[#26A5E4]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-white">Telegram</h3>
              {telegramLinked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {de ? 'Verbunden' : 'Подключено'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  {de ? 'Nicht verbunden' : 'Не подключено'}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1 mb-3">
              {de
                ? 'Erhalte Terminerinnerungen, PDFs und Benachrichtigungen über Telegram.'
                : 'Получай напоминания, PDF и уведомления через Telegram.'}
            </p>
            {telegramLinked ? (
              <button
                onClick={handleUnlinkTelegram}
                disabled={unlinkingTg}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {unlinkingTg ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />{de ? 'Trenne...' : 'Отключаю...'}</>
                ) : (
                  <><Unlink className="h-3.5 w-3.5" strokeWidth={1.5} />{de ? 'Trennen' : 'Отключить'}</>
                )}
              </button>
            ) : (
              <a
                href={`https://t.me/NumerologieProBot?start=${userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#26A5E4]/30 bg-[#26A5E4]/10 px-4 py-2 text-xs font-medium text-[#26A5E4] hover:bg-[#26A5E4]/20 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                {de ? 'Telegram verbinden' : 'Подключить Telegram'}
              </a>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 border border-[#25D366]/20">
            <MessageCircle className="h-5 w-5 text-[#25D366]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-white">WhatsApp</h3>
              {waPhoneOriginal ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {de ? 'Verbunden' : 'Подключено'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  {de ? 'Nicht verbunden' : 'Не подключено'}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1 mb-3">
              {de
                ? 'Hinterlege deine WhatsApp-Nummer für Benachrichtigungen.'
                : 'Укажи номер WhatsApp для уведомлений.'}
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
                <input
                  type="tel"
                  value={waPhone}
                  onChange={(e) => { setWaPhone(e.target.value); setWaError(''); }}
                  placeholder="+49 170 1234567"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                />
              </div>
              <button
                onClick={handleSaveWhatsApp}
                disabled={savingWa || waPhone === waPhoneOriginal}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors disabled:opacity-50"
              >
                {savingWa ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </button>
            </div>
            {waError && (
              <p className="text-xs text-red-400 mt-1.5">{waError}</p>
            )}
            {waSuccess && (
              <p className="text-xs text-emerald-400 mt-1.5">{de ? 'Gespeichert!' : 'Сохранено!'}</p>
            )}
          </div>
        </div>

        {/* Preferred Channel */}
        <div className="rounded-xl bg-white/5 border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-white/40" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-white">
              {de ? 'Bevorzugter Kanal' : 'Предпочтительный канал'}
            </h3>
            {savingChannel && <Loader2 className="h-3 w-3 text-gold animate-spin" strokeWidth={1.5} />}
          </div>
          <p className="text-xs text-white/40 mb-3">
            {de
              ? 'Worüber möchtest du Erinnerungen und PDFs erhalten?'
              : 'Через что ты хочешь получать напоминания и PDF?'}
          </p>
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'email' as const, label: 'E-Mail', enabled: true },
              { key: 'telegram' as const, label: 'Telegram', enabled: telegramLinked },
              { key: 'whatsapp' as const, label: 'WhatsApp', enabled: !!waPhoneOriginal },
            ]).map(({ key, label, enabled }) => (
              <button
                key={key}
                onClick={() => handleChannelChange(key)}
                disabled={!enabled}
                className={`rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                  channel === key
                    ? 'bg-gold/20 border border-gold/40 text-gold shadow-sm shadow-gold/10'
                    : enabled
                      ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                      : 'bg-white/3 border border-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {label}
                {!enabled && (
                  <span className="ml-1.5 text-[10px] text-white/20">
                    ({de ? 'nicht verbunden' : 'не подключено'})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DSGVO: Data Export & Account Deletion */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-white">
          {de ? 'Datenschutz & Daten' : 'Конфиденциальность и данные'}
        </h2>

        {/* Data Export (Art. 20 DSGVO) */}
        <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
            <Download className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white">
              {de ? 'Daten anfordern' : 'Запросить данные'}
            </h3>
            <p className="text-xs text-white/40 mt-0.5 mb-3">
              {de
                ? 'Du hast das Recht, eine Kopie deiner gespeicherten Daten zu erhalten (Art. 20 DSGVO). Schreibe uns dafür eine E-Mail an:'
                : 'Вы имеете право получить копию ваших сохранённых данных (Ст. 20 GDPR). Напишите нам на:'}
            </p>
            <a
              href="mailto:info@numerologie-pro.com?subject=Datenexport%20anfragen"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              info@numerologie-pro.com
            </a>
          </div>
        </div>

        {/* Account Deletion (Art. 17 DSGVO) */}
        <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <Trash2 className="h-5 w-5 text-red-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white">
              {de ? 'Konto löschen' : 'Удалить аккаунт'}
            </h3>
            <p className="text-xs text-white/40 mt-0.5 mb-3">
              {de
                ? 'Möchtest du dein Konto und alle zugehörigen Daten löschen lassen? Schreibe uns eine E-Mail und wir kümmern uns darum (Art. 17 DSGVO).'
                : 'Хотите удалить свой аккаунт и все связанные данные? Напишите нам, и мы позаботимся об этом (Ст. 17 GDPR).'}
            </p>
            <a
              href="mailto:info@numerologie-pro.com?subject=Konto%20l%C3%B6schen"
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              info@numerologie-pro.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
