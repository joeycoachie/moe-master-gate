import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client with the service key. Only for tables that hold health data
// (clients, arc_sessions, arc_session_entries), which have RLS on and no public access.
// Never import this from a 'use client' file.
let admin: SupabaseClient | null = null;

export class AdminNotConfiguredError extends Error {
  constructor() {
    super('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new AdminNotConfiguredError();
  admin ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}
