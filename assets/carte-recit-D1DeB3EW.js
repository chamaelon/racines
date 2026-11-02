import{o as e,r as t,t as n}from"./index-om3feeHo.js";var r=e=>{let t=7;for(let n of e)t=t*31+n.charCodeAt(0)>>>0;return t},i={conte:{ciel:[`#141a44`,`#54407a`],astre:`#f4ecc8`,loin:`#2b2650`,pres:`#171233`},legende:{ciel:[`#d9642b`,`#f9c777`],astre:`#fff1c9`,loin:`#a24d22`,pres:`#5a2a12`},histoire:{ciel:[`#b98a52`,`#ecd6a4`],astre:`#fff6dc`,loin:`#8a5a2c`,pres:`#4a2c14`}},a=[`#e0a43a`,`#b8322a`,`#2f3f8f`,`#fbf1dc`,`#1a1209`,`#1f6f6b`];function o(e){let t=r(e.id),n=i[e.type],o=(e,n)=>(t>>e*3&255)%n,s=40+o(0,240),c=34+o(1,50),l=`g-${e.id}`,u=`M0 ${130+o(2,18)} Q ${70+o(3,50)} ${88+o(4,34)} 160 ${122+o(5,16)} T 320 ${112+o(6,28)} V200 H0 Z`,d=50+o(7,200),f;if(e.type===`histoire`){let e=Array.from({length:7},(e,t)=>`<rect x="${d-56+t*16}" y="112" width="10" height="9"/>`).join(``);f=`<rect x="${d-58}" y="120" width="112" height="60"/>${e}`}else f=e.type===`legende`?`<path d="M${d-26} 170V136H${d+26}V170Z"/><path d="M${d-34} 140L${d} 100L${d+34} 140Z"/>`:`<path d="M${d-12} 172Q${d-8} 140 ${d-7} 118H${d+7}Q${d+8} 140 ${d+12} 172Z"/>${[-3,-2,-1,0,1,2,3].map(e=>`<path d="M${d+e*2} 120L${d+e*9} ${102-(e%2?8:0)}" stroke="${n.pres}" stroke-width="4" stroke-linecap="round"/>`).join(``)}`;let p=e.type===`conte`?Array.from({length:14},(e,n)=>`<circle cx="${t*(n+3)*37%320}" cy="${t*(n+5)*13%90}" r="1.1" fill="#fff"/>`).join(``):``,m=Array.from({length:16},(e,t)=>`<rect x="${t*20}" y="172" width="20" height="8" fill="${a[(t+o(1,6))%a.length]}"/>`).join(``);return`<svg class="illustration" viewBox="0 0 320 180" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="${l}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${n.ciel[0]}"/><stop offset="1" stop-color="${n.ciel[1]}"/></linearGradient></defs>
    <rect width="320" height="180" fill="url(#${l})"/>${p}
    <circle cx="${s}" cy="${c}" r="20" fill="${n.astre}"/>
    <path d="${u}" fill="${n.loin}"/>
    <g fill="${n.pres}">${f}</g>
    <path d="M0 160 Q 90 ${146+o(2,10)} 180 158 T 320 150 V180 H0 Z" fill="${n.pres}"/>
    ${m}
  </svg>`}function s(r,{regionNom:i,langues:a}){let s=Object.keys(r.audio).map(e=>a[e]).join(`, `),c=n.estTermine(r.id);return`<li class="carte-recit">
    <a href="#/recit/${r.id}">
      ${o(r)}
      <div class="carte-recit-corps">
        <p class="etiquettes"><span class="etiquette type-${r.type}">${t[r.type].nom}</span>${r.jouable?`<span class="etiquette jouable">▶ Jouable</span>`:``}${c?`<span class="etiquette fini">✓ Terminé</span>`:``}</p>
        <h2>${e(r.titre)}</h2>
        <p class="meta">${e(i)} · ${e(r.peuple)}</p>
        ${s?`<p class="meta">Audio : ${e(s)}</p>`:``}
      </div>
    </a>
  </li>`}export{s as t};