import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { ChevronDown, Code2, Loader2, LockKeyhole, Square } from "lucide-react";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const params = new URLSearchParams(searchString);
  // The current invitation format is /invitation?invite?code=ABC123.
  // Because the format contains a second "?", parse that part explicitly.
  const currentInvitationMatch = searchString.match(/[?&]code=([^&?#]+)/i);
  const refCode = currentInvitationMatch?.[1]
    || params.get("money")
    || params.get("reg")
    || params.get("code")
    || "";

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      country: "TD",
      password: "",
      confirmPassword: "",
      invitationCode: refCode,
    },
  });

  const { data: apiCountries } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = form.watch("country");

  useEffect(() => {
    if (!apiCountries || apiCountries.length === 0) return;
    const isValid = apiCountries.some(ac => ac.code === selectedCountry && ac.isActive);
    if (!isValid) {
      const first = apiCountries.find(ac => ac.isActive);
      if (first) form.setValue("country", first.code);
    }
  }, [apiCountries, selectedCountry, form]);

  const countryData = (() => {
    if (apiCountries && apiCountries.length > 0) {
      const c = apiCountries.find(ac => ac.code === selectedCountry && ac.isActive);
      if (c) return { phonePrefix: c.phonePrefix, name: c.name };
      return null;
    }
    const f = FALLBACK_COUNTRIES.find(fc => fc.code === selectedCountry);
    return f ? { phonePrefix: f.phonePrefix, name: f.name } : null;
  })();

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        fullName: `User_${data.phone}`,
        phone: data.phone,
        country: data.country,
        password: data.password,
        invitationCode: data.invitationCode,
      });
      toast({ title: "Inscription réussie !", description: "Bienvenue sur Stone by ton !" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur d'inscription", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const displayedPrefix = countryData?.phonePrefix || "228";

  return (
    <main className="auth-reference auth-register">
      <style>{`
        .auth-reference { width: 100%; min-height: 100dvh; overflow-x: hidden; background: #0d150f; color: #00c926; font-family: Arial, sans-serif; }
        .auth-reference *, .auth-reference *::before, .auth-reference *::after { box-sizing: border-box; }
        .auth-reference .auth-screen { width: 100%; max-width: 512px; min-height: 100dvh; margin: 0 auto; overflow: hidden; background: #111a13; }
        .auth-reference .auth-panel { min-height: 100dvh; box-sizing: border-box; background: #111a13; }
        .auth-register .auth-panel { width: 100%; padding: 18px clamp(16px, 6.05vw, 31px) 40px; }
        .auth-register .auth-title { margin: 0 0 22px; color: #fff; font-size: clamp(39px, 10.55vw, 54px); font-weight: 400; line-height: 60px; }
        .auth-reference form { width: 100%; min-width: 0; }
        .auth-reference .auth-fields { display: grid; gap: 20px; }
        .auth-reference .auth-field { display: flex; width: 100%; min-width: 0; height: 67px; align-items: center; overflow: hidden; border-radius: 11px; padding: 0 clamp(12px, 3.9vw, 20px); background: #fff; box-shadow: 0 1px 2px rgba(0, 128, 30, .12); }
        .auth-reference .auth-field input { width: 0; min-width: 0; flex: 1 1 auto; overflow: hidden; border: 0; outline: 0; background: transparent; color: #1cc33a; font-size: clamp(15px, 3.9vw, 20px); font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }
        .auth-reference .auth-field input::placeholder { color: #19bd37; opacity: 1; }
        .auth-reference .auth-prefix { display: flex; flex: 0 1 auto; min-width: 0; align-items: center; gap: clamp(6px, 2.15vw, 11px); margin-right: clamp(5px, 1.56vw, 8px); border: 0; padding: 0; background: transparent; color: #25c943; font-size: clamp(20px, 5.47vw, 28px); line-height: 1; white-space: nowrap; }
        .auth-reference .auth-prefix svg { width: clamp(25px, 6.25vw, 32px); height: clamp(25px, 6.25vw, 32px); flex: none; stroke-width: 2.7; }
        .auth-reference .auth-prefix .prefix-chevron { width: clamp(15px, 3.52vw, 18px); height: clamp(15px, 3.52vw, 18px); margin-left: -9px; color: #b8b8b8; stroke-width: 1.6; }
        .auth-reference .auth-field-icon { width: clamp(27px, 6.64vw, 34px); height: clamp(27px, 6.64vw, 34px); flex: none; margin-right: clamp(7px, 1.95vw, 10px); color: #19c83a; stroke-width: 2.9; }
        .auth-reference .auth-switch { display: block; max-width: 100%; width: fit-content; margin: 21px 0 0 auto; border: 0; padding: 0; background: transparent; color: #fff; font-size: clamp(16px, 3.9vw, 20px); font-weight: 400; line-height: 28px; text-align: right; text-decoration: underline; text-underline-offset: 2px; }
        .auth-reference .auth-submit { display: grid; width: 100%; height: 64px; place-items: center; margin-top: 15px; border: 0; border-radius: 11px; background: #fff; color: #00ca26; font-size: clamp(23px, 5.66vw, 29px); font-weight: 700; line-height: 1; box-shadow: 0 1px 2px rgba(0, 128, 30, .15); transition: transform .12s ease, background-color .12s ease; }
        .auth-reference .auth-submit:active { transform: scale(.98); background: #f5fff6; }
        .auth-reference .auth-submit:disabled { opacity: .68; }
        .auth-reference .auth-error { margin: -13px 0 -7px 4px; color: #fff; font-size: 12px; }
        @media (max-width: 370px) {
          .auth-register .auth-panel { padding-right: 22px; padding-left: 22px; }
          .auth-reference .auth-field { height: 64px; }
          .auth-reference .auth-fields { gap: 16px; }
          .auth-reference .auth-prefix { margin-right: 5px; }
          .auth-reference .auth-field-icon { margin-right: 8px; }
          .auth-reference .auth-submit { height: 62px; }
        }
      `}</style>

      <div className="auth-screen">
        <section className="auth-panel">
          <h1 className="auth-title">REGISTER</h1>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <input type="hidden" {...form.register("country")} />

            <div className="auth-fields">
              <div className="auth-field">
                <button type="button" className="auth-prefix" onClick={() => setCountryModalOpen(true)} data-testid="button-select-country" aria-label="Choisir le pays">
                  <Square aria-hidden="true" />
                  <span>+{displayedPrefix}</span>
                  <ChevronDown className="prefix-chevron" aria-hidden="true" />
                </button>
                <input {...form.register("phone")} type="tel" autoComplete="username" placeholder="Entrez le numéro de téléphone" data-testid="input-phone" />
              </div>
              {form.formState.errors.phone && <p className="auth-error">{form.formState.errors.phone.message}</p>}

              <div className="auth-field">
                <LockKeyhole className="auth-field-icon" aria-hidden="true" />
                <input {...form.register("password")} type="password" autoComplete="new-password" placeholder="Entrez le mot de passe" data-testid="input-password" />
              </div>
              {form.formState.errors.password && <p className="auth-error">{form.formState.errors.password.message}</p>}

              <div className="auth-field">
                <LockKeyhole className="auth-field-icon" aria-hidden="true" />
                <input {...form.register("confirmPassword")} type="password" autoComplete="new-password" placeholder="Ressaisir le mot de passe" data-testid="input-confirm-password" />
              </div>
              {form.formState.errors.confirmPassword && <p className="auth-error">{form.formState.errors.confirmPassword.message}</p>}

              <div className="auth-field">
                <Code2 className="auth-field-icon" aria-hidden="true" />
                <input {...form.register("invitationCode")} placeholder="Code d'invitation" data-testid="input-invitation-code" />
              </div>
            </div>

            <button type="button" className="auth-switch" onClick={() => navigate("/login")} data-testid="link-login">Aller à la connexion &gt;</button>
            <button type="submit" disabled={isLoading} className="auth-submit" data-testid="button-register">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "S'inscrire"}
            </button>
          </form>
        </section>
      </div>

      <CountrySelector selectedCountryCode={selectedCountry} open={countryModalOpen} onClose={() => setCountryModalOpen(false)} onSelect={(code) => form.setValue("country", code, { shouldValidate: true })} />
    </main>
  );
}
