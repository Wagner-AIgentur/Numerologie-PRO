'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import Logo from '@/components/shared/Logo';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Min. 8 Zeichen', ok: password.length >= 8 },
    { label: 'Großbuchstabe', ok: /[A-Z]/.test(password) },
    { label: 'Zahl', ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5 text-xs">
          {c.ok
            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            : <XCircle className="h-3.5 w-3.5 text-white/30" />}
          <span className={c.ok ? 'text-green-400' : 'text-white/40'}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function UpdatePasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const de = locale === 'de';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase handles the hash token automatically on client load
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(de ? 'Passwort muss mindestens 8 Zeichen haben.' : 'Пароль должен содержать минимум 8 символов.');
      return;
    }
    if (password !== confirm) {
      setError(de ? 'Passwörter stimmen nicht überein.' : 'Пароли не совпадают.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(de ? 'Fehler beim Aktualisieren. Versuche es erneut.' : 'Ошибка обновления. Попробуйте снова.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/${locale}/dashboard`), 2500);
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
            {success ? (
              <div className="text-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mx-auto mb-5">
                  <CheckCircle2 className="h-7 w-7 text-gold" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-3">
                  {de ? 'Passwort aktualisiert!' : 'Пароль обновлён!'}
                </h2>
                <p className="text-white/60 text-sm">
                  {de ? 'Du wirst zum Dashboard weitergeleitet…' : 'Перенаправляем в кабинет…'}
                </p>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-2xl font-bold text-white text-center mb-2">
                  {de ? 'Neues Passwort setzen' : 'Новый пароль'}
                </h1>
                <p className="text-white/50 text-sm text-center mb-8">
                  {de ? 'Wähle ein sicheres Passwort für dein Konto.' : 'Выберите надёжный пароль для вашего аккаунта.'}
                </p>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      {de ? 'Neues Passwort' : 'Новый пароль'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 Zeichen"
                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      {de ? 'Passwort bestätigen' : 'Подтвердите пароль'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-colors ${
                          confirm && confirm !== password
                            ? 'border-red-500/50 focus:ring-red-500/30'
                            : 'border-white/10 focus:border-gold/50 focus:ring-gold/30'
                        }`}
                      />
                    </div>
                    {confirm && confirm !== password && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {de ? 'Passwörter stimmen nicht überein.' : 'Пароли не совпадают.'}
                      </p>
                    )}
                  </div>

                  <GoldButton
                    type="submit"
                    className="w-full"
                    disabled={loading || !sessionReady || password !== confirm || password.length < 8}
                  >
                    {loading ? '...' : (de ? 'Passwort speichern' : 'Сохранить пароль')}
                  </GoldButton>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
