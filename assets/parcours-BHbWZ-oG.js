import{a as e,h as t,o as n,t as r,x as i,y as a}from"./index-TxFjLNiQ.js";import{n as o}from"./moteur-B6bTJsgj.js";async function s(s){let[c,l]=await Promise.all([i(),a()]),u=c.filter(e=>e.jouable),d=await Promise.all(u.map(e=>t(e.jouable)));e({titre:`Mon parcours`,description:`Films vus et histoires jouées, fins découvertes et objets trouvés.`});function f(){let e=r.compteurs(),t=d.reduce((e,t)=>e+o(t).length,0),i=[{nom:`Griot apprenti`,detail:`3 récits terminés`,ok:e.termines>=3},{nom:`Griot confirmé`,detail:`10 récits terminés`,ok:e.termines>=10},{nom:`Spectateur attentif`,detail:`3 films vus`,ok:e.ecoutes>=3},{nom:`Explorateur du terroir`,detail:`${l.length} objets trouvés`,ok:e.objets>=l.length},{nom:`Toutes les fins`,detail:`${t} fins découvertes`,ok:e.fins>=t}];s.innerHTML=`<div class="page">
      <h1>Mon parcours</h1>
      <p class="chapeau">Votre progression reste sur cet appareil. Aucun compte n'est nécessaire.</p>
      <div class="chiffres chiffres-clair">
        <div><b>${e.ecoutes}</b><span>films vus</span></div>
        <div><b>${e.joues}</b><span>joués</span></div>
        <div><b>${e.fins}/${t}</b><span>fins découvertes</span></div>
        <div><b>${e.objets}/${l.length}</b><span>objets trouvés</span></div>
      </div>
      <h2>Badges</h2>
      <ul class="badges">${i.map(e=>`<li class="${e.ok?`gagne`:``}"><strong>${e.ok?`★`:`☆`} ${n(e.nom)}</strong><small>${n(e.detail)}${e.ok?``:` (pas encore)`}</small></li>`).join(``)}</ul>
      <h2>Histoires à vivre</h2>
      <ul class="liste-recits liste-large">${u.map((e,t)=>{let i=r.fins(e.id),a=o(d[t]).length;return`<li><a href="#/jouer/${e.id}"><span class="puce-jouable" aria-hidden="true">▶</span><span><b>${n(e.titre)}</b><small>${i.length}/${a} fins découvertes${r.sauvegarde(e.id)?` · partie en cours`:``}</small></span></a></li>`}).join(``)}</ul>
      <h2>Tout effacer</h2>
      <p>Cette action efface vos récits, vos fins et vos sauvegardes.</p>
      <button type="button" class="bouton" data-effacer>Réinitialiser ma progression</button>
    </div>`,s.querySelector(`[data-effacer]`).addEventListener(`click`,e=>{e.currentTarget.dataset.sur?(r.reinitialiser(),f()):(e.currentTarget.dataset.sur=`1`,e.currentTarget.textContent=`Confirmer : tout effacer`)})}f()}export{s as monter};