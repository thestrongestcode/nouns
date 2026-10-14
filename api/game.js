// Vercel serverless entry point. The game rules live in server/engine.js; this file only
// handles HTTP and connects to Supabase with the server-only secret key.
import { handleRequest } from '../server/engine.js';
import { database } from '../server/db.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (Number(req.headers['content-length'] || 0) > 8192) return res.status(413).json({ error: 'Request too large' });
  const { status, json } = await handleRequest(req.body, {
    getDb: database,
    supabaseUrl: process.env.SUPABASE_URL || null,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || null,
  });
  return res.status(status).json(json);
}
