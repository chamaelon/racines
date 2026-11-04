import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
const films = JSON.parse(readFileSync('public/data/films.json', 'utf8'));
for (const id of Object.keys(films)) {
  test(`film ${id}`, async ({ page }) => {
    const erreurs = [];
    page.on('response', (r) => { if (r.status() >= 400) erreurs.push(`${r.status()} ${r.url()}`); });
    await page.goto(`./#/film/${id}`);
    const choix = page.locator('[data-langue]');
    await expect(choix).toBeVisible();
    const codes = await choix.locator('option').evaluateAll((o) => o.map((x) => x.value));
    const nationales = codes.filter((c) => !['fr', 'zxx'].includes(c));
    expect(nationales).toHaveLength(2);
    await page.locator('[data-lancer]').click();
    for (const code of nationales) {
      await choix.selectOption(code);
      await expect(page.locator('[data-note]')).toContainText('automatiques');
      // Le son doit repartir de lui-même et avancer avec l'image.
      await expect.poll(() => page.evaluate(() => { const a = document.querySelector('[data-film] audio'); return !a.paused && a.readyState >= 2; }), { timeout: 45000 }).toBe(true);
      const t0 = await page.evaluate(() => document.querySelector('[data-film] audio').currentTime);
      await expect.poll(() => page.evaluate(() => document.querySelector('[data-film] audio').currentTime), { timeout: 30000 }).toBeGreaterThan(t0 + 1);
      const etat = await page.evaluate(() => { const a = document.querySelector('[data-film] audio'), v = document.querySelector('[data-film] video'); return { src: a.src, duree: a.duration, ecart: Math.abs(a.currentTime - v.currentTime), videoPause: v.paused }; });
      expect(etat.src).toContain(`/${code}.m4a`);
      expect(etat.duree).toBeGreaterThan(30);
      expect(etat.videoPause).toBe(false);
      expect(etat.ecart).toBeLessThan(1.5);
      await page.locator('[data-st]').click();
      const st = await page.evaluate(() => [...document.querySelector('[data-film] video').textTracks].filter((t) => t.mode === 'showing').map((t) => t.language));
      expect(st).toEqual([code]);
      await page.locator('[data-st]').click();
    }
    expect(erreurs).toEqual([]);
  });
}
test('fiche : textes en langue nationale', async ({ page }) => {
  await page.goto('./#/recit/yennenga');
  await expect(page.getByRole('heading', { name: 'En langue nationale' })).toBeVisible();
  await expect(page.locator('.texte-recit[lang="mos"]')).not.toBeEmpty();
  await expect(page.getByText('Traduction automatique, non relue')).toBeVisible();
});
test('jeu : texte et voix en langue nationale', async ({ page }) => {
  const sons = [];
  page.on('response', (r) => { if (r.url().endsWith('.m4a')) sons.push(`${r.status()} ${r.url()}`); });
  await page.goto('./#/jouer/yennenga');
  await page.locator('[data-l-voix]').first().selectOption('mos');
  await page.locator('[data-l-texte]').first().selectOption('mos');
  await page.getByRole('button', { name: /Commencer/ }).first().click();
  await expect.poll(() => sons.length, { timeout: 25000 }).toBeGreaterThan(0);
  expect(sons[0]).toMatch(/^20[06] .*yennenga-.*-mos\.m4a$/);
  await page.screenshot({ path: 'montage/jeu-mos.png' });
});
