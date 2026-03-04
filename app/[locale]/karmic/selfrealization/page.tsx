'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

const t = {
  de: {
    title: 'Selbstverwirklichungs-Code',
    subtitle: 'Testseite — PDF kostenlos herunterladen und prüfen',
    birthdateLabel: 'Geburtsdatum (DD.MM.JJJJ) *',
    birthdatePlaceholder: 'z.B. 25.12.1985',
    nameLabel: 'Name *',
    namePlaceholder: 'z.B. Anna Müller',
    download: 'PDF herunterladen',
    loading: 'PDF wird generiert...',
    error: 'Bitte gib ein gültiges Geburtsdatum (DD.MM.JJJJ) ein.',
    allFieldsError: 'Bitte fülle alle Pflichtfelder aus.',
    formula: 'Formel: Alle Ziffern des Geburtsdatums werden addiert. Ist die Summe > 22, wird 22 abgezogen. Beispiel: 25.12.1985 → 2+5+1+2+1+9+8+5 = 33 → 33 − 22 = Arkana 11.',
    formulaLabel: 'Formel:',
    arcanaPrefix: '→ Arkana',
  },
  ru: {
    title: 'Код самореализации',
    subtitle: 'Тестовая страница — скачай PDF бесплатно для проверки',
    birthdateLabel: 'Дата рождения (ДД.ММ.ГГГГ) *',
    birthdatePlaceholder: 'напр. 25.12.1985',
    nameLabel: 'Имя *',
    namePlaceholder: 'напр. Анна Иванова',
    download: 'Скачать PDF',
    loading: 'PDF генерируется...',
    error: 'Пожалуйста, введите корректную дату рождения (ДД.ММ.ГГГГ).',
    allFieldsError: 'Пожалуйста, заполните все обязательные поля.',
    formula: 'Формула: Все цифры даты рождения складываются. Если сумма > 22, вычитается 22. Пример: 25.12.1985 → 2+5+1+2+1+9+8+5 = 33 → 33 − 22 = Аркан 11.',
    formulaLabel: 'Формула:',
    arcanaPrefix: '→ Аркан',
  },
};

function calcArcana(birthdate: string): number | null {
  const parts = birthdate.split('.');
  if (parts.length !== 3) return null;
  const digits = birthdate.replace(/\D/g, '');
  if (digits.length < 5) return null;
  let sum = 0;
  for (const ch of digits) sum += parseInt(ch, 10);
  while (sum > 22) sum -= 22;
  return sum;
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

export default function SelfRealizationTestPage() {
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
      const res = await fetch('/api/karmic/selfrealization', {
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
      a.download = 'selfrealization-code.pdf';
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
