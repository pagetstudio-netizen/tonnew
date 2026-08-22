import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { Copy } from "lucide-react";
import teamReference from "@assets/images_(69)_1787362692968.jpeg";
import earningsReference from "@assets/IMG-20260821-WA0159_1787357447412.jpg";
import teamLogo from "@assets/images_(25)_1787362692989.png";
import instagramIcon from "@assets/Instagram_icon_1787367952152.png";
import facebookIcon from "@assets/images_(27)_1787367952249.png";
import whatsappIcon from "@assets/images_(26)_1787367952281.png";
import telegramIcon from "@assets/tg-1_1787367952311.png";

interface TeamStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<TeamStats>({
    queryKey: ["/api/team/stats"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency === "FCFA" ? "XOF" : countryInfo?.currency || "XOF";
  const referralLink = `https://Tonnew.top/invitation?invite?code=${user.referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Code copié !" });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié !" });
  };

  const lv1Rate = settings?.level1Commission || "27";
  const lv2Rate = settings?.level2Commission || "2";
  const lv3Rate = settings?.level3Commission || "1";

  const levelRows = [
    {
      label: "LV1",
      commission: `${lv1Rate}%`,
      users: stats?.level1Count || 0,
      rewards: (stats?.level1Commission || 0).toFixed(0),
    },
    {
      label: "LV2",
      commission: `${lv2Rate}%`,
      users: stats?.level2Count || 0,
      rewards: (stats?.level2Commission || 0).toFixed(0),
    },
    {
      label: "LV3",
      commission: `${lv3Rate}%`,
      users: stats?.level3Count || 0,
      rewards: (stats?.level3Commission || 0).toFixed(0),
    },
  ];
  const totalPeople = (stats?.level1Count || 0) + (stats?.level2Count || 0) + (stats?.level3Count || 0);

  return (
    <main className="team-reference min-h-full bg-white pb-24">
      <style>{`
        .team-reference { color: #141414; font-family: Inter, Arial, sans-serif; }
        .team-reference .team-screen { width: 100%; max-width: 500px; margin: 0 auto; overflow: hidden; }
        .team-reference .team-title { display: flex; height: 89px; align-items: center; justify-content: space-between; padding: 10px 26px 0 34px; border-bottom: 1px solid #eee; font-size: 35px; font-weight: 400; line-height: 1; }
        .team-reference .team-title img { width: 54px; height: 54px; object-fit: contain; }
        .team-reference .invite-card { margin: 0 16px; overflow: hidden; border-radius: 20px; background: #60402d; }
        .team-reference .invite-art { height: min(54vw, 270px); overflow: hidden; }
        .team-reference .invite-art img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center center; pointer-events: none; }
        .team-reference .invite-info { display: grid; grid-template-columns: 1fr 1.12fr; min-height: 168px; gap: 25px; padding: 12px 14px 18px; color: white; background: rgba(78,48,31,.91); }
        .team-reference .invite-label { margin-bottom: 15px; font-size: 13px; line-height: 1; }
        .team-reference .invite-code { font-size: 30px; font-weight: 800; letter-spacing: -.5px; line-height: 1; }
        .team-reference .invite-link { display: -webkit-box; overflow: hidden; font-size: 17px; font-weight: 700; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; word-break: break-all; }
        .team-reference .copy-button { display: flex; width: 100%; height: 38px; align-items: center; justify-content: center; gap: 5px; margin-top: 20px; border: 1px solid white; border-radius: 22px; color: white; font-size: 16px; }
        .team-reference .copy-button svg { width: 14px; height: 14px; }
        .team-reference .section-head { display: flex; align-items: center; justify-content: space-between; padding: 19px 20px 16px; }
        .team-reference .section-head h2 { font-size: 26px; font-weight: 800; }
        .team-reference .section-head button { font-size: 16px; }
        .team-reference .share-panel { min-height: 150px; margin: 0 9px; padding: 18px 20px 20px; border-radius: 5px; background: white; box-shadow: 0 1px 5px rgba(0,0,0,.07); }
        .team-reference .share-title { margin-bottom: 21px; color: #303030; font-size: 25px; font-weight: 400; }
        .team-reference .share-row { display: flex; justify-content: space-between; }
        .team-reference .share-item { display: grid; width: 58px; height: 58px; place-items: center; overflow: hidden; border: 0; border-radius: 14px; background: transparent; font-weight: 800; }
        .team-reference .share-item img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .team-reference .levels { padding: 25px 7px 0; }
        .team-reference .level-card { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); height: 106px; margin-bottom: 6px; padding-top: 40px; overflow: visible; border-radius: 20px; background: linear-gradient(110deg, #9fdcf2 0%, #9bcdf5 44%, #b187ed 100%); box-shadow: inset 0 0 18px rgba(255,255,255,.3); }
        .team-reference .level-badge { position: absolute; top: -1px; left: 50%; display: flex; width: 80px; height: 34px; align-items: center; justify-content: center; border-radius: 0 0 9px 9px; background: linear-gradient(135deg, #fff1ba, #ffe08a); color: #265b9d; font-size: 19px; font-weight: 800; transform: translateX(-50%); }
        .team-reference .level-stat { color: white; text-align: center; text-shadow: 0 1px 2px rgba(27,76,151,.3); }
        .team-reference .level-number { font-size: 20px; font-weight: 800; line-height: 1; }
        .team-reference .level-caption { margin-top: 8px; font-size: 12px; font-weight: 700; line-height: 1; }
        .team-reference .earnings { position: relative; height: 169px; margin: 20px 16px 0; overflow: hidden; border-radius: 19px; background-color: #315bed; background-image: linear-gradient(90deg, rgba(48,83,236,.96) 0%, rgba(55,82,235,.94) 54%, rgba(48,80,236,.07) 74%), url("${earningsReference}"); background-repeat: no-repeat; background-size: auto, 461px auto; background-position: 0 0, center -460px; }
        .team-reference .earnings-content { position: relative; z-index: 1; padding: 2px 19px; color: white; }
        .team-reference .earnings-title { font-size: 19px; font-weight: 400; }
        .team-reference .earnings-value { margin-top: 10px; font-size: 32px; font-weight: 400; line-height: 1; }
        .team-reference .earnings-people { margin-top: 14px; font-size: 19px; line-height: 1; }
        .team-reference .reward-copy { padding: 34px 29px 12px; }
        .team-reference .reward-copy h2 { margin-bottom: 21px; color: #777; font-size: 25px; font-weight: 400; }
        .team-reference .reward-copy p { margin-bottom: 28px; font-size: 18px; font-weight: 400; line-height: 1.6; }
        .team-reference .reward-copy strong { font-weight: 800; }
        @media (max-width: 360px) {
          .team-reference .team-title { padding-left: 24px; font-size: 31px; }
          .team-reference .invite-info { gap: 14px; padding-right: 11px; padding-left: 11px; }
          .team-reference .invite-code { font-size: 24px; }
          .team-reference .invite-link { font-size: 14px; }
          .team-reference .share-item { width: 50px; height: 50px; }
          .team-reference .level-caption { font-size: 10px; }
        }
      `}</style>

      <div className="team-screen">
          <h1 className="team-title">
            <span>Équipe</span>
            <img src={teamLogo} alt="Stone by ton" />
          </h1>

        <section className="invite-card" aria-label="Invitation">
          <div className="invite-art"><img src={teamReference} alt="" /></div>
          <div className="invite-info">
            <div>
              <p className="invite-label">Code d'invitation</p>
              <p className="invite-code" data-testid="text-referral-code">{user.referralCode}</p>
              <button className="copy-button" onClick={copyCode} data-testid="button-copy-code"><Copy /> Copier</button>
            </div>
            <div>
              <p className="invite-label">lien d'invitation</p>
              <p className="invite-link" data-testid="text-referral-link">{referralLink}</p>
              <button className="copy-button" onClick={copyLink} data-testid="button-copy-link"><Copy /> Copier</button>
            </div>
          </div>
        </section>

        <div className="section-head">
          <h2>Mon équipe</h2>
          <button onClick={() => navigate("/team-details")} data-testid="button-centre-taches">Détails de l'équipe &gt;</button>
        </div>

        <section className="share-panel" aria-label="Partager">
          <p className="share-title">Partager</p>
          <div className="share-row">
            <button className="share-item telegram" onClick={copyLink} aria-label="Partager sur Telegram"><img src={telegramIcon} alt="" /></button>
            <button className="share-item whatsapp" onClick={copyLink} aria-label="Partager sur WhatsApp"><img src={whatsappIcon} alt="" /></button>
            <button className="share-item facebook" onClick={copyLink} aria-label="Partager sur Facebook"><img src={facebookIcon} alt="" /></button>
            <button className="share-item instagram" onClick={copyLink} aria-label="Partager sur Instagram"><img src={instagramIcon} alt="" /></button>
          </div>
        </section>

        <section className="levels" aria-label="Niveaux d'équipe">
          {levelRows.map((level, index) => (
            <div className="level-card" key={level.label} data-testid={`vip-row-${index + 1}`}>
              <span className="level-badge">{level.label}</span>
              <div className="level-stat"><p className="level-number">{level.commission}</p><p className="level-caption">Taux de commission</p></div>
              <div className="level-stat"><p className="level-number" data-testid={`text-level${index + 1}-count`}>{level.users}</p><p className="level-caption">Utilisateur valide</p></div>
              <div className="level-stat"><p className="level-number" data-testid={`text-level${index + 1}-commission`}>{level.rewards}</p><p className="level-caption">Commission</p></div>
            </div>
          ))}
        </section>

        <section className="earnings" aria-label="Mes revenus">
          <div className="earnings-content">
            <p className="earnings-title">Mes revenus</p>
            <p className="earnings-value">{(stats?.totalCommission || 0).toFixed(0)}</p>
            <p className="earnings-people">Nombre de personnes</p>
            <p className="earnings-value">{totalPeople}</p>
          </div>
        </section>

        <section className="reward-copy">
          <h2>Cadeau d'invitation</h2>
          <p>✨ Lorsque vos amis s’inscrivent et effectuent leur investissement, vous recevez immédiatement <strong>{lv1Rate} % de cashback.</strong></p>
          <p>🌟 Lorsque les membres de votre équipe de niveau 2 investissent, vous recevez <strong>{lv2Rate} % de cashback.</strong></p>
        </section>
      </div>
    </main>
  );
}
