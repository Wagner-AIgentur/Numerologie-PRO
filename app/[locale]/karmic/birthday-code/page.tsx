'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

const t = {
  de: {
    title: 'Geburtstags-Code',
    subtitle: 'Testseite — PDF kostenlos herunterladen und prüfen',
    arcanaPrefix: '→ Arkana',
    nameLabel: 'Name *',
    namePlaceholder: 'z.B. Anna Müller',
    birthdateLabel: 'Geburtsdatum (DD.MM.JJJJ) *',
    birthdatePlaceholder: 'z.B. 25.12.1985',
    download: 'PDF herunterladen',
    loading: 'PDF wird generiert...',
    error: 'Bitte gib ein gültiges Geburtsdatum (DD.MM.JJJJ) ein.',
    allFieldsError: 'Bitte fülle alle Pflichtfelder aus.',
    formula: 'Formel: Tag > 22 → Tag − 22 = Arkana-Nummer. Z.B. Tag 25 → 25 − 22 = Arkana 3 (Kaiserin).',
    formulaLabel: 'Formel:',
  },
  ru: {
    title: 'Код дня рождения',
    subtitle: 'Тестовая страница — скачай PDF бесплатно для проверки',
    arcanaPrefix: '→ Аркан',
    nameLabel: 'Имя *',
    namePlaceholder: 'напр. Анна Иванова',
    birthdateLabel: 'Дата рождения (ДД.ММ.ГГГГ) *',
    birthdatePlaceholder: 'напр. 25.12.1985',
    download: 'Скачать PDF',
    loading: 'PDF генерируется...',
    error: 'Пожалуйста, введите корректную дату рождения (ДД.ММ.ГГГГ).',
    allFieldsError: 'Пожалуйста, заполните все обязательные поля.',
    formula: 'Формула: день > 22 → день − 22 = номер аркана. Напр. день 25 → 25 − 22 = Аркан 3 (Императрица).',
    formulaLabel: 'Формула:',
  },
};

function formatBirthdateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  let result = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += '.';
    result += digits[i];
  }
  return result;
}

export default function BirthdayCodeTestPage() {
  const params = useParams();
  const locale = (params.locale as 'de' | 'ru') || 'de';
  const l = t[locale] || t.de;

  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidBirthdate = /^\d{2}\.\d{2}\.\d{4}$/.test(birthdate);
  const isFormValid = name.trim().length > 0 && isValidBirthdate;

  // Extract day from birthdate for arcana preview
  const arcanaNumber = (() => {
    if (!isValidBirthdate) return null;
    const day = parseInt(birthdate.split('.')[0], 10);
    if (day < 1 || day > 31) return null;
    return day > 22 ? day - 22 : day;
  })();

  async function handleDownload() {
    if (!isFormValid) {
      if (!isValidBirthdate) {
        setError(l.error);
      } else {
        setError(l.allFieldsError);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/karmic/birthday-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          birthdate,
          locale,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'PDF generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birthday-code-${birthdate.replace(/\./g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
        {l.title}
      </h1>
      <p className="mb-8 text-white/60">
        {l.subtitle}
      </p>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm text-white/70">
            {l.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={l.namePlaceholder}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="mb-1 block text-sm text-white/70">
            {l.birthdateLabel}
          </label>
          <input
            type="text"
            value={birthdate}
            onChange={(e) => setBirthdate(formatBirthdateInput(e.target.value))}
            placeholder={l.birthdatePlaceholder}
            maxLength={10}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#D4AF37] transition-colors"
          />
          {arcanaNumber !== null && (
            <p className="mt-1 text-sm text-[#D4AF37]">
              {l.arcanaPrefix} {arcanaNumber}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={loading || !isFormValid}
          className="w-full rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-[#051A24] transition-all hover:bg-[#e0c04a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? l.loading : l.download}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-white/50">
          <strong className="text-white/70">{l.formulaLabel}</strong> {l.formula}
        </p>
      </div>
    </div>
  );
}
