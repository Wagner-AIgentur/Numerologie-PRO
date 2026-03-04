'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Mail } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import Logo from '@/components/shared/Logo';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const de = locale === 'de';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      if (!res.ok) {
        setError(de ? 'Fehler beim Senden. Versuche es erneut.' : 'Ошибка отправки. Попробуйте снова.');
        setLoading(false);
        return;
      }
    } catch {
      setError(de ? 'Netzwerkfehler. Versuche es erneut.' : 'Ошибка сети. Попробуйте снова.');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.4)] backdrop-blur-sm p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mx-auto mb-5">
                  <Mail className="h-7 w-7 text-gold" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-xl font-bold text-white mb-3">
                  {de ? 'E-Mail gesendet!' : 'Письмо отправлено!'}
                </h2>
                <p className="text-white/60 text-sm">
                  {de
                    ? `Wir haben einen Reset-Link an ${email} gesendet.`
                    : `Мы отправили ссылку на ${email}.`}
                </p>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-2xl font-bold text-white text-center mb-2">
                  {de ? 'Passwort zurücksetzen' : 'Сброс пароля'}
                </h1>
                <p className="text-white/50 text-sm text-center mb-8">
                  {de ? 'Wir senden dir einen Reset-Link per E-Mail.' : 'Мы отправим ссылку для сброса на ваш email.'}
                </p>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleReset} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">E-Mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="deine@email.de"
                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                    </div>
                  </div>

                  <GoldButton type="submit" className="w-full" disabled={loading}>
                    {loading ? '...' : (de ? 'Reset-Link senden' : 'Отправить ссылку')}
                  </GoldButton>
                </form>

                <p className="mt-6 text-center text-xs text-white/40">
                  <Link href="/auth/login" className="text-gold/70 hover:text-gold transition-colors">
                    {de ? '← Zurück zur Anmeldung' : '← Назад ко входу'}
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
