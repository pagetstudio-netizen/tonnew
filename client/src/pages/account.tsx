import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import {
  Loader2,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PATH } from "@/lib/admin-path";
import accountBackground from "@assets/images_(72)_1787363798761.jpeg";
import tonLogo from "@assets/images_(25)_1787363798796.png";
import rechargeIcon from "@assets/6_1787388071510.png";
import withdrawalIcon from "@assets/mine-mod-bankcard-CLOhqwHj_1787388454905.png";
import historyIcon from "@assets/4-1_1787388071574.png";
import taskIcon from "@assets/téléchargement_(66)_1787388422746.png";
import teamIcon from "@assets/20260822_002731_1787387728085.png";
import walletIcon from "@assets/20260822_002744_1787387728119.png";
import aboutIcon from "@assets/20260822_083448_1787387727726.png";
import serviceIcon from "@assets/20260822_083355_1787387728003.png";
import passwordIcon from "@assets/20260822_002632_1787387728169.png";
import rulesIcon from "@assets/20260822_002803_1787387728051.png";
import logoutIcon from "@assets/logout_1787368185297.png";

const tonGreen = "#00CC2C";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Code PIN incorrect");
      }
      return res.json();
    },
    onSuccess: () => {
      setShowPinModal(false);
      setAdminPin("");
      navigate(ADMIN_PATH);
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "XOF";
  const balance = Number.parseFloat(user.balance || "0");
  const earnings = Number.parseFloat(user.totalEarnings || "0");
  const phonePrefix = country?.phonePrefix || "";
  const formatAmount = (amount: number) => `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;

  const actionButtons = [
    { label: "Recharger", image: rechargeIcon, href: "/deposit" },
    { label: "Retrait", image: withdrawalIcon, href: "/withdrawal" },
    { label: "Historique", image: historyIcon, href: "/history" },
    { label: "Code cadeau", image: taskIcon, href: "/gift-code" },
  ];

  const menuItems = [
    { label: "à propos de\nnous", image: aboutIcon, href: "/about" },
    { label: "Service Client", image: serviceIcon, href: "/service" },
    { label: "Équipe", image: teamIcon, href: "/team" },
    { label: "Règles de la\nplateforme", image: rulesIcon, href: "/rules" },
    { label: "Lier le compte\nde portefeuille", image: walletIcon, href: "/wallet" },
    { label: "Changer le mot\nde passe", image: passwordIcon, href: "/change-password" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleAdminClick = () => {
    if (user.isAdminPasswordRequired === false) {
      navigate(ADMIN_PATH);
      return;
    }
    setShowPinModal(true);
  };

  return (
    <main className="account-reference min-h-full bg-white pb-[84px]">
      <style>{`
        .account-reference {
          color: #141414;
          font-family: Inter, Arial, sans-serif;
        }
        .account-reference .account-screen {
          width: 100%;
          max-width: 500px;
          min-height: 100%;
          margin: 0 auto;
          overflow: hidden;
          background: #fff;
        }
        .account-reference .account-header {
          padding: 30px 16px 0;
          background: #e9f9ec;
        }
        .account-reference .profile-row {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 105px;
        }
        .account-reference .avatar {
          flex: 0 0 auto;
          width: 88px;
          height: 88px;
          overflow: hidden;
          border: 3px solid ${tonGreen};
          border-radius: 50%;
          background-image: url("${tonLogo}");
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 128, 30, .18);
        }
        .account-reference .profile-copy {
          min-width: 0;
        }
        .account-reference .phone {
          margin: 0 0 12px;
          color: #202020;
          font-size: 24px;
          font-weight: 600;
          line-height: 1.1;
        }
        .account-reference .level {
          margin: 0;
          color: #555;
          font-size: 16px;
          font-weight: 500;
        }
        .account-reference .level strong {
          margin-left: 10px;
          color: ${tonGreen};
        }
        .account-reference .account-summaries {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin: 18px 0 0;
        }
        .account-reference .summary {
          position: relative;
          display: flex;
          align-items: center;
           min-width: 0;
          height: 78px;
          overflow: hidden;
          border-radius: 14px;
          padding: 0 24px;
          background: linear-gradient(110deg, #00cc2c 0%, #008f24 100%);
        }
        .account-reference .summary-amount {
           min-width: 0;
           overflow: hidden;
          margin: 0;
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          white-space: nowrap;
           text-overflow: ellipsis;
          line-height: 1;
        }
        .account-reference .summary-label {
           flex: 0 0 auto;
          margin: 0 0 0 10px;
          color: #fff;
          font-size: 17px;
          font-weight: 600;
          white-space: nowrap;
          line-height: 1;
        }
        .account-reference .summary-symbol {
          display: none;
        }
        .account-reference .promo-banner {
          position: relative;
          height: 198px;
          margin: 14px 16px 0;
          overflow: hidden;
          border-radius: 14px;
          background: #006b1c;
        }
        .account-reference .promo-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: .72;
        }
        .account-reference .promo-copy {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          color: #fff;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0,0,0,.3);
        }
        .account-reference .promo-copy strong {
          font-size: 26px;
          font-weight: 500;
        }
        .account-reference .promo-copy span {
          max-width: 310px;
          margin-top: 10px;
          font-size: 15px;
        }
        .account-reference .promo-copy button {
          margin-top: 14px;
          padding: 10px 28px;
          border-radius: 10px;
          color: #fff;
          background: ${tonGreen};
          font-size: 15px;
          font-weight: 700;
        }
        .account-reference .account-actions {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          padding: 20px 8px 17px;
          background: white;
          border-bottom: 1px solid #f1f1f1;
        }
        .account-reference .account-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          color: #202020;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.15;
          text-align: center;
        }
        .account-reference .account-action img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(44%) sepia(96%) saturate(1750%) hue-rotate(94deg) brightness(91%) contrast(105%);
        }
        .account-reference .services-title {
          margin: 0;
          padding: 14px 16px 10px;
          border-bottom: 1px solid #222;
          font-size: 18px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .account-reference .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 8px;
          padding: 14px 8px 20px;
          background: #fff;
        }
        .account-reference .setting-button {
          display: flex;
          min-height: 68px;
          min-width: 0;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 1px 5px rgba(0,0,0,.08);
          color: #282a2f;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
          text-align: left;
          white-space: pre-line;
        }
        .account-reference .setting-button img {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          object-fit: contain;
          filter: saturate(.9);
        }
        .account-reference .account-hidden-actions {
          margin: 24px 16px 18px;
        }
        .account-reference .logout {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 14px;
          border: 1.5px solid ${tonGreen};
          padding: 13px;
          color: #009d22;
          background: white;
          font-size: 14px;
          font-weight: 700;
        }
        .account-reference .logout img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }
        .account-reference .admin {
          width: 100%;
          margin-top: 12px;
          border-radius: 14px;
          padding: 13px;
          color: white;
          background: ${tonGreen};
          font-size: 14px;
          font-weight: 700;
        }
         @media (max-width: 420px) {
           .account-reference .account-summaries { gap: 8px; }
           .account-reference .summary {
             flex-direction: column;
             justify-content: center;
             gap: 7px;
             padding: 8px 10px;
             text-align: center;
           }
           .account-reference .summary-amount {
             width: 100%;
             font-size: clamp(13px, 5.2vw, 20px);
           }
           .account-reference .summary-label {
             max-width: 100%;
             margin-left: 0;
             font-size: clamp(13px, 4.4vw, 17px);
           }
         }
        @media (max-width: 360px) {
          .account-reference .account-header { padding-right: 10px; padding-left: 10px; }
          .account-reference .profile-row { gap: 12px; }
          .account-reference .avatar { width: 76px; height: 76px; }
          .account-reference .phone { font-size: 20px; }
          .account-reference .level { font-size: 14px; }
          .account-reference .summary { padding-right: 12px; padding-left: 12px; }
          .account-reference .summary-amount { font-size: 17px; }
          .account-reference .summary-label { margin-left: 7px; font-size: 15px; }
          .account-reference .promo-banner { margin-right: 10px; margin-left: 10px; }
          .account-reference .setting-button { padding-right: 8px; padding-left: 8px; font-size: 12px; }
        }
      `}</style>

      <div className="account-screen">
        <section className="account-header" aria-label="Informations du compte">
          <div className="profile-row">
            <div className="avatar" aria-hidden="true" />
            <div className="profile-copy">
              <p className="phone">+{phonePrefix} {user.phone}</p>
              <p className="level">Niveau d'équipe <strong>Lv1</strong></p>
            </div>
          </div>
          <section className="account-summaries" aria-label="Résumé du compte">
            <article className="summary balance">
              <p className="summary-amount">{formatAmount(balance)}</p>
              <p className="summary-label">Solde</p>
            </article>
            <article className="summary earnings">
              <p className="summary-amount">{formatAmount(earnings)}</p>
              <p className="summary-label">Revenu</p>
            </article>
          </section>
        </section>

        <section className="promo-banner" aria-label="Centre d'enregistrement">
          <img src={accountBackground} alt="" />
          <div className="promo-copy">
            <strong>Centre d'enregistrement</strong>
            <span>Connectez-vous pour obtenir des récompenses quotidiennes supplémentaires</span>
            <button type="button" onClick={() => navigate("/checkin")}>Aller</button>
          </div>
        </section>

        <section className="account-actions" aria-label="Actions du compte">
          {actionButtons.map((action) => (
            <button
              key={action.label}
              className="account-action"
              onClick={() => navigate(action.href)}
            >
              <img src={action.image} alt="" />
              <span>{action.label}</span>
            </button>
          ))}
        </section>

        <h2 className="services-title">Autres services</h2>

        <section className="settings-grid" aria-label="Paramètres du compte">
          {menuItems.map((item) => {
            return (
              <button
                key={item.href}
                className="setting-button"
                onClick={() => navigate(item.href)}
              >
                <img src={item.image} alt="" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </section>

        <div className="account-hidden-actions">
          <button className="logout" onClick={handleLogout} data-testid="button-logout">
            <img src={logoutIcon} alt="" />
            Déconnexion
          </button>
          {user.isAdmin && (
            <button className="admin" onClick={handleAdminClick} data-testid="button-admin">
              <Shield className="mr-2 inline h-4 w-4" />
              Panel Admin
            </button>
          )}
        </div>
      </div>

      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Code d'accès administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Entrez votre code PIN pour accéder au panel administrateur
            </p>
            <Input
              type="password"
              value={adminPin}
              onChange={(event) => setAdminPin(event.target.value)}
              placeholder="Code PIN"
              className="text-center text-2xl tracking-widest"
              maxLength={8}
              data-testid="input-admin-pin"
            />
            <Button
              onClick={() => {
                if (adminPin.length < 4) {
                  toast({ title: "Le code PIN doit contenir au moins 4 caractères", variant: "destructive" });
                  return;
                }
                verifyPinMutation.mutate(adminPin);
              }}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full bg-[#249daf] hover:bg-[#1c8796]"
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}