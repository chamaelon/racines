import{t as e}from"./carte-recit-GHCkVX87.js";import{n as t,r as n}from"./carte-svg-Cs4GYSWQ.js";import{S as r,_ as i,a,g as o,i as s,m as c,o as l,r as u,x as d,y as f}from"./index-BDdtpQLN.js";import{r as p}from"./film-DT8g6syT.js";async function m(m,h){let[g,_,v,y,b,x]=await Promise.all([d(),i(),r(),f(),o(),c()]),S=g.find(e=>e.id===h);if(!S)return a({titre:`Récit introuvable`}),m.innerHTML=`<div class="page texte"><h1>Récit introuvable</h1><p>Ce récit n'existe pas, ou pas encore.</p><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>`,()=>{};a({titre:S.titre,description:S.resume});let C=S.localites.map(e=>_.find(t=>t.id===e)),w=v.find(e=>e.id===C[0].region),T=Object.fromEntries(v.map(e=>[e.id,e.nom])),E=Object.fromEntries(_.map(e=>[e.id,e])),D=(S.patrimoine||[]).map(e=>y.find(t=>t.id===e)),O=g.filter(e=>e.id!==S.id).map(e=>({x:e,score:(E[e.localites[0]].region===w.id?2:0)+ +(e.type===S.type)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,3).map(e=>e.x),k=x[S.film];return m.innerHTML=`<article class="page fiche-recit">
    <p class="fil"><a href="#/catalogue">Catalogue</a> › <span>${l(u[S.type].nom)}</span></p>
    <header class="fiche-entete">
      <div>
        <p class="etiquettes"><span class="etiquette type-${S.type}">${l(S.genre||u[S.type].nom)}</span></p>
        <h1>${l(S.titre)}</h1>
        <p class="chapeau">${l(S.resume)}</p>
        <dl class="fiche-infos">
          <div><dt>Lieu</dt><dd>${C.map(e=>`<a href="#/carte/${e.id}">${l(e.nom)}</a>`).join(`, `)}, région ${l(w.nom)}</dd></div>
          <div><dt>Peuple</dt><dd>${l(S.peuple)}</dd></div>
          ${k?`<div><dt>Durée du film</dt><dd>${p(k.duree)}</dd></div>`:``}
        </dl>
        <div class="fiche-options">
          <a class="bouton fort grand" href="#/jouer/${S.id}">▶ Jouer l'histoire</a>
          ${k?`<a class="bouton fort grand" href="#/film/${S.film}">▶ Voir le film</a>`:``}
        </div>
        ${S.statut===`a_valider`?s():``}
      </div>
      <div class="mini-carte" role="img" aria-label="Situation de ${l(C[0].nom)} sur la carte du Burkina Faso"></div>
    </header>

    <div class="fiche-infos-bas">
      <aside class="fiche-cote">
        <section class="encart"><h2>Morale</h2><p>${l(S.morale)}</p></section>
        ${S.personnages?.length?`<section class="encart"><h2>Personnages</h2><p>${l(S.personnages.join(`, `))}</p></section>`:``}
        <section class="encart"><h2>Petit lexique</h2><dl class="lexique">${S.lexique.map(e=>`<div><dt lang="${e.langue===`fr`?`fr`:e.langue}">${l(e.mot)}${e.langue===`fr`?``:` <small>${l(b[e.langue])}</small>`}</dt><dd>${l(e.sens)}</dd></div>`).join(``)}</dl></section>
        ${D.length?`<section class="encart"><h2>Patrimoine lié</h2><ul class="liste-tags">${D.map(e=>`<li><a href="#/patrimoine/${e.id}">${l(e.titre)}</a></li>`).join(``)}</ul></section>`:``}
        <section class="encart"><h2>Sources</h2><ul class="sources">${S.sources.map(e=>`<li>${e.url?`<a href="${l(e.url)}" target="_blank" rel="noreferrer">${l(e.titre)}</a>`:l(e.titre)}</li>`).join(``)}</ul></section>
      </aside>
    </div>

    ${O.length?`<section class="voisins"><h2>À découvrir aussi</h2><ul class="grille-recits">${O.map(t=>e(t,{regionNom:T[E[t.localites[0]].region],langues:b})).join(``)}</ul></section>`:``}
  </article>`,t().then(({svg:e,projeter:t})=>{let r=m.querySelector(`.mini-carte`);r&&(e.removeAttribute(`role`),e.querySelector(`.regions path[data-region="${w.id}"]`).classList.add(`choisie`),C.forEach(r=>{let[i,a]=t(r.coords);e.append(n(`circle`,{cx:i,cy:a,r:16,class:`point-mini`}))}),e.setAttribute(`aria-hidden`,`true`),r.append(e))}),()=>{}}async function h(e,t){let n=await m(e,t.params[0]);return{async maj({params:t}){n(),scrollTo(0,0),n=await m(e,t[0])},demonter(){n()}}}export{h as monter};