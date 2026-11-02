import{o as e,r as t,s as n}from"./data-WU6kzAGN.js";import{n as r}from"./moteur-BcZ-BK0n.js";import{a as i,o as a,t as o}from"./index-om3feeHo.js";async function s(s){let[c,l]=await Promise.all([n(),e()]),u=c.filter(e=>e.jouable),d=await Promise.all(u.map(e=>t(e.jouable)));i({titre:`Mon parcours`,description:`Récits lus, écoutés et joués, fins découvertes et objets trouvés.`});function f(){let e=o.compteurs(),t=d.reduce((e,t)=>e+r(t).length,0),n=[{nom:`Griot apprenti`,detail:`3 récits terminés`,ok:e.termines>=3},{nom:`Griot confirmé`,detail:`10 récits terminés`,ok:e.termines>=10},{nom:`Oreille attentive`,detail:`3 récits écoutés`,ok:e.ecoutes>=3},{nom:`Explorateur du terroir`,detail:`${l.length} objets trouvés`,ok:e.objets>=l.length},{nom:`Toutes les fins`,detail:`${t} fins découvertes`,ok:e.fins>=t}];s.innerHTML=`<div class="page">
      <h1>Mon parcours</h1>
      <p class="chapeau">Votre progression reste sur cet appareil. Aucun compte n'est nécessaire.</p>
      <div class="chiffres chiffres-clair">
        <div><b>${e.lus}</b><span>récits lus</span></div>
        <div><b>${e.ecoutes}</b><span>écoutés</span></div>
        <div><b>${e.joues}</b><span>joués</span></div>
        <div><b>${e.fins}/${t}</b><span>fins découvertes</span></div>
        <div><b>${e.objets}/${l.length}</b><span>objets trouvés</span></div>
      </div>
      <h2>Badges</h2>
      <ul class="badges">${n.map(e=>`<li class="${e.ok?`gagne`:``}"><strong>${e.ok?`★`:`☆`} ${a(e.nom)}</strong><small>${a(e.detail)}${e.ok?``:` (pas encore)`}</small></li>`).join(``)}</ul>
      <h2>Histoires à vivre</h2>
      <ul class="liste-recits liste-large">${u.map((e,t)=>{let n=o.fins(e.id),i=r(d[t]).length;return`<li><a href="#/jouer/${e.id}"><span class="puce-jouable" aria-hidden="true">▶</span><span><b>${a(e.titre)}</b><small>${n.length}/${i} fins découvertes${o.sauvegarde(e.id)?` · partie en cours`:``}</small></span></a></li>`}).join(``)}</ul>
      <h2>Tout effacer</h2>
      <p>Cette action efface vos récits, vos fins et vos sauvegardes.</p>
      <button type="button" class="bouton" data-effacer>Réinitialiser ma progression</button>
    </div>`,s.querySelector(`[data-effacer]`).addEventListener(`click`,e=>{e.currentTarget.dataset.sur?(o.reinitialiser(),f()):(e.currentTarget.dataset.sur=`1`,e.currentTarget.textContent=`Confirmer : tout effacer`)})}f()}export{s as monter};