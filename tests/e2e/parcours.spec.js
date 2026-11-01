import { expect, test } from '@playwright/test';

// Le visiteur déjà venu : pas d'écran d'accueil, texte instantané pour aller vite.
const PREFS = { recits: {}, fins: {}, objets: [], sauvegardes: {}, audio: {}, prefs: { son: false, vitesse: 0, intro: true } };

async function preparer(page, { prefs = PREFS } = {}) {
  const erreurs = [];
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', (e) => erreurs.push(e.message));
  await page.addInitScript((p) => {
    if (!localStorage.getItem('racines-progression') && p) localStorage.setItem('racines-progression', JSON.stringify(p));
  }, prefs);
  return erreurs;
}

// Joue jusqu'à l'écran de fin. plan : indices des choix à prendre, dans l'ordre (0 ensuite).
async function jouerJusquaLaFin(page, plan = []) {
  const fin = page.locator('.j-fin');
  for (let i = 0; i < 400; i++) {
    if (await fin.isVisible()) return;
    const choix = page.locator('.j-choix button');
    const suiteExplore = page.locator('.j-explore-suite');
    const piste = page.locator('.mj-piste');
    const reponse = page.locator('.mj-reponses button:not([disabled])');
    const suiteMini = page.locator('.mj-suite');
    if (await page.locator('.j-info').isVisible()) await page.locator('.j-info > button').click();
    else if (await suiteExplore.isVisible()) {
      const objet = page.locator('.j-explore-liste button:not(.trouve)').first();
      if (await objet.count()) await objet.click(); else await suiteExplore.click();
    } else if (await choix.count()) await choix.nth(plan.shift() ?? 0).click();
    else if (await piste.isVisible()) await page.keyboard.press('Space');
    else if (await suiteMini.count()) await suiteMini.click();
    else if (await reponse.count()) await reponse.first().click();
    else if (await page.locator('.j-boite').isVisible()) await page.locator('.j-boite').click({ position: { x: 5, y: 5 }, timeout: 3000 }).catch(() => {});
    else await page.waitForTimeout(50);
  }
  throw new Error('Fin non atteinte');
}

test('accueil, localité, fiche, jeu, fin, sans erreur', async ({ page }, info) => {
  const erreurs = await preparer(page);
  await page.goto('./');
  await expect(page.locator('.regions path')).toHaveCount(17);
  await expect(page.locator('.marqueur').first()).toBeAttached();
  expect(await page.locator('.marqueur').count()).toBeGreaterThanOrEqual(8);

  // Au clavier : la liste double la carte
  await page.locator('.liste-regions summary', { hasText: 'Nakambé' }).click();
  await page.locator('.liste-regions a', { hasText: 'Tenkodogo' }).click();
  await expect(page.locator('.panneau h2')).toHaveText('Tenkodogo');
  await expect(page.locator('.panneau')).toContainText('Mossi');
  await expect(page.locator('.panneau')).toContainText('Le tambour parleur');

  await page.locator('.panneau a', { hasText: 'La légende de Yennenga' }).click();
  await expect(page.locator('h1')).toHaveText('La légende de Yennenga');
  await expect(page.locator('.encart', { hasText: 'Morale' })).toBeVisible();
  await expect(page.locator('.lexique')).toContainText('naaba');
  await expect(page.locator('.sous-titres button').first()).toBeVisible();

  await page.getByRole('link', { name: "Vivre l'histoire" }).click();
  await page.getByRole('button', { name: /Commencer/ }).click();
  await expect(page.locator('.j-boite')).toBeVisible();
  await page.locator('[data-moteur]').click();
  await expect(page.locator('.j-debug')).toContainText('nœud courant');
  await jouerJusquaLaFin(page, [0, 0]);
  await expect(page.locator('.j-fin')).toContainText('fin découverte sur 2');
  await page.locator('.j-fin a', { hasText: 'Mon parcours' }).click();
  await expect(page.locator('.chiffres')).toContainText('1/5');
  expect(erreurs, `console (${info.project.name})`).toEqual([]);
});

test('les choix changent la suite : le lièvre et l\'hyène, deux fins', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/jouer/lievre-hyene');
  await page.getByRole('button', { name: /Commencer/ }).click();
  await jouerJusquaLaFin(page, [0, 0, 0]);
  await expect(page.locator('.j-fin h2')).toContainText('malin');
  await page.locator('[data-rejouer]').click();
  await jouerJusquaLaFin(page, [1, 1, 1]);
  await expect(page.locator('.j-fin h2')).toContainText('partagé');
  await expect(page.locator('.j-fin')).toContainText('2 fins découvertes sur 3');
  expect(erreurs).toEqual([]);
});

test('la sauvegarde permet de reprendre', async ({ page }) => {
  await preparer(page);
  await page.goto('./#/jouer/yennenga');
  await page.getByRole('button', { name: /Commencer/ }).click();
  for (let i = 0; i < 2; i++) await page.locator('.j-boite').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('.j-explore')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre' }).click();
  await expect(page.locator('.j-explore')).toBeVisible();
  await expect(page.locator('.j-texte')).toContainText('objets qui brillent');
});

test('catalogue : les filtres réduisent la liste et un lien filtré rouvre la même vue', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/catalogue');
  const cartes = page.locator('.carte-recit');
  await expect(cartes.first()).toBeVisible();
  const total = await cartes.count();
  expect(total).toBeGreaterThanOrEqual(8);
  await page.selectOption('select[name=langue]', 'dyu');
  const dioula = await cartes.count();
  expect(dioula).toBeLessThan(total);
  await page.fill('input[name=q]', 'TIEFO');
  await expect(cartes).toHaveCount(1);
  await expect(page).toHaveURL(/langue=dyu/);
  await page.reload();
  await expect(cartes).toHaveCount(1);
  await expect(page.locator('select[name=langue]')).toHaveValue('dyu');
  await page.getByRole('button', { name: 'Tout effacer' }).click();
  await expect(cartes).toHaveCount(total);
  expect(erreurs).toEqual([]);
});

test('sans WebGL, le mode lecture prend le relais', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl/.test(t) ? null : orig.call(this, t, ...r); };
  });
  await page.goto('./#/jouer/yennenga');
  await expect(page.locator('.j-avis')).toContainText('mode lecture');
  await page.getByRole('button', { name: /Commencer/ }).click();
  await expect(page.locator('.j-lecture')).toBeVisible();
  await jouerJusquaLaFin(page, [0, 0]);
  await expect(page.locator('.j-fin')).toBeVisible();
  await page.goto('./#/carte');
  await expect(page.locator('[data-relief]')).toHaveCount(0);
  expect(erreurs).toEqual([]);
});

test('premier lancement : le griot ouvre la veillée, une seule fois', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.veillee')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.locator('[data-suite]').click();
  await expect(page.locator('.veillee')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.regions path')).toHaveCount(17);
  await expect(page.locator('.veillee')).toHaveCount(0);
});

test('carte : clic sur une région et un marqueur, relief 3D', async ({ page }, info) => {
  const erreurs = await preparer(page);
  await page.goto('./');
  await page.locator('.regions path[data-region=liptako]').click({ force: true, position: { x: 30, y: 30 } }).catch(() => {});
  await page.goto('./#/carte?region=liptako');
  await expect(page.locator('.panneau h2')).toHaveText('Liptako');
  await expect(page.locator('.regions path[data-region=liptako]')).toHaveClass(/choisie/);
  const m = page.locator('.marqueur[data-localite=dori] .zone-toucher');
  await m.click({ force: true });
  await expect(page.locator('.panneau h2')).toHaveText('Dori');
  await page.locator('[data-relief]').click();
  await expect(page.locator('.relief-canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await page.locator('[data-relief]').click();
  await expect(page.locator('.relief-canvas')).toHaveCount(0);
  expect(erreurs, info.project.name).toEqual([]);
});
