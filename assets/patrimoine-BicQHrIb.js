import{n as e,r as t,t as n}from"./fiche-patrimoine-DRBsU8XM.js";import{a as r,c as i,o as a,s as o}from"./data-WU6kzAGN.js";import{a as s,o as c}from"./index-D3oXObO5.js";async function l(l,u){let[d,f,p,m]=await Promise.all([a(),i(),o(),r()]),h=``;function g(){s({titre:`Patrimoine`,description:`Objets, habits, instruments, mets et habitat du Burkina Faso, dessinés et expliqués.`});let e=d.filter(e=>!h||e.categorie===h);l.innerHTML=`<div class="page">
      <h1>Patrimoine</h1>
      <p class="chapeau">Les objets qu'on croise dans les récits. Ce sont les mêmes fiches que dans le jeu.</p>
      <div role="group" aria-label="Filtrer par catégorie" class="segments segments-clair">
        <button type="button" data-cat="" aria-pressed="${!h}">Tout</button>
        ${Object.entries(n).map(([e,t])=>`<button type="button" data-cat="${e}" aria-pressed="${h===e}">${t}</button>`).join(``)}
      </div>
      <ul class="grille-patrimoine">${e.map(e=>`<li><a href="#/patrimoine/${e.id}"><canvas width="256" height="256" data-dessin="${e.dessin}" aria-hidden="true"></canvas><h2>${c(e.titre)}</h2><p class="meta">${n[e.categorie]}</p></a></li>`).join(``)}</ul>
    </div>`,t(l),l.querySelector(`.segments`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-cat]`);t&&(h=t.dataset.cat,g(),l.querySelector(`[data-cat="${h}"]`).focus())})}function _(r){s({titre:r.titre,description:r.texte});let i=r.regions.map(e=>f.find(t=>t.id===e)),a=m.filter(e=>e.patrimoine.includes(r.id)),o=r.recits.map(e=>p.find(t=>t.id===e));l.innerHTML=`<article class="page fiche-patrimoine">
      <p class="fil"><a href="#/patrimoine">Patrimoine</a> › <span>${n[r.categorie]}</span></p>
      <div class="fiche-p-corps">${e(r).replace(`<h2>`,`<div><h1>`).replace(`</h2>`,`</h1>`)}
        ${r.statut===`a_valider`?`<p class="meta">Texte provisoire, à valider.</p>`:``}
        <h2>Régions</h2><ul class="liste-tags">${i.map(e=>`<li><a href="#/carte?region=${e.id}">${c(e.nom)}</a></li>`).join(``)}</ul>
        ${a.length?`<h2>Localités</h2><ul class="liste-tags">${a.map(e=>`<li><a href="#/carte/${e.id}">${c(e.nom)}</a></li>`).join(``)}</ul>`:``}
        <h2>Récits</h2><ul class="liste-tags">${o.map(e=>`<li><a href="#/recit/${e.id}">${c(e.titre)}</a></li>`).join(``)}</ul>
        </div>
      </div>
    </article>`,t(l)}function v({params:e}){if(scrollTo(0,0),e[0]){let t=d.find(t=>t.id===e[0]);if(t){_(t);return}}g()}return v(u),{maj:v}}export{l as monter};