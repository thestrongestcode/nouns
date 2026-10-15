import { defineConfig } from 'vite';

// VITE_BASE is the path the site is served from: "/" locally, "/nouns/" on GitHub Pages.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
});
