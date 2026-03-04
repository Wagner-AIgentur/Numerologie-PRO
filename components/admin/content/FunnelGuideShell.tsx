'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  Heart,
  ShoppingCart,
  Crown,
  Zap,
  Users,
  Shield,
  Gift,
  MessageCircle,
  ArrowDown,
  Lightbulb,
  Target,
  TrendingUp,
  Star,
} from 'lucide-react';

interface Props {
  locale: string;
  t: Record<string, string>;
}

/* ── Color palette per funnel stage ────────────────── */
const stages = [
  {
    key: 'Tofu',
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-300',
    icon: Eye,
    width: 'w-full',
    percent: '40%',
  },
  {
    key: 'Mofu',
    color: 'orange',
    gradient: 'from-orange-500/20 to-orange-600/5',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    badge: 'bg-orange-500/20 text-orange-300',
    icon: Heart,
    width: 'w-[85%]',
    percent: '30%',
  },
  {
    key: 'Bofu',
    color: 'gold',
    gradient: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    badge: 'bg-yellow-500/20 text-yellow-300',
    icon: ShoppingCart,
    width: 'w-[65%]',
    percent: '20%',
  },
  {
    key: 'Retention',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-300',
    icon: Crown,
    width: 'w-[45%]',
    percent: '10%',
  },
];

const valueLadderSteps = [
  { key: 'Free', icon: Gift, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'Tripwire', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { key: 'Core', icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { key: 'Premium', icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
];

export default function FunnelGuideShell({ locale, t }: Props) {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/content`}
          className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white/60" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{t.fgTitle}</h1>
          <p className="text-white/50 text-sm mt-1">{t.fgSubtitle}</p>
        </div>
      </div>

      {/* ── What is a Funnel? ──────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
            <Lightbulb className="h-6 w-6 text-gold" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{t.fgWhatIsFunnel}</h2>
            <p className="text-white/60 mt-2 leading-relaxed">{t.fgWhatIsFunnelDesc}</p>
          </div>
        </div>
      </section>

      {/* ── Visual Funnel Pyramid ──────────────────── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gold" strokeWidth={1.5} />
          Marketing Funnel
        </h2>
        <div className="flex flex-col items-center gap-2 py-6">
          {stages.map((stage, i) => (
            <div key={stage.key} className={`${stage.width} transition-all`}>
              <div
                className={`rounded-2xl border ${stage.border} bg-gradient-to-r ${stage.gradient} backdrop-blur-sm p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <stage.icon className={`h-5 w-5 ${stage.text}`} strokeWidth={1.5} />
                  <span className={`font-semibold ${stage.text}`}>
                    {t[`fgStage${stage.key}`]}
                  </span>
                  <span className="text-white/30 text-xs hidden sm:inline">
                    {t[`fgStage${stage.key}Full`]}
                  </span>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${stage.badge}`}>
                  {stage.percent}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-white/20" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Detailed Stage Cards ──────────────────── */}
      {stages.map((stage) => {
        const Icon = stage.icon;
        return (
          <section
            key={stage.key}
            className={`rounded-2xl border ${stage.border} bg-gradient-to-br ${stage.gradient} backdrop-blur-sm p-6 sm:p-8 space-y-5`}
          >
            {/* Stage header */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stage.bg}`}>
                <Icon className={`h-6 w-6 ${stage.text}`} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${stage.text}`}>
                  {t[`fgStage${stage.key}`]}
                </h2>
                <p className="text-white/40 text-sm">
                  {t[`fgStage${stage.key}Full`]}
                </p>
              </div>
            </div>

            {/* Goal */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <Target className={`h-4 w-4 ${stage.text} shrink-0`} strokeWidth={1.5} />
              <span className="text-white font-medium text-sm">
                {t[`fgStage${stage.key}Goal`]}
              </span>
            </div>

            {/* Description */}
            <p className="text-white/60 leading-relaxed">
              {t[`fgStage${stage.key}Desc`]}
            </p>

            {/* Info grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Content types */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-white/40" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Content</span>
                </div>
                <p className="text-white/70 text-sm">
                  {t[`fgStage${stage.key}Content`]}
                </p>
              </div>
              {/* Triggers */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-white/40" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Trigger</span>
                </div>
                <p className="text-white/70 text-sm">
                  {t[`fgStage${stage.key}Triggers`]}
                </p>
              </div>
            </div>

            {/* Examples */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                {locale === 'ru' ? 'Примеры' : 'Beispiele'}
              </span>
              <p className="text-white/70 text-sm leading-relaxed">
                {t[`fgStage${stage.key}Examples`]}
              </p>
            </div>

            {/* Tip */}
            <div className={`flex items-start gap-3 rounded-xl ${stage.bg} border ${stage.border} p-4`}>
              <Lightbulb className={`h-5 w-5 ${stage.text} shrink-0 mt-0.5`} strokeWidth={1.5} />
              <p className={`text-sm ${stage.text} leading-relaxed`}>
                {t[`fgStage${stage.key}Tip`]}
              </p>
            </div>
          </section>
        );
      })}

      {/* ── Balance Recommendation ─────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gold" strokeWidth={1.5} />
          {t.fgBalanceTitle}
        </h2>
        <p className="text-white/60">{t.fgBalanceDesc}</p>

        {/* Visual balance bar */}
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.key} className="flex items-center gap-3">
              <span className={`text-xs font-medium ${stage.text} w-24`}>
                {t[`fgBalance${stage.key}`]}
              </span>
              <div className="flex-1 h-6 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${stage.bg} border ${stage.border} flex items-center justify-end pr-2`}
                  style={{ width: stage.percent }}
                >
                  <span className="text-[10px] font-mono text-white/50">{stage.percent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value Ladder ──────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gold" strokeWidth={1.5} />
          {t.fgValueLadder}
        </h2>
        <p className="text-white/60">{t.fgValueLadderDesc}</p>

        <div className="grid sm:grid-cols-4 gap-3">
          {valueLadderSteps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={step.key} className="relative">
                <div className={`rounded-xl border ${step.border} ${step.bg} p-4 space-y-2 h-full`}>
                  <div className="flex items-center gap-2">
                    <StepIcon className={`h-5 w-5 ${step.color}`} strokeWidth={1.5} />
                    <span className={`font-semibold text-sm ${step.color}`}>
                      {t[`fgValue${step.key}`]}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {t[`fgValue${step.key}Desc`]}
                  </p>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/60">{i + 1}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ManyChat Flow ─────────────────────────── */}
      <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10">
            <MessageCircle className="h-6 w-6 text-purple-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-purple-400">{t.fgManyChatTitle}</h2>
            <p className="text-white/40 text-sm">{t.fgManyChatDesc}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-purple-300">{t.fgManyChatFlow}</h3>
          <div className="space-y-0">
            {[
              t.fgManyChatFlowStep1,
              t.fgManyChatFlowStep2,
              t.fgManyChatFlowStep3,
              t.fgManyChatFlowStep4,
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-300">{i + 1}</span>
                  </div>
                  {i < 3 && <div className="w-px h-4 bg-purple-500/20" />}
                </div>
                <span className="text-white/70 text-sm py-2">{step.replace(/^\d+\.\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Example visual */}
        <div className="rounded-xl bg-black/20 border border-purple-500/20 p-4 space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-wider">
            {locale === 'ru' ? 'Пример' : 'Beispiel'}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
              {locale === 'ru' ? 'Напишите' : 'Kommentiere'} <strong>ANALYSE</strong>
            </span>
            <ArrowDown className="h-4 w-4 text-purple-400/50 rotate-[-90deg]" strokeWidth={1.5} />
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
              {locale === 'ru' ? 'DM со ссылкой на запись' : 'DM mit Buchungslink'}
            </span>
            <ArrowDown className="h-4 w-4 text-purple-400/50 rotate-[-90deg]" strokeWidth={1.5} />
            <span className="px-3 py-1.5 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm">
              {locale === 'ru' ? 'Лид в CRM' : 'Lead im CRM'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Back to Studio ─────────────────────────── */}
      <div className="flex justify-center">
        <Link
          href={`/${locale}/admin/content`}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-6 py-3 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          {t.fgBackToStudio}
        </Link>
      </div>
    </div>
  );
}
