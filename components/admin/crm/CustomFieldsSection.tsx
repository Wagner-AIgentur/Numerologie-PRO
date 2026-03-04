'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings2, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CustomFieldRenderer from '@/components/admin/custom-fields/CustomFieldRenderer';

interface FieldDefinition {
  id: string;
  field_key: string;
  label_de: string;
  label_ru: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface FieldValue {
  field_id: string;
  value: string;
}

interface Props {
  profileId: string;
  locale: string;
}

export default function CustomFieldsSection({ profileId, locale }: Props) {
  const de = locale === 'de';
  const [definitions, setDefinitions] = useState<FieldDefinition[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    async function load() {
      try {
        const [defsRes, valsRes] = await Promise.all([
          fetch('/api/admin/custom-fields'),
          fetch(`/api/admin/custom-fields/values?profile_id=${profileId}`),
        ]);

        if (defsRes.ok) {
          const allDefs = (await defsRes.json()) as FieldDefinition[];
          setDefinitions(allDefs.filter((d) => d.is_active).sort((a, b) => a.sort_order - b.sort_order));
        }

        if (valsRes.ok) {
          const allVals = (await valsRes.json()) as FieldValue[];
          const map: Record<string, string> = {};
          for (const v of allVals) {
            map[v.field_id] = v.value;
          }
          setValues(map);
        }
      } catch (err) {
        console.error('[CustomFields] Load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profileId]);

  const saveValue = useCallback(async (fieldId: string, value: string) => {
    setSaving(fieldId);
    setSaved(null);
    try {
      const res = await fetch('/api/admin/custom-fields/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, field_id: fieldId, value }),
      });
      if (res.ok) {
        setSaved(fieldId);
        setTimeout(() => setSaved((prev) => (prev === fieldId ? null : prev)), 1500);
      }
    } catch (err) {
      console.error('[CustomFields] Save failed:', err);
    } finally {
      setSaving(null);
    }
  }, [profileId]);

  const handleChange = useCallback((fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));

    // Debounce save (500ms)
    if (debounceTimers.current[fieldId]) {
      clearTimeout(debounceTimers.current[fieldId]);
    }
    debounceTimers.current[fieldId] = setTimeout(() => {
      saveValue(fieldId, value);
    }, 500);
  }, [saveValue]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-9 bg-white/5 rounded-xl" />
          <div className="h-9 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (definitions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
        <Settings2 className="h-6 w-6 text-white/15 mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-white/30 text-xs mb-2">
          {de ? 'Keine eigenen Felder definiert.' : 'Нет собственных полей.'}
        </p>
        <Link
          href={`/${locale}/admin/custom-fields`}
          className="text-xs text-gold/60 hover:text-gold transition-colors"
        >
          {de ? 'Felder verwalten' : 'Управление полями'} →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">
          {de ? 'Eigene Felder' : 'Свои поля'} ({definitions.length})
        </h3>
        <Link
          href={`/${locale}/admin/custom-fields`}
          className="text-white/20 hover:text-gold/60 transition-colors"
          title={de ? 'Felder verwalten' : 'Управление полями'}
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {definitions.map((def) => (
          <div key={def.id} className="relative">
            <CustomFieldRenderer
              definition={def}
              value={values[def.id] ?? ''}
              onChange={(val) => handleChange(def.id, val)}
              locale={locale}
            />
            {/* Save indicator */}
            {saving === def.id && (
              <Loader2 className="absolute top-0 right-0 h-3 w-3 text-gold/50 animate-spin" />
            )}
            {saved === def.id && (
              <Check className="absolute top-0 right-0 h-3 w-3 text-emerald-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
