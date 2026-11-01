import{t as e}from"./carte-recit-15G4NhHQ.js";import{n as t,r as n}from"./carte-svg-8OhtuD4s.js";import{a as r,c as i,i as a,l as o,n as s,o as c,s as l,u}from"./data-WU6kzAGN.js";import{a as d,i as f,o as p,r as m,s as h,t as g}from"./index-Bro0h7sf.js";var _=[.75,1,1.25],v=e=>e.trim().split(`:`).map(Number).reduce((e,t)=>e*60+t,0);function y(e){return e.replace(/\r/g,``).split(/\n\n+/).map(e=>{let t=e.split(`
`),n=t.findIndex(e=>e.includes(`-->`));if(n<0)return null;let[r,i]=t[n].split(`-->`);return{debut:v(r),fin:v(i.split(` `).filter(Boolean)[0]),texte:t.slice(n+1).join(` `).trim()}}).filter(Boolean)}function b(e,t,n){let r=Object.keys(t.audio);if(!r.length)return e.innerHTML=`<p class="meta">Pas encore d'audio pour ce récit. La collecte reste ouverte.</p>`,()=>{};e.innerHTML=`<div class="lecteur">
    <div class="lecteur-haut">
      <div role="group" aria-label="Langue de la voix" class="segments" data-langues>${r.map((e,t)=>`<button type="button" data-l="${e}" aria-pressed="${t===0}">${p(n[e])}</button>`).join(``)}</div>
      <div role="group" aria-label="Vitesse de lecture" class="segments" data-vitesses>${_.map(e=>`<button type="button" data-v="${e}" aria-pressed="${e===1}">${String(e).replace(`.`,`,`)}×</button>`).join(``)}</div>
    </div>
    <p class="audio-a-venir cache"><strong>Audio à venir :</strong> ce fichier est muet en attendant la voix enregistrée. Les sous-titres défilent déjà.</p>
    <audio controls preload="metadata"></audio>
    <div class="sous-titres" aria-label="Sous-titres en français"></div>
  </div>`;let i=e.querySelector(`audio`);i.setAttribute(`aria-label`,`Écouter : ${t.titre}`);let a=e.querySelector(`.sous-titres`),o=e.querySelector(`.audio-a-venir`),c=r[0],l=[],d=0,f=1;async function m(n){c=n;let r=t.audio[n];e.querySelectorAll(`[data-l]`).forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.l===n)),o.classList.toggle(`cache`,!r.provisoire),i.src=u(r.src),i.playbackRate=f;let d=g.positionAudio(t.id,n);d&&i.addEventListener(`loadedmetadata`,()=>{i.currentTime=d},{once:!0}),d&&i.load(),l=y(await s(r.vtt)),a.innerHTML=l.map((e,t)=>`<button type="button" data-q="${t}">${p(e.texte)}</button>`).join(``)}return e.querySelector(`[data-langues]`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-l]`);t&&m(t.dataset.l)}),e.querySelector(`[data-vitesses]`).addEventListener(`click`,t=>{let n=t.target.closest(`[data-v]`);n&&(f=+n.dataset.v,i.playbackRate=f,e.querySelectorAll(`[data-v]`).forEach(e=>e.setAttribute(`aria-pressed`,e===n)))}),a.addEventListener(`click`,e=>{let t=e.target.closest(`[data-q]`);t&&(i.currentTime=l[+t.dataset.q].debut)}),i.addEventListener(`play`,()=>g.marquer(t.id,`ecoute`)),i.addEventListener(`timeupdate`,()=>{let e=i.currentTime;Math.abs(e-d)>3&&(d=e,g.retenirAudio(t.id,c,e));let n=l.findIndex(t=>e>=t.debut&&e<t.fin),r=a.querySelector(`.actif`);if(!(r&&+r.dataset.q===n)&&(r&&r.classList.remove(`actif`),n>=0)){let e=a.children[n];e.classList.add(`actif`),a.scrollTop=e.offsetTop-a.offsetTop-40}}),i.addEventListener(`ended`,()=>g.retenirAudio(t.id,c,0)),m(c),()=>{i.pause(),i.removeAttribute(`src`)}}var x=e=>`site/lecteur.html?h=${e}`;async function S(s,u){let[_,v,y,S,C]=await Promise.all([l(),r(),i(),c(),a()]),w=_.find(e=>e.id===u);if(!w)return d({titre:`Récit introuvable`}),s.innerHTML=`<div class="page texte"><h1>Récit introuvable</h1><p>Ce récit n'existe pas, ou pas encore.</p><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>`,()=>{};d({titre:w.titre,description:w.resume});let T=await o(w.texte),E=w.localites.map(e=>v.find(t=>t.id===e)),D=y.find(e=>e.id===E[0].region),O=Object.fromEntries(y.map(e=>[e.id,e.nom])),k=Object.fromEntries(v.map(e=>[e.id,e])),A=(w.patrimoine||[]).map(e=>S.find(t=>t.id===e)),j=_.filter(e=>e.id!==w.id).map(e=>({x:e,score:(k[e.localites[0]].region===D.id?2:0)+ +(e.type===w.type)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,3).map(e=>e.x),M=Object.values(w.audio)[0]?.duree;s.innerHTML=`<article class="page fiche-recit">
    <p class="fil"><a href="#/catalogue">Catalogue</a> › <span>${p(m[w.type].nom)}</span></p>
    <header class="fiche-entete">
      <div>
        <p class="etiquettes"><span class="etiquette type-${w.type}">${p(w.genre||m[w.type].nom)}</span></p>
        <h1>${p(w.titre)}</h1>
        <p class="chapeau">${p(w.resume)}</p>
        <dl class="fiche-infos">
          <div><dt>Lieu</dt><dd>${E.map(e=>`<a href="#/carte/${e.id}">${p(e.nom)}</a>`).join(`, `)}, région ${p(D.nom)}</dd></div>
          <div><dt>Peuple</dt><dd>${p(w.peuple)}</dd></div>
          <div><dt>Durée</dt><dd>${w.lecture} min de lecture${M?`, ${Math.ceil(M/60)} min d'écoute`:``}</dd></div>
        </dl>
        <div class="rangee">
          ${w.jouable?`<a class="bouton fort" href="#/jouer/${w.id}">▶ Vivre l'histoire</a>`:``}
          ${w.film?`<a class="bouton" href="${x(w.film)}">Voir le film d'animation</a>`:``}
        </div>
      </div>
      <div class="mini-carte" role="img" aria-label="Situation de ${p(E[0].nom)} sur la carte du Burkina Faso"></div>
    </header>

    <div class="fiche-colonnes">
      <div class="fiche-texte">
        <section aria-labelledby="t-ecouter">
          <h2 id="t-ecouter">Écouter</h2>
          <div data-lecteur></div>
        </section>
        <section aria-labelledby="t-lire">
          <h2 id="t-lire">Lire</h2>
          ${w.statut===`a_valider`?f():``}
          <div class="texte-recit">${h(T)}</div>
          <div data-fin-lecture></div>
        </section>
        ${Object.entries(w.texteLocal||{}).length?`<section><h2>En langue nationale</h2>${(await Promise.all(Object.entries(w.texteLocal).map(async([e,t])=>`<h3>${p(C[e])}</h3><div class="texte-recit" lang="${e}">${h(await o(t))}</div>`))).join(``)}</section>`:``}
      </div>
      <aside class="fiche-cote">
        <section class="encart"><h2>Morale</h2><p>${p(w.morale)}</p></section>
        ${w.personnages?.length?`<section class="encart"><h2>Personnages</h2><p>${p(w.personnages.join(`, `))}</p></section>`:``}
        <section class="encart"><h2>Petit lexique</h2><dl class="lexique">${w.lexique.map(e=>`<div><dt lang="${e.langue===`fr`?`fr`:e.langue}">${p(e.mot)}${e.langue===`fr`?``:` <small>${p(C[e.langue])}</small>`}</dt><dd>${p(e.sens)}</dd></div>`).join(``)}</dl></section>
        ${A.length?`<section class="encart"><h2>Patrimoine lié</h2><ul class="liste-tags">${A.map(e=>`<li><a href="#/patrimoine/${e.id}">${p(e.titre)}</a></li>`).join(``)}</ul></section>`:``}
        <section class="encart"><h2>Sources</h2><ul class="sources">${w.sources.map(e=>`<li>${e.url?`<a href="${p(e.url)}" target="_blank" rel="noreferrer">${p(e.titre)}</a>`:p(e.titre)}</li>`).join(``)}</ul></section>
      </aside>
    </div>

    ${j.length?`<section class="voisins"><h2>À lire aussi</h2><ul class="grille-recits">${j.map(t=>e(t,{regionNom:O[k[t.localites[0]].region],langues:C})).join(``)}</ul></section>`:``}
  </article>`;let N=b(s.querySelector(`[data-lecteur]`),w,C);t().then(({svg:e,projeter:t})=>{let r=s.querySelector(`.mini-carte`);r&&(e.removeAttribute(`role`),e.querySelector(`.regions path[data-region="${D.id}"]`).classList.add(`choisie`),E.forEach(r=>{let[i,a]=t(r.coords);e.append(n(`circle`,{cx:i,cy:a,r:16,class:`point-mini`}))}),e.setAttribute(`aria-hidden`,`true`),r.append(e))});let P=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(g.marquer(w.id,`lu`),P.disconnect())},{threshold:1});return P.observe(s.querySelector(`[data-fin-lecture]`)),()=>{P.disconnect(),N()}}async function C(e,t){let n=await S(e,t.params[0]);return{async maj({params:t}){n(),scrollTo(0,0),n=await S(e,t[0])},demonter(){n()}}}export{C as monter};