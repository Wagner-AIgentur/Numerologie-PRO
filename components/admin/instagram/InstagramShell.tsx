'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { getAdminT } from '@/lib/i18n/admin';
import { Instagram, Send, Loader2, Link2, X, Search } from 'lucide-react';

/* ---------- Types ---------- */

interface ProfileInfo {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface Conversation {
  sender_id: string;
  profile: ProfileInfo | null;
  lastMessage: {
    id: string;
    message_text: string | null;
    direction: 'in' | 'out';
    created_at: string;
  };
  messageCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  profile_id: string | null;
  direction: 'in' | 'out';
  message_text: string | null;
  message_type: string;
  created_at: string;
  profiles?: ProfileInfo | null;
}

interface Props {
  locale: string;
  initialConversations: Conversation[];
}

/* ---------- Helpers ---------- */

function relativeTime(dateStr: string, locale: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const de = locale === 'de';

  if (seconds < 60) return de ? 'gerade eben' : '\u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u043e';
  if (minutes < 60) return de ? `vor ${minutes}m` : `${minutes}\u043c \u043d\u0430\u0437\u0430\u0434`;
  if (hours < 24) return de ? `vor ${hours}h` : `${hours}\u0447 \u043d\u0430\u0437\u0430\u0434`;
  if (days < 7) return de ? `vor ${days}d` : `${days}\u0434 \u043d\u0430\u0437\u0430\u0434`;

  return new Date(dateStr).toLocaleDateString(de ? 'de-DE' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '\u2026';
}

function formatTimestamp(dateStr: string, locale: string): string {
  const de = locale === 'de';
  return new Date(dateStr).toLocaleTimeString(de ? 'de-DE' : 'ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------- Component ---------- */

export default function InstagramShell({ locale, initialConversations }: Props) {
  const t = getAdminT(locale);
  const de = locale === 'de';

  // State
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived
  const selectedConversation = conversations.find((c) => c.sender_id === selectedSenderId) ?? null;

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (senderId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/instagram/messages?sender_id=${encodeURIComponent(senderId)}&limit=100`);
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setMessages(json.messages ?? []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/instagram/conversations');
      if (!res.ok) return;
      const json = await res.json();
      setConversations(json.conversations ?? []);
    } catch {
      // silent
    }
  }, []);

  // Select a conversation
  const handleSelectConversation = useCallback(
    (senderId: string) => {
      setSelectedSenderId(senderId);
      setMobileShowChat(true);
      fetchMessages(senderId);
    },
    [fetchMessages],
  );

  // Auto-refresh every 10 seconds
  useAutoRefresh(async () => {
    await fetchConversations();
    if (selectedSenderId) {
      await fetchMessages(selectedSenderId);
    }
  }, 10000);

  // Send message
  const handleSend = useCallback(async () => {
    if (!selectedSenderId || !replyText.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/instagram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: selectedSenderId,
          text: replyText.trim(),
          profile_id: selectedConversation?.profile?.id ?? null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Send failed');
      }

      setReplyText('');
      // Refresh messages immediately
      await fetchMessages(selectedSenderId);
      await fetchConversations();
      inputRef.current?.focus();
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  }, [selectedSenderId, replyText, sending, selectedConversation, fetchMessages, fetchConversations]);

  // Handle enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Link profile
  const handleLinkProfile = useCallback(async () => {
    if (!selectedSenderId || !linkEmail.trim()) return;

    setLinkLoading(true);
    setLinkError('');

    try {
      // Link sender_id to profile via email lookup
      const linkRes = await fetch('/api/admin/instagram/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: selectedSenderId,
          email: linkEmail.trim(),
        }),
      });

      if (!linkRes.ok) {
        const json = await linkRes.json();
        if (linkRes.status === 404) {
          setLinkError(de ? 'Kein Profil mit dieser E-Mail gefunden.' : '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0441 \u044d\u0442\u0438\u043c email \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.');
          return;
        }
        throw new Error(json.error ?? 'Link failed');
      }

      // Refresh
      setShowLinkDialog(false);
      setLinkEmail('');
      await fetchConversations();
      await fetchMessages(selectedSenderId);
    } catch (err) {
      console.error('Link error:', err);
      setLinkError(de ? 'Fehler beim Verknüpfen.' : '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0435.');
    } finally {
      setLinkLoading(false);
    }
  }, [selectedSenderId, linkEmail, de, fetchConversations, fetchMessages]);

  // Get display name for a conversation
  const getDisplayName = (conv: Conversation): string => {
    if (conv.profile?.full_name) return conv.profile.full_name;
    return `${t.igUnknownUser} ${conv.sender_id.slice(-6)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">{t.instagramTitle}</h1>
        <p className="text-white/50 text-sm mt-1">{t.instagramSubtitle}</p>
      </div>

      {/* Empty State */}
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <Instagram className="h-10 w-10 text-pink-400/30 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40">{t.igNoConversations}</p>
        </div>
      ) : (
        /* Two-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 h-[calc(100vh-220px)] bg-[rgba(15,48,63,0.3)] border border-white/10 rounded-2xl overflow-hidden">
          {/* Left Column — Conversation List */}
          <div
            className={`border-r border-white/10 flex flex-col overflow-hidden ${
              mobileShowChat ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* List Header */}
            <div className="p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/80">{t.igConversations}</h2>
                <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              </div>
            </div>

            {/* Conversation Cards */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const isActive = selectedSenderId === conv.sender_id;
                const name = getDisplayName(conv);
                const preview = conv.lastMessage.message_text
                  ? truncate(conv.lastMessage.message_text, 60)
                  : conv.lastMessage.direction === 'out'
                    ? (de ? 'Nachricht gesendet' : '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e')
                    : '[Anhang]';

                return (
                  <button
                    key={conv.sender_id}
                    onClick={() => handleSelectConversation(conv.sender_id)}
                    className={`w-full text-left p-4 transition-all duration-150 border-b border-white/5 ${
                      isActive
                        ? 'bg-[#D4AF37]/5 border-l-2 border-l-[#D4AF37]/20'
                        : 'hover:bg-white/5 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {conv.profile?.avatar_url ? (
                          <img
                            src={conv.profile.avatar_url}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                            <Instagram className="h-4 w-4 text-pink-400" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm truncate ${
                              isActive ? 'text-white font-semibold' : 'text-white/80 font-medium'
                            }`}
                          >
                            {name}
                          </span>
                          <span className="text-[10px] text-white/30 shrink-0">
                            {relativeTime(conv.lastMessage.created_at, locale)}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 truncate">
                          {conv.lastMessage.direction === 'out' && (
                            <span className="text-[#D4AF37]/50 mr-1">&larr;</span>
                          )}
                          {preview}
                        </p>
                        {conv.profile && (
                          <p className="text-[10px] text-[#D4AF37]/40 mt-1 truncate">
                            {conv.profile.email}
                          </p>
                        )}
                      </div>

                      {/* Message count badge */}
                      {conv.messageCount > 1 && (
                        <span className="shrink-0 text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">
                          {conv.messageCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column — Message Thread */}
          <div
            className={`flex flex-col overflow-hidden ${
              !mobileShowChat ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-white/10 shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile back button */}
                    <button
                      onClick={() => setMobileShowChat(false)}
                      className="lg:hidden text-white/50 hover:text-white mr-1"
                    >
                      &larr;
                    </button>

                    {/* Avatar */}
                    {selectedConversation.profile?.avatar_url ? (
                      <img
                        src={selectedConversation.profile.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        <Instagram className="h-3.5 w-3.5 text-pink-400" strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {getDisplayName(selectedConversation)}
                      </h3>
                      {selectedConversation.profile && (
                        <p className="text-[10px] text-white/30 truncate">
                          {selectedConversation.profile.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Link Profile button */}
                  {!selectedConversation.profile && (
                    <button
                      onClick={() => {
                        setShowLinkDialog(true);
                        setLinkEmail('');
                        setLinkError('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t.igLinkProfile}
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-white/20" strokeWidth={1.5} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white/30 text-sm">
                        {de ? 'Keine Nachrichten.' : '\u041d\u0435\u0442 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isOut = msg.direction === 'out';

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="max-w-[75%]">
                              <div
                                className={`px-4 py-2.5 text-sm leading-relaxed ${
                                  isOut
                                    ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl rounded-br-none text-white/90'
                                    : 'bg-white/5 rounded-2xl rounded-bl-none text-white/80'
                                }`}
                              >
                                {msg.message_text ?? (
                                  <span className="italic text-white/30">
                                    {msg.message_type === 'image'
                                      ? (de ? '[Bild]' : '[\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435]')
                                      : (de ? '[Anhang]' : '[\u0412\u043b\u043e\u0436\u0435\u043d\u0438\u0435]')}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[10px] text-white/30 mt-1 ${
                                  isOut ? 'text-right' : 'text-left'
                                }`}
                              >
                                {formatTimestamp(msg.created_at, locale)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.igSendPlaceholder}
                      disabled={sending}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!replyText.trim() || sending}
                      className="bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <Send className="h-4 w-4" strokeWidth={1.5} />
                      )}
                      <span className="hidden sm:inline">{t.igSendMessage}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Instagram className="h-12 w-12 text-pink-400/20 mx-auto mb-4" strokeWidth={1} />
                  <p className="text-white/30 text-sm">
                    {de
                      ? 'Wähle eine Unterhaltung aus der Liste.'
                      : '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0438\u0430\u043b\u043e\u0433 \u0438\u0437 \u0441\u043f\u0438\u0441\u043a\u0430.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a1a24] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            {/* Dialog Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10">
                  <Link2 className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white">{t.igLinkProfile}</h3>
              </div>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Email Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">
                  {de ? 'E-Mail des Profils' : 'Email \u043f\u0440\u043e\u0444\u0438\u043b\u044f'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
                  <input
                    type="email"
                    value={linkEmail}
                    onChange={(e) => {
                      setLinkEmail(e.target.value);
                      setLinkError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLinkProfile();
                      }
                    }}
                    placeholder={de ? 'email@beispiel.de' : 'email@example.com'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Error */}
              {linkError && (
                <p className="text-xs text-red-400/80">{linkError}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleLinkProfile}
                  disabled={!linkEmail.trim() || linkLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 disabled:opacity-40 disabled:cursor-not-allowed border border-[#D4AF37]/20 transition-all flex items-center justify-center gap-2"
                >
                  {linkLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Link2 className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {de ? 'Verknüpfen' : '\u041f\u0440\u0438\u0432\u044f\u0437\u0430\u0442\u044c'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
