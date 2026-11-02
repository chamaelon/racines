import { readFileSync } from 'node:fs';
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
    const tam = page.locator('.mj-tams button:not([disabled])');
    if (await page.locator('.j-info').isVisible()) await page.locator('.j-info > button').click();
    else if (await suiteExplore.isVisible()) {
      const objet = page.locator('.j-explore-liste button:not(.trouve)').first();
      if (await objet.count()) await objet.click(); else await suiteExplore.click();
    } else if (await choix.count()) await choix.nth(plan.shift() ?? 0).click();
    else if (await piste.isVisible()) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
    else if (await page.locator('.mj-tams').count()) { if (await tam.count()) await tam.first().click().catch(() => {}); else await page.waitForTimeout(100); }
    else if (await suiteMini.count()) await suiteMini.click();
    else if (await reponse.count()) await reponse.first().click();
    else if (await page.locator('.j-boite').isVisible()) await page.locator('.j-boite').click({ position: { x: 5, y: 5 }, timeout: 3000 }).catch(() => {});
    else await page.waitForTimeout(50);
  }
  throw new Error('Fin non atteinte');
}

test('accueil, localité, fiche, jeu, fin, sans erreur', async ({ page }, info) => {
  test.setTimeout(290000); // la fin se joue en 3D, lente sur le rendu logiciel des tests
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

  await page.locator('.panneau a[href="#/recit/yennenga"]').click();
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
  await expect(page.locator('.chiffres')).toContainText(/1\/\d+/);
  expect(erreurs, `console (${info.project.name})`).toEqual([]);
});

test('les choix changent la suite : le lièvre et l\'hyène, deux fins', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/jouer/lievre-hyene?lecture=1');
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
  await page.goto('./#/carte');
  await page.locator('.liste-regions summary', { hasText: 'Liptako' }).click();
  await page.locator('.liste-regions a[href="#/carte?region=liptako"]').click();
  await expect(page.locator('.panneau h2')).toHaveText('Liptako');
  await expect(page.locator('.regions path[data-region=liptako]')).toHaveClass(/choisie/);
  // Le cadrage sur la région s'anime : on clique une fois la vue posée.
  await page.waitForTimeout(800);
  // La liste des régions est plus bas : on remonte, sinon l'en-tête fixe recouvre la carte.
  await page.evaluate(() => scrollTo(0, 0));
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

test.describe("moins d'animations", () => {
  test.use({ reducedMotion: 'reduce' });
  test('le système le demande : parallaxe coupée et mode lecture proposé', async ({ page }) => {
    const erreurs = await preparer(page, { prefs: { ...PREFS, prefs: { son: false, vitesse: 1, intro: true } } });
    await page.goto('./#/jouer/yennenga');
    const lien = page.locator('[data-lecture]');
    await expect(lien).toBeVisible();
    await lien.click();
    await expect(page.locator('.j-lecture')).toBeVisible();
    await page.getByRole('button', { name: /Commencer/ }).click();
    // Le texte s'affiche d'un coup, sans machine à écrire
    await expect(page.locator('.j-texte')).toContainText('avant lui.');
    expect(erreurs).toEqual([]);
  });
});

// Chaque récit se joue du début à une fin, dans ses décors, sans erreur dans la console.
const IDS = JSON.parse(readFileSync('public/data/recits.json', 'utf8')).map((r) => r.id);
for (const id of IDS) {
  test(`de bout en bout : ${id}`, async ({ page }) => {
    test.setTimeout(150000);
    const erreurs = await preparer(page);
    // Le mode lecture suit le même moteur : ici, on vérifie le récit. La 3D a son propre test.
    await page.goto(`./#/jouer/${id}?lecture=1`);
    await page.getByRole('button', { name: /Commencer/ }).click();
    await jouerJusquaLaFin(page);
    await expect(page.locator('.j-fin h2')).not.toBeEmpty();
    expect(erreurs).toEqual([]);
  });
}

// Le rendu logiciel des tests est lent : une histoire par famille de décors suffit, sur grand écran.
for (const id of ['yennenga', 'zenuo', 'bilissi']) {
  test(`en 3D, tous les décors de ${id} se chargent`, async ({ page }, info) => {
    test.skip(info.project.name !== '1280');
    test.setTimeout(280000);
    const erreurs = await preparer(page);
    const manquants = [];
    page.on('requestfailed', (r) => manquants.push(r.url()));
    page.on('response', (r) => { if (r.status() >= 400) manquants.push(r.url()); });
    await page.goto(`./#/jouer/${id}`);
    await page.getByRole('button', { name: /Commencer/ }).click();
    await jouerJusquaLaFin(page);
    await expect(page.locator('.j-fin h2')).not.toBeEmpty();
    await expect(page.locator('.j-lecture')).toBeHidden();
    expect(manquants).toEqual([]);
    expect(erreurs).toEqual([]);
  });
}

test("voyager : quitter, changer d'étape, par lieu", async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/jouer/loropeni');
  await page.getByRole('button', { name: /Commencer/ }).click();
  await expect(page.locator('.j-boite')).toBeVisible();
  await expect(page.locator('.j-repere')).toContainText("Aujourd'hui");

  // Le temps : de nos jours à la forteresse relevée
  await page.locator('[data-voyage]').click();
  const crans = page.locator('.j-voyage .frise-crans button');
  for (let i = await crans.count() - 1; i >= 0 && !(await page.locator('.j-etape', { hasText: 'La forteresse relevée' }).count()); i--) await crans.nth(i).click();
  await page.locator('.j-etape', { hasText: 'La forteresse relevée' }).click();
  await expect(page.locator('.j-voyage')).toBeHidden();
  await expect(page.locator('.j-repere')).toContainText('Temps des royaumes');
  await expect(page.locator('.j-texte')).toContainText('Plus haut');

  // Par lieu, puis fermer à l'Échap
  await page.locator('[data-voyage]').click();
  await page.locator('[data-axe=lieu]').click();
  await expect(page.locator('.j-voyage-groupe h3').first()).toContainText('Loropéni');
  await page.keyboard.press('Escape');
  await expect(page.locator('.j-voyage')).toBeHidden();

  await page.locator('.j-quitter').click();
  await expect(page).toHaveURL(/#\/recit\/loropeni/);
  await expect(page.locator('h1')).toHaveText('Les ruines de Loropéni');
  expect(erreurs).toEqual([]);
});

test('la langue du récit change en cours de partie, et les langues non traduites sont signalées', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/jouer/yennenga');
  await expect(page.locator('[data-l-texte] option[value=mos]')).toHaveAttribute('disabled');
  await expect(page.locator('[data-l-texte] option[value=mos]')).toContainText('à traduire');
  await page.getByRole('button', { name: /Commencer/ }).click();
  await expect(page.locator('.j-texte')).toContainText('avant lui');
  await page.locator('[data-pause]').click();
  await page.locator('.j-pause [data-l-texte]').selectOption('en');
  await expect(page.locator('.j-pause')).toBeHidden();
  await expect(page.locator('.j-nom')).toHaveText('The griot');
  await expect(page.locator('.j-texte')).toContainText('Come closer');
  // Le choix est retenu d'une histoire à l'autre, et une histoire non traduite reste en français
  await page.goto('./#/jouer/guimbi');
  await page.getByRole('button', { name: /Start/ }).click();
  await expect(page.locator('.j-nom')).toHaveText(/griot/i);
  await expect(page.locator('.j-texte')).toContainText('siècle');
  expect(erreurs).toEqual([]);
});

test('une époque filtre la carte et mène à une étape du récit', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/carte');
  const visibles = page.locator('.marqueur:not(.cache)');
  await expect(visibles.first()).toBeAttached();
  const tous = await visibles.count();
  await page.locator('.carte-temps [data-epoque=guerre]').click();
  await expect(page.locator('.panneau h2')).toHaveText('La guerre du Bani-Volta');
  await expect.poll(() => visibles.count()).toBeLessThan(tous);
  await page.locator('.panneau a', { hasText: 'Le serment de Bona' }).click();
  await page.locator('[data-go=etape]').click();
  await expect(page.locator('.j-repere')).toContainText('Bona');
  await expect(page.locator('.j-texte')).toContainText('serment');
  expect(erreurs).toEqual([]);
});

test("le curseur de la barre de temps change l'année, et la barre défile", async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/carte');
  const curseur = page.locator('.carte-temps .frise-curseur');
  await expect(page.locator('.frise-lecture')).toHaveText('Toutes les époques');
  const position = await curseur.evaluate((c) => [...document.querySelectorAll('.frise-crans button')].findIndex((b) => b.textContent === '1916'));
  await curseur.evaluate((c, i) => { c.value = i; c.dispatchEvent(new Event('input', { bubbles: true })); }, position);
  await expect(page.locator('.frise-lecture')).toHaveText(/^1916 · La guerre du Bani-Volta/);
  await expect(page).toHaveURL(/epoque=guerre&annee=1916/);
  await expect(page.locator('.panneau')).toContainText('1916 : les ruines');
  await expect(page.locator('.panneau')).not.toContainText('1915 à Datomon');
  const defile = page.locator('.carte-temps .frise-defile');
  expect(await defile.evaluate((d) => d.scrollWidth > d.clientWidth)).toBe(true);
  expect(await defile.evaluate((d) => d.scrollLeft)).toBeGreaterThan(0);
  await curseur.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.frise-lecture')).toHaveText(/^1915 /);
  await page.locator('[data-toutes]').click();
  await expect(page.locator('.frise-lecture')).toHaveText('Toutes les époques');
  expect(erreurs).toEqual([]);
});

test('le site suit le fichier de traduction, et une phrase vide reste en français', async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/carte');
  await page.selectOption('[data-langue-site]', 'en');
  await expect(page.locator('.entete nav')).toContainText('Heritage');
  await expect(page.locator('.panneau h2')).toHaveText('Travel the country, listen to its stories');
  await page.goto('./#/jouer/yennenga');
  await expect(page.locator('.j-titre h1')).toHaveText('The Legend of Yennenga');
  await expect(page.locator('[data-go=muet]')).toHaveText('Without sound');
  await page.goto('./#/carte');
  await page.selectOption('[data-langue-site]', 'fr');
  await expect(page.locator('.entete nav')).toContainText('Patrimoine');
  expect(erreurs).toEqual([]);
});

test('une image déposée dans public/motifs habille le modèle', async ({ page }) => {
  const erreurs = await preparer(page);
  const carre = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  await page.route('**/motifs/index.json', (r) => r.fulfill({ json: { canari: [{ fichier: 'poterie-canari-1.png', type: 'poterie', objet: 'canari', numero: 1 }] } }));
  await page.route('**/motifs/poterie-canari-1.png', (r) => r.fulfill({ body: carre, contentType: 'image/png' }));
  await page.goto('./#/patrimoine/canari');
  await page.locator('.objet-3d-btn').click();
  const choix = page.locator('.objet-motif select');
  await choix.selectOption('image:poterie-canari-1.png');
  await expect(page.locator('.objet-motif p')).toBeHidden();
  await choix.selectOption('peuple:Bissa');
  await expect(page.locator('.objet-motif p')).toContainText('démonstration');
  expect(erreurs).toEqual([]);
});

test("le patrimoine se filtre par peuple et s'ouvre en 3D", async ({ page }) => {
  const erreurs = await preparer(page);
  await page.goto('./#/patrimoine');
  const objets = page.locator('.grille-patrimoine li');
  const total = await objets.count();
  expect(total).toBeGreaterThanOrEqual(33);
  await page.selectOption('[data-peuple]', 'Lobi');
  await expect.poll(() => objets.count()).toBeLessThan(total);
  await page.locator('.grille-patrimoine a', { hasText: 'bateba' }).click();
  await expect(page.locator('h1')).toContainText('bateba');
  await expect(page.locator('.fiche-p-corps')).toContainText('Fidélité du modèle');
  await expect(page.locator('.sources a').first()).toHaveAttribute('href', /bowers/);
  await page.getByRole('button', { name: 'Tourner en 3D' }).click();
  await expect(page.locator('.objet-3d-canvas')).toBeVisible({ timeout: 20000 });
  expect(erreurs).toEqual([]);
});
