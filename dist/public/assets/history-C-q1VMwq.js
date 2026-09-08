import{a as q,G as T,b as B,r as k,j as e,e as M,L as R}from"./index-DlaJTQwz.js";import{u as f}from"./useQuery-Ced6SNce.js";import{g as H}from"./countries-D0mDAtBf.js";import{C as K}from"./chevron-left-DzI-mwb2.js";import{R as _}from"./refresh-cw-CLRHEkBM.js";const b="/assets/nodata-da225bbb_(1)_1783249133513-DaJAjPYJ.png",w="#43cf18",O="#f8f8ff",Q=(s,i,c)=>{const r=new Date(c),a=String(r.getFullYear()).slice(2),d=String(r.getMonth()+1).padStart(2,"0"),l=String(r.getDate()).padStart(2,"0"),h=String(r.getHours()).padStart(2,"0"),g=String(r.getMinutes()).padStart(2,"0"),u=String(i).padStart(4,"0");return`sdk${a}${d}${l}${h}${g}${s}${u}`},A=s=>{const i=s.sendavapayReference||s.omnipayReference||s.omnipayId||s.soleaspayReference||s.soleaspayOrderId;return i?i.startsWith("sdk")?i:`sdk${i}`:Q("D",s.id,s.createdAt)},V=s=>s.length<=6?s:`${s.slice(0,2)}****${s.slice(-4)}`,j=s=>{const i=new Date(s),c=String(i.getDate()).padStart(2,"0"),r=String(i.getMonth()+1).padStart(2,"0"),a=i.getFullYear(),d=String(i.getHours()).padStart(2,"0"),l=String(i.getMinutes()).padStart(2,"0"),h=String(i.getSeconds()).padStart(2,"0");return`${c}/${r}/${a} ${d}:${l}:${h}`},C=s=>{switch(s){case"completed":case"approved":return{label:"Paiement réussi",color:w};case"rejected":return{label:"Paiement échoué",color:"#e33d3d"};case"processing":return{label:"En traitement",color:"#d98208"};default:return{label:"En attente...",color:"#d98208"}}},G=s=>{switch(s.type){case"bonus":return s.description==="Bonus quotidien"?"Bonus quotidien":s.description;case"signup_bonus":return"Bonus d'inscription";case"task_reward":return"Récompense";case"commission":return"Commission";case"deposit":return"Dépôt";default:return s.description}},p=({label:s,value:i})=>e.jsxs("div",{className:"history-row",children:[e.jsx("span",{children:s}),e.jsx("span",{children:i})]}),v=({label:s,color:i})=>e.jsx("span",{className:"history-status",style:{backgroundColor:i},children:s});function Z(){const{user:s,refreshUser:i}=q(),c=T(),{toast:r}=B(),[a,d]=k.useState("withdrawals"),[l,h]=k.useState(null),g=!!s?.isAdmin,u=s?H(s.country):null,x=u?.currency==="XOF"||u?.currency==="XAF"?"FCFA":u?.currency||"FCFA",{data:N=[],isLoading:L}=f({queryKey:["/api/deposits/history"]}),{data:$=[],isLoading:D}=f({queryKey:["/api/withdrawals/history"]}),{data:F=[],isLoading:z}=f({queryKey:["/api/transactions"]}),I=t=>(t.status==="pending"||t.status==="processing")&&!!(t.soleaspayReference||t.soleaspayOrderId||t.omnipayId||t.omnipayReference||t.sendavapayReference),P=async t=>{h(t);try{const n=await(await fetch(`/api/deposits/${t}/verify`,{credentials:"include"})).json();n.status==="approved"?(r({title:"Paiement confirmé",description:"Votre compte a été crédité"}),i(),c.invalidateQueries({queryKey:["/api/deposits/history"]})):n.status==="rejected"?(r({title:"Paiement échoué",description:"Le paiement a été refusé",variant:"destructive"}),c.invalidateQueries({queryKey:["/api/deposits/history"]})):r({title:"En cours",description:"Le paiement est toujours en attente"})}catch{r({title:"Erreur",description:"Impossible de vérifier le paiement",variant:"destructive"})}finally{h(null)}};if(!s)return null;const S=[...F,{id:-1,userId:s.id,type:"registration",amount:"0",description:"Inscription",createdAt:s.createdAt}].sort((t,o)=>new Date(o.createdAt).getTime()-new Date(t.createdAt).getTime()),E=a==="balance"?z:a==="deposits"?L:D;return e.jsxs("main",{className:"history-page",children:[e.jsx("style",{children:`
        .history-page {
          width: 100%;
          min-height: 100dvh;
          overflow-x: hidden;
          background: #fff;
          color: #101010;
          font-family: Arial, sans-serif;
        }
        .history-page *,
        .history-page *::before,
        .history-page *::after {
          box-sizing: border-box;
        }
        .history-screen {
          width: 100%;
          max-width: 500px;
          min-height: 100dvh;
          margin: 0 auto;
          background: #fff;
        }
        .history-header {
          position: relative;
          display: flex;
          height: 66px;
          align-items: center;
          padding: 8px 20px 0;
        }
        .history-back {
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          border: 0;
          padding: 0;
          background: transparent;
          color: #171717;
        }
        .history-back svg {
          width: 25px;
          height: 25px;
          stroke-width: 1.9;
        }
        .history-title {
          position: absolute;
          right: 55px;
          left: 55px;
          margin: 0;
          color: #111;
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
          text-align: center;
        }
        .history-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr 1.12fr;
          gap: 4px;
          align-items: center;
          min-height: 61px;
          padding: 4px 9px 13px;
        }
        .history-tab {
          display: flex;
          min-width: 0;
          height: 42px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          border-radius: 6px;
          padding: 0 7px;
          background: transparent;
          color: #333;
          font-size: 16px;
          font-weight: 400;
          line-height: 1;
          white-space: nowrap;
        }
        .history-tab.active {
          background: #242625;
          color: #fff;
          font-weight: 700;
        }
        .history-tab-arrow {
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 7px solid #111;
        }
        .history-tab-arrow.right {
          border-left-color: #e12626;
        }
        .history-tab-arrow.left {
          transform: rotate(180deg);
        }
        .history-content {
          min-height: calc(100dvh - 127px);
          padding: 9px 16px 40px;
          background: #fff;
        }
        .history-list {
          display: grid;
          gap: 20px;
        }
        .history-card {
          width: 100%;
          min-height: 146px;
          overflow: hidden;
          border-radius: 7px;
          padding: 10px 18px 11px;
          background: ${O};
          box-shadow: 0 1px 5px rgba(42, 44, 88, .045);
        }
        .history-card-top {
          display: flex;
          min-height: 29px;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .history-amount {
          margin: 0;
          color: #111;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.15;
        }
        .history-card-label {
          margin: 7px 0 0;
          color: #111;
          font-size: 16px;
          line-height: 1.15;
        }
        .history-status {
          display: inline-flex;
          min-height: 31px;
          align-items: center;
          flex: 0 0 auto;
          border-radius: 17px;
          padding: 0 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
        .history-divider {
          height: 1px;
          margin: 13px 0 5px;
          background: #8d8d8d;
        }
        .history-row {
          display: flex;
          min-height: 21px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #111;
          font-size: 14px;
          line-height: 1.2;
        }
        .history-row > span:last-child {
          text-align: right;
          white-space: nowrap;
        }
        .history-empty {
          display: flex;
          min-height: 280px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #999;
          font-size: 14px;
        }
        .history-empty img {
          width: 112px;
          height: 112px;
          object-fit: contain;
        }
        .history-verify {
          width: 100%;
          margin-top: 10px;
          border: 0;
          border-radius: 18px;
          padding: 9px 12px;
          background: ${w};
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }
        @media (max-width: 370px) {
          .history-header { height: 62px; padding-top: 6px; }
          .history-title { font-size: 19px; }
          .history-tabs { min-height: 58px; padding-bottom: 11px; }
          .history-tab { font-size: 14px; }
          .history-content { min-height: calc(100dvh - 120px); padding-right: 16px; padding-left: 16px; }
          .history-card { padding-right: 18px; padding-left: 18px; }
          .history-card-label { font-size: 15px; }
          .history-status { font-size: 12px; padding-right: 8px; padding-left: 8px; }
          .history-row { font-size: 13px; }
        }
      `}),e.jsxs("div",{className:"history-screen",children:[e.jsxs("header",{className:"history-header",children:[e.jsx(M,{href:"/account",children:e.jsx("button",{className:"history-back","data-testid":"button-back","aria-label":"Retour",children:e.jsx(K,{"aria-hidden":"true"})})}),e.jsx("h1",{className:"history-title",children:"Enregistrements de fonds"})]}),e.jsxs("nav",{className:"history-tabs","aria-label":"Type d'enregistrement",children:[e.jsxs("button",{className:`history-tab ${a==="balance"?"active":""}`,onClick:()=>d("balance"),"data-testid":"tab-balance",children:[e.jsx("span",{children:"Solde"}),e.jsx("span",{className:`history-tab-arrow ${a==="balance"?"right":"left"}`,"aria-hidden":"true"})]}),e.jsxs("button",{className:`history-tab ${a==="deposits"?"active":""}`,onClick:()=>d("deposits"),"data-testid":"tab-deposits",children:[e.jsx("span",{children:"Dépôt"}),e.jsx("span",{className:`history-tab-arrow ${a==="deposits"?"right":"left"}`,"aria-hidden":"true"})]}),e.jsxs("button",{className:`history-tab ${a==="withdrawals"?"active":""}`,onClick:()=>d("withdrawals"),"data-testid":"tab-withdrawals",children:[e.jsx("span",{children:"Retrait"}),e.jsx("span",{className:"history-tab-arrow right","aria-hidden":"true"})]})]}),e.jsx("section",{className:"history-content","aria-live":"polite",children:E?e.jsx("div",{className:"history-empty",children:e.jsx(R,{className:"animate-spin"})}):a==="balance"?S.length>0?e.jsx("div",{className:"history-list",children:S.map(t=>{const o=Number.parseFloat(t.amount||"0"),n=t.type==="registration";return e.jsxs("article",{className:"history-card","data-testid":`balance-item-${t.id}`,children:[e.jsxs("div",{className:"history-card-top",children:[e.jsxs("div",{children:[e.jsx("p",{className:"history-amount",children:n?"—":`+${x} ${o.toLocaleString("fr-FR")}`}),e.jsx("p",{className:"history-card-label",children:t.type==="deposit"?"Dépôt":t.description})]}),e.jsx(v,{label:"Paiement réussi",color:w})]}),e.jsx("div",{className:"history-divider"}),e.jsx(p,{label:"Type :",value:n?"Inscription":G(t)}),e.jsx(p,{label:"Heure :",value:j(t.createdAt)})]},`${t.type}-${t.id}`)})}):e.jsxs("div",{className:"history-empty",children:[e.jsx("img",{src:b,alt:"Aucune donnée"}),e.jsx("span",{children:"Plus de données"})]}):a==="deposits"?N.length>0?e.jsx("div",{className:"history-list",children:N.map(t=>{const{label:o,color:n}=C(t.status),m=Number.parseFloat(t.amount),y=g?A(t):V(A(t));return e.jsxs("article",{className:"history-card","data-testid":`deposit-item-${t.id}`,children:[e.jsxs("div",{className:"history-card-top",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"history-amount",children:[x," ",m.toLocaleString("fr-FR")]}),e.jsx("p",{className:"history-card-label",children:"Montant du dépôt"})]}),e.jsx(v,{label:o,color:n})]}),e.jsx("div",{className:"history-divider"}),e.jsx(p,{label:"Numéro :",value:y}),e.jsx(p,{label:"Heure du dépôt :",value:j(t.createdAt)}),I(t)&&!t.sendavapayReference?e.jsxs("button",{className:"history-verify",onClick:()=>P(t.id),disabled:l===t.id,"data-testid":`button-verify-${t.id}`,children:[l===t.id?e.jsx(R,{className:"inline animate-spin"}):e.jsx(_,{className:"mr-1 inline h-3 w-3"}),"Vérifier la transaction"]}):null]},t.id)})}):e.jsxs("div",{className:"history-empty",children:[e.jsx("img",{src:b,alt:"Aucune donnée"}),e.jsx("span",{children:"Plus de données"})]}):$.length>0?e.jsx("div",{className:"history-list",children:$.map(t=>{const{label:o,color:n}=C(t.status),m=Number.parseFloat(t.amount),y=Number.parseFloat(t.netAmount||t.amount);return e.jsxs("article",{className:"history-card","data-testid":`withdrawal-item-${t.id}`,children:[e.jsxs("div",{className:"history-card-top",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"history-amount",children:[x," ",m.toLocaleString("fr-FR")]}),e.jsx("p",{className:"history-card-label",children:"Montant du retrait"})]}),e.jsx(v,{label:o,color:n})]}),e.jsx("div",{className:"history-divider"}),e.jsx(p,{label:"Montant reçu :",value:`${x} ${y.toLocaleString("fr-FR")}`}),e.jsx(p,{label:"Heure du retrait :",value:j(t.createdAt)})]},t.id)})}):e.jsxs("div",{className:"history-empty",children:[e.jsx("img",{src:b,alt:"Aucune donnée"}),e.jsx("span",{children:"Plus de données"})]})})]})]})}export{Z as default};
