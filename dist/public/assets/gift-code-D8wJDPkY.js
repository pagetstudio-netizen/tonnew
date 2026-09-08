import{a as l,b as d,r as p,j as e,e as u,L as h,f as m}from"./index-BIwQnpPu.js";import{u as x}from"./useQuery-DAnbtRi1.js";import{u as b}from"./useMutation-BOExnpSA.js";import{C as j}from"./chevron-right-CZIHCcb9.js";const w="/assets/IMG-20260821-WA0140_1787390560133-7fET19PL.jpg",y="/assets/tg-1_1787367952311-7lN49whF.png";function N(){const{refreshUser:o}=l(),{toast:i}=d(),[r,n]=p.useState(""),{data:f}=x({queryKey:["/api/settings"]}),a=b({mutationFn:async t=>{const s=await m("POST","/api/gift-codes/claim",{code:t});if(!s.ok){const g=await s.json();throw new Error(g.message||"Erreur")}return s.json()},onSuccess:t=>{o(),n(""),i({title:"Félicitations !",description:t.message})},onError:t=>{i({title:"Erreur",description:t.message,variant:"destructive"})}}),c=()=>{if(!r.trim()){i({title:"Erreur",description:"Veuillez saisir un code",variant:"destructive"});return}a.mutate(r.trim())};return e.jsxs("main",{className:"gift-reference",children:[e.jsx("style",{children:`
        .gift-reference { min-height: 100dvh; background: #f3f3f3; color: #151515; font-family: Arial, sans-serif; }
        .gift-reference *, .gift-reference *::before, .gift-reference *::after { box-sizing: border-box; }
        .gift-reference .gift-screen { width: 100%; max-width: 512px; min-height: 100dvh; margin: 0 auto; background: #f3f3f3; }
        .gift-reference .gift-title { height: 80px; display: flex; align-items: center; padding: 0 38px; background: #fff; border-bottom: 1px solid #ddd; }
        .gift-reference .gift-title a { color: #37434b; font-size: 38px; line-height: 1; text-decoration: none; }
         .gift-reference .gift-title h1 { flex: 1; margin: 0; color: #00CC2C; font-size: 21px; font-weight: 700; text-align: center; }
        .gift-reference .gift-hero { display: block; width: 100%; height: auto; aspect-ratio: 461 / 292; object-fit: cover; }
        .gift-reference .gift-description { height: 58px; display: flex; align-items: center; padding: 0 21px; background: #f8f8f8; color: #555; font-size: 17px; }
        .gift-reference .gift-telegram { height: 93px; display: flex; align-items: center; padding: 0 21px; background: #fff; border-bottom: 1px solid #eee; text-decoration: none; }
        .gift-reference .gift-telegram img { width: 56px; height: 56px; margin-right: 15px; object-fit: contain; }
        .gift-reference .gift-telegram strong { flex: 1; color: #171717; font-size: 19px; }
        .gift-reference .gift-telegram svg { width: 22px; height: 22px; color: #aaa; stroke-width: 2; }
        .gift-reference .gift-form { padding: 29px 21px 0; }
        .gift-reference .gift-label { display: block; margin-bottom: 17px; color: #151515; font-size: 19px; font-weight: 700; }
         .gift-reference .gift-label::first-letter { color: #00CC2C; }
        .gift-reference .gift-input { display: block; width: 100%; height: 67px; border: 0; border-radius: 8px; padding: 0 21px; outline: 0; background: #e9e9eb; color: #333; font-size: 16px; }
        .gift-reference .gift-input::placeholder { color: #a6a9b3; opacity: 1; }
         .gift-reference .gift-submit { display: block; width: calc(100% - 42px); height: 69px; margin: 37px auto 0; border: 0; border-radius: 36px; background: #00CC2C; color: white; font-size: 21px; font-weight: 700; box-shadow: 0 8px 18px rgba(0, 204, 44, .2); }
        .gift-reference .gift-submit:active { transform: scale(.98); }
        .gift-reference .gift-submit:disabled { opacity: .7; }
        @media (max-width: 370px) {
          .gift-reference .gift-description { font-size: 15px; }
          .gift-reference .gift-title h1 { font-size: 19px; }
        }
      `}),e.jsxs("div",{className:"gift-screen",children:[e.jsxs("header",{className:"gift-title",children:[e.jsx(u,{href:"/account","aria-label":"Retour",children:"‹"}),e.jsx("h1",{children:"Échanger un cadeau"})]}),e.jsx("img",{className:"gift-hero",src:w,alt:"Voiture électrique en recharge","data-testid":"img-gift-banner"}),e.jsx("p",{className:"gift-description",children:"Vous pouvez obtenir un code cadeau dans le groupe"}),e.jsxs("a",{className:"gift-telegram",href:f?.groupLink||"https://t.me/sybotx",target:"_blank",rel:"noreferrer",children:[e.jsx("img",{src:y,alt:""}),e.jsx("strong",{children:"Groupe officiel"}),e.jsx(j,{"aria-hidden":"true"})]}),e.jsxs("form",{className:"gift-form",onSubmit:t=>{t.preventDefault(),c()},children:[e.jsxs("label",{className:"gift-label",htmlFor:"gift-code-input",children:[e.jsx("span",{children:"* "}),"Code cadeau"]}),e.jsx("input",{id:"gift-code-input",className:"gift-input",type:"text",value:r,onChange:t=>n(t.target.value.toUpperCase()),placeholder:"Veuillez saisir le code cadeau","data-testid":"input-gift-code"}),e.jsx("button",{className:"gift-submit",type:"submit",disabled:a.isPending,"data-testid":"button-submit-code",children:a.isPending?e.jsx(h,{className:"mx-auto h-5 w-5 animate-spin"}):"Confirmer"})]})]})]})}export{N as default};
