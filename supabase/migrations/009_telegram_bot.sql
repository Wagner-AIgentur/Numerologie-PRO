-- Migration 009: Telegram Bot Integration + Referral System

-- 1. Telegram-Verknüpfung auf profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Telegram-Nachrichten-Log
CREATE TABLE IF NOT EXISTS public.telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id BIGINT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  command TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON public.telegram_messages(chat_id);

-- 3. Referral-System
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  reward_coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_profile_id);

-- 4. Indexes für Telegram-Lookups
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
