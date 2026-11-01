import{a as e,s as t}from"./data-WU6kzAGN.js";import{a as n,o as r}from"./index-D3oXObO5.js";async function i(i){let[a,o]=await Promise.all([e(),t()]);n({titre:`À propos`,description:`Objectifs, sources, crédits et choix techniques de la plateforme Racines.`}),i.innerHTML=`<article class="page texte">
    <h1>À propos de Racines</h1>
    <p class="chapeau">Racines veut préserver, numériser et transmettre le patrimoine oral du Burkina Faso : on parcourt le pays sur une carte, puis on lit, écoute ou vit ses récits.</p>

    <h2>D'où viennent les récits</h2>
    <p>Les ${o.length} récits sont des <strong>versions de travail</strong>. Les contes et les légendes sont des adaptations libres, écrites à partir de fiches et de motifs connus. Les récits historiques sont simplifiés, et leurs sources sont citées sur chaque fiche. Une légende a souvent plusieurs versions selon les villages : celle-ci n'en est qu'une. Les pratiques secrètes, comme le Dyoro ou le vur, ne sont pas décrites.</p>
    <p>Tant qu'un texte n'est pas vérifié, il porte le bandeau « texte provisoire ». Une collecte auprès de griots et de conteurs reste à faire.</p>

    <h2>Les voix</h2>
    <p>Les bandes sonores sont pensées en mooré, dioula et fulfulde, avec des sous-titres français. Les voix sont enregistrées par des personnes, pas générées. Tant qu'un enregistrement manque, le lecteur affiche « audio à venir ».</p>

    <h2>La carte</h2>
    <p>La carte suit les <strong>17 régions</strong> créées en juillet 2025 : les 45 provinces de geoBoundaries (2017) y sont regroupées d'après les listes publiées par <a href="https://www.sidwaya.info/reorganisation-administrative-du-territoire-les-toponymes-des-17-regions-et-leur-signification/" target="_blank" rel="noreferrer">Sidwaya</a>. Les deux provinces créées en 2025 (Karo-Peli et Dyamongou) n'y sont donc pas séparées, ce qui ne change pas les contours des régions. Les points marqués « indicatif » désignent une aire culturelle plutôt qu'un lieu précis.</p>

    <h2>Choix techniques</h2>
    <ul>
      <li>Un site statique, sans serveur ni compte : le lien reste valable, et la progression reste sur votre appareil.</li>
      <li>Un moteur de récit maison, piloté par des fichiers JSON : ajouter un récit, c'est ajouter un fichier.</li>
      <li>Des scènes en 2,5D dans Three.js, chargé seulement pour le jeu et le relief. Sans WebGL, l'histoire se joue en mode lecture.</li>
      <li>Tous les dessins sont faits par le code : aucune image n'est téléchargée.</li>
    </ul>

    <h2>Les films d'animation</h2>
    <p>Trente de ces récits existent aussi en film stickman, avec voix de synthèse, ambiance et musique. Ces films et le studio de doublage restent accessibles : <a href="site/index.html">carte-globe et films</a>, <a href="site/studio.html">studio de doublage</a>.</p>

    <h2>Crédits</h2>
    <ul>
      <li>Auteur : SOME M J Enock, projet du cours de Web multimédia.</li>
      <li>Contours : <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0) et <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> (domaine public).</li>
      <li>Polices : Cinzel et Nunito (SIL OFL). Rendu : <a href="https://threejs.org/" target="_blank" rel="noreferrer">Three.js</a> (MIT).</li>
      <li>Une partie de l'idée de la carte vient du prototype <a href="https://keen-monstera-caf0d9.netlify.app/" target="_blank" rel="noreferrer">Voix du Faso</a>, réutilisé avec autorisation.</li>
    </ul>

    <h2>Proposer un récit</h2>
    <p>Remplissez ce formulaire : il prépare le fichier du récit, à copier et à nous transmettre. Rien n'est envoyé d'ici.</p>
    <form class="proposer">
      <label class="champ">Titre<input name="titre" required></label>
      <label class="champ">Localité<select name="localite">${a.map(e=>`<option value="${e.id}">${r(e.nom)}</option>`).join(``)}</select></label>
      <label class="champ">Langue<input name="langue" placeholder="mos, dyu, fuf…"></label>
      <label class="champ champ-large">Texte<textarea name="texte" rows="5"></textarea></label>
      <button type="submit" class="bouton fort">Préparer le fichier</button>
    </form>
    <div class="proposer-sortie cache"><pre tabindex="0"></pre><button type="button" class="bouton" data-copier>Copier</button> <span role="status"></span></div>
  </article>`;let s=i.querySelector(`.proposer`),c=i.querySelector(`.proposer-sortie`);s.addEventListener(`submit`,e=>{e.preventDefault();let t=s.titre.value.trim(),n=t.normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);c.querySelector(`pre`).textContent=JSON.stringify({id:n,titre:t,type:`conte`,localites:[s.localite.value],langues:s.langue.value?[s.langue.value.trim()]:[],resume:``,texteComplet:s.texte.value,statut:`a_valider`},null,2),c.classList.remove(`cache`)}),c.querySelector(`[data-copier]`).addEventListener(`click`,async()=>{let e=c.querySelector(`[role=status]`);try{await navigator.clipboard.writeText(c.querySelector(`pre`).textContent),e.textContent=`Copié.`}catch{e.textContent=`Copie refusée : sélectionnez le texte à la main.`}})}export{i as monter};