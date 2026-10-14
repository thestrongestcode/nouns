import { createClient } from '@supabase/supabase-js';

let db = null;

// Tests and the local mock server swap in an in-memory database here.
export function useDatabase(fake) {
  db = fake;
}

export function database() {
  if (db) return db;
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error('Server not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.');
  }
  db = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
  return db;
}
