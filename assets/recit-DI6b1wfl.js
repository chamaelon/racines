import{t as e}from"./carte-recit-Dkf3VHpM.js";import{n as t,r as n}from"./carte-svg-CRKJCmN8.js";import{C as r,E as i,T as a,a as o,g as s,h as c,i as l,o as u,r as d,s as f,t as p,v as m,w as h,x as g,y as _}from"./index-BBsuaWpS.js";var v=[.75,1,1.25],y=e=>e.trim().split(`:`).map(Number).reduce((e,t)=>e*60+t,0);function b(e){return e.replace(/\r/g,``).split(/\n\n+/).map(e=>{let t=e.split(`
`),n=t.findIndex(e=>e.includes(`-->`));if(n<0)return null;let[r,i]=t[n].split(`-->`);return{debut:y(r),fin:y(i.split(` `).filter(Boolean)[0]),texte:t.slice(n+1).join(` `).trim()}}).filter(Boolean)}function x(e,t,n){let r=Object.keys(t.audio);if(!r.length)return e.innerHTML=`<p class="meta">Pas encore d'audio pour ce récit. La collecte reste ouverte.</p>`,()=>{};e.innerHTML=`<div class="lecteur">
    <div class="lecteur-haut">
      <div role="group" aria-label="Langue de la voix" class="segments" data-langues>${r.map((e,t)=>`<button type="button" data-l="${e}" aria-pressed="${t===0}">${u(n[e])}</button>`).join(``)}</div>
      <div role="group" aria-label="Vitesse de lecture" class="segments" data-vitesses>${v.map(e=>`<button type="button" data-v="${e}" aria-pressed="${e===1}">${String(e).replace(`.`,`,`)}×</button>`).join(``)}</div>
    </div>
    <p class="audio-a-venir cache"><strong>Audio à venir :</strong> ce fichier est muet en attendant la voix enregistrée. Les sous-titres défilent déjà.</p>
    <audio controls preload="metadata"></audio>
    <div class="sous-titres" aria-label="Sous-titres en français"></div>
  </div>`;let a=e.querySelector(`audio`);a.setAttribute(`aria-label`,`Écouter : ${t.titre}`);let o=e.querySelector(`.sous-titres`),s=e.querySelector(`.audio-a-venir`),l=r[0],d=[],f=0,m=1;async function h(n){l=n;let r=t.audio[n];e.querySelectorAll(`[data-l]`).forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.l===n)),s.classList.toggle(`cache`,!r.provisoire),a.src=i(r.src),a.playbackRate=m;let f=p.positionAudio(t.id,n);f&&a.addEventListener(`loadedmetadata`,()=>{a.currentTime=f},{once:!0}),f&&a.load(),d=b(await c(r.vtt)),o.innerHTML=d.map((e,t)=>`<button type="button" data-q="${t}">${u(e.texte)}</button>`).join(``)}return e.querySelector(`[data-langues]`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-l]`);t&&h(t.dataset.l)}),e.querySelector(`[data-vitesses]`).addEventListener(`click`,t=>{let n=t.target.closest(`[data-v]`);n&&(m=+n.dataset.v,a.playbackRate=m,e.querySelectorAll(`[data-v]`).forEach(e=>e.setAttribute(`aria-pressed`,e===n)))}),o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-q]`);t&&(a.currentTime=d[+t.dataset.q].debut)}),a.addEventListener(`play`,()=>p.marquer(t.id,`ecoute`)),a.addEventListener(`timeupdate`,()=>{let e=a.currentTime;Math.abs(e-f)>3&&(f=e,p.retenirAudio(t.id,l,e));let n=d.findIndex(t=>e>=t.debut&&e<t.fin),r=o.querySelector(`.actif`);if(!(r&&+r.dataset.q===n)&&(r&&r.classList.remove(`actif`),n>=0)){let e=o.children[n];e.classList.add(`actif`),o.scrollTop=e.offsetTop-o.offsetTop-40}}),a.addEventListener(`ended`,()=>p.retenirAudio(t.id,l,0)),h(l),()=>{a.pause(),a.removeAttribute(`src`)}}async function S(i,c){let[v,y,b,S,C,w]=await Promise.all([r(),_(),h(),g(),m(),s()]),T=v.find(e=>e.id===c);if(!T)return o({titre:`Récit introuvable`}),i.innerHTML=`<div class="page texte"><h1>Récit introuvable</h1><p>Ce récit n'existe pas, ou pas encore.</p><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>`,()=>{};o({titre:T.titre,description:T.resume});let E=await a(T.texte),D=T.localites.map(e=>y.find(t=>t.id===e)),O=b.find(e=>e.id===D[0].region),k=Object.fromEntries(b.map(e=>[e.id,e.nom])),A=Object.fromEntries(y.map(e=>[e.id,e])),j=(T.patrimoine||[]).map(e=>S.find(t=>t.id===e)),M=v.filter(e=>e.id!==T.id).map(e=>({x:e,score:(A[e.localites[0]].region===O.id?2:0)+ +(e.type===T.type)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,3).map(e=>e.x),N=Object.values(T.audio)[0]?.duree;i.innerHTML=`<article class="page fiche-recit">
    <p class="fil"><a href="#/catalogue">Catalogue</a> › <span>${u(d[T.type].nom)}</span></p>
    <header class="fiche-entete">
      <div>
        <p class="etiquettes"><span class="etiquette type-${T.type}">${u(T.genre||d[T.type].nom)}</span></p>
        <h1>${u(T.titre)}</h1>
        <p class="chapeau">${u(T.resume)}</p>
        <dl class="fiche-infos">
          <div><dt>Lieu</dt><dd>${D.map(e=>`<a href="#/carte/${e.id}">${u(e.nom)}</a>`).join(`, `)}, région ${u(O.nom)}</dd></div>
          <div><dt>Peuple</dt><dd>${u(T.peuple)}</dd></div>
          <div><dt>Durée</dt><dd>${T.lecture} min de lecture${N?`, ${Math.ceil(N/60)} min d'écoute`:``}</dd></div>
        </dl>
        <div class="rangee">
          ${T.jouable?`<a class="bouton fort" href="#/jouer/${T.id}">▶ Vivre l'histoire</a>`:``}
          ${w[T.film]?`<a class="bouton" href="#/film/${T.film}">▶ Voir le film</a>`:``}
        </div>
      </div>
      <div class="mini-carte" role="img" aria-label="Situation de ${u(D[0].nom)} sur la carte du Burkina Faso"></div>
    </header>

    <div class="fiche-colonnes">
      <div class="fiche-texte">
        <section aria-labelledby="t-ecouter">
          <h2 id="t-ecouter">Écouter</h2>
          <div data-lecteur></div>
        </section>
        <section aria-labelledby="t-lire">
          <h2 id="t-lire">Lire</h2>
          ${T.statut===`a_valider`?l():``}
          <div class="texte-recit">${f(E)}</div>
          <div data-fin-lecture></div>
        </section>
        ${Object.entries(T.texteLocal||{}).length?`<section><h2>En langue nationale</h2><p class="meta">Traduction automatique, non relue par un locuteur : des erreurs sont probables.</p>${(await Promise.all(Object.entries(T.texteLocal).map(async([e,t])=>`<h3>${u(C[e])}</h3><div class="texte-recit" lang="${e}">${f(await a(t))}</div>`))).join(``)}</section>`:``}
      </div>
      <aside class="fiche-cote">
        <section class="encart"><h2>Morale</h2><p>${u(T.morale)}</p></section>
        ${T.personnages?.length?`<section class="encart"><h2>Personnages</h2><p>${u(T.personnages.join(`, `))}</p></section>`:``}
        <section class="encart"><h2>Petit lexique</h2><dl class="lexique">${T.lexique.map(e=>`<div><dt lang="${e.langue===`fr`?`fr`:e.langue}">${u(e.mot)}${e.langue===`fr`?``:` <small>${u(C[e.langue])}</small>`}</dt><dd>${u(e.sens)}</dd></div>`).join(``)}</dl></section>
        ${j.length?`<section class="encart"><h2>Patrimoine lié</h2><ul class="liste-tags">${j.map(e=>`<li><a href="#/patrimoine/${e.id}">${u(e.titre)}</a></li>`).join(``)}</ul></section>`:``}
        <section class="encart"><h2>Sources</h2><ul class="sources">${T.sources.map(e=>`<li>${e.url?`<a href="${u(e.url)}" target="_blank" rel="noreferrer">${u(e.titre)}</a>`:u(e.titre)}</li>`).join(``)}</ul></section>
      </aside>
    </div>

    ${M.length?`<section class="voisins"><h2>À lire aussi</h2><ul class="grille-recits">${M.map(t=>e(t,{regionNom:k[A[t.localites[0]].region],langues:C})).join(``)}</ul></section>`:``}
  </article>`;let P=x(i.querySelector(`[data-lecteur]`),T,C);t().then(({svg:e,projeter:t})=>{let r=i.querySelector(`.mini-carte`);r&&(e.removeAttribute(`role`),e.querySelector(`.regions path[data-region="${O.id}"]`).classList.add(`choisie`),D.forEach(r=>{let[i,a]=t(r.coords);e.append(n(`circle`,{cx:i,cy:a,r:16,class:`point-mini`}))}),e.setAttribute(`aria-hidden`,`true`),r.append(e))});let F=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(p.marquer(T.id,`lu`),F.disconnect())},{threshold:1});return F.observe(i.querySelector(`[data-fin-lecture]`)),()=>{F.disconnect(),P()}}async function C(e,t){let n=await S(e,t.params[0]);return{async maj({params:t}){n(),scrollTo(0,0),n=await S(e,t[0])},demonter(){n()}}}export{C as monter};