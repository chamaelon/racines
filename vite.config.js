import { defineConfig } from 'vitest/config';

// base relative : le site marche sur https://chamaelon.github.io/racines/ comme depuis n'importe quel dossier.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 },
  test: { include: ['tests/*.test.js'] },
});
