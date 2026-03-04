'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, ShoppingCart, Loader2, Share2, ArrowRight, Sparkles } from 'lucide-react';

interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  converted_referrals: number;
  pending_referrals: number;
  reward_coupons: Array<{
    id: string;
    code: string;
    value: number;
    used_count: number;
    active: boolean;
  }>;
}

const t = {
  de: {
    title: 'Freunde einladen & 15% sparen',
    subtitle: 'Jede erfolgreiche Empfehlung bringt dir einen persönlichen 15%-Gutschein!',
    heroTitle: 'Dein persönlicher Empfehlungs-Code',
    heroDesc: 'Teile diesen Code oder Link mit Freunden und Familie. Wenn jemand über deinen Link eine Beratung oder PDF-Analyse bucht, erhältst du automatisch einen 15%-Gutschein für deine nächste Bestellung.',
    yourCode: 'Dein Code',
    yourLink: 'Oder teile diesen Link direkt',
    copied: 'Kopiert!',
    copyCode: 'Code kopieren',
    copyLink: 'Link kopieren',
    shareNow: 'Jetzt teilen',
    shareWhatsApp: 'Per WhatsApp teilen',
    shareTelegram: 'Per Telegram teilen',
    shareEmail: 'Per E-Mail teilen',
    howTitle: 'So funktioniert dein Empfehlungs-Programm',
    step1title: 'Link teilen',
    step1desc: 'Sende deinen persönlichen Empfehlungs-Link an Freunde und Familie',
    step2title: 'Freund bucht',
    step2desc: 'Dein Freund bucht eine Beratung oder PDF-Analyse über deinen Link',
    step3title: 'Du sparst 15%',
    step3desc: 'Du erhältst automatisch einen einmaligen 15%-Gutschein per E-Mail und Telegram',
    statsTitle: 'Deine Empfehlungs-Statistik',
    totalReferrals: 'Einladungen verschickt',
    converted: 'Erfolgreiche Buchungen',
    pending: 'Ausstehend',
    rewardsTitle: 'Deine Belohnungs-Gutscheine',
    discount: 'Rabatt',
    active: 'Bereit zum Einlösen',
    used: 'Bereits eingelöst',
    noCoupons: 'Sobald ein Freund über deinen Link bucht, erscheint dein 15%-Gutschein hier.',
    loading: 'Wird geladen...',
    shareTextWA: 'Hey! Ich nutze Numerologie PRO für professionelle Psychomatrix-Analysen und bin begeistert. Probier es aus über meinen persönlichen Link — ich würde mich freuen!',
    shareTextTG: 'Numerologie PRO — professionelle Psychomatrix-Analyse. Probier es über meinen Link aus:',
    emailSubject: 'Mein Tipp für dich: Numerologie PRO',
    emailBody: 'Hallo!\n\nIch möchte dir Numerologie PRO empfehlen — eine professionelle Psychomatrix-Analyse von der Numerologin Swetlana Wagner.\n\nNutze meinen persönlichen Link:\n',
    faqTitle: 'Häufige Fragen',
    faq1q: 'Wann bekomme ich meinen Gutschein?',
    faq1a: 'Sofort nachdem dein Freund eine Bestellung abgeschlossen hat. Du bekommst den Gutschein-Code per Telegram und er erscheint hier in deinem Dashboard.',
    faq2q: 'Wie oft kann ich Freunde einladen?',
    faq2a: 'Unbegrenzt! Für jede erfolgreiche Empfehlung erhältst du einen neuen 15%-Gutschein.',
    faq3q: 'Wo kann ich den Gutschein einlösen?',
    faq3a: 'Bei deiner nächsten Bestellung — egal ob Beratung oder PDF-Analyse. Gib den Code einfach beim Checkout ein.',
  },
  ru: {
    title: 'Пригласи друзей и получи скидку 15%',
    subtitle: 'За каждую успешную рекомендацию ты получаешь персональный купон на скидку 15%!',
    heroTitle: 'Твой персональный код рекомендации',
    heroDesc: 'Поделись этим кодом или ссылкой с друзьями и семьёй. Когда кто-то закажет консультацию или PDF-анализ по твоей ссылке, ты автоматически получишь купон на 15% скидку.',
    yourCode: 'Твой код',
    yourLink: 'Или поделись ссылкой напрямую',
    copied: 'Скопировано!',
    copyCode: 'Скопировать код',
    copyLink: 'Скопировать ссылку',
    shareNow: 'Поделиться',
    shareWhatsApp: 'Отправить в WhatsApp',
    shareTelegram: 'Отправить в Telegram',
    shareEmail: 'Отправить по e-mail',
    howTitle: 'Как работает программа рекомендаций',
    step1title: 'Поделись ссылкой',
    step1desc: 'Отправь свою персональную ссылку друзьям и семье',
    step2title: 'Друг покупает',
    step2desc: 'Твой друг заказывает консультацию или PDF-анализ по твоей ссылке',
    step3title: 'Ты экономишь 15%',
    step3desc: 'Ты автоматически получаешь одноразовый купон на скидку 15% по e-mail и Telegram',
    statsTitle: 'Твоя статистика рекомендаций',
    totalReferrals: 'Приглашений отправлено',
    converted: 'Успешных покупок',
    pending: 'В ожидании',
    rewardsTitle: 'Твои купоны-награды',
    discount: 'Скидка',
    active: 'Готов к использованию',
    used: 'Уже использован',
    noCoupons: 'Как только друг закажет по твоей ссылке, здесь появится твой купон на 15%.',
    loading: 'Загрузка...',
    shareTextWA: 'Привет! Я пользуюсь Numerologie PRO для анализа психоматрицы и в восторге. Попробуй через мою ссылку!',
    shareTextTG: 'Numerologie PRO — профессиональный анализ психоматрицы. Попробуй по моей ссылке:',
    emailSubject: 'Рекомендую: Numerologie PRO',
    emailBody: 'Привет!\n\nХочу порекомендовать Numerologie PRO — профессиональный анализ психоматрицы от нумеролога Светланы Вагнер.\n\nИспользуй мою персональную ссылку:\n',
    faqTitle: 'Частые вопросы',
    faq1q: 'Когда я получу купон?',
    faq1a: 'Сразу после того, как твой друг оплатит заказ. Код купона придёт в Telegram и появится здесь, в твоём кабинете.',
    faq2q: 'Сколько раз можно приглашать?',
    faq2a: 'Без ограничений! За каждую успешную рекомендацию ты получаешь новый купон на 15%.',
    faq3q: 'Где использовать купон?',
    faq3a: 'При следующем заказе — неважно, консультация или PDF-анализ. Просто введи код при оплате.',
  },
};

export default function ReferralPanel({ locale }: { locale: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const l = locale === 'ru' ? t.ru : t.de;

  useEffect(() => {
    fetch('/api/referral/my-stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
  };

  const shareWhatsApp = () => {
    if (!stats) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${l.shareTextWA}\n\n${stats.referral_link}`)}`, '_blank');
  };

  const shareTelegram = () => {
    if (!stats) return;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(stats.referral_link)}&text=${encodeURIComponent(l.shareTextTG)}`, '_blank');
  };

  const shareEmail = () => {
    if (!stats) return;
    window.open(`mailto:?subject=${encodeURIComponent(l.emailSubject)}&body=${encodeURIComponent(`${l.emailBody}${stats.referral_link}`)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gold/60" />
        <span className="ml-3 text-white/40 text-sm">{l.loading}</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">{l.title}</h1>
        <p className="text-white/50 text-sm mt-1">{l.subtitle}</p>
      </div>

      {/* Hero Card — Der Code, gross und klar */}
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 via-[rgba(15,48,63,0.6)] to-[rgba(15,48,63,0.4)] backdrop-blur-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-white">{l.heroTitle}</h2>
        </div>
        <p className="text-sm text-white/50 mb-6 max-w-xl leading-relaxed">{l.heroDesc}</p>

        {/* Code — gross und prominent */}
        <div className="mb-5">
          <p className="text-xs text-gold/70 font-medium uppercase tracking-wider mb-2">{l.yourCode}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-black/40 border-2 border-gold/30 px-5 py-4 text-center">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-gold tracking-[0.15em]">
                {stats.referral_code}
              </span>
            </div>
            <button
              onClick={() => copy(stats.referral_code, 'code')}
              className="shrink-0 rounded-xl bg-gold/10 border border-gold/20 px-4 py-4 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
              title={l.copyCode}
            >
              {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Link */}
        <div className="mb-6">
          <p className="text-xs text-white/40 mb-2">{l.yourLink}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white/70 font-mono break-all">
              {stats.referral_link}
            </code>
            <button
              onClick={() => copy(stats.referral_link, 'link')}
              className="shrink-0 rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title={l.copyLink}
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <p className="text-xs text-white/40 mb-3">{l.shareNow}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={shareWhatsApp} className="inline-flex items-center gap-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 px-5 py-2.5 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/15 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.348 0-4.518-.809-6.243-2.164l-.436-.347-2.635.884.884-2.635-.347-.436A9.95 9.95 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            {l.shareWhatsApp}
          </button>
          <button onClick={shareTelegram} className="inline-flex items-center gap-2 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 px-5 py-2.5 text-sm font-medium text-[#0088cc] hover:bg-[#0088cc]/15 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            {l.shareTelegram}
          </button>
          <button onClick={shareEmail} className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            {l.shareEmail}
          </button>
        </div>
      </div>

      {/* How It Works — 3 Schritte visuell */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h2 className="text-sm font-semibold text-white mb-5">{l.howTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { num: '1', icon: Share2, title: l.step1title, desc: l.step1desc, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { num: '2', icon: ShoppingCart, title: l.step2title, desc: l.step2desc, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { num: '3', icon: Gift, title: l.step3title, desc: l.step3desc, color: 'text-gold bg-gold/10 border-gold/20' },
          ].map(({ num, icon: Icon, title, desc, color }, i) => (
            <div key={num} className="relative">
              <div className={`w-10 h-10 rounded-xl border ${color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
              {i < 2 && (
                <ArrowRight className="hidden sm:block absolute top-3 -right-3 h-5 w-5 text-white/15" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h2 className="text-sm font-semibold text-white mb-4">{l.statsTitle}</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: l.totalReferrals, value: stats.total_referrals, accent: 'text-blue-400' },
            { icon: ShoppingCart, label: l.converted, value: stats.converted_referrals, accent: 'text-emerald-400' },
            { icon: Gift, label: l.pending, value: stats.pending_referrals, accent: 'text-amber-400' },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-black/20 border border-white/5">
              <Icon className={`h-5 w-5 ${accent} mx-auto mb-2`} strokeWidth={1.5} />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-[11px] text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Coupons */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h2 className="text-sm font-semibold text-white mb-4">{l.rewardsTitle}</h2>
        {stats.reward_coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
            <Gift className="h-8 w-8 text-white/15 mx-auto mb-3" strokeWidth={1} />
            <p className="text-white/30 text-sm">{l.noCoupons}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.reward_coupons.map((coupon) => {
              const isActive = coupon.active && coupon.used_count === 0;
              return (
                <div key={coupon.id} className={`flex items-center justify-between rounded-xl px-5 py-4 border ${isActive ? 'bg-gold/5 border-gold/20' : 'bg-black/20 border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <Gift className={`h-5 w-5 ${isActive ? 'text-gold' : 'text-white/20'}`} strokeWidth={1.5} />
                    <div>
                      <span className={`font-mono text-base font-bold tracking-wider ${isActive ? 'text-gold' : 'text-white/30'}`}>{coupon.code}</span>
                      <div className="text-xs text-white/40 mt-0.5">{coupon.value}% {l.discount}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                    {isActive ? l.active : l.used}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h2 className="text-sm font-semibold text-white mb-4">{l.faqTitle}</h2>
        <div className="space-y-4">
          {[
            { q: l.faq1q, a: l.faq1a },
            { q: l.faq2q, a: l.faq2a },
            { q: l.faq3q, a: l.faq3a },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-sm font-medium text-white/80 mb-1">{q}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
