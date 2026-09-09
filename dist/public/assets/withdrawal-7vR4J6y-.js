import{a as E,b as $,G as P,r as d,u as D,j as e,L as v,e as y,f as K}from"./index-BZtyZonK.js";import{u as w}from"./useQuery-TCRHvdEh.js";import{u as O}from"./useMutation-DiRpgpJ7.js";import{g as V}from"./countries-DOninoG6.js";import{h as N}from"./20260410_193219_1787363717022-BPGkEb2R.js";import{C as T}from"./chevron-right-CtHEy5_G.js";const G="/assets/IMG-20260821-WA0161_1787357237688-D8C2A4Ko.jpg",k="/assets/t%C3%A9l%C3%A9chargement_(80)_1787363581764-DIwCG-l1.png";function Z(){const{user:o,refreshUser:C}=E(),{toast:i}=$(),z=P(),[n,m]=d.useState(""),[r,f]=d.useState(null),[,I]=D(),x=(o?V(o.country):null)?.currency||"XOF",l=x==="FCFA"?"XOF":x,{data:c}=w({queryKey:["/api/settings/withdrawal"],staleTime:0,refetchOnMount:!0}),h=c?.minWithdrawal??1500,u=c?.withdrawalFees??18,g=c?.withdrawalStartHour??9,b=c?.withdrawalEndHour??17,F=n?Math.floor(Number(n)*(1-u/100)):0,j=new Date().getHours(),S=j>=g&&j<b,{data:a=[],isLoading:W}=w({queryKey:["/api/wallets"],refetchOnWindowFocus:!0}),{data:R=[]}=w({queryKey:["/api/user/products"]}),L=R.some(t=>t.status==="active");d.useEffect(()=>{const t=localStorage.getItem("selectedWalletId");if(t&&a.length>0){const s=a.find(H=>H.id===parseInt(t));s&&f(s),localStorage.removeItem("selectedWalletId")}},[a]),d.useEffect(()=>{if(!r&&a.length>0){const t=a.find(s=>s.isDefault);t&&f(t)}},[a,r]);const p=O({mutationFn:async t=>(await K("POST","/api/withdrawals",t)).json(),onSuccess:()=>{i({title:"Demande envoyée",description:"Votre demande de retrait a été envoyée."}),C(),z.invalidateQueries({queryKey:["/api/withdrawals"]}),m("")},onError:t=>{i({title:"Erreur",description:t.message,variant:"destructive"})}}),M=()=>{if(!S){i({title:"Horaires de retrait",description:`Les retraits sont disponibles de ${g}h à ${b}h`,variant:"destructive"});return}if(!L){i({title:"Produit requis",description:"Vous devez avoir un produit actif pour effectuer un retrait",variant:"destructive"});return}if(!n||n<h){i({title:"Montant invalide",description:`Le montant minimum est de ${h} ${l}`,variant:"destructive"});return}if(!r){i({title:"Compte requis",description:"Veuillez sélectionner un compte bancaire",variant:"destructive"});return}p.mutate({amount:Number(n),walletId:r.id})};if(W)return e.jsx("div",{className:"min-h-screen bg-white flex items-center justify-center",children:e.jsx(v,{className:"w-8 h-8 animate-spin text-[#00CC2C]"})});if(!o)return null;const q=parseFloat(o?.balance||"0"),A=a.length>0;return e.jsxs("main",{className:"withdraw-reference min-h-screen bg-[#f7f4f2]",children:[e.jsx("style",{children:`
        .withdraw-reference {
          color: #151515;
          font-family: Inter, Arial, sans-serif;
        }
        .withdraw-reference .withdraw-screen {
          width: 100%;
          max-width: 500px;
          min-height: 100vh;
          margin: 0 auto;
          overflow: hidden;
          background: #f7f4f2;
        }
        .withdraw-reference .withdraw-hero {
          position: relative;
          height: min(70.7vw, 354px);
          min-height: 283px;
          background: #ffca2b;
        }
        .withdraw-reference .history-button {
          position: absolute;
          z-index: 3;
          top: 14px;
          right: 16px;
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          border: 0;
          border-radius: 12px;
          background: rgba(255,255,255,.24);
        }
        .withdraw-reference .history-icon {
          width: 30px;
          height: 30px;
          background: #3174d1;
          -webkit-mask-image: url("${N}");
          mask-image: url("${N}");
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: contain;
          mask-size: contain;
        }
        .withdraw-reference .hero-art {
          width: 100%;
          height: min(36.65vw, 183px);
          overflow: hidden;
        }
        .withdraw-reference .hero-art img {
          width: 100%;
          height: auto;
          transform: translateY(-10.55%);
          pointer-events: none;
        }
        .withdraw-reference .withdraw-back {
          position: absolute;
          top: 85px;
          left: 24px;
          width: 40px;
          height: 40px;
        }
        .withdraw-reference .balance-card {
          position: absolute;
          top: min(36.45vw, 182px);
          right: 16px;
          left: 16px;
          height: 160px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,.88);
          border-radius: 10px;
          background: linear-gradient(110deg, #ffd45d 0%, #ffe69a 100%);
          box-shadow: 0 1px 2px rgba(202,151,0,.1);
        }
        .withdraw-reference .balance-label {
          margin: 29px 0 0 15px;
          color: #eb7123;
          font-size: 23px;
          font-weight: 800;
          line-height: 1;
        }
        .withdraw-reference .balance-value {
          margin: 20px 0 0 15px;
          color: #f36d17;
          font-size: 43px;
          font-weight: 800;
          line-height: .9;
        }
        .withdraw-reference .balance-value span {
          margin-left: 3px;
          font-size: 28px;
        }
        .withdraw-reference .wallet-mark {
          position: absolute;
          top: 14px;
          right: 14px;
          display: grid;
          width: 109px;
          height: 109px;
          place-items: center;
          border-radius: 50%;
          background: white;
        }
        .withdraw-reference .wallet-mark img {
          width: 67px;
          height: 67px;
          object-fit: contain;
        }
        .withdraw-reference .amount-panel {
          min-height: 154px;
          padding: 25px 35px 16px;
          background: white;
        }
        .withdraw-reference .amount-label {
          margin: 0 0 7px 9px;
          color: #c98e41;
          font-size: 16px;
          font-weight: 400;
        }
        .withdraw-reference .amount-field {
          display: flex;
          height: 54px;
          align-items: center;
          overflow: hidden;
          border-radius: 12px;
          background: #f3f0ee;
        }
        .withdraw-reference .amount-field input {
          width: 100%;
          min-width: 0;
          height: 100%;
          padding: 0 21px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #656565;
          font-size: 19px;
        }
        .withdraw-reference .amount-field input::placeholder { color: #777; opacity: 1; }
        .withdraw-reference .amount-currency {
          padding-right: 20px;
          color: #767676;
          font-size: 24px;
        }
        .withdraw-reference .amount-details {
          display: flex;
          justify-content: space-between;
          margin-top: 14px;
          color: #191919;
          font-size: 14px;
        }
        .withdraw-reference .wallet-choice {
          display: flex;
          width: calc(100% - 32px);
          height: 53px;
          align-items: center;
          margin: 12px 16px 0;
          padding: 0 17px;
          border-radius: 5px;
          background: linear-gradient(112deg, #00CC2C 0%, #009d22 100%);
          color: white;
          text-align: left;
          box-shadow: 0 1px 2px rgba(214,153,0,.15);
        }
        .withdraw-reference .wallet-choice img {
          width: 34px;
          height: 34px;
          margin-right: 10px;
          object-fit: contain;
        }
        .withdraw-reference .wallet-choice svg:last-child {
          width: 22px;
          height: 22px;
          margin-left: auto;
        }
        .withdraw-reference .wallet-copy {
          overflow: hidden;
          font-size: 16px;
          font-weight: 400;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .withdraw-reference .instructions {
          padding: 28px 9px 20px;
        }
        .withdraw-reference .instructions-title {
          margin-bottom: 29px;
          font-size: 17px;
          font-weight: 800;
        }
        .withdraw-reference .instructions-title::before {
          content: "💸";
          margin-right: 8px;
          font-size: 17px;
        }
        .withdraw-reference .instruction {
          position: relative;
          margin: 0 0 26px 28px;
          font-size: 17px;
          font-weight: 500;
          line-height: 1.65;
        }
        .withdraw-reference .instruction::before {
          content: "◆";
          position: absolute;
          top: 2px;
          left: -19px;
          color: #579ad8;
          font-size: 9px;
        }
        .withdraw-reference .instruction strong { font-weight: 800; }
        .withdraw-reference .submit {
          display: flex;
          width: calc(100% - 48px);
          min-height: 57px;
          align-items: center;
          justify-content: center;
          margin: 4px 24px 35px;
          border-radius: 29px;
          background: linear-gradient(112deg, #00CC2C 0%, #009d22 100%);
          color: white;
          font-size: 17px;
          font-weight: 600;
        }
        .withdraw-reference .submit:disabled { opacity: .6; }
        @media (max-width: 360px) {
          .withdraw-reference .balance-card { right: 10px; left: 10px; }
          .withdraw-reference .wallet-mark { transform: scale(.82); transform-origin: top right; }
          .withdraw-reference .balance-label { font-size: 20px; }
          .withdraw-reference .balance-value { font-size: 37px; }
          .withdraw-reference .amount-panel { padding-right: 25px; padding-left: 25px; }
          .withdraw-reference .instruction { font-size: 15px; }
        }
      `}),e.jsxs("div",{className:"withdraw-screen",children:[e.jsxs("section",{className:"withdraw-hero","aria-label":"Retrait",children:[e.jsx("div",{className:"hero-art",children:e.jsx("img",{src:G,alt:""})}),e.jsx(y,{href:"/history",children:e.jsx("button",{className:"history-button","aria-label":"Historique des transactions",children:e.jsx("span",{className:"history-icon","aria-hidden":"true"})})}),e.jsx(y,{href:"/account",children:e.jsx("button",{className:"withdraw-back","data-testid":"button-back","aria-label":"Retour"})}),e.jsxs("div",{className:"balance-card",children:[e.jsx("p",{className:"balance-label",children:"Solde du compte"}),e.jsxs("p",{className:"balance-value","data-testid":"text-balance",children:[Math.round(q).toLocaleString("fr-FR"),e.jsx("span",{children:l})]}),e.jsx("div",{className:"wallet-mark","aria-hidden":"true",children:e.jsx("img",{src:k,alt:""})})]})]}),e.jsxs("section",{className:"amount-panel","aria-label":"Montant de retrait",children:[e.jsx("p",{className:"amount-label",children:"Veuillez saisir le montant de retrait"}),e.jsxs("label",{className:"amount-field",children:[e.jsx("input",{type:"number",value:n,onChange:t=>m(t.target.value?Number(t.target.value):""),placeholder:"montant","data-testid":"input-withdrawal-amount","aria-label":"Montant de retrait"}),e.jsx("span",{className:"amount-currency",children:l})]}),e.jsxs("div",{className:"amount-details",children:[e.jsxs("span",{children:["Montant reçu: ",F.toLocaleString("fr-FR")]}),e.jsxs("span",{children:["Taxe: ",u.toFixed(2),"%"]})]})]}),e.jsxs("button",{onClick:()=>I(A?"/wallet?from=withdrawal":"/wallet"),className:"wallet-choice","data-testid":"button-select-wallet",children:[e.jsx("img",{src:k,alt:""}),e.jsx("span",{className:"wallet-copy",children:r?`${r.accountName} · ${r.accountNumber}`:"Choisissez votre portefeuille"}),e.jsx(T,{"aria-hidden":"true"})]}),e.jsx("button",{onClick:M,disabled:p.isPending,className:"submit","data-testid":"button-submit-withdrawal",children:p.isPending?e.jsx(v,{className:"h-5 w-5 animate-spin"}):"Retirez votre argent maintenant"}),e.jsxs("section",{className:"instructions","aria-label":"Instructions de retrait",children:[e.jsx("h2",{className:"instructions-title",children:"Instructions de Retrait :"}),e.jsxs("p",{className:"instruction",children:[e.jsx("strong",{children:"Montant minimum de retrait :"})," ",h.toLocaleString("fr-FR")," ",l]}),e.jsxs("p",{className:"instruction",children:[e.jsx("strong",{children:"Retraits possibles à tout moment,"})," sans limite de temps, de montant ou de fréquence"]}),e.jsxs("p",{className:"instruction",children:[e.jsx("strong",{children:"Frais de retrait :"})," ",u," % par transaction"]}),e.jsxs("p",{className:"instruction",children:[e.jsx("strong",{children:"Délai de traitement :"})," généralement dans les 2 heures, et exceptionnellement sous 24 heures."]}),e.jsx("p",{className:"instruction",children:"Vérifiez vos informations de portefeuille avant de soumettre votre demande."})]})]})]})}export{Z as default};
