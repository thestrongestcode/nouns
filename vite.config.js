import { defineConfig } from 'vite';

// VITE_BASE: the URL path the site is served from. "/" on Vercel, "/nouns/" on GitHub Pages.
// VITE_DEMO=1: build the static demo (no server). The flag is replaced at build time, so the
// demo-only code and the question bank are removed from the normal Vercel build.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  define: {
    __DEMO__: JSON.stringify(process.env.VITE_DEMO === '1'),
  },
});
