import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import rechargeIcon from "@assets/20260822_002803_1787358527659.png";
import withdrawalIcon from "@assets/20260822_002744_1787358527799.png";
import supportIcon from "@assets/20260822_002731_1787358527833.png";
import checkinIcon from "@assets/20260822_002632_1787358527865.png";
import foxBanner from "@assets/téléchargement_-_2026-08-21T234856.376_1787356257166.png";
import zootopiaDuo from "@assets/20260822_002744_1787358732420.png";
import judy from "@assets/20260822_002731_1787358732448.png";
import sheep from "@assets/20260822_002632_1787358732474.png";
import homeHeroReference from "@assets/20260822_025245_1787367215372.png";
import welcomeImage from "@assets/20260415_134352_1787438067693.png";
import telegramGroupImage from "@assets/20260411_144546_1787438067855.png";
import closePopupImage from "@assets/20260411_144711_1787438067885.png";

const quickActions = [
  { label: "Recharger", href: "/deposit", icon: rechargeIcon, color: "#fff0b8" },
  { label: "Retrait", href: "/withdrawal", icon: withdrawalIcon, color: "#ffc3d2" },
  { label: "Aide", href: "/service", icon: supportIcon, color: "#a8e5f4" },
  { label: "Check-in", href: "/checkin", icon: checkinIcon, color: "#edc5f5" },
];

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const [welcomePopupOpen, setWelcomePopupOpen] = useState(false);

  useEffect(() => {
    if (settings) setWelcomePopupOpen(true);
  }, [settings]);

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "XOF";
  const balance = Number.parseFloat(user.balance || "0");
  const totalEarnings = Number.parseFloat(user.totalEarnings || "0");
  const noticeText = settings?.noticeText || "Bienvenue sur Stone by ton !";
  const groupLink = settings?.groupLink || "";
  const formatMoney = (amount: number) => `${Math.round(amount).toLocaleString("fr-FR")}${currency}`;

  return (
    <>
      <main className="reference-home min-h-full bg-[#f7f7f7] pb-[84px]">
      <style>{`
        .reference-home {
          color: #20232c;
          font-family: Inter, Arial, sans-serif;
        }
        .reference-home .screen {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          overflow: hidden;
          background: #f7f7f7;
        }
        .reference-home .hero {
          height: min(88.12vw, 441px);
          min-height: 300px;
          position: relative;
          overflow: hidden;
          background: transparent;
        }
        .reference-home .hero-reference {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .reference-home .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          padding: 39px 13px 28px;
          gap: 6px;
        }
        .reference-home .quick-action {
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          color: #333641;
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
        }
        .reference-home .quick-icon {
          display: grid;
          width: 62px;
          height: 62px;
          place-items: center;
          overflow: hidden;
          border-radius: 20px;
          box-shadow: inset 0 1px 2px rgba(255,255,255,.7), 0 2px 4px rgba(0,0,0,.04);
        }
        .reference-home .quick-icon img {
          width: 66px;
          height: 66px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .reference-home .transaction {
          display: flex;
          height: 50px;
          align-items: center;
          gap: 11px;
          margin: 0 11px;
          padding: 0 14px;
          overflow: hidden;
          border-radius: 6px;
          background: white;
          box-shadow: 0 1px 6px rgba(0,0,0,.025);
          color: #4d4d56;
          font-size: 15px;
          white-space: nowrap;
        }
        .reference-home .transaction-mark {
          display: grid;
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          place-items: center;
          border: 2px solid #272a2d;
          border-radius: 7px;
          color: #272a2d;
          font-size: 24px;
          font-weight: 300;
          line-height: 1;
        }
        .reference-home .transaction-text {
          display: block;
          width: 100%;
          min-width: 0;
          animation: home-notice-scroll 12s linear infinite;
          text-indent: 100%;
        }
        .reference-home .transaction-window {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
        }
        @keyframes home-notice-scroll {
          from { text-indent: 100%; }
          to { text-indent: -100%; }
        }
        .reference-home .checkin-banner {
          position: relative;
          height: 106px;
          margin: 13px 15px 0;
          overflow: hidden;
          border-radius: 21px;
          background: linear-gradient(112deg, #ffb333 0%, #ff9d29 100%);
          box-shadow: 0 2px 5px rgba(252,154,30,.18);
        }
        .reference-home .checkin-copy {
          position: relative;
          z-index: 2;
          display: block;
          width: calc(100% - 125px);
          padding: 22px 0 0 27px;
          color: white;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.15;
          white-space: nowrap;
        }
        .reference-home .checkin-button {
          position: relative;
          z-index: 2;
          display: grid;
          width: 100px;
          height: 31px;
          place-items: center;
          margin: 22px 0 0 27px;
          border-radius: 18px;
          background: #fff5d9;
          color: #dd981d;
          font-size: 20px;
          font-weight: 400;
          line-height: 1;
        }
        .reference-home .checkin-fox {
          position: absolute;
          z-index: 1;
          right: -3px;
          bottom: -21px;
          width: 128px;
          height: 120px;
          object-fit: contain;
          object-position: bottom right;
          mix-blend-mode: multiply;
        }
        .reference-home .wallet-title {
          margin: 23px 22px 17px;
          color: #202124;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -.4px;
          line-height: 1;
        }
        .reference-home .wallet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 0 10px 18px;
        }
        .reference-home .balance-card {
          position: relative;
          min-height: 202px;
          overflow: hidden;
          border-radius: 21px;
          background: #65c7ef;
        }
        .reference-home .balance-card > div,
        .reference-home .small-card > div {
          position: relative;
          z-index: 1;
        }
        .reference-home .balance-card .amount {
          padding: 31px 0 0 14px;
          color: #0789c9;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -.85px;
          line-height: 1;
        }
        .reference-home .balance-card .label {
          padding: 17px 0 0 14px;
          color: #0789c9;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -.35px;
        }
        .reference-home .balance-characters {
          position: absolute;
          right: -20px;
          bottom: -2px;
          width: 164px;
          height: 151px;
          object-fit: contain;
          object-position: bottom right;
          mix-blend-mode: multiply;
        }
        .reference-home .earnings-stack {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          gap: 10px;
        }
        .reference-home .small-card {
          position: relative;
          min-height: 96px;
          overflow: hidden;
          border-radius: 19px;
        }
        .reference-home .earnings-card { background: #d8c3fb; }
        .reference-home .withdrawn-card { background: #ffc6df; }
        .reference-home .small-card .amount {
          padding: 25px 0 0 12px;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -.5px;
          line-height: 1;
        }
        .reference-home .earnings-card .amount,
        .reference-home .earnings-card .label { color: #8050cb; }
        .reference-home .withdrawn-card .amount,
        .reference-home .withdrawn-card .label { color: #f065a2; }
        .reference-home .small-card .label {
          padding: 10px 0 0 12px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -.35px;
          line-height: 1.05;
        }
        .reference-home .small-character {
          position: absolute;
          right: -5px;
          bottom: -6px;
          width: 88px;
          height: 99px;
          object-fit: contain;
          object-position: bottom right;
          mix-blend-mode: multiply;
        }
        @media (max-width: 360px) {
          .reference-home .quick-action { font-size: 13px; }
          .reference-home .quick-icon { width: 54px; height: 54px; border-radius: 17px; }
          .reference-home .wallet-grid { gap: 10px; }
          .reference-home .balance-card .amount { font-size: 25px; }
          .reference-home .balance-card .label { font-size: 16px; }
          .reference-home .small-card .label { font-size: 14px; }
        }
      `}</style>

      <div className="screen">
        <section className="hero" aria-label="Bannière d'accueil">
          <img className="hero-reference" src={homeHeroReference} alt="" />
        </section>

        <section className="quick-grid" aria-label="Actions rapides">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="quick-action"
              onClick={() => navigate(action.href)}
            >
              <span className="quick-icon" style={{ background: action.color }}>
                <img src={action.icon} alt="" />
              </span>
              <span>{action.label}</span>
            </button>
          ))}
        </section>

        <section className="transaction" aria-label="Dernière activité">
          <span className="transaction-mark">−</span>
          <span className="transaction-window">
            <span className="transaction-text">{noticeText}</span>
          </span>
        </section>

        <button className="checkin-banner w-[calc(100%-30px)] text-left" onClick={() => navigate("/checkin")}>
          <span className="checkin-copy">N'oubliez pas de faire le check-in chaque jour.</span>
          <span className="checkin-button">aller&gt;</span>
          <img className="checkin-fox" src={foxBanner} alt="" />
        </button>

        <h1 className="wallet-title">Mon portefeuille</h1>

        <section className="wallet-grid" aria-label="Résumé du portefeuille">
          <article className="balance-card">
            <div className="amount" data-testid="text-balance">{formatMoney(balance)}</div>
            <div className="label">Solde du compte</div>
            <img className="balance-characters" src={zootopiaDuo} alt="" />
          </article>

          <div className="earnings-stack">
            <article className="small-card earnings-card">
              <div className="amount" data-testid="text-total-earnings">{formatMoney(totalEarnings)}</div>
              <div className="label">Revenus accumulés</div>
              <img className="small-character" src={judy} alt="" />
            </article>
            <article className="small-card withdrawn-card">
              <div className="amount">0{currency}</div>
              <div className="label">Montant retiré</div>
              <img className="small-character" src={sheep} alt="" />
            </article>
          </div>
        </section>
        </div>
      </main>
      <Dialog open={welcomePopupOpen} onOpenChange={setWelcomePopupOpen}>
      <DialogContent className="max-h-[calc(100vh-24px)] max-w-[380px] overflow-y-auto overflow-x-visible border-0 bg-transparent p-0 shadow-none [&>button:last-child]:hidden">
        <div className="flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="sr-only">Notification</DialogTitle>
          </DialogHeader>
          <img src={welcomeImage} alt="" className="block h-auto w-full" />
          <a
            href={groupLink || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={() => setWelcomePopupOpen(false)}
            className="mt-3 block w-[92%]"
            aria-label="Rejoindre le groupe Telegram"
          >
            <img src={telegramGroupImage} alt="Telegram Group" className="h-auto w-full" />
          </a>
        </div>
        <button
          type="button"
          onClick={() => setWelcomePopupOpen(false)}
          className="mx-auto mt-5 block h-14 w-14 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          aria-label="Fermer la notification"
        >
          <img src={closePopupImage} alt="" className="h-full w-full" />
        </button>
        </DialogContent>
      </Dialog>
    </>
  );
}