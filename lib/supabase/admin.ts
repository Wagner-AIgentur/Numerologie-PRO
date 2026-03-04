import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Service Role Client — bypasses RLS. ONLY use server-side (API routes, webhooks).
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
