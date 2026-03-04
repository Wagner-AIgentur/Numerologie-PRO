'use client';

interface FieldDefinition {
  id: string;
  field_key: string;
  label_de: string;
  label_ru: string;
  field_type: string;
  options: string[] | null;
  is_required: boolean | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface Props {
  definition: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  locale: string;
  readOnly?: boolean;
}

export default function CustomFieldRenderer({ definition, value, onChange, locale, readOnly = false }: Props) {
  const de = locale === 'de';
  const label = de ? definition.label_de : definition.label_ru;

  const baseInputClass = `w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none transition-colors ${
    readOnly ? 'opacity-60 cursor-not-allowed' : ''
  }`;

  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">
        {label}
        {definition.is_required && <span className="text-amber-400 ml-1">*</span>}
      </label>

      {definition.field_type === 'text' && (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={de ? 'Text eingeben...' : 'Введите текст...'}
          className={baseInputClass}
        />
      )}

      {definition.field_type === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={de ? 'Zahl eingeben...' : 'Введите число...'}
          className={baseInputClass}
        />
      )}

      {definition.field_type === 'date' && (
        <input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={`${baseInputClass} [color-scheme:dark]`}
        />
      )}

      {definition.field_type === 'select' && (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={`${baseInputClass} ${readOnly ? 'pointer-events-none' : ''}`}
        >
          <option value="" className="bg-[#0a1a24]">
            {de ? '-- Auswählen --' : '-- Выбрать --'}
          </option>
          {definition.options?.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0a1a24]">
              {opt}
            </option>
          ))}
        </select>
      )}

      {definition.field_type === 'boolean' && (
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => !readOnly && onChange(value === 'true' ? 'false' : 'true')}
            disabled={readOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value === 'true' ? 'bg-gold/30' : 'bg-white/10'
            } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full transition-transform ${
                value === 'true' ? 'translate-x-6 bg-gold' : 'translate-x-1 bg-white/40'
              }`}
            />
          </button>
          <span className="text-sm text-white/60">
            {value === 'true' ? (de ? 'Ja' : 'Да') : (de ? 'Nein' : 'Нет')}
          </span>
        </div>
      )}
    </div>
  );
}
