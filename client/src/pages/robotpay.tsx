import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Loader2, Phone, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES, type ApiCountry } from "@/lib/countries";

type Provider = "ashtech" | "westpay" | "sendavapay";
type Operator = { id?: string; name?: string; code?: string; requiresOtp?: boolean; status?: string };

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-7">
      {["Numéro de téléphone", "Informations de confirmation", "Paiement terminé"].map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className={`flex flex-col items-center text-center ${i <= step ? "text-[#1877d2]" : "text-gray-400"}`}>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${i <= step ? "border-[#8fc4d8] bg-[#eef9fc]" : "border-gray-300 bg-white"}`}>
              {i < step ? <Check className="w-5 h-5" /> : i + 1}
            </div>
            <span className="text-[11px] leading-tight mt-1 w-24">{label}</span>
          </div>
          {i < 2 && <div className={`h-px flex-1 mx-1 mt-[-18px] ${i < step ? "bg-[#8fc4d8]" : "bg-gray-300"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function RobotPayPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const amount = Number(params.get("amount") || 0);
  const country = (params.get("country") || "").toUpperCase();
  // 0 = operator, 1 = phone, 2 = confirmation, 3 = success
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<Operator | null>(null);
  const [depositId, setDepositId] = useState<number | null>(null);
  const [transactionReference] = useState(() => `dépôt-${Math.floor(10000 + Math.random() * 90000)}`);
  const [paymentToken, setPaymentToken] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [ashtechOtp, setAshtechOtp] = useState("");
  const [ashtechOtpRequired, setAshtechOtpRequired] = useState(false);
  const [ussd, setUssd] = useState("");
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [status, setStatus] = useState("pending");

  const { data: countries = [] } = useQuery<ApiCountry[]>({ queryKey: ["/api/countries"] });
  const { data: providerInfo } = useQuery<{ provider: Provider; name: string }>({
    queryKey: ["/api/deposit/provider", country],
    queryFn: async () => (await fetch(`/api/deposit/provider/${country}`, { credentials: "include" })).json(),
    enabled: !!country,
  });
  const provider = providerInfo?.provider || "sendavapay";
  const countryInfo = countries.find(c => c.code === country) || COUNTRIES.find(c => c.code === country);
  const currency = countryInfo?.currency || "FCFA";
  const phonePrefix = countryInfo?.phonePrefix || "";
  const paymentPhone = phone.trim().startsWith("+")
    ? phone.trim()
    : phonePrefix
      ? `+${phonePrefix}${phone.replace(/\D/g, "")}`
      : phone.trim();

  const { data: sendavaData, isLoading: sendavaLoading } = useQuery<{ success: boolean; data: Operator[] }>({
    queryKey: ["/api/sendavapay/operators", country],
    queryFn: async () => (await fetch(`/api/sendavapay/operators/${country}`, { credentials: "include" })).json(),
    enabled: provider === "sendavapay" && !!country,
  });
  const { data: ashtechData, isLoading: ashtechLoading } = useQuery<any[]>({
    queryKey: ["/api/ashtechpay/countries"],
    queryFn: async () => (await fetch("/api/ashtechpay/countries", { credentials: "include" })).json(),
    enabled: provider === "ashtech",
  });
  const operators: Operator[] = provider === "ashtech"
    ? ((ashtechData || []).find(c => c.code?.toUpperCase() === country)?.operators || []).map((x: any) => typeof x === "string" ? { name: x, id: x } : x)
    : (sendavaData?.data || []).filter((x: Operator) => x.status === "online");
  const loadingOperators = sendavaLoading || ashtechLoading || !providerInfo;

  const sendavaMutation = useMutation({
    mutationFn: async () => {
      if (!operator?.id) throw new Error("Sélectionnez un opérateur");
      const created = await apiRequest("POST", "/api/sendavapay/create", {
        amount, country, operatorId: operator.id, operatorName: operator.name, payerPhone: paymentPhone,
      });
      if (!created.ok) throw new Error((await created.json()).message || "Création impossible");
      const data = await created.json();
      setDepositId(data.depositId); setPaymentToken(data.paymentToken);
      const initiated = await apiRequest("POST", "/api/sendavapay/initiate", {
        paymentToken: data.paymentToken, payerCountry: country, operatorId: operator.id,
        depositId: data.depositId, payerPhone: paymentPhone,
      });
      if (!initiated.ok) throw new Error((await initiated.json()).message || "Initiation impossible");
      return initiated.json();
    },
    onSuccess: (data) => {
      setMessage(data.message || "");
      if (data.requiresOtp && data.otpToken) { setOtpToken(data.otpToken); setUssd(data.ussdCode || ""); setStep(2); }
      else if (data.requiresRedirect && data.redirectUrl) { setRedirectUrl(data.redirectUrl); setStep(2); }
      else { setStep(2); setStatus("processing"); }
    },
    onError: (e: any) => toast({ title: "Erreur de paiement", description: e.message, variant: "destructive" }),
  });
  const ashtechMutation = useMutation({
    mutationFn: async (otpCode?: string) => {
      if (!operator?.name) throw new Error("Sélectionnez un opérateur");
      const res = await apiRequest("POST", "/api/ashtechpay/collect", {
        amount, country, operator: operator.name, phone: phone.replace(/\D/g, ""),
        depositId: depositId || undefined, otp: otpCode || undefined,
      });
      if (!res.ok) throw new Error((await res.json()).message || "Initiation impossible");
      return res.json();
    },
    onSuccess: (data) => {
       setAshtechOtpRequired(false);
      setDepositId(data.depositId); setMessage(data.message || ""); setUssd(data.ussdCode || "");
      if (data.waveUrl) setRedirectUrl(data.waveUrl);
      setStep(2); setStatus(data.status || "processing");
    },
    onError: (e: any) => {
      if (e.data?.requiresOtp) {
        setDepositId(e.data.depositId || depositId);
        setAshtechOtpRequired(true);
        setUssd(e.data.ussdCode || "");
        setMessage(e.message || "Composez le code indiqué puis saisissez votre OTP.");
        setStep(2);
        return;
      }
      toast({ title: "Erreur de paiement", description: e.message, variant: "destructive" });
    },
  });
  const westpayMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/deposits", {
        amount, accountName: user?.fullName || "", accountNumber: paymentPhone,
        paymentMethod: "WestPay", country, useWestpay: true,
      });
      if (!res.ok) throw new Error((await res.json()).message || "WestPay indisponible");
      return res.json();
    },
    onSuccess: (data) => { setDepositId(data.deposit?.id || null); setRedirectUrl(data.westpayUrl || ""); setStep(2); setStatus("processing"); },
    onError: (e: any) => toast({ title: "Erreur WestPay", description: e.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (step !== 2 || !depositId || status === "approved" || provider === "westpay") return;
    const timer = setInterval(async () => {
      const url = provider === "ashtech" ? `/api/deposits/${depositId}/ashtechpay-status` : `/api/deposits/${depositId}/sendavapay-status`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setStatus(data.status);
      if (data.status === "approved") { setStep(3); clearInterval(timer); queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] }); }
      if (data.status === "rejected") { clearInterval(timer); toast({ title: "Paiement refusé", variant: "destructive" }); }
    }, 5000);
    return () => clearInterval(timer);
  }, [step, depositId, status, provider]);

  const submitPhone = () => {
    if (!phone.trim()) { toast({ title: "Numéro requis", description: "Saisissez le numéro Mobile Money utilisé.", variant: "destructive" }); return; }
    if (!operator) { toast({ title: "Opérateur requis", description: "Sélectionnez votre opérateur.", variant: "destructive" }); return; }
    if (provider === "ashtech") ashtechMutation.mutate(undefined);
    else if (provider === "westpay") westpayMutation.mutate();
    else sendavaMutation.mutate();
  };
  const submitOtp = async () => {
    if (provider === "ashtech") {
      if (!ashtechOtp.trim()) return;
      ashtechMutation.mutate(ashtechOtp.trim());
      return;
    }
    const res = await apiRequest("POST", "/api/sendavapay/submit-otp", { otpToken, otp });
    if (!res.ok) { toast({ title: "OTP invalide", variant: "destructive" }); return; }
    setStep(2); setStatus("processing");
  };
  const busy = sendavaMutation.isPending || ashtechMutation.isPending || westpayMutation.isPending;

   if (!amount || !country) return <div className="min-h-screen flex items-center justify-center p-6 text-center">Données de dépôt invalides.</div>;
  return (
     <main className="min-h-screen bg-[#4b91ef] p-3 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-white px-5 pt-4 pb-6">
          <p className="text-xl">Montant:</p>
          <p className="text-4xl font-bold">{amount.toLocaleString()} <span className="text-2xl font-normal">{currency}</span></p>
        </div>
        <section className={step === 0 ? "space-y-5" : "rounded-xl bg-white p-5 shadow-xl sm:p-8"}>
          {step > 0 && <Stepper step={Math.max(0, Math.min(2, step - 1))} />}
          {step === 0 && (
            <div className="space-y-5">
              <p className="px-1 text-xl text-white">Sélectionnez le mode de paiement :</p>
              {loadingOperators ? <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-500" /> : operators.length === 0 ? <p className="text-center text-gray-500">Aucun opérateur disponible pour ce pays.</p> : (
                <div className="space-y-3">{operators.map((op, i) => <button key={`${op.id || op.name}-${i}`} onClick={() => { setOperator(op); setStep(1); }} className={`w-full flex items-center justify-between rounded-lg px-4 py-4 border-2 text-left ${operator === op ? "border-[#2885d8] bg-blue-50" : "border-gray-100 bg-white shadow-sm"}`}><span className="font-semibold text-lg text-[#14538a]">{op.name || op.code}</span><ChevronRight className="text-gray-400" /></button>)}</div>
              )}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-[#ffe0a0] px-3 py-2 text-sm leading-tight text-[#e65b28]">Veuillez sélectionner la même option que votre méthode de transfert.</div>
              <label className="block text-sm font-semibold">Veuillez entrer votre numéro de téléphone:</label>
              <div className="flex items-center rounded-lg border border-gray-300 px-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="shrink-0 border-r border-gray-200 pr-2 text-gray-600">+{phonePrefix}</span>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 12))} type="tel" inputMode="numeric" placeholder="Numéro de téléphone" className="w-full px-3 py-3 outline-none" />
              </div>
              <p className="text-sm font-semibold">Choisissez la méthode de transfert</p>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="h-4 w-4 rounded-full border-[4px] border-[#1686e8] ring-1 ring-[#1686e8]" />
                <span>{operator?.name || operator?.code}</span>
              </div>
              <div className="flex items-center justify-center gap-5 pt-3">
                <button onClick={() => setStep(0)} className="w-[43%] rounded-md bg-[#78b9df] py-3 font-semibold text-white shadow-sm">&lt; Retour</button>
                <button onClick={submitPhone} disabled={busy || !phone.trim()} className="w-[43%] rounded-md bg-[#078ee8] py-3 font-semibold text-white shadow-sm disabled:opacity-50">{busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Suivant >"}</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5 text-center">
              {redirectUrl ? <><p className="text-gray-700">{message || "Ouvrez la page sécurisée pour terminer votre paiement."}</p><a href={redirectUrl} target="_blank" rel="noreferrer" className="block rounded-lg bg-[#1486d8] text-white py-3 font-semibold">Ouvrir la page de paiement</a></> : (otpToken || ashtechOtpRequired) ? <>{ussd && <p className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-3 text-center font-mono text-xl font-bold tracking-widest text-[#00a526]">{ussd}</p>}<p className="text-sm text-gray-600">{ussd ? "Composez ce code sur votre téléphone pour obtenir le code OTP, puis saisissez-le ci-dessous." : "Un code OTP vous a été envoyé. Saisissez-le ci-dessous."}</p><input value={provider === "ashtech" ? ashtechOtp : otp} onChange={e => provider === "ashtech" ? setAshtechOtp(e.target.value.replace(/\D/g, "")) : setOtp(e.target.value)} inputMode="numeric" placeholder="Saisissez le code OTP" className="w-full border rounded-lg p-3 text-center text-xl" /><button onClick={submitOtp} disabled={busy} className="w-full rounded-lg bg-[#1486d8] py-3 font-semibold text-white disabled:opacity-50">Confirmer</button></> : <><ShieldCheck className="mx-auto h-16 w-16 animate-pulse text-green-400" /><p className="font-semibold text-lg">Paiement en cours de confirmation</p><p className="text-sm text-gray-500">Validez la demande sur votre téléphone. La page se met à jour automatiquement.</p></>}
            </div>
          )}
          {step === 3 && <div className="text-center space-y-5 py-5"><div className="text-left border-b pb-3 text-xl text-gray-700">ROBOTPAY - {countryInfo?.name || country}</div><p className="text-left text-2xl text-gray-900">{amount.toLocaleString()} {currency}</p><Check className="w-24 h-24 mx-auto rounded-full p-4 bg-green-500 text-white" /><h2 className="text-xl text-gray-600">Votre paiement a été approuvé</h2><div className="text-left rounded bg-gray-200 p-3 text-sm leading-7 text-gray-700"><b>Payeur :</b> {phone}<br /><b>ID Transaction :</b> {transactionReference}<br /><b>Date Paiement :</b> {new Date().toLocaleString("fr-FR")}</div><p className="pt-12 text-gray-500">🔒 Sécurisé par <b className="text-[#174d79]">ROBOTPAY</b></p><button onClick={() => navigate("/")} className="text-lg text-[#4b91ef]">Retourner sur le site</button></div>}
        </section>
      </div>
    </main>
  );
}