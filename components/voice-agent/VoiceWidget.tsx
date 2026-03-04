'use client';

import { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const widgetText = {
  de: {
    connecting: 'Verbinde...',
    speaking: 'Lisa spricht...',
    listening: 'Lisa hoert zu...',
    cta: 'Jetzt mit Lisa sprechen',
    aiLabel: 'KI-Sprachassistentin',
    aiDisclosure: 'Du sprichst mit einer KI, nicht mit einem Menschen.',
    endHint: 'Klick auf den Button um das Gespraech zu beenden',
    startHint: 'Frag Lisa zu Paketen, Preisen und buch dein Erstgespraech',
    micPaused: 'Mikrofon pausiert',
    micActive: 'Mikrofon aktiv',
    errorConnection: 'Verbindungsfehler. Bitte versuch es nochmal.',
    errorStart: 'Konnte keine Verbindung herstellen. Bitte versuch es nochmal.',
    titleEnd: 'Gespraech beenden',
    titleStart: 'Mit Lisa sprechen',
  },
  ru: {
    connecting: 'Подключение...',
    speaking: 'Лиза говорит...',
    listening: 'Лиза слушает...',
    cta: 'Поговорить с Лизой',
    aiLabel: 'ИИ-голосовой ассистент',
    aiDisclosure: 'Ты общаешься с ИИ, а не с человеком.',
    endHint: 'Нажми на кнопку, чтобы завершить разговор',
    startHint: 'Спроси Лизу о пакетах, ценах и запишись на консультацию',
    micPaused: 'Микрофон на паузе',
    micActive: 'Микрофон активен',
    errorConnection: 'Ошибка подключения. Попробуй снова.',
    errorStart: 'Не удалось подключиться. Попробуй снова.',
    titleEnd: 'Завершить разговор',
    titleStart: 'Поговорить с Лизой',
  },
} as const;

interface VoiceWidgetProps {
  className?: string;
  compact?: boolean;
  locale?: string;
}

export default function VoiceWidget({ className, compact = false, locale = 'de' }: VoiceWidgetProps) {
  const lang = locale === 'ru' ? 'ru' : 'de';
  const l = widgetText[lang];

  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setError(null);
    },
    onDisconnect: () => {},
    onError: (err) => {
      console.error('[Voice Widget] Error:', err);
      setError(l.errorConnection);
    },
  });

  const handleStart = useCallback(async () => {
    try {
      setError(null);

      // Request microphone permission explicitly before starting
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our API (secure, no agent ID exposed)
      const res = await fetch('/api/voice-agent/signed-url');
      if (!res.ok) throw new Error('Failed to get signed URL');
      const { signed_url } = await res.json();

      // Start the conversation via WebSocket with language override
      await conversation.startSession({
        signedUrl: signed_url,
        connectionType: 'websocket',
        overrides: {
          agent: {
            language: lang,
          },
        },
      });
    } catch (err) {
      console.error('[Voice Widget] Start error:', err);
      setError(l.errorStart);
    }
  }, [conversation, lang, l.errorStart]);

  const handleEnd = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnecting = conversation.status === 'connecting';
  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  // Compact mode: floating gold button
  if (compact) {
    return (
      <button
        onClick={isConnected ? handleEnd : handleStart}
        disabled={isConnecting}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-gold flex items-center justify-center transition-all duration-300',
          isConnected
            ? 'bg-red-600 hover:bg-red-700 scale-110'
            : 'bg-gold-gradient hover:shadow-gold-hover',
          isConnecting && 'opacity-70 cursor-wait',
          isSpeaking && 'ring-4 ring-gold/30 animate-pulse',
          className
        )}
        title={isConnected ? l.titleEnd : `${l.titleStart} (${l.aiLabel})`}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 text-teal-dark animate-spin" />
        ) : isConnected ? (
          <PhoneOff className="w-6 h-6 text-white" />
        ) : (
          <Phone className="w-6 h-6 text-teal-dark" />
        )}
      </button>
    );
  }

  // Full widget mode — dark teal glass card with gold accents
  return (
    <div
      className={cn(
        'rounded-[16px] backdrop-blur-2xl bg-[rgba(15,48,63,0.4)] border border-gold/20 p-8 text-center shadow-card',
        className
      )}
    >
      {/* Status Indicator */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Pulse rings when active */}
        {isConnected && (
          <>
            <div className="absolute inset-0 rounded-full bg-gold/15 animate-ping" />
            <div
              className="absolute inset-2 rounded-full bg-gold/10 animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </>
        )}

        {/* Main button */}
        <button
          onClick={isConnected ? handleEnd : handleStart}
          disabled={isConnecting}
          className={cn(
            'relative w-full h-full rounded-full flex items-center justify-center transition-all duration-500',
            isConnected
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg'
              : 'bg-gold-gradient shadow-gold hover:shadow-gold-hover hover:scale-[1.02]',
            isConnecting && 'opacity-70 cursor-wait',
            isSpeaking && 'scale-105'
          )}
        >
          {isConnecting ? (
            <Loader2 className="w-10 h-10 text-teal-dark animate-spin" />
          ) : isConnected ? (
            <PhoneOff className="w-10 h-10 text-white" />
          ) : (
            <Phone className="w-10 h-10 text-teal-dark" />
          )}
        </button>
      </div>

      {/* AI Disclosure (EU AI Act Art. 50) */}
      <div className="inline-flex flex-col items-center gap-1 bg-gold/10 border border-gold/20 rounded-[12px] px-4 py-2 mb-3">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span className="text-xs font-semibold text-gold uppercase tracking-wider">{l.aiLabel}</span>
        </div>
        <span className="text-[11px] text-white/50">{l.aiDisclosure}</span>
      </div>

      {/* Status Text */}
      <h3 className="text-xl font-serif font-bold text-white mb-2">
        {isConnecting
          ? l.connecting
          : isConnected
            ? isSpeaking
              ? l.speaking
              : l.listening
            : l.cta}
      </h3>

      <p className="text-sm text-white/50 mb-4">
        {isConnected ? l.endHint : l.startHint}
      </p>

      {/* Mic Status */}
      {isConnected && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {isSpeaking ? (
            <MicOff className="w-4 h-4 text-white/40" />
          ) : (
            <Mic className="w-4 h-4 text-gold animate-pulse" />
          )}
          <span className={isSpeaking ? 'text-white/40' : 'text-gold'}>
            {isSpeaking ? l.micPaused : l.micActive}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-[12px]">
          {error}
        </p>
      )}

      {/* Languages */}
      {!isConnected && (
        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-white/40">
          <span>DE Deutsch</span>
          <span className="text-gold/40">&#9679;</span>
          <span>RU Русский</span>
        </div>
      )}
    </div>
  );
}
