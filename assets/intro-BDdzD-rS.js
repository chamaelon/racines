import{T as e,t}from"./index-aEJwrNXY.js";var n=[`Approche, le feu est allumé. Ici, chaque région du Burkina Faso garde ses récits.`,`Touche la carte, choisis un lieu, puis lis, écoute ou vis son histoire.`,`Ce que tu auras entendu, à toi de le raconter à ton tour.`];function r(){let r=document.createElement(`div`);r.className=`veillee`,r.setAttribute(`role`,`dialog`),r.setAttribute(`aria-modal`,`true`),r.setAttribute(`aria-label`,`Le griot ouvre la veillée`),r.innerHTML=`<div class="veillee-carte">
    <img src="${e(`modeles/portraits/griot.webp`)}" width="192" height="192" alt="">
    <div>
      <p class="sur-titre">Le griot</p>
      <p class="veillee-texte" aria-live="polite"></p>
      <div class="rangee"><button type="button" class="bouton fort" data-suite>Continuer</button><button type="button" class="bouton discret" data-passer>Passer</button></div>
    </div>
  </div>`,document.body.append(r);let i=r.querySelector(`.veillee-texte`),a=r.querySelector(`[data-suite]`),o=0,s=()=>{t.definirPref(`intro`,!0),r.remove(),document.getElementById(`app`).focus()},c=()=>{i.textContent=n[o],a.textContent=o===n.length-1?`Entrer dans la veillée`:`Continuer`};a.addEventListener(`click`,()=>{o++,o>=n.length?s():c()}),r.querySelector(`[data-passer]`).addEventListener(`click`,s),r.addEventListener(`keydown`,e=>{e.key===`Escape`&&s()}),c(),a.focus()}export{r as ouvrirVeillee};