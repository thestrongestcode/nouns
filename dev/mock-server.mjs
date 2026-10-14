// Play the whole game locally with no Supabase or Vercel account.
//   npm run dev:mock
// Rooms live in memory and disappear when you stop this process.
import http from 'node:http';
import { createServer as createVite } from 'vite';
import handler from '../api/game.js';
import { useDatabase } from '../server/db.js';
import { createFakeDatabase } from './fake-db.js';

useDatabase(createFakeDatabase());

const apiPort = Number(process.env.MOCK_API_PORT || 3001);
const webPort = Number(process.env.PORT || 5173);

http.createServer((req, res) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; });
  req.on('end', async () => {
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = null; }
    res.status = code => { res.statusCode = code; return res; };
    res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return res; };
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('{"error":"Mock server error"}');
    }
  });
}).listen(apiPort);

const vite = await createVite({
  server: { port: webPort, strictPort: true, proxy: { '/api': `http://localhost:${apiPort}` } },
});
await vite.listen();
console.log('\nLocal mock game (in-memory, no Supabase):');
vite.printUrls();
