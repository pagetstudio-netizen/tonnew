import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, Info, Copy, CheckCircle, Upload, Phone, Loader2,
  ImageIcon, ArrowRight, Zap, RefreshCw, ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import { COUNTRIES, type ApiCountry } from "@/lib/countries";
import type { PaymentNumber } from "@shared/schema";
import rechargeReference from "@assets/IMG-20260821-WA0163_1787357122336.jpg";
import historyIcon from "@assets/20260410_193219_1787363717022.png";

const TON_GREEN = "#00CC2C";
const TON_GREEN_DARK = "#009d22";
const TON_GRADIENT = `linear-gradient(112deg, ${TON_GREEN} 0%, ${TON_GREEN_DARK} 100%)`;

type Step =
  | "amount"
  | "select"
  | "form"
  | "sv-operator"
  | "sv-waiting"
  | "sv-otp"
  | "sv-redirect"
  | "westpay"
  | "ashtech-operator"
  | "ashtech-otp"
  | "ashtech-redirect"
  | "ashtech-waiting";

interface SvOperator {
  id: string;
  name: string;
  requiresOtp: boolean;
  status: string;
}

interface AshtechCountry {
  code: string;
  name: string;
  currency: string;
  operators: (string | { name?: string; code?: string; id?: string })[];
}

export default function DepositPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("amount");
  const [selectedNumber, setSelectedNumber] = useState<PaymentNumber | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [amount, setAmount] = useState<number | "">("");
  const [depositCountry, setDepositCountry] = useState("");
  const [senderPhone, setSenderPhone] = useState(user?.phone || "");
  const [screenshot, setScreenshot] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [reference, setReference] = useState("");

  // SendavaPay state
  const [svCountry, setSvCountry] = useState(user?.country || "");
  const [svPhone, setSvPhone] = useState("");
  const [svOperator, setSvOperator] = useState<SvOperator | null>(null);
  const [svDepositId, setSvDepositId] = useState<number | null>(null);
  const [svPaymentToken, setSvPaymentToken] = useState<string>("");
  const [svOtpToken, setSvOtpToken] = useState<string>("");
  const [svOtp, setSvOtp] = useState<string>("");
  const [svUssdCode, setSvUssdCode] = useState<string>("");
  const [svOtpMessage, setSvOtpMessage] = useState<string>("");
  const [svRedirectUrl, setSvRedirectUrl] = useState<string>("");
  const [svStatus, setSvStatus] = useState<string>("");
  const [svPolling, setSvPolling] = useState(false);

  // AshtechPay state
  const [ashtechCountry, setAshtechCountry] = useState(user?.country || "");
  const [ashtechPhone, setAshtechPhone] = useState("");
  const [ashtechOperator, setAshtechOperator] = useState("");
  const [ashtechDepositId, setAshtechDepositId] = useState<number | null>(null);
  const [ashtechOtp, setAshtechOtp] = useState("");
  const [ashtechUssdCode, setAshtechUssdCode] = useState("");
  const [ashtechMessage, setAshtechMessage] = useState("");
  const [ashtechWaveUrl, setAshtechWaveUrl] = useState("");
  const [ashtechStatus, setAshtechStatus] = useState("");
  const [ashtechPolling, setAshtechPolling] = useState(false);

  const country = depositCountry;

  const { data: apiCountries = [] } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const countryInfo = apiCountries.length > 0
    ? apiCountries.find(c => c.code === country && c.isActive)
    : COUNTRIES.find(c => c.code === country);
  const currency = countryInfo?.currency || "FCFA";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "4000");
  const sendavapayEnabled = platformSettings?.sendavapayEnabled === "true";
  const sendavapayChannelName = platformSettings?.sendavapayChannelName || "SendavaPay";
  const westpayEnabled = platformSettings?.westpayEnabled === "true";
  const westpayChannelName = platformSettings?.westpayChannelName || "WestPay";
  const westpayCountries = platformSettings?.westpayCountries || "";
  const westpayAvailable = westpayEnabled && (
    !westpayCountries || westpayCountries.split(",").map(c => c.trim()).includes(country)
  );
  const ashtechEnabled = platformSettings?.ashtechEnabled === "true";
  const ashtechChannelName = platformSettings?.ashtechChannelName || "AshtechPay";
  const ashtechCountriesSetting = platformSettings?.ashtechCountries || "";
  const ashtechCountryAllowed = !ashtechCountriesSetting ||
    ashtechCountriesSetting.split(",").map(c => c.trim().toUpperCase()).includes(country.toUpperCase());
  const ashtechAvailable = ashtechEnabled && ashtechCountryAllowed;

  const activeDepositCountries = (apiCountries.length > 0
    ? apiCountries.filter(c => c.isActive)
    : COUNTRIES
  ) as Array<{ code: string; name: string; currency: string }>;
  const ashtechConfiguredCountryCodes = ashtechCountriesSetting
    ? ashtechCountriesSetting.split(",").map(c => c.trim().toUpperCase()).filter(Boolean)
    : null;

  const { data: paymentNumbersList = [], isLoading: numbersLoading } = useQuery<PaymentNumber[]>({
    queryKey: ["/api/payment-numbers", country],
    queryFn: async () => {
      const res = await fetch(`/api/payment-numbers?country=${country}`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    enabled: !!country,
  });

  // SendavaPay: load operators for selected country
  const { data: svOperatorsData, isLoading: svOperatorsLoading } = useQuery<{ success: boolean; data: SvOperator[] }>({
    queryKey: ["/api/sendavapay/operators", svCountry],
    queryFn: async () => {
      const res = await fetch(`/api/sendavapay/operators/${svCountry}`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    enabled: step === "sv-operator" && !!svCountry,
  });
  const svOperators = (svOperatorsData?.data || []).filter(op => op.status === "online");

  const { data: ashtechCountries = [], isLoading: ashtechCountriesLoading } = useQuery<AshtechCountry[]>({
    queryKey: ["/api/ashtechpay/countries"],
    queryFn: async () => {
      const res = await fetch("/api/ashtechpay/countries", { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les opérateurs");
      return res.json();
    },
    enabled: step === "ashtech-operator" && ashtechAvailable,
  });
  const availableAshtechCountries = ashtechCountries.filter(c =>
    activeDepositCountries.some(active => active.code.toUpperCase() === c.code.toUpperCase()) &&
    (!ashtechConfiguredCountryCodes || ashtechConfiguredCountryCodes.includes(c.code.toUpperCase()))
  );
  const selectedAshtechCountry = availableAshtechCountries.find(c => c.code === ashtechCountry);
  const ashtechOperators = selectedAshtechCountry?.operators || [];

  // Poll deposit status
  useEffect(() => {
    if (step !== "sv-waiting" || !svDepositId || !svPolling) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposits/${svDepositId}/sendavapay-status`, { credentials: "include" });
        const data = await res.json();
        setSvStatus(data.status);
        if (data.status === "approved") {
          clearInterval(interval);
          setSvPolling(false);
          toast({ title: "Paiement confirmé !", description: "Votre solde a été crédité." });
          refreshUser();
          queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
          // reset
          setStep("amount");
          setAmount("");
          setSvOperator(null);
          setSvDepositId(null);
          setSvPaymentToken("");
          setSvOtpToken("");
          setSvOtp("");
          setSvStatus("");
        } else if (data.status === "rejected") {
          clearInterval(interval);
          setSvPolling(false);
          toast({ title: "Paiement échoué", description: "Le paiement a été refusé ou annulé.", variant: "destructive" });
          setStep("sv-operator");
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, svDepositId, svPolling]);

  useEffect(() => {
    if (step !== "ashtech-waiting" || !ashtechDepositId || !ashtechPolling) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposits/${ashtechDepositId}/ashtechpay-status`, { credentials: "include" });
        const data = await res.json();
        setAshtechStatus(data.status);
        if (data.status === "approved") {
          clearInterval(interval);
          setAshtechPolling(false);
          toast({ title: "Paiement confirmé !", description: "Votre solde a été crédité." });
          refreshUser();
          queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
          setStep("amount");
          setAmount("");
          setAshtechDepositId(null);
          setAshtechStatus("");
        } else if (data.status === "rejected") {
          clearInterval(interval);
          setAshtechPolling(false);
          toast({ title: "Paiement échoué", description: "Le paiement a été refusé ou annulé.", variant: "destructive" });
          setStep("ashtech-operator");
        }
      } catch {
        // Keep polling; a transient provider error must not lose the payment flow.
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, ashtechDepositId, ashtechPolling]);

  // ── Mutations ───────────────────────────────────────────────────────────────

  const copyPhone = async (number: PaymentNumber) => {
    try {
      await navigator.clipboard.writeText(number.phone);
      setCopiedId(number.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: "Numéro copié !", description: `${number.phone} copié` });
    } catch {
      toast({ title: "Numéro: " + number.phone, description: "Copiez ce numéro manuellement" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fichier trop grand", description: "Maximum 5 Mo", variant: "destructive" });
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNumber) throw new Error("Aucun numéro sélectionné");
      const res = await apiRequest("POST", "/api/deposits", {
        amount: Number(amount),
        accountName: user?.fullName || "",
        accountNumber: senderPhone,
        paymentMethod: selectedNumber.operatorName,
        country,
        paymentNumberId: selectedNumber.id,
        channelName: `${selectedNumber.operatorName} - ${selectedNumber.phone}`,
        screenshot: screenshot || null,
        paymentMessage: paymentMessage || null,
        reference: reference || null,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Demande envoyée !", description: "Votre dépôt est en attente de validation" });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      refreshUser();
      setStep("amount");
      setSelectedNumber(null);
      setAmount("");
      setSenderPhone(user?.phone || "");
      setScreenshot("");
      setScreenshotName("");
      setPaymentMessage("");
      setReference("");
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // WestPay: create deposit + get redirect URL
  const [wpDepositId, setWpDepositId] = useState<number | null>(null);
  const [wpStatus, setWpStatus] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("wp_status");
    const did = params.get("wp_depositId");
    if (s) {
      setWpStatus(s);
      if (did) setWpDepositId(parseInt(did));
      // clean URL
      window.history.replaceState({}, "", "/deposit");
      if (s === "success") {
        toast({ title: "Paiement en cours de confirmation", description: "Votre dépôt sera crédité dès confirmation WestPay." });
        queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      }
    }
  }, []);

  const wpInitiateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/deposits", {
        amount: Number(amount),
        accountName: user?.fullName || "",
        accountNumber: user?.phone || "",
        paymentMethod: "WestPay",
        country,
        useWestpay: true,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur WestPay");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.westpayUrl) {
        window.location.href = data.westpayUrl;
      }
    },
    onError: (e: any) => toast({ title: "Erreur WestPay", description: e.message, variant: "destructive" }),
  });

  const ashtechCollectMutation = useMutation({
    mutationFn: async (otp?: string) => {
      if (!ashtechOperator || !ashtechPhone.trim()) throw new Error("Sélectionnez un opérateur et saisissez votre numéro");
      const res = await apiRequest("POST", "/api/ashtechpay/collect", {
        amount: Number(amount),
        country: ashtechCountry,
        operator: ashtechOperator,
        phone: ashtechPhone.trim(),
        depositId: ashtechDepositId || undefined,
        otp: otp || undefined,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur AshtechPay");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      setAshtechDepositId(data.depositId);
      setAshtechMessage(data.message || "");
      setAshtechUssdCode(data.ussdCode || "");
      if (data.waveUrl) {
        setAshtechWaveUrl(data.waveUrl);
        setStep("ashtech-redirect");
      } else if (data.requiresOtp) {
        setStep("ashtech-otp");
      } else {
        setAshtechPolling(true);
        setAshtechStatus(data.status || "pending");
        setStep("ashtech-waiting");
      }
    },
    onError: (e: any) => {
      if (e.data?.requiresOtp) {
        setAshtechDepositId(e.data.depositId || ashtechDepositId);
        setAshtechUssdCode(e.data.ussdCode || "");
        setAshtechMessage(e.message || "Composez le code indiqué puis saisissez le code OTP.");
        setAshtechOtp("");
        setStep("ashtech-otp");
        return;
      }
      toast({ title: `Erreur ${ashtechChannelName}`, description: e.message, variant: "destructive" });
    },
  });

  // SendavaPay: create + initiate
  const svInitiateMutation = useMutation({
    mutationFn: async () => {
      if (!svOperator) throw new Error("Sélectionnez un opérateur");
      // Step 1: create payment on backend
      const createRes = await apiRequest("POST", "/api/sendavapay/create", {
        amount: Number(amount),
        country: svCountry,
        operatorId: svOperator.id,
        operatorName: svOperator.name,
        payerPhone: svPhone,
      });
      if (!createRes.ok) {
        const d = await createRes.json();
        throw new Error(d.message || "Erreur création paiement");
      }
      const createData = await createRes.json();
      setSvDepositId(createData.depositId);
      setSvPaymentToken(createData.paymentToken);

      // Step 2: initiate payment
      const initRes = await apiRequest("POST", "/api/sendavapay/initiate", {
        paymentToken: createData.paymentToken,
        payerCountry: svCountry,
        operatorId: svOperator.id,
        depositId: createData.depositId,
        payerPhone: svPhone,
      });
      if (!initRes.ok) {
        const d = await initRes.json();
        throw new Error(d.message || "Erreur initiation paiement");
      }
      return initRes.json();
    },
    onSuccess: (data: any) => {
      const isWave = svOperator?.name?.toLowerCase().includes("wave");
      if (data.requiresRedirect && data.redirectUrl && isWave) {
        // Seul Wave nécessite une redirection vers une page externe
        setSvRedirectUrl(data.redirectUrl);
        setStep("sv-redirect");
      } else if (data.requiresRedirect && !isWave) {
        // Les autres opérateurs (MTN, Moov, etc.) envoient un push USSD directement
        // sur le téléphone — pas besoin de redirection, on attend juste le webhook
        setSvPolling(true);
        setStep("sv-waiting");
      } else if (data.requiresOtp && data.otpToken) {
        // Orange Money (BF, CI, GN, ML, SN) — user must dial USSD then enter OTP
        setSvOtpToken(data.otpToken);
        setSvUssdCode(data.ussdCode || "");
        setSvOtpMessage(data.message || "");
        setStep("sv-otp");
      } else if (data.success) {
        // Standard push: invite sent directly to phone — wait for webhook
        setSvPolling(true);
        setStep("sv-waiting");
      } else {
        toast({ title: "Erreur", description: data.error || data.message || "Erreur paiement", variant: "destructive" });
      }
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // SendavaPay: retry failed payment
  const svRetryMutation = useMutation({
    mutationFn: async () => {
      if (!svPaymentToken) throw new Error("Token de paiement manquant");
      const res = await apiRequest("POST", "/api/sendavapay/retry", {
        paymentToken: svPaymentToken,
        depositId: svDepositId,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur retry");
      }
      return res.json();
    },
    onSuccess: () => {
      // Reset to operator selection to re-initiate
      setSvOtp("");
      setSvOtpToken("");
      setSvStatus("");
      setSvPolling(false);
      setStep("sv-operator");
      toast({ title: "Prêt à réessayer", description: "Sélectionnez un opérateur et relancez le paiement." });
    },
    onError: (e: any) => toast({ title: "Erreur retry", description: e.message, variant: "destructive" }),
  });

  // SendavaPay: submit OTP
  const svOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sendavapay/submit-otp", {
        otpToken: svOtpToken,
        otp: svOtp,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      setSvPolling(true);
      setStep("sv-waiting");
    },
    onError: (e: any) => toast({ title: "Erreur OTP", description: e.message, variant: "destructive" }),
  });

  const handleAmountNext = () => {
    if (!amount || Number(amount) < MIN_DEPOSIT) {
      toast({
        title: "Montant invalide",
        description: `Le minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`,
        variant: "destructive",
      });
      return;
    }

    openRobotPay();
  };

  const openRobotPay = () => {
    if (!depositCountry) {
      toast({ title: "Pays requis", description: "Sélectionnez le pays du paiement.", variant: "destructive" });
      return;
    }
    window.location.href = `/robotpay?amount=${encodeURIComponent(Number(amount))}&country=${encodeURIComponent(depositCountry)}`;
  };

  const getOperatorIcon = (name: string): string | null => {
    const n = name.toLowerCase();
    if (n.includes("tmoney") || n.includes("t-money")) return "/operators/tmoney.png";
    if (n.includes("moov")) return "/operators/moov.jpg";
    if (n.includes("orange")) return "/operators/orange.png";
    if (n.includes("mtn")) return "/operators/mtn.png";
    if (n.includes("airtel")) return "/operators/airtel.png";
    if (n.includes("wave")) return "/operators/wave.png";
    return null;
  };

  const handleSubmit = () => {
    if (!senderPhone.trim()) {
      toast({ title: "Numéro requis", description: "Entrez le numéro depuis lequel vous avez payé", variant: "destructive" });
      return;
    }
    if (!screenshot) {
      toast({ title: "Capture requise", description: "Veuillez joindre la capture d'écran du paiement", variant: "destructive" });
      return;
    }
    depositMutation.mutate();
  };

  if (!user) return null;

  // ── STEP 1: Amount ─────────────────────────────────────────────────────────
  if (step === "amount") return (
    <main className="recharge-reference min-h-screen bg-[#f7f3f0]">
      <style>{`
        .recharge-reference {
          color: #181818;
          font-family: Inter, Arial, sans-serif;
        }
        .recharge-reference .recharge-screen {
          width: 100%;
          max-width: 500px;
          min-height: 100vh;
          margin: 0 auto;
          overflow: hidden;
          background: #f7f3f0;
        }
        .recharge-reference .recharge-hero {
          position: relative;
          height: min(33.84vw, 169px);
          min-height: 135px;
          overflow: hidden;
          background: #ffca29;
        }
        .recharge-reference .history-button {
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
        .recharge-reference .history-icon {
          width: 30px;
          height: 30px;
          background: #3174d1;
          -webkit-mask-image: url("${historyIcon}");
          mask-image: url("${historyIcon}");
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: contain;
          mask-size: contain;
        }
        .recharge-reference .recharge-hero img {
          width: 100%;
          height: auto;
          transform: translateY(-10.55%);
          pointer-events: none;
        }
        .recharge-reference .recharge-back {
          position: absolute;
          top: 50%;
          left: 24px;
          width: 40px;
          height: 40px;
          transform: translateY(-50%);
        }
        .recharge-reference .amount-panel {
          min-height: 238px;
          padding: 29px 25px 35px;
          background: white;
          border-radius: 0 0 8px 8px;
        }
        .recharge-reference .preset-row {
          display: flex;
          gap: 18px;
        }
        .recharge-reference .preset {
          width: 82px;
          height: 50px;
          border-radius: 10px;
          background: #eeeeee;
          color: #24252a;
          font-size: 15px;
          font-weight: 500;
        }
        .recharge-reference .preset.active {
          background: ${TON_GRADIENT};
          color: white;
          box-shadow: 0 2px 4px rgba(247,178,0,.14);
        }
        .recharge-reference .amount-label {
          margin: 25px 0 23px 16px;
          color: #c98e41;
          font-size: 16px;
          font-weight: 400;
        }
        .recharge-reference .amount-input {
          display: flex;
          height: 55px;
          align-items: center;
          overflow: hidden;
          border-radius: 11px;
          background: #f5f2f0;
        }
        .recharge-reference .amount-input input {
          width: 100%;
          height: 100%;
          min-width: 0;
          padding: 0 14px;
          border: 0;
          outline: 0;
          color: #787878;
          background: transparent;
          font-size: 19px;
        }
        .recharge-reference .currency {
          padding: 0 13px 0 0;
          color: #707070;
          font-size: 24px;
          font-weight: 400;
        }
        .recharge-reference .continue {
          display: flex;
          width: 231px;
          height: 52px;
          align-items: center;
          justify-content: center;
          margin: 30px auto 0;
          border-radius: 28px;
          background: ${TON_GRADIENT};
          color: white;
          font-size: 18px;
          font-weight: 400;
          box-shadow: 0 2px 4px rgba(236,165,0,.16);
        }
        .recharge-reference .instructions {
          padding: 25px 9px 40px;
          color: #151515;
        }
        .recharge-reference .instructions-title {
          margin-bottom: 28px;
          font-size: 17px;
          font-weight: 800;
        }
        .recharge-reference .instructions-title::before {
          content: "▰";
          margin-right: 8px;
          color: #f3c414;
          font-size: 18px;
        }
        .recharge-reference .instruction {
          position: relative;
          margin: 0 0 25px 26px;
          font-size: 17px;
          font-weight: 500;
          line-height: 1.65;
        }
        .recharge-reference .instruction::before {
          content: "◆";
          position: absolute;
          left: -20px;
          top: 2px;
          color: #579ad8;
          font-size: 10px;
        }
        .recharge-reference .instruction strong { font-weight: 800; }
        @media (max-width: 360px) {
          .recharge-reference .amount-panel { padding-right: 18px; padding-left: 18px; }
          .recharge-reference .preset-row { gap: 10px; }
          .recharge-reference .preset { flex: 1; width: auto; }
          .recharge-reference .instruction { font-size: 15px; }
        }
      `}</style>

      <div className="recharge-screen">
        <section className="recharge-hero" aria-label="Recharger">
          <img src={rechargeReference} alt="" />
          <Link href="/history">
            <button className="history-button" aria-label="Historique des transactions">
              <span className="history-icon" aria-hidden="true" />
            </button>
          </Link>
          <Link href="/account">
            <button className="recharge-back" aria-label="Retour" />
          </Link>
        </section>

        <section className="amount-panel" aria-label="Montant de recharge">
          <div className="preset-row">
            {[3000, 12500, 32000].map((preset) => (
              <button
                key={preset}
                className={`preset ${amount === preset ? "active" : ""}`}
                onClick={() => setAmount(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <p className="amount-label">Veuillez saisir le montant de recharge</p>
          <label className="amount-input">
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value ? Number(event.target.value) : "")}
              aria-label="Montant de recharge"
            />
            <span className="currency">{currency}</span>
          </label>
        </section>

        <section className="mx-auto mt-2 w-[88%]" aria-label="Pays du paiement">
          <label htmlFor="deposit-country" className="mb-2 block text-sm font-semibold text-gray-800">Pays du paiement</label>
          <select
            id="deposit-country"
            value={depositCountry}
            onChange={(event) => setDepositCountry(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
          >
            <option value="">Sélectionnez un pays</option>
            {activeDepositCountries.map((item) => (
              <option key={item.code} value={item.code}>{item.name} ({item.currency})</option>
            ))}
          </select>
        </section>

        <button
          className="continue"
          onClick={handleAmountNext}
          disabled={!depositCountry}
        >
          Recharger maintenant
        </button>

        <section className="instructions" aria-label="Instructions de recharge">
          <h2 className="instructions-title">Instructions de Recharge :</h2>
          <p className="instruction"><strong>Montant minimum de recharge :</strong> {MIN_DEPOSIT.toLocaleString("fr-FR")} {currency}</p>
          <p className="instruction"><strong>Vérifiez attentivement vos informations de compte</strong> lors du virement pour éviter toute erreur de paiement</p>
          <p className="instruction"><strong>Chaque commande possède ses propres informations de paiement</strong> ; ne réutilisez pas les informations précédentes pour un second paiement</p>
          <p className="instruction"><strong>Après un virement réussi,</strong> veuillez patienter 10 à 30 minutes.</p>
        </section>
      </div>
    </main>
  );

  // ── Compatibility redirect for old in-app navigation ──────────────────────
  if (step === "select") return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
        <button className="flex items-center gap-1 text-gray-800" onClick={() => setStep("amount")}>
          <ChevronLeft className="h-5 w-5" /><span className="font-semibold text-base">Choisir le pays</span>
        </button>
        <Link href="/history"><button className="rounded-full border border-[#00CC2C] px-3 py-1.5 text-xs font-semibold text-[#00CC2C]">Historique</button></Link>
      </header>
      <div className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 p-4">
        <div><p className="text-xs text-gray-500">Montant à déposer</p><p className="text-xl font-bold text-[#00CC2C]">{Number(amount).toLocaleString()} FCFA</p></div>
        <button onClick={() => setStep("amount")} className="text-xs text-[#00CC2C] underline">Modifier</button>
      </div>
      <div className="p-4">
        <div className="rounded-2xl border-2 border-[#00CC2C] bg-green-50 p-4">
          <p className="mb-2 text-sm font-bold text-gray-900">Pays du paiement</p>
          <select value={depositCountry} onChange={e => setDepositCountry(e.target.value)} className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-700 outline-none">
            <option value="">Sélectionnez un pays</option>
            {activeDepositCountries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>)}
          </select>
          <p className="mt-2 text-xs text-gray-500">Seuls les pays activés par l’administration sont affichés.</p>
        </div>
        <button onClick={openRobotPay} disabled={!depositCountry} className="mt-5 w-full rounded-xl bg-[#00CC2C] py-3 font-semibold text-white disabled:opacity-50">Continuer vers le paiement</button>
      </div>
    </div>
  );

  // ── STEP 3: Manual deposit form ────────────────────────────────────────────
  if (step === "form" && selectedNumber) return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <button className="flex items-center gap-1 text-gray-800" onClick={() => setStep("select")}>
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-base">Confirmer le paiement</span>
        </button>
      </header>

      <div className="p-4 space-y-4 pb-10">
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 flex items-center gap-3">
          {selectedNumber.logoUrl ? (
            <img src={selectedNumber.logoUrl} alt={selectedNumber.operatorName} className="w-10 h-10 rounded-lg object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-orange-100">
              <Phone className="w-5 h-5 text-[#00CC2C]" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-500">Numéro destinataire</p>
            <p className="font-bold text-[#00CC2C] text-sm">{selectedNumber.operatorName} — {selectedNumber.phone}</p>
            <p className="text-xs text-gray-500">{selectedNumber.ownerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Montant</p>
            <p className="font-bold text-gray-800">{Number(amount).toLocaleString()} {currency}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Votre numéro payeur</p>
          <div className="border border-gray-300 rounded-md flex items-center overflow-hidden bg-white">
            <Phone className="w-4 h-4 text-gray-400 ml-4" />
            <input
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="Numéro depuis lequel vous avez payé"
              className="flex-1 px-3 py-4 text-sm text-gray-700 outline-none bg-transparent"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Référence / ID transaction <span className="text-gray-400 font-normal">(optionnel)</span></p>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Numéro de référence de la transaction"
            className="w-full border border-gray-300 rounded-md px-4 py-4 text-sm text-gray-700 outline-none bg-white"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Message reçu après paiement <span className="text-gray-400 font-normal">(optionnel)</span></p>
          <textarea
            value={paymentMessage}
            onChange={(e) => setPaymentMessage(e.target.value)}
            placeholder="Collez ici le SMS ou message de confirmation reçu..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 outline-none bg-white resize-none"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Capture d'écran du paiement <span className="text-red-500">*</span></p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl py-7 flex flex-col items-center gap-2 transition-colors ${
              screenshot ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#00CC2C] hover:bg-green-50"
            }`}
          >
            {screenshot ? (
              <><CheckCircle className="w-8 h-8 text-green-500" /><p className="text-sm font-medium text-green-600">{screenshotName}</p><p className="text-xs text-gray-400">Appuyez pour changer</p></>
            ) : (
              <><ImageIcon className="w-8 h-8 text-gray-400" /><p className="text-sm font-medium text-gray-600">Appuyez pour ajouter la capture</p><p className="text-xs text-gray-400">JPG, PNG — max 5 Mo</p></>
            )}
          </button>
          {screenshot && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
              <img src={screenshot} alt="Capture" className="w-full max-h-52 object-contain bg-gray-50" />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={depositMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-50"
          style={{ background: TON_GRADIENT }}
        >
          {depositMutation.isPending ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Upload className="w-5 h-5" /> Soumettre ma demande</span>
          )}
        </button>
      </div>
    </div>
  );

  // ── WESTPAY: Confirm + redirect ────────────────────────────────────────────
  if (step === "westpay") return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <button className="flex items-center gap-1 text-gray-800" onClick={() => setStep("select")}>
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-base">{westpayChannelName}</span>
        </button>
      </header>

      <div className="p-4 space-y-5 pb-10">
        {/* Amount recap */}
        <div className="mx-0 rounded-xl p-4 border border-orange-100 bg-orange-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Montant à déposer</p>
            <p className="text-xl font-bold text-[#00CC2C]">{Number(amount).toLocaleString()} {currency}</p>
          </div>
          <button onClick={() => setStep("amount")} className="text-xs text-[#00CC2C] underline">Modifier</button>
        </div>

        {/* Info card */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00CC2C]" />
            <p className="font-semibold text-gray-900 text-sm">Comment ça marche ?</p>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            1. Cliquez <strong>Payer avec {westpayChannelName}</strong> — vous serez redirigé vers la page de paiement sécurisée.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            2. Entrez votre numéro Mobile Money et validez le paiement USSD depuis votre téléphone.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            3. Après paiement, vous serez automatiquement redirigé ici. Votre solde est crédité après confirmation.
          </p>
        </div>

        <button
          onClick={() => wpInitiateMutation.mutate()}
          disabled={wpInitiateMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: TON_GRADIENT }}
        >
          {wpInitiateMutation.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Redirection en cours...</>
          ) : (
            <><ExternalLink className="w-5 h-5" /> Payer avec {westpayChannelName}</>
          )}
        </button>

        <p className="text-xs text-center text-gray-400">
          Paiement sécurisé via {westpayChannelName} — USSD Mobile Money
        </p>
      </div>
    </div>
  );

  // ── ASHTECHPAY: Select country + operator ─────────────────────────────────
  if (step === "ashtech-operator") return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <button className="flex items-center gap-1 text-gray-800" onClick={() => setStep("select")}>
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-base">{ashtechChannelName}</span>
        </button>
        <Link href="/history"><button className="text-xs text-[#00CC2C] font-semibold px-3 py-1.5 rounded-full border border-[#00CC2C]">Historique</button></Link>
      </header>
      <div className="mx-4 mt-4 rounded-xl p-4 border border-orange-100 bg-orange-50 flex items-center justify-between">
        <div><p className="text-xs text-gray-500">Montant à déposer</p><p className="text-xl font-bold text-[#00CC2C]">{Number(amount).toLocaleString()} {currency}</p></div>
        <button onClick={() => setStep("amount")} className="text-xs text-[#00CC2C] underline">Modifier</button>
      </div>
      <div className="p-4 space-y-4 pb-10">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Pays</p>
          {ashtechCountriesLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#00CC2C] mx-auto" /> : (
            <select value={ashtechCountry} onChange={(e) => { setAshtechCountry(e.target.value); setAshtechOperator(""); }}
              className="w-full border border-gray-300 rounded-md px-4 py-4 text-sm text-gray-700 outline-none bg-white appearance-none">
              {availableAshtechCountries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>)}
            </select>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Numéro Mobile Money</p>
          <div className="border border-gray-300 rounded-md flex items-center overflow-hidden bg-white">
            <Phone className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
            <input type="tel" inputMode="numeric" value={ashtechPhone} onChange={(e) => setAshtechPhone(e.target.value)}
              placeholder="Votre numéro Mobile Money" className="flex-1 px-3 py-4 text-sm text-gray-700 outline-none bg-transparent" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Opérateur Mobile Money</p>
          {ashtechOperators.length === 0 ? <p className="text-sm text-gray-400 text-center py-5">Aucun opérateur disponible pour ce pays</p> : (
            <div className="space-y-2">
              {ashtechOperators.map((operator, index) => {
                const name = typeof operator === "string" ? operator : (operator.name || operator.code || `Opérateur ${index + 1}`);
                return <button key={`${name}-${index}`} onClick={() => setAshtechOperator(name)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 ${ashtechOperator === name ? "border-[#00CC2C] bg-green-50" : "border-gray-200 bg-white"}`}>
                  <span className="font-semibold text-gray-900 text-sm">{name}</span>
                  {ashtechOperator === name && <CheckCircle className="w-5 h-5 text-[#00CC2C]" />}
                </button>;
              })}
            </div>
          )}
        </div>
        <button onClick={() => ashtechCollectMutation.mutate(undefined)} disabled={!ashtechOperator || !ashtechPhone.trim() || ashtechCollectMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-40" style={{ background: TON_GRADIENT }}>
          {ashtechCollectMutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Initiation en cours...</span> : "Initier le paiement"}
        </button>
      </div>
    </div>
  );

  // ── ASHTECHPAY: OTP screen ────────────────────────────────────────────────
  if (step === "ashtech-otp") return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={() => setStep("ashtech-operator")} className="flex items-center gap-1 text-gray-800"><ChevronLeft className="w-5 h-5" /><span className="font-semibold text-base">Code OTP</span></button>
      </header>
      <div className="p-4 space-y-5 pb-10">
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4">
          <p className="font-bold text-gray-900 text-sm mb-2">Code à composer</p>
          {ashtechUssdCode && <p className="bg-white rounded-xl border border-orange-200 px-4 py-3 text-center font-mono font-black text-2xl text-[#00CC2C] tracking-widest">{ashtechUssdCode}</p>}
          <p className="text-sm text-gray-600 mt-3">
            {ashtechUssdCode
              ? "Composez ce code sur votre téléphone pour obtenir le code OTP, puis saisissez-le ci-dessous."
              : "Un code OTP vous a été envoyé. Saisissez-le ci-dessous."}
          </p>
        </div>
        <input type="text" inputMode="numeric" value={ashtechOtp} onChange={(e) => setAshtechOtp(e.target.value)} maxLength={8}
          placeholder="Code OTP reçu par SMS" className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-2xl tracking-widest font-black text-gray-800 outline-none bg-white focus:border-[#00CC2C]" />
        <button onClick={() => ashtechCollectMutation.mutate(ashtechOtp)} disabled={!ashtechOtp.trim() || ashtechCollectMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-40" style={{ background: TON_GRADIENT }}>
          {ashtechCollectMutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Vérification...</span> : "Valider le code OTP"}
        </button>
      </div>
    </div>
  );

  // ── ASHTECHPAY: Wave redirect ─────────────────────────────────────────────
  if (step === "ashtech-redirect") return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={() => setStep("ashtech-operator")} className="flex items-center gap-1 text-gray-800"><ChevronLeft className="w-5 h-5" /><span className="font-semibold text-base">Finaliser le paiement</span></button>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center"><ExternalLink className="w-10 h-10 text-[#00CC2C]" /></div>
        <div><p className="font-bold text-gray-900 text-xl mb-2">Finaliser avec Wave</p><p className="text-sm text-gray-500">Ouvrez la page Wave pour confirmer votre dépôt de <strong>{Number(amount).toLocaleString()} {currency}</strong>.</p></div>
        <a href={ashtechWaveUrl} target="_blank" rel="noopener noreferrer" onClick={() => { setAshtechPolling(true); setStep("ashtech-waiting"); }}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg flex items-center justify-center gap-2" style={{ background: TON_GRADIENT }}>
          <ExternalLink className="w-5 h-5" /> Ouvrir Wave
        </a>
      </div>
    </div>
  );

  // ── ASHTECHPAY: Waiting / polling ─────────────────────────────────────────
  if (step === "ashtech-waiting") return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100"><span className="font-semibold text-base text-gray-800">Paiement en cours</span></header>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center"><RefreshCw className="w-10 h-10 text-[#00CC2C] animate-spin" style={{ animationDuration: "2s" }} /></div>
        <div><p className="font-bold text-gray-900 text-xl">En attente de confirmation</p><p className="text-sm text-gray-500 mt-2">Validez le paiement sur votre téléphone. Cette page se met à jour automatiquement.</p></div>
        <div className="flex gap-3 w-full"><Link href="/history" className="flex-1"><button className="w-full py-3 rounded-full border border-[#00CC2C] text-[#00CC2C] font-semibold text-sm">Voir l'historique</button></Link>
          <button onClick={() => { setStep("amount"); setAmount(""); setAshtechDepositId(null); setAshtechPolling(false); setAshtechStatus(""); }} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">Nouvelle recharge</button>
        </div>
      </div>
    </div>
  );

  // ── SENDAVAPAY: Select country + operator ──────────────────────────────────
  if (step === "sv-operator") return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <button className="flex items-center gap-1 text-gray-800" onClick={() => setStep("amount")}>
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-base">Top up</span>
        </button>
        <Link href="/history">
          <button className="text-xs text-[#00CC2C] font-semibold px-3 py-1.5 rounded-full border border-[#00CC2C]">Historique</button>
        </Link>
      </header>

      {/* Amount recap */}
      <div className="mx-4 mt-4 rounded-xl p-4 border border-orange-100 bg-orange-50 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Montant à déposer</p>
          <p className="text-xl font-bold text-[#00CC2C]">{Number(amount).toLocaleString()} {currency}</p>
        </div>
        <button onClick={() => setStep("amount")} className="text-xs text-[#00CC2C] underline">Modifier</button>
      </div>

      <div className="p-4 space-y-4 pb-10">
        {/* Country selector */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Pays</p>
          <select
            value={svCountry}
            onChange={(e) => { setSvCountry(e.target.value); setSvOperator(null); }}
            className="w-full border border-gray-300 rounded-md px-4 py-4 text-sm text-gray-700 outline-none bg-white appearance-none"
          >
            {(apiCountries.length > 0 ? apiCountries.filter(c => c.isActive) : COUNTRIES).map((c: any) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Phone number */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Numéro Mobile Money</p>
          <div className="border border-gray-300 rounded-md flex items-center overflow-hidden bg-white">
            <Phone className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
            <input
              type="tel"
              inputMode="numeric"
              value={svPhone}
              onChange={(e) => setSvPhone(e.target.value)}
              placeholder="Numéro sur lequel envoyer la demande"
              className="flex-1 px-3 py-4 text-sm text-gray-700 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Operator selector */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Opérateur Mobile Money</p>
          {svOperatorsLoading ? (
            <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#00CC2C]" />
            </div>
          ) : svOperators.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Aucun opérateur disponible pour ce pays</p>
            </div>
          ) : (
            <div className="space-y-2">
              {svOperators.map((op) => {
                const icon = getOperatorIcon(op.name);
                return (
                  <button
                    key={op.id}
                    onClick={() => setSvOperator(op)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all ${
                      svOperator?.id === op.id
                        ? "border-[#00CC2C] bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {icon ? (
                        <img src={icon} alt={op.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          svOperator?.id === op.id ? "bg-[#00CC2C] text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          {op.name.charAt(0)}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{op.name}</p>
                        {op.requiresOtp && <p className="text-xs text-[#00CC2C]">Code OTP requis</p>}
                      </div>
                    </div>
                    {svOperator?.id === op.id && <CheckCircle className="w-5 h-5 text-[#00CC2C]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => svInitiateMutation.mutate()}
          disabled={!svOperator || svInitiateMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-40"
            style={{ background: TON_GRADIENT }}
        >
          {svInitiateMutation.isPending ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Initiation en cours...</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><img src="/topup-icon.png" className="w-6 h-6 object-contain" alt="topup" /> Initier le paiement</span>
          )}
        </button>
      </div>
    </div>
  );

  // ── SENDAVAPAY: OTP screen ─────────────────────────────────────────────────
  if (step === "sv-otp") return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={() => setStep("sv-operator")} className="flex items-center gap-1 text-gray-800">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-base">Code OTP</span>
        </button>
      </header>

      <div className="p-4 space-y-5 pb-10">

        {/* Step 1 — Dial USSD code */}
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#00CC2C] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">1</span>
            </div>
            <p className="font-bold text-gray-900 text-sm">Composez ce code sur votre téléphone</p>
          </div>
          {svUssdCode ? (
            <div className="bg-white rounded-xl border border-orange-200 px-4 py-3 text-center">
              <p className="font-mono font-black text-2xl text-[#00CC2C] tracking-widest">{svUssdCode}</p>
              <p className="text-xs text-gray-400 mt-1">Composez ce code USSD sur votre téléphone</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Composez le code USSD de votre opérateur (ex&nbsp;: <span className="font-mono font-bold text-[#00CC2C]">*144#</span>) sur votre téléphone pour recevoir le code OTP par SMS.
            </p>
          )}
        </div>

        {/* Step 2 — Enter OTP */}
        <div className="rounded-2xl border-2 border-orange-100 bg-orange-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#00CC2C] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">2</span>
            </div>
            <p className="font-bold text-gray-900 text-sm">Entrez le code OTP reçu par SMS</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Après avoir composé le code, vous recevrez un SMS avec un code OTP. Saisissez-le ci-dessous pour confirmer le paiement de <strong>{Number(amount).toLocaleString()} {currency}</strong>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={svOtp}
            onChange={(e) => setSvOtp(e.target.value)}
            placeholder="Code OTP reçu par SMS"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-2xl tracking-widest font-black text-gray-800 outline-none bg-white focus:border-[#00CC2C]"
            maxLength={8}
          />
        </div>

        <button
          onClick={() => svOtpMutation.mutate()}
          disabled={!svOtp.trim() || svOtpMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-40"
          style={{ background: TON_GRADIENT }}
        >
          {svOtpMutation.isPending ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Vérification...</span>
          ) : "Valider le code OTP"}
        </button>
      </div>
    </div>
  );

  // ── SENDAVAPAY: Redirect screen (Wave, etc.) ──────────────────────────────
  if (step === "sv-redirect") return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={() => setStep("sv-operator")} className="flex items-center gap-1 text-gray-800">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-base">Finaliser le paiement</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          <ExternalLink className="w-10 h-10 text-[#00CC2C]" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-xl mb-2">Finaliser sur l'application</p>
          <p className="text-sm text-gray-500">
            Appuyez sur le bouton ci-dessous pour ouvrir la page de paiement de l'opérateur
            et confirmer votre dépôt de <strong>{Number(amount).toLocaleString()} {currency}</strong>.
          </p>
        </div>
        <a
          href={svRedirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg flex items-center justify-center gap-2"
           style={{ background: TON_GRADIENT }}
          onClick={() => { setSvPolling(true); setStep("sv-waiting"); }}
        >
          <ExternalLink className="w-5 h-5" /> Ouvrir la page de paiement
        </a>
      </div>
    </div>
  );

  // ── SENDAVAPAY: Waiting / polling screen ────────────────────────────────────
  if (step === "sv-waiting") return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <span className="font-semibold text-base text-gray-800">Paiement en cours</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        {svStatus === "approved" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xl">Paiement confirmé !</p>
              <p className="text-sm text-gray-500 mt-1">Votre solde a été crédité de <strong>{Number(amount).toLocaleString()} {currency}</strong></p>
            </div>
          </>
        ) : svStatus === "rejected" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xl">Paiement échoué</p>
              <p className="text-sm text-gray-500 mt-1">Le paiement a été refusé ou annulé.</p>
            </div>
            <div className="flex gap-3 w-full">
              {svPaymentToken && (
                <button
                  onClick={() => svRetryMutation.mutate()}
                  disabled={svRetryMutation.isPending}
                  className="flex-1 py-3 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                   style={{ background: TON_GRADIENT }}
                >
                  {svRetryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Réessayer
                </button>
              )}
              <button
                onClick={() => { setStep("amount"); setAmount(""); setSvOperator(null); setSvDepositId(null); setSvPaymentToken(""); setSvPolling(false); setSvStatus(""); }}
                className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm"
              >
                Nouvelle recharge
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-[#00CC2C] animate-spin" style={{ animationDuration: "2s" }} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xl">En attente de confirmation</p>
              <p className="text-sm text-gray-500 mt-2">
                Une demande de paiement de <strong>{Number(amount).toLocaleString()} {currency}</strong> a été envoyée sur votre téléphone.<br />
                Acceptez-la sur votre téléphone. Cette page se met à jour automatiquement.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Link href="/history" className="flex-1">
                <button className="w-full py-3 rounded-full border border-[#00CC2C] text-[#00CC2C] font-semibold text-sm">
                  Voir l'historique
                </button>
              </Link>
              <button
                onClick={() => { setStep("amount"); setAmount(""); setSvOperator(null); setSvDepositId(null); setSvPaymentToken(""); setSvPolling(false); setSvStatus(""); }}
                className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm"
              >
                Nouvelle recharge
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return null;
}
