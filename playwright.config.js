import { defineConfig } from '@playwright/test';

// En local, on utilise Edge déjà installé ; en CI, le Chromium de Playwright.
const navigateur = process.env.CI ? {} : { channel: 'msedge' };
const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120000,
  expect: { timeout: 20000 },
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173/', ...navigateur, launchOptions: { args } },
  projects: [
    { name: '1280', use: { viewport: { width: 1280, height: 800 } } },
    { name: '768', use: { viewport: { width: 768, height: 1024 } } },
    { name: '360', use: { viewport: { width: 360, height: 740 }, hasTouch: true } },
  ],
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/', reuseExistingServer: !process.env.CI, timeout: 120000 },
});
