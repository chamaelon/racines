import{t as e}from"./carte-recit-B5Bg2DJf.js";import{n as t,r as n}from"./carte-svg-CsG1vp5k.js";import{C as r,S as i,T as a,_ as o,a as s,b as c,h as l,i as u,o as d,r as f,s as p,t as m,v as h,w as g}from"./index-aEJwrNXY.js";var _=[.75,1,1.25],v=e=>e.trim().split(`:`).map(Number).reduce((e,t)=>e*60+t,0);function y(e){return e.replace(/\r/g,``).split(/\n\n+/).map(e=>{let t=e.split(`
`),n=t.findIndex(e=>e.includes(`-->`));if(n<0)return null;let[r,i]=t[n].split(`-->`);return{debut:v(r),fin:v(i.split(` `).filter(Boolean)[0]),texte:t.slice(n+1).join(` `).trim()}}).filter(Boolean)}function b(e,t,n){let r=Object.keys(t.audio);if(!r.length)return e.innerHTML=`<p class="meta">Pas encore d'audio pour ce récit. La collecte reste ouverte.</p>`,()=>{};e.innerHTML=`<div class="lecteur">
    <div class="lecteur-haut">
      <div role="group" aria-label="Langue de la voix" class="segments" data-langues>${r.map((e,t)=>`<button type="button" data-l="${e}" aria-pressed="${t===0}">${d(n[e])}</button>`).join(``)}</div>
      <div role="group" aria-label="Vitesse de lecture" class="segments" data-vitesses>${_.map(e=>`<button type="button" data-v="${e}" aria-pressed="${e===1}">${String(e).replace(`.`,`,`)}×</button>`).join(``)}</div>
    </div>
    <p class="audio-a-venir cache"><strong>Audio à venir :</strong> ce fichier est muet en attendant la voix enregistrée. Les sous-titres défilent déjà.</p>
    <audio controls preload="metadata"></audio>
    <div class="sous-titres" aria-label="Sous-titres en français"></div>
  </div>`;let i=e.querySelector(`audio`);i.setAttribute(`aria-label`,`Écouter : ${t.titre}`);let o=e.querySelector(`.sous-titres`),s=e.querySelector(`.audio-a-venir`),c=r[0],u=[],f=0,p=1;async function h(n){c=n;let r=t.audio[n];e.querySelectorAll(`[data-l]`).forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.l===n)),s.classList.toggle(`cache`,!r.provisoire),i.src=a(r.src),i.playbackRate=p;let f=m.positionAudio(t.id,n);f&&i.addEventListener(`loadedmetadata`,()=>{i.currentTime=f},{once:!0}),f&&i.load(),u=y(await l(r.vtt)),o.innerHTML=u.map((e,t)=>`<button type="button" data-q="${t}">${d(e.texte)}</button>`).join(``)}return e.querySelector(`[data-langues]`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-l]`);t&&h(t.dataset.l)}),e.querySelector(`[data-vitesses]`).addEventListener(`click`,t=>{let n=t.target.closest(`[data-v]`);n&&(p=+n.dataset.v,i.playbackRate=p,e.querySelectorAll(`[data-v]`).forEach(e=>e.setAttribute(`aria-pressed`,e===n)))}),o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-q]`);t&&(i.currentTime=u[+t.dataset.q].debut)}),i.addEventListener(`play`,()=>m.marquer(t.id,`ecoute`)),i.addEventListener(`timeupdate`,()=>{let e=i.currentTime;Math.abs(e-f)>3&&(f=e,m.retenirAudio(t.id,c,e));let n=u.findIndex(t=>e>=t.debut&&e<t.fin),r=o.querySelector(`.actif`);if(!(r&&+r.dataset.q===n)&&(r&&r.classList.remove(`actif`),n>=0)){let e=o.children[n];e.classList.add(`actif`),o.scrollTop=e.offsetTop-o.offsetTop-40}}),i.addEventListener(`ended`,()=>m.retenirAudio(t.id,c,0)),h(c),()=>{i.pause(),i.removeAttribute(`src`)}}var x=e=>`site/lecteur.html?h=${e}`;async function S(a,l){let[_,v,y,S,C]=await Promise.all([i(),h(),r(),c(),o()]),w=_.find(e=>e.id===l);if(!w)return s({titre:`Récit introuvable`}),a.innerHTML=`<div class="page texte"><h1>Récit introuvable</h1><p>Ce récit n'existe pas, ou pas encore.</p><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>`,()=>{};s({titre:w.titre,description:w.resume});let T=await g(w.texte),E=w.localites.map(e=>v.find(t=>t.id===e)),D=y.find(e=>e.id===E[0].region),O=Object.fromEntries(y.map(e=>[e.id,e.nom])),k=Object.fromEntries(v.map(e=>[e.id,e])),A=(w.patrimoine||[]).map(e=>S.find(t=>t.id===e)),j=_.filter(e=>e.id!==w.id).map(e=>({x:e,score:(k[e.localites[0]].region===D.id?2:0)+ +(e.type===w.type)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,3).map(e=>e.x),M=Object.values(w.audio)[0]?.duree;a.innerHTML=`<article class="page fiche-recit">
    <p class="fil"><a href="#/catalogue">Catalogue</a> › <span>${d(f[w.type].nom)}</span></p>
    <header class="fiche-entete">
      <div>
        <p class="etiquettes"><span class="etiquette type-${w.type}">${d(w.genre||f[w.type].nom)}</span></p>
        <h1>${d(w.titre)}</h1>
        <p class="chapeau">${d(w.resume)}</p>
        <dl class="fiche-infos">
          <div><dt>Lieu</dt><dd>${E.map(e=>`<a href="#/carte/${e.id}">${d(e.nom)}</a>`).join(`, `)}, région ${d(D.nom)}</dd></div>
          <div><dt>Peuple</dt><dd>${d(w.peuple)}</dd></div>
          <div><dt>Durée</dt><dd>${w.lecture} min de lecture${M?`, ${Math.ceil(M/60)} min d'écoute`:``}</dd></div>
        </dl>
        <div class="rangee">
          ${w.jouable?`<a class="bouton fort" href="#/jouer/${w.id}">▶ Vivre l'histoire</a>`:``}
          ${w.film?`<a class="bouton" href="${x(w.film)}">Voir le film d'animation</a>`:``}
        </div>
      </div>
      <div class="mini-carte" role="img" aria-label="Situation de ${d(E[0].nom)} sur la carte du Burkina Faso"></div>
    </header>

    <div class="fiche-colonnes">
      <div class="fiche-texte">
        <section aria-labelledby="t-ecouter">
          <h2 id="t-ecouter">Écouter</h2>
          <div data-lecteur></div>
        </section>
        <section aria-labelledby="t-lire">
          <h2 id="t-lire">Lire</h2>
          ${w.statut===`a_valider`?u():``}
          <div class="texte-recit">${p(T)}</div>
          <div data-fin-lecture></div>
        </section>
        ${Object.entries(w.texteLocal||{}).length?`<section><h2>En langue nationale</h2>${(await Promise.all(Object.entries(w.texteLocal).map(async([e,t])=>`<h3>${d(C[e])}</h3><div class="texte-recit" lang="${e}">${p(await g(t))}</div>`))).join(``)}</section>`:``}
      </div>
      <aside class="fiche-cote">
        <section class="encart"><h2>Morale</h2><p>${d(w.morale)}</p></section>
        ${w.personnages?.length?`<section class="encart"><h2>Personnages</h2><p>${d(w.personnages.join(`, `))}</p></section>`:``}
        <section class="encart"><h2>Petit lexique</h2><dl class="lexique">${w.lexique.map(e=>`<div><dt lang="${e.langue===`fr`?`fr`:e.langue}">${d(e.mot)}${e.langue===`fr`?``:` <small>${d(C[e.langue])}</small>`}</dt><dd>${d(e.sens)}</dd></div>`).join(``)}</dl></section>
        ${A.length?`<section class="encart"><h2>Patrimoine lié</h2><ul class="liste-tags">${A.map(e=>`<li><a href="#/patrimoine/${e.id}">${d(e.titre)}</a></li>`).join(``)}</ul></section>`:``}
        <section class="encart"><h2>Sources</h2><ul class="sources">${w.sources.map(e=>`<li>${e.url?`<a href="${d(e.url)}" target="_blank" rel="noreferrer">${d(e.titre)}</a>`:d(e.titre)}</li>`).join(``)}</ul></section>
      </aside>
    </div>

    ${j.length?`<section class="voisins"><h2>À lire aussi</h2><ul class="grille-recits">${j.map(t=>e(t,{regionNom:O[k[t.localites[0]].region],langues:C})).join(``)}</ul></section>`:``}
  </article>`;let N=b(a.querySelector(`[data-lecteur]`),w,C);t().then(({svg:e,projeter:t})=>{let r=a.querySelector(`.mini-carte`);r&&(e.removeAttribute(`role`),e.querySelector(`.regions path[data-region="${D.id}"]`).classList.add(`choisie`),E.forEach(r=>{let[i,a]=t(r.coords);e.append(n(`circle`,{cx:i,cy:a,r:16,class:`point-mini`}))}),e.setAttribute(`aria-hidden`,`true`),r.append(e))});let P=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(m.marquer(w.id,`lu`),P.disconnect())},{threshold:1});return P.observe(a.querySelector(`[data-fin-lecture]`)),()=>{P.disconnect(),N()}}async function C(e,t){let n=await S(e,t.params[0]);return{async maj({params:t}){n(),scrollTo(0,0),n=await S(e,t[0])},demonter(){n()}}}export{C as monter};