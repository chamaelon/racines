import{_ as e,a as t,o as n,x as r}from"./index-TxFjLNiQ.js";async function i(i){let[a,o]=await Promise.all([e(),r()]);t({titre:`À propos`,description:`Objectifs, sources, crédits et choix techniques de la plateforme Racines.`}),i.innerHTML=`<article class="page texte">
    <h1>À propos de Racines</h1>
    <p class="chapeau">Racines veut préserver, numériser et transmettre le patrimoine oral du Burkina Faso : on parcourt le pays sur une carte, puis on lit, écoute ou vit ses récits.</p>

    <h2>D'où viennent les récits</h2>
    <p>Les ${o.length} récits sont des <strong>versions de travail</strong>. Les contes et les légendes sont des adaptations libres, écrites à partir de fiches et de motifs connus. Les récits historiques sont simplifiés, et leurs sources sont citées sur chaque fiche. Une légende a souvent plusieurs versions selon les villages : celle-ci n'en est qu'une. Les pratiques secrètes, comme le Dyoro ou le vur, ne sont pas décrites.</p>
    <p>Tant qu'un texte n'est pas vérifié, il porte le bandeau « texte provisoire ». Une collecte auprès de griots et de conteurs reste à faire.</p>

    <h2>Ce que le jeu ajoute aux récits</h2>
    <p>Chaque récit se vit aussi en jouant. Dans un conte ou une légende, la fin « Version du griot » suit le texte de la fiche, et les fins « Autre chemin » sont inventées pour le jeu. Dans un récit historique, les choix changent ce que l'on regarde, jamais les faits ; le témoin joué et certaines répliques sont imaginés. Ce qui relève du secret, comme le Dyoro ou le vur, n'est pas montré.</p>

    <h2>Les voix</h2>
    <p>Chaque histoire se joue en 3D et se regarde en film, en français et dans deux langues nationales. Ces voix sont générées par des modèles automatiques : aucune n'est encore enregistrée par un locuteur.</p>

    <h2>La carte</h2>
    <p>La carte suit les <strong>17 régions</strong> créées en juillet 2025 : les 45 provinces de geoBoundaries (2017) y sont regroupées d'après les listes publiées par <a href="https://www.sidwaya.info/reorganisation-administrative-du-territoire-les-toponymes-des-17-regions-et-leur-signification/" target="_blank" rel="noreferrer">Sidwaya</a>. Les deux provinces créées en 2025 (Karo-Peli et Dyamongou) n'y sont donc pas séparées, ce qui ne change pas les contours des régions. Les points marqués « indicatif » désignent une aire culturelle plutôt qu'un lieu précis.</p>

    <h2>Choix techniques</h2>
    <ul>
      <li>Un site statique, sans serveur ni compte : le lien reste valable, et la progression reste sur votre appareil.</li>
      <li>Un moteur de récit maison, piloté par des fichiers JSON : ajouter un récit, c'est ajouter un fichier.</li>
      <li>Des scènes en 3D dans Three.js, chargé seulement pour le jeu, le patrimoine et le relief. La qualité s'adapte à l'appareil, et sans WebGL l'histoire se joue en mode lecture.</li>
      <li>Les décors, les personnages et les objets sont générés par des scripts Blender (dossier <code>modeles3d</code>) : aucun modèle n'est téléchargé d'un tiers. Ce sont des interprétations. Chaque fiche du patrimoine dit jusqu'où elle est fidèle.</li>
      <li>Chaque histoire se parcourt sur deux axes, le temps et l'espace. Époques et lieux viennent du texte des récits ; quand un récit ne donne pas de date, le site l'indique au lieu d'en inventer une.</li>
    </ul>

    <h2>Les films d'animation</h2>
    <p>Toutes les histoires existent aussi en film. Les films sont animés en 3D avec les personnages du jeu, exportés en vidéo, puis montés avec leurs pistes sonores. Une seule image pour toutes les langues : c'est la piste audio qui change. Cinq films sont en 3D. Les autres restent, pour l'instant, dans leur ancienne version stickman. La voix française est une voix de synthèse.</p>
    <p>Chaque histoire existe aussi dans deux langues nationales tirées au sort parmi le mooré, le dioula et le fulfulde : film, sous-titres et jeu. Ces versions sont produites par des modèles automatiques (NLLB-200 pour la traduction, MMS-TTS pour la voix, tous deux de Meta, sous licence non commerciale). Aucun locuteur ne les a relues : elles contiennent des erreurs et ne remplacent pas un vrai doublage. Le français reste la version de référence.</p>

    <h2>Licences</h2>
    <p>Le code est sous licence MIT, et nos modèles 3D sous licence CC BY 4.0. Le détail est dans le fichier LICENSE.md du dépôt.</p>

    <h2>Crédits</h2>
    <ul>
      <li>Projet du cours de Web multimédia, réalisé par TIROUDA Leila, ZAPRE Malika, OUEDRAOGO Boris et SOME Enock.</li>
      <li>Contours : <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0) et <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> (domaine public).</li>
      <li>Polices : Cinzel et Nunito (SIL OFL). Rendu : <a href="https://threejs.org/" target="_blank" rel="noreferrer">Three.js</a> (MIT).</li>
      <li>Une partie de l'idée de la carte vient du prototype <a href="https://keen-monstera-caf0d9.netlify.app/" target="_blank" rel="noreferrer">Voix du Faso</a>, réutilisé avec autorisation.</li>
    </ul>

    <h2>Proposer un récit</h2>
    <p>Remplissez ce formulaire : il prépare le fichier du récit, à copier et à nous transmettre. Rien n'est envoyé d'ici.</p>
    <form class="proposer">
      <label class="champ">Titre<input name="titre" required></label>
      <label class="champ">Localité<select name="localite">${a.map(e=>`<option value="${e.id}">${n(e.nom)}</option>`).join(``)}</select></label>
      <label class="champ">Langue<input name="langue" placeholder="mos, dyu, fuf…"></label>
      <label class="champ champ-large">Texte<textarea name="texte" rows="5"></textarea></label>
      <button type="submit" class="bouton fort">Préparer le fichier</button>
    </form>
    <div class="proposer-sortie cache"><pre tabindex="0"></pre><button type="button" class="bouton" data-copier>Copier</button> <span role="status"></span></div>
  </article>`;let s=i.querySelector(`.proposer`),c=i.querySelector(`.proposer-sortie`);s.addEventListener(`submit`,e=>{e.preventDefault();let t=s.titre.value.trim(),n=t.normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``);c.querySelector(`pre`).textContent=JSON.stringify({id:n,titre:t,type:`conte`,localites:[s.localite.value],langues:s.langue.value?[s.langue.value.trim()]:[],resume:``,texteComplet:s.texte.value,statut:`a_valider`},null,2),c.classList.remove(`cache`)}),c.querySelector(`[data-copier]`).addEventListener(`click`,async()=>{let e=c.querySelector(`[role=status]`);try{await navigator.clipboard.writeText(c.querySelector(`pre`).textContent),e.textContent=`Copié.`}catch{e.textContent=`Copie refusée : sélectionnez le texte à la main.`}})}export{i as monter};