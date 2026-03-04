'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getAdminT } from '@/lib/i18n/admin';
import {
  ArrowLeft,
  Sparkles,
  Mail,
  MessageCircle,
  Send,
  Save,
  Clock,
  Users,
  Star,
  UserCheck,
  UserPlus,
  Tag,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

type ContentType = 'newsletter' | 'telegram_post' | 'upsell' | 'event' | 'daily_tip';
type AudienceType = 'all' | 'vip' | 'clients' | 'leads' | 'tags';
type ChannelMode = 'email' | 'telegram' | 'both';
type LangFilter = 'all' | 'de' | 'ru';

interface AIModel {
  id: string;
  label: string;
  description: string;
}

export default function BroadcastComposerPage() {
  const locale = useLocale();
  const t = getAdminT(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  // Form state
  const [title, setTitle] = useState('');
  const [subjectEmail, setSubjectEmail] = useState('');
  const [contentEmail, setContentEmail] = useState('');
  const [contentTelegram, setContentTelegram] = useState('');
  const [channel, setChannel] = useState<ChannelMode>('both');
  const [audience, setAudience] = useState<AudienceType>('all');
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [activeTab, setActiveTab] = useState<'email' | 'telegram'>('email');

  // AI state
  const [aiContentType, setAiContentType] = useState<ContentType>('newsletter');
  const [aiLanguage, setAiLanguage] = useState<'de' | 'ru'>('de');
  const [aiTopic, setAiTopic] = useState('');
  const [aiModel, setAiModel] = useState('google/gemini-2.0-flash-001');
  const [models, setModels] = useState<AIModel[]>([]);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Save/send state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [broadcastId, setBroadcastId] = useState<string | null>(editId);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ status: string; count: number } | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  // Load available AI models
  useEffect(() => {
    fetch('/api/admin/ai/generate')
      .then((r) => r.json())
      .then((d) => { if (d.models) setModels(d.models); })
      .catch(() => {});
  }, []);

  // Load existing broadcast if editing
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/broadcasts/${editId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.broadcast) return;
        const b = d.broadcast;
        setTitle(b.title ?? '');
        setSubjectEmail(b.subject_email ?? '');
        setContentEmail(b.content_email ?? '');
        setContentTelegram(b.content_telegram ?? '');
        const ch = b.channels as string[];
        if (ch.includes('email') && ch.includes('telegram')) setChannel('both');
        else if (ch.includes('telegram')) setChannel('telegram');
        else setChannel('email');
        const af = b.audience_filter as { type: string; values?: string[] };
        if (af.type === 'status' && af.values?.includes('vip')) setAudience('vip');
        else if (af.type === 'status') setAudience('clients');
        else if (af.type === 'leads') setAudience('leads');
        else if (af.type === 'tags') setAudience('tags');
        else setAudience('all');
        setLangFilter((b.language as LangFilter) ?? 'all');
      })
      .catch(() => {});
  }, [editId]);

  // Count audience whenever filter changes
  const fetchAudienceCount = useCallback(async () => {
    const filter = getAudienceFilter();
    const channels = getChannels();
    try {
      const res = await fetch('/api/admin/broadcasts/count-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience_filter: filter, language: langFilter, channels }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecipientCount(data.count ?? null);
      }
    } catch {
      // Silently ignore — count is nice-to-have
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience, langFilter, channel]);

  useEffect(() => {
    fetchAudienceCount();
  }, [fetchAudienceCount]);

  function getAudienceFilter() {
    switch (audience) {
      case 'vip': return { type: 'status', values: ['vip'] };
      case 'clients': return { type: 'status', values: ['client', 'vip'] };
      case 'leads': return { type: 'leads' };
      case 'tags': return { type: 'tags', values: [] }; // TODO: tag picker
      default: return { type: 'all' };
    }
  }

  function getChannels(): string[] {
    if (channel === 'both') return ['email', 'telegram'];
    return [channel];
  }

  // AI Content Generation
  async function handleGenerate() {
    setGenerating(true);
    setAiError('');
    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: aiContentType,
          language: aiLanguage,
          topic: aiTopic || undefined,
          model: aiModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setContentEmail(data.email_content ?? '');
      setContentTelegram(data.telegram_content ?? '');
      if (data.subject) setSubjectEmail(data.subject);
      if (!title) setTitle(aiTopic || aiContentType);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  }

  // Save Draft
  async function handleSaveDraft() {
    if (!title.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        title,
        content_email: contentEmail || null,
        content_telegram: contentTelegram || null,
        subject_email: subjectEmail || null,
        channels: getChannels(),
        audience_filter: getAudienceFilter(),
        language: langFilter,
        ai_prompt: aiTopic || null,
        ai_model: aiModel || null,
      };

      let res;
      if (broadcastId) {
        res = await fetch(`/api/admin/broadcasts/${broadcastId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.broadcast?.id) setBroadcastId(data.broadcast.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  // Send Now
  async function handleSendNow() {
    if (!broadcastId) {
      // Save first, then send
      await handleSaveDraft();
    }
    const id = broadcastId;
    if (!id) return;

    if (!confirm(t.confirmSendDesc.replace('{count}', String(recipientCount ?? '?')))) return;

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/admin/broadcasts/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSendResult({ status: data.status, count: data.recipient_count });
      // Redirect after 2s
      setTimeout(() => router.push(`/${locale}/admin/content`), 2000);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  }

  const contentTypes: { value: ContentType; label: string }[] = [
    { value: 'newsletter', label: t.ct_newsletter },
    { value: 'telegram_post', label: t.ct_telegram_post },
    { value: 'upsell', label: t.ct_upsell },
    { value: 'event', label: t.ct_event },
    { value: 'daily_tip', label: t.ct_daily_tip },
  ];

  const audienceOptions: { value: AudienceType; label: string; icon: typeof Users }[] = [
    { value: 'all', label: t.audienceAll, icon: Users },
    { value: 'vip', label: t.audienceVip, icon: Star },
    { value: 'clients', label: t.audienceClients, icon: UserCheck },
    { value: 'leads', label: t.audienceLeads, icon: UserPlus },
    { value: 'tags', label: t.audienceCustom, icon: Tag },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/content`}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white/50" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {editId ? t.composerEditTitle : t.composerTitle}
          </h1>
        </div>
      </div>

      {/* Title + Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t.broadcastTitle}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t.emailSubject}</label>
          <input
            type="text"
            value={subjectEmail}
            onChange={(e) => setSubjectEmail(e.target.value)}
            placeholder={t.emailSubject}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          />
        </div>
      </div>

      {/* AI Content Assistant */}
      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-white">AI Content Assistant</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* Content Type */}
          <div>
            <label className="block text-xs text-white/50 mb-1">{t.contentType}</label>
            <select
              value={aiContentType}
              onChange={(e) => setAiContentType(e.target.value as ContentType)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
            >
              {contentTypes.map((ct) => (
                <option key={ct.value} value={ct.value} className="bg-[#0a2a38] text-white">
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs text-white/50 mb-1">{t.languageFilter}</label>
            <select
              value={aiLanguage}
              onChange={(e) => setAiLanguage(e.target.value as 'de' | 'ru')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
            >
              <option value="de" className="bg-[#0a2a38]">{t.langDe}</option>
              <option value="ru" className="bg-[#0a2a38]">{t.langRu}</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs text-white/50 mb-1">{t.model}</label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0a2a38]">
                  {m.label}
                </option>
              ))}
              {models.length === 0 && (
                <option value="google/gemini-2.0-flash-001" className="bg-[#0a2a38]">Gemini Flash</option>
              )}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs text-white/50 mb-1">{t.topicPlaceholder}</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder={t.topicPlaceholder}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />{t.generating}</>
          ) : (
            <><Sparkles className="h-4 w-4" strokeWidth={1.5} />{t.generateWithAi}</>
          )}
        </button>

        {aiError && (
          <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
            {aiError}
          </p>
        )}
      </div>

      {/* Content Editor */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === 'email' ? 'text-gold border-b-2 border-gold' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            {t.emailContent}
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === 'telegram' ? 'text-gold border-b-2 border-gold' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            {t.telegramContent}
          </button>
        </div>

        {/* Textarea */}
        <div className="p-5">
          {activeTab === 'email' ? (
            <textarea
              value={contentEmail}
              onChange={(e) => setContentEmail(e.target.value)}
              placeholder={t.emailContent}
              rows={12}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors resize-y font-mono"
            />
          ) : (
            <>
              <textarea
                value={contentTelegram}
                onChange={(e) => setContentTelegram(e.target.value)}
                placeholder={t.telegramContent}
                rows={12}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors resize-y font-mono"
              />
              <div className="flex justify-between mt-2 text-xs">
                <span className={contentTelegram.length > 4096 ? 'text-red-400' : 'text-white/30'}>
                  {contentTelegram.length} / 4096 {t.charCount}
                </span>
                {contentTelegram.length > 4096 && (
                  <span className="text-red-400">{t.telegramLimit}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5 space-y-5">
        {/* Channel Selector */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t.channels}</label>
          <div className="flex gap-2">
            {[
              { value: 'email' as ChannelMode, label: t.channelEmail, icon: Mail },
              { value: 'telegram' as ChannelMode, label: t.channelTelegram, icon: MessageCircle },
              { value: 'both' as ChannelMode, label: t.channelBoth, icon: Send },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setChannel(value)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all ${
                  channel === value
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'border-white/10 text-white/50 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Audience Selector */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t.recipients}</label>
          <div className="flex flex-wrap gap-2">
            {audienceOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setAudience(value)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all ${
                  audience === value
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'border-white/10 text-white/50 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t.languageFilter}</label>
          <div className="flex gap-2">
            {[
              { value: 'all' as LangFilter, label: t.langAll },
              { value: 'de' as LangFilter, label: t.langDe },
              { value: 'ru' as LangFilter, label: t.langRu },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLangFilter(value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium border transition-all ${
                  langFilter === value
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'border-white/10 text-white/50 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Count */}
        {recipientCount !== null && (
          <p className="text-sm text-white/50">
            {t.recipientPreview.replace('{count}', String(recipientCount))}
          </p>
        )}
      </div>

      {/* Success / Send Result */}
      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
          {t.saved}
        </div>
      )}

      {sendResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <Send className="h-4 w-4" strokeWidth={1.5} />
          {sendResult.status === 'sending'
            ? `${t.sending} ${sendResult.count} ${t.recipients}`
            : `${t.status_sent} — ${sendResult.count} ${t.recipients}`}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={saving || !title.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          <Save className="h-4 w-4" strokeWidth={1.5} />
          {saving ? '...' : t.saveDraft}
        </button>

        <button
          onClick={() => {/* TODO: date picker for scheduling */}}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors"
        >
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          {t.schedule}
        </button>

        <button
          onClick={handleSendNow}
          disabled={sending || !title.trim() || (!contentEmail && !contentTelegram)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-5 py-3 text-sm font-bold text-gold hover:bg-gold/20 transition-colors disabled:opacity-30"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
          {sending ? t.sending : t.sendNow}
        </button>
      </div>
    </div>
  );
}
