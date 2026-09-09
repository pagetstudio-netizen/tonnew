import{a as x,b as u,u as g,j as e,L as f,q as l,f as m}from"./index-BZtyZonK.js";import{u as b}from"./useQuery-TCRHvdEh.js";import{u as k}from"./useMutation-DiRpgpJ7.js";import{g as w}from"./countries-DOninoG6.js";import{t as v}from"./images_(25)_1787362692989-B89UW5lb.js";import{C as j}from"./chevron-left-Cv7KrZWr.js";const y="/assets/images_(72)_1787362692942-DCzyL_pY.jpeg";function E(){const{user:c}=x(),{toast:s}=u(),[,h]=g(),{data:i}=b({queryKey:["/api/daily-bonus-status"],refetchInterval:6e4}),t=k({mutationFn:async()=>{const n=await m("POST","/api/claim-daily-bonus",{});if(!n.ok){const p=await n.json();throw new Error(p.message||"Erreur")}return n.json()},onSuccess:()=>{l.invalidateQueries({queryKey:["/api/daily-bonus-status"]}),l.invalidateQueries({queryKey:["/api/user"]}),s({title:"Bonus reçu !",description:"50 FCFA ajoutés à votre solde"})},onError:n=>{s({title:"Erreur",description:n.message,variant:"destructive"})}});if(!c)return null;const r=w(c.country)?.currency||"XOF",o=i?.totalBonusClaimed||0,a=!!i?.canClaim,d=n=>`${Math.round(n).toLocaleString("fr-FR")}${r}`;return e.jsxs("main",{className:"checkin-reference min-h-full bg-[#f4f4f4] pb-20",children:[e.jsx("style",{children:`
        .checkin-reference {
          color: #171717;
          font-family: Inter, Arial, sans-serif;
        }
        .checkin-reference .checkin-screen {
          width: 100%;
          max-width: 500px;
          min-height: 100%;
          margin: 0 auto;
          overflow: hidden;
          background: #f4f4f4;
        }
        .checkin-reference .hero {
          position: relative;
          height: min(61.4vw, 307px);
          min-height: 245px;
          overflow: hidden;
          background: #77cdeb;
        }
        .checkin-reference .hero-art {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: min(49.9vw, 250px);
          overflow: hidden;
        }
        .checkin-reference .hero-art::after {
          position: absolute;
          z-index: 1;
          inset: 0;
          background: linear-gradient(180deg, rgba(34, 151, 219, .12), rgba(35, 112, 198, .2));
          content: "";
          pointer-events: none;
        }
        .checkin-reference .hero-art img {
          position: relative;
          z-index: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          pointer-events: none;
        }
        .checkin-reference .back {
          position: absolute;
          z-index: 3;
          top: 12px;
          left: 34px;
          display: grid;
          width: 68px;
          height: 39px;
          place-items: center;
          border-radius: 22px;
          background: #3776cf;
          color: white;
          box-shadow: 0 1px 2px rgba(0,0,0,.08);
        }
        .checkin-reference .back svg {
          width: 23px;
          height: 23px;
          stroke-width: 4;
        }
        .checkin-reference .hero-title {
          position: absolute;
          z-index: 2;
          top: 30px;
          left: 0;
          width: 100%;
          color: white;
          font-size: 25px;
          font-weight: 400;
          line-height: 1;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0,0,0,.1);
        }
        .checkin-reference .avatar {
          position: absolute;
          z-index: 3;
          top: 73px;
          left: 50%;
          width: 126px;
          height: 126px;
          overflow: hidden;
          border: 4px solid white;
          border-radius: 50%;
          background-image: url("${v}");
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,.12);
          transform: translateX(-50%);
        }
        .checkin-reference .earnings-card {
          position: relative;
          z-index: 4;
          height: 298px;
          margin: -28px 16px 0;
          overflow: hidden;
          border-radius: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,.01);
        }
        .checkin-reference .earned-total {
          padding-top: 9px;
          color: #070707;
          font-size: 29px;
          font-weight: 800;
          line-height: 1.1;
          text-align: center;
        }
        .checkin-reference .earned-heading {
          margin-top: 10px;
          color: #424242;
          font-size: 20px;
          font-weight: 400;
          line-height: 1;
          text-align: center;
        }
        .checkin-reference .stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 78px;
        }
        .checkin-reference .stat {
          text-align: center;
        }
        .checkin-reference .stat-value {
          color: #2574cf;
          font-size: 35px;
          font-weight: 800;
          letter-spacing: -.8px;
          line-height: 1;
        }
        .checkin-reference .stat-value span {
          padding-left: 4px;
          font-size: 23px;
        }
        .checkin-reference .stat-value.secondary {
          font-size: 35px;
          font-weight: 400;
        }
        .checkin-reference .stat-label {
          margin-top: 15px;
          color: #3471a1;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
        }
        .checkin-reference .claim {
          display: flex;
          width: calc(100% - 96px);
          height: 62px;
          align-items: center;
          justify-content: center;
          margin: 14px 48px 0;
          border-radius: 34px;
          background: #3174d1;
          color: white;
          font-size: 26px;
          font-weight: 400;
          line-height: 1;
          box-shadow: 0 2px 3px rgba(31,90,174,.16);
        }
        .checkin-reference .claim:disabled {
          background: #a4a4a4;
          color: rgba(255,255,255,.9);
          box-shadow: none;
        }
        .checkin-reference .claim svg {
          width: 24px;
          height: 24px;
        }
        .checkin-reference .next-claim {
          margin-top: 10px;
          color: #777;
          font-size: 12px;
          text-align: center;
        }
        @media (max-width: 360px) {
          .checkin-reference .back { left: 20px; }
          .checkin-reference .hero-title { font-size: 22px; }
          .checkin-reference .avatar { width: 112px; height: 112px; }
          .checkin-reference .earnings-card { margin-right: 10px; margin-left: 10px; }
          .checkin-reference .claim { width: calc(100% - 64px); margin-right: 32px; margin-left: 32px; }
          .checkin-reference .stat-label { font-size: 11px; }
        }
      `}),e.jsxs("div",{className:"checkin-screen",children:[e.jsxs("section",{className:"hero","aria-label":"Check-in quotidien",children:[e.jsx("div",{className:"hero-art",children:e.jsx("img",{src:y,alt:""})}),e.jsx("button",{className:"back",onClick:()=>h("/"),children:e.jsx(j,{"aria-hidden":"true"})}),e.jsx("h1",{className:"hero-title",children:"Check-in"}),e.jsx("div",{className:"avatar","aria-hidden":"true"})]}),e.jsxs("section",{className:"earnings-card","aria-label":"Revenus du check-in",children:[e.jsx("p",{className:"earned-total",children:d(o)}),e.jsx("p",{className:"earned-heading",children:"Revenus cumulés"}),e.jsxs("div",{className:"stats",children:[e.jsxs("div",{className:"stat",children:[e.jsxs("p",{className:"stat-value",children:["50",e.jsx("span",{children:r})]}),e.jsx("p",{className:"stat-label",children:"Revenus du check-in quotidien"})]}),e.jsxs("div",{className:"stat",children:[e.jsxs("p",{className:"stat-value secondary",children:[Math.round(o),e.jsx("span",{children:r})]}),e.jsx("p",{className:"stat-label",children:"Revenus cumulés"})]})]})]}),e.jsx("button",{className:"claim",onClick:()=>t.mutate(),disabled:!a||t.isPending,"data-testid":"button-pointer",children:t.isPending?e.jsx(f,{className:"animate-spin"}):a?"Check-in":`${i?.hoursRemaining||0}h`}),!a&&i?.hoursRemaining?e.jsxs("p",{className:"next-claim",children:["Prochain check-in dans ",i.hoursRemaining,"h"]}):null]})]})}export{E as default};
