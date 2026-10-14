// Static demo backend. Runs the same game rules as the Vercel API, in this browser.
// Only bundled when building with VITE_DEMO=1. Tabs in the same browser share one room
// through localStorage, which stands in for the shared database.
import { handleRequest } from '../server/engine.js';
import { createMemoryDatabase } from '../server/memory-db.js';

const KEY = 'word-vault-demo-database-v1';

export async function demoRequest(body) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { saved = null; }
  const db = createMemoryDatabase(saved || undefined);
  const result = await handleRequest(body, { getDb: () => db });
  try { localStorage.setItem(KEY, JSON.stringify(db.tables)); }
  catch { /* storage full or blocked: this request still answered, but other tabs will not see it */ }
  return result;
}
