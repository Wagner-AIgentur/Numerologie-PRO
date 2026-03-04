'use client';

import { useState } from 'react';
import { Link as LinkIcon, MessageCircle, Send, Check } from 'lucide-react';

interface ShareButtonsProps {
  birthdate: string;
  schicksalszahl: number;
  locale: 'de' | 'ru';
}

const TEXT = {
  de: {
    copy: 'Link kopieren',
    copied: 'Kopiert!',
    shareMsg: (wn: number) =>
      `Meine Schicksalszahl ist ${wn}! Berechne deine Psychomatrix kostenlos:`,
  },
  ru: {
    copy: 'Скопировать ссылку',
    copied: 'Скопировано!',
    shareMsg: (wn: number) =>
      `Моё число судьбы — ${wn}! Рассчитай свою психоматрицу бесплатно:`,
  },
};

export default function ShareButtons({ birthdate, schicksalszahl, locale }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const t = TEXT[locale];

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = t.shareMsg(schicksalszahl);
  const fullShareText = `${shareText} ${currentUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = currentUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullShareText)}`, '_blank');
  };

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/20 bg-gold/5 px-3 py-1.5 text-xs font-medium text-gold/80 hover:border-gold/40 hover:bg-gold/10 hover:text-gold transition-all"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            {t.copied}
          </>
        ) : (
          <>
            <LinkIcon className="h-3.5 w-3.5" />
            {t.copy}
          </>
        )}
      </button>

      <button
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400 transition-all"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </button>

      <button
        onClick={handleTelegram}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 hover:border-blue-400/30 hover:bg-blue-400/5 hover:text-blue-400 transition-all"
      >
        <Send className="h-3.5 w-3.5" />
        Telegram
      </button>
    </div>
  );
}
