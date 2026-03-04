'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

const t = {
  de: {
    title: 'Karmischer-Knoten-Code',
    subtitle: 'Testseite — PDF kostenlos herunterladen und prüfen',
    birthdateLabel: 'Geburtsdatum (DD.MM.JJJJ) *',
    birthdatePlaceholder: 'z.B. 25.12.1985',
    nameLabel: 'Name *',
    namePlaceholder: 'z.B. Anna Müller',
    download: 'PDF herunterladen',
    loading: 'PDF wird generiert...',
    error: 'Bitte gib ein gültiges Geburtsdatum (DD.MM.JJJJ) ein.',
    allFieldsError: 'Bitte fülle alle Pflichtfelder aus.',
    formula: 'Formel: Tag-Arkana + Monat + Jahres-Quersumme → falls > 22, wird 22 abgezogen. Beispiel: 25.12.1985 → Tag 3 + Monat 12 + Jahr 1+9+8+5=23→1 = 16 → Arkana 16.',
    formulaLabel: 'Formel:',
    arcanaPrefix: '→ Arkana',
  },
  ru: {
    title: 'Код кармического узла',
    subtitle: 'Тестовая страница — скачай PDF бесплатно для проверки',
    birthdateLabel: 'Дата рождения (ДД.ММ.ГГГГ) *',
    birthdatePlaceholder: 'напр. 25.12.1985',
    nameLabel: 'Имя *',
    namePlaceholder: 'напр. Анна Иванова',
    download: 'Скачать PDF',
    loading: 'PDF генерируется...',
    error: 'Пожалуйста, введите корректную дату рождения (ДД.ММ.ГГГГ).',
    allFieldsError: 'Пожалуйста, заполните все обязательные поля.',
    formula: 'Формула: Аркан дня + месяц + сумма цифр года → если > 22, вычитается 22. Пример: 25.12.1985 → День 3 + Месяц 12 + Год 1+9+8+5=23→1 = 16 → Аркан 16.',
    formulaLabel: 'Формула:',
    arcanaPrefix: '→ Аркан',
  },
};

function calcArcana(birthdate: string): number | null {
  const parts = birthdate.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const yearStr = parts[2];
  if (isNaN(day) || isNaN(month) || yearStr.length !== 4) return null;

  const dayArcana = day > 22 ? day - 22 : day;
  let yearSum = 0;
  for (const ch of yearStr) yearSum += parseInt(ch, 10);
  while (yearSum > 22) yearSum -= 22;

  let total = dayArcana + month + yearSum;
  while (total > 22) total -= 22;
  return total;
}

function formatBirthdateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  let result = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += '.';
    result += digits[i];
  }
  return result;
}

export default function KarmicKnotsTestPage() {
  const params = useParams();
  const locale = (params.locale as 'de' | 'ru') || 'de';
  const l = t[locale] || t.de;

  const [birthdate, setBirthdate] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidBirthdate = /^\d{2}\.\d{2}\.\d{4}$/.test(birthdate);
  const isFormValid = isValidBirthdate && name.trim().length > 0;

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
      const res = await fetch('/api/karmic/karmic-knots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthdate,
          name: name.trim(),
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
      a.download = 'karmic-knots-code.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const arcanaNumber = calcArcana(birthdate);

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
        {l.title}
      </h1>
      <p className="mb-8 text-white/60">{l.subtitle}</p>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div>
          <label className="mb-1 block text-sm text-white/70">{l.nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={l.namePlaceholder}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">{l.birthdateLabel}</label>
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

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleDownload}
          disabled={loading || !isFormValid}
          className="w-full rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-[#051A24] transition-all hover:bg-[#e0c04a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? l.loading : l.download}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-white/50">
          <strong className="text-white/70">{l.formulaLabel}</strong> {l.formula}
        </p>
      </div>
    </div>
  );
}
