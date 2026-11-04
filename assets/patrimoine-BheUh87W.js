import{i as e,n as t,r as n,t as r}from"./fiche-patrimoine-ByXRhmXN.js";import{S as i,_ as a,a as o,o as s,x as c,y as l}from"./index-BDdtpQLN.js";async function u(u,d){let[f,p,m,h]=await Promise.all([l(),i(),c(),a()]),g=``,_=``,v=()=>{},y=[...new Set(f.flatMap(e=>e.peuples))].filter(e=>e!==`Plusieurs peuples`).sort((e,t)=>e.localeCompare(t));function b(){o({titre:`Patrimoine`,description:`Objets, masques, habits, outils, instruments et habitat du Burkina Faso, en 3D et expliqués.`});let t=f.filter(e=>(!g||e.categorie===g)&&(!_||e.peuples.includes(_)));u.innerHTML=`<div class="page">
      <h1>Patrimoine</h1>
      <p class="chapeau">Les objets qu'on croise dans les récits, à faire tourner en 3D. Ce sont les mêmes fiches que dans le jeu. Chaque modèle est une interprétation, et sa fiche dit jusqu'où il est fidèle.</p>
      <label class="filtre-peuple">Peuple :
        <select data-peuple><option value="">Tous</option>${y.map(e=>`<option value="${s(e)}" ${e===_?`selected`:``}>${s(e)}</option>`).join(``)}</select>
      </label>
      <div role="group" aria-label="Filtrer par catégorie" class="segments segments-clair">
        <button type="button" data-cat="" aria-pressed="${!g}">Tout</button>
        ${Object.entries(r).map(([e,t])=>`<button type="button" data-cat="${e}" aria-pressed="${g===e}">${t}</button>`).join(``)}
      </div>
      <ul class="grille-patrimoine">${t.map(t=>`<li><a href="#/patrimoine/${t.id}"><img src="${e(t)}" width="384" height="384" alt="" loading="lazy"><h2>${s(t.titre)}</h2><p class="meta">${r[t.categorie]} · ${s(t.peuples.join(`, `))}</p></a></li>`).join(``)}</ul>
      ${t.length?``:`<p>Aucun objet ne correspond à ces deux filtres.</p>`}
    </div>`,u.querySelector(`[data-peuple]`).addEventListener(`change`,e=>{_=e.target.value,b(),u.querySelector(`[data-peuple]`).focus()}),u.querySelector(`.segments`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-cat]`);t&&(g=t.dataset.cat,b(),u.querySelector(`[data-cat="${g}"]`).focus())})}function x(e){o({titre:e.titre,description:e.texte});let i=e.regions.map(e=>p.find(t=>t.id===e)),a=h.filter(t=>t.patrimoine.includes(e.id)),c=e.recits.map(e=>m.find(t=>t.id===e));v(),u.innerHTML=`<article class="page fiche-patrimoine">
      <p class="fil"><a href="#/patrimoine">Patrimoine</a> › <span>${r[e.categorie]}</span></p>
      <div class="fiche-p-corps">${n(e).replace(`<h2>`,`<div><h1>`).replace(`</h2>`,`</h1>`)}
        ${e.statut===`a_valider`?`<p class="meta">Texte provisoire, à valider.</p>`:``}
        <h2>Régions</h2><ul class="liste-tags">${i.map(e=>`<li><a href="#/carte?region=${e.id}">${s(e.nom)}</a></li>`).join(``)}</ul>
        ${a.length?`<h2>Localités</h2><ul class="liste-tags">${a.map(e=>`<li><a href="#/carte/${e.id}">${s(e.nom)}</a></li>`).join(``)}</ul>`:``}
        <h2>Récits</h2><ul class="liste-tags">${c.map(e=>`<li><a href="#/recit/${e.id}">${s(e.titre)}</a></li>`).join(``)}</ul>
        </div>
      </div>
    </article>`,v=t(u,f)}function S({params:e}){if(scrollTo(0,0),v(),v=()=>{},e[0]){let t=f.find(t=>t.id===e[0]);if(t){x(t);return}}b()}return S(d),{maj:S,demonter(){v()}}}export{u as monter};