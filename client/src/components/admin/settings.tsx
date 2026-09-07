import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save, Link, Clock, Users, Zap } from "lucide-react";

const NETWORKS = [
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];
const INPAY_COUNTRIES = [
  { code: "SN", name: "Sénégal" },
  { code: "ML", name: "Mali" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "BF", name: "Burkina Faso" },
  { code: "TG", name: "Togo" },
  { code: "BJ", name: "Bénin" },
  { code: "GH", name: "Ghana" },
  { code: "CM", name: "Cameroun" },
  { code: "CG", name: "Congo" },
  { code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzanie" },
  { code: "UG", name: "Ouganda" },
  { code: "ZA", name: "Afrique du Sud" },
] as const;

const settingsSchema = z.object({
  supportLink: z.string().min(5, "Lien requis"),
  supportType: z.string().min(1, "Réseau requis"),
  supportLabel: z.string().min(1, "Label requis"),
  support2Link: z.string().min(5, "Lien requis"),
  support2Type: z.string().min(1, "Réseau requis"),
  support2Label: z.string().min(1, "Label requis"),
  channelLink: z.string().min(5, "Lien requis"),
  channelType: z.string().min(1, "Réseau requis"),
  channelLabel: z.string().min(1, "Label requis"),
  groupLink: z.string().min(5, "Lien requis"),
  groupType: z.string().min(1, "Réseau requis"),
  groupLabel: z.string().min(1, "Label requis"),
  popupButtonLabel: z.string().min(1, "Label requis"),
  supportEnabled: z.boolean(),
  support2Enabled: z.boolean(),
  channelEnabled: z.boolean(),
  groupEnabled: z.boolean(),
  signupBonus: z.string().min(1, "Bonus requis"),
  minDeposit: z.string().min(1, "Montant requis"),
  minWithdrawal: z.string().min(1, "Montant requis"),
  withdrawalFees: z.string().min(1, "Frais requis"),
  maxWithdrawalsPerDay: z.string().min(1, "Requis"),
  withdrawalStartHour: z.string().min(1, "Heure requise"),
  withdrawalEndHour: z.string().min(1, "Heure requise"),
  level1Commission: z.string().min(1, "Commission requise"),
  level2Commission: z.string().min(1, "Commission requise"),
  level3Commission: z.string().min(1, "Commission requise"),
  sendavapayEnabled: z.boolean(),
  sendavapayChannelName: z.string().min(1, "Nom requis"),
  sendavapayWebhookSecret: z.string(),
  westpayEnabled: z.boolean(),
  westpayChannelName: z.string().min(1, "Nom requis"),
  westpayCountries: z.string(),
  westpayWebhookSecret: z.string(),
  ashtechEnabled: z.boolean(),
  ashtechChannelName: z.string().min(1, "Nom requis"),
  ashtechCountries: z.string(),
  inpayEnabled: z.boolean(),
  inpayChannelName: z.string().min(1, "Nom requis"),
  inpayCountries: z.string(),
  inpayMerchantId_SN: z.string(),
  inpayMerchantId_ML: z.string(),
  inpayMerchantId_CI: z.string(),
  inpayMerchantId_BF: z.string(),
  inpayMerchantId_TG: z.string(),
  inpayMerchantId_BJ: z.string(),
  inpayMerchantId_GH: z.string(),
  inpayMerchantId_CM: z.string(),
  inpayMerchantId_CG: z.string(),
  inpayMerchantId_KE: z.string(),
  inpayMerchantId_TZ: z.string(),
  inpayMerchantId_UG: z.string(),
  inpayMerchantId_ZA: z.string(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface AdminSettingsProps {
  isSuperAdmin: boolean;
}

export default function AdminSettings({ isSuperAdmin }: AdminSettingsProps) {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      supportLink: "https://t.me/sybotx",
      supportType: "telegram",
      supportLabel: "Service client",
      support2Link: "https://t.me/sybotx",
      support2Type: "telegram",
      support2Label: "Service client 2",
      channelLink: "https://t.me/sybotx",
      channelType: "telegram",
      channelLabel: "Chaîne officielle",
      groupLink: "https://t.me/sybotx",
      groupType: "telegram",
      groupLabel: "Groupe de discussion",
      popupButtonLabel: "Cliquez ici pour rejoindre le groupe Telegram",
      supportEnabled: true,
      support2Enabled: true,
      channelEnabled: true,
      groupEnabled: true,
      signupBonus: "500",
      minDeposit: "4000",
      minWithdrawal: "1500",
      withdrawalFees: "18",
      maxWithdrawalsPerDay: "1",
      withdrawalStartHour: "9",
      withdrawalEndHour: "17",
      level1Commission: "15",
      level2Commission: "2",
      level3Commission: "1",
      sendavapayEnabled: false,
      sendavapayChannelName: "SendavaPay",
      sendavapayWebhookSecret: "",
      westpayEnabled: false,
      westpayChannelName: "WestPay",
      westpayCountries: "",
      westpayWebhookSecret: "",
      ashtechEnabled: false,
      ashtechChannelName: "AshtechPay",
      ashtechCountries: "",
      inpayEnabled: false,
      inpayChannelName: "InPay",
      inpayCountries: "",
      ...Object.fromEntries(INPAY_COUNTRIES.map(({ code }) => [`inpayMerchantId_${code}`, ""])),
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        supportLink: settings.supportLink || "https://t.me/sybotx",
        supportType: settings.supportType || "telegram",
        supportLabel: settings.supportLabel || "Service client",
        support2Link: settings.support2Link || "https://t.me/sybotx",
        support2Type: settings.support2Type || "telegram",
        support2Label: settings.support2Label || "Service client 2",
        channelLink: settings.channelLink || "https://t.me/sybotx",
        channelType: settings.channelType || "telegram",
        channelLabel: settings.channelLabel || "Chaîne officielle",
        groupLink: settings.groupLink || "https://t.me/sybotx",
        groupType: settings.groupType || "telegram",
        groupLabel: settings.groupLabel || "Groupe de discussion",
        popupButtonLabel: settings.popupButtonLabel || "Cliquez ici pour rejoindre le groupe Telegram",
        supportEnabled: settings.supportEnabled !== "false",
        support2Enabled: settings.support2Enabled !== "false",
        channelEnabled: settings.channelEnabled !== "false",
        groupEnabled: settings.groupEnabled !== "false",
        signupBonus: settings.signupBonus || "500",
        minDeposit: settings.minDeposit || "4000",
        minWithdrawal: settings.minWithdrawal || "1500",
        withdrawalFees: settings.withdrawalFees || "18",
        maxWithdrawalsPerDay: settings.maxWithdrawalsPerDay || "1",
        withdrawalStartHour: settings.withdrawalStartHour || "9",
        withdrawalEndHour: settings.withdrawalEndHour || "17",
        level1Commission: settings.level1Commission || "15",
        level2Commission: settings.level2Commission || "2",
        level3Commission: settings.level3Commission || "1",
        westpayEnabled: settings.westpayEnabled === "true",
        westpayChannelName: settings.westpayChannelName || "WestPay",
        westpayCountries: settings.westpayCountries || "",
        westpayWebhookSecret: settings.westpayWebhookSecret || "",
        sendavapayEnabled: settings.sendavapayEnabled === "true",
        sendavapayChannelName: settings.sendavapayChannelName || "SendavaPay",
        sendavapayWebhookSecret: settings.sendavapayWebhookSecret || "",
        ashtechEnabled: settings.ashtechEnabled === "true",
        ashtechChannelName: settings.ashtechChannelName || "AshtechPay",
        ashtechCountries: settings.ashtechCountries || "",
        inpayEnabled: settings.inpayEnabled === "true",
        inpayChannelName: settings.inpayChannelName || "InPay",
        inpayCountries: settings.inpayCountries || "",
        ...Object.fromEntries(INPAY_COUNTRIES.map(({ code }) => [
          `inpayMerchantId_${code}`,
          settings[`inpayMerchantId_${code}`] || "",
        ])),
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      const serialized = {
        ...data,
        supportEnabled: String(data.supportEnabled),
        support2Enabled: String(data.support2Enabled),
        channelEnabled: String(data.channelEnabled),
        groupEnabled: String(data.groupEnabled),
        sendavapayEnabled: String(data.sendavapayEnabled),
        westpayEnabled: String(data.westpayEnabled),
        ashtechEnabled: String(data.ashtechEnabled),
        inpayEnabled: String(data.inpayEnabled),
      };
      const response = await apiRequest("POST", "/api/admin/settings", serialized);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/links"] });
      toast({ title: "Paramètres enregistrés !" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const [inpayBalances, setInpayBalances] = useState<Record<string, string>>({});
  const inpayBalanceMutation = useMutation({
    mutationFn: async (country: string) => {
      const response = await apiRequest("GET", `/api/admin/inpay/balance/${country}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Solde InPay indisponible");
      return { country, balance: data.balance as string };
    },
    onSuccess: ({ country, balance }) => {
      setInpayBalances((current) => ({ ...current, [country]: balance }));
    },
    onError: (error: any) => {
      toast({ title: "Erreur InPay", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">

        {/* ── Liens & Réseaux sociaux ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              Liens & Réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Support 1 */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 1 — Service client</p>
                <FormField control={form.control} name="supportEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="supportLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Service client" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supportType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Réseau..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="supportLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Support 2 */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 2 — Service client</p>
                <FormField control={form.control} name="support2Enabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="support2Label" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Service client 2" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="support2Type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Réseau..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="support2Link" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Channel */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 3 — Chaîne officielle</p>
                <FormField control={form.control} name="channelEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="channelLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Chaîne officielle" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="channelType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Réseau..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="channelLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Group */}
            <div className="space-y-2 border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lien 4 — Groupe de discussion</p>
                <FormField control={form.control} name="groupEnabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField control={form.control} name="groupLabel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé affiché</FormLabel>
                    <FormControl><Input {...field} placeholder="Groupe de discussion" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="groupType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réseau social</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Réseau..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="groupLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Popup dashboard button */}
            <div className="border border-red-500 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-600">Bouton du popup sur le tableau de bord</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Ce bouton apparaît dans la fenêtre d'avertissement qui s'ouvre automatiquement sur l'accueil.
              </p>
              <FormField control={form.control} name="popupButtonLabel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Texte du bouton <span className="text-red-500">(popup dashboard)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Ex: Cliquez ici pour rejoindre le groupe Telegram" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="groupLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien du bouton <span className="text-red-500">(popup dashboard)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                  <FormDescription>Ce lien est aussi utilisé dans le popup de bienvenue du tableau de bord.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

          </CardContent>
        </Card>

        {/* ── Retraits & Bonus ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Retraits & Bonus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="signupBonus" render={({ field }) => (
              <FormItem>
                <FormLabel>Bonus d'inscription (FCFA)</FormLabel>
                <FormControl><Input {...field} type="number" min="0" /></FormControl>
                <FormDescription>Montant offert à chaque nouvel utilisateur à l'inscription.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="minDeposit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dépôt minimum (FCFA)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="minWithdrawal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Retrait minimum (FCFA)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalFees" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de retrait (%)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="100" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maxWithdrawalsPerDay" render={({ field }) => (
                <FormItem>
                  <FormLabel>Max retraits / jour</FormLabel>
                  <FormControl><Input {...field} type="number" min="1" max="10" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalStartHour" render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure début retraits</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="withdrawalEndHour" render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure fin retraits</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* ── Commissions ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Commissions de parrainage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="level1Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau 1 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level2Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau 2 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="level3Commission" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau 3 (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* ── SendavaPay ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              SendavaPay — Paiement automatique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Activer SendavaPay</p>
                <p className="text-xs text-gray-500">Affiche l'option de paiement automatique Mobile Money</p>
              </div>
              <FormField control={form.control} name="sendavapayEnabled" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="sendavapayChannelName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du canal affiché</FormLabel>
                <FormControl><Input {...field} placeholder="SendavaPay" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sendavapayWebhookSecret" render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook Secret</FormLabel>
                <FormControl><Input {...field} type="password" placeholder="whsec_..." /></FormControl>
                 <FormDescription className="text-xs">Configurez SENDAVAPAY_WEBHOOK_SECRET dans les Secrets/variables d'environnement du serveur. Cette variable est prioritaire et obligatoire pour accepter les webhooks.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-xs text-orange-700 space-y-1">
              <p className="font-semibold">Configuration requise :</p>
              <p>1. Ajoutez la variable d'environnement <code className="bg-orange-100 px-1 rounded">SENDAVAPAY_API_KEY</code> avec votre clé SDK (commence par <code className="bg-orange-100 px-1 rounded">sdk_</code>)</p>
               <p>2. Ajoutez le secret Webhook dans SENDAVAPAY_WEBHOOK_SECRET, puis configurez l'URL webhook dans votre compte SendavaPay : <code className="bg-orange-100 px-1 rounded">/api/webhooks/sendavapay</code></p>
            </div>
          </CardContent>
        </Card>

        {/* ── WestPay ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              WestPay — Page de paiement hébergée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Activer WestPay</p>
                <p className="text-xs text-gray-500">Affiche l'option de paiement WestPay (Mobile Money par redirection)</p>
              </div>
              <FormField control={form.control} name="westpayEnabled" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="westpayChannelName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du canal affiché</FormLabel>
                <FormControl><Input {...field} placeholder="WestPay" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="westpayCountries" render={({ field }) => (
              <FormItem>
                <FormLabel>Pays activés (codes séparés par virgule)</FormLabel>
                <FormControl><Input {...field} placeholder="TG,CM,BJ,BF,SN,CI — vide = tous les pays" /></FormControl>
                <FormDescription className="text-xs">Laissez vide pour afficher WestPay dans tous les pays. Chaque pays peut avoir sa propre clé API pour les retraits (WESTPAY_API_KEY_TG, etc.).</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="westpayWebhookSecret" render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook Secret</FormLabel>
                <FormControl><Input {...field} type="password" placeholder="Secret webhook WestPay..." /></FormControl>
                 <FormDescription className="text-xs">Configurez WESTPAY_WEBHOOK_SECRET dans les Secrets du serveur. Cette variable est prioritaire et obligatoire pour accepter les webhooks.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-xs text-orange-700 space-y-1">
              <p className="font-semibold">Variables d'environnement à définir sur le serveur (Plesk, VPS…) :</p>
              <p>• <code className="bg-orange-100 px-1 rounded">WESTPAY_MERCHANT_SLUG</code> — votre identifiant marchand WestPay</p>
              <p>• <code className="bg-orange-100 px-1 rounded">WESTPAY_API_KEY_TG</code>, <code className="bg-orange-100 px-1 rounded">WESTPAY_API_KEY_BF</code>… — clé API par pays</p>
              <p>• URL webhook à configurer dans votre compte WestPay : <code className="bg-orange-100 px-1 rounded">/api/webhooks/westpay</code></p>
              <p className="font-semibold text-red-600 mt-1">⚠ Ne jamais saisir ces clés dans un formulaire ou les stocker en base de données.</p>
            </div>
          </CardContent>
        </Card>

        {/* ── AshtechPay ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              InPay — Paiements et retraits par pays
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Activer InPay</p>
                <p className="text-xs text-gray-500">Redirection de paiement et envoi des retraits vers InPay</p>
              </div>
              <FormField control={form.control} name="inpayEnabled" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="inpayChannelName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du canal affiché</FormLabel>
                <FormControl><Input {...field} placeholder="InPay" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="inpayCountries" render={({ field }) => (
              <FormItem>
                <FormLabel>Pays InPay activés</FormLabel>
                <FormControl><Input {...field} placeholder="TG,CI,BJ — codes séparés par virgule" /></FormControl>
                <FormDescription className="text-xs">Seuls ces pays afficheront InPay. Les identifiants marchands ci-dessous sont séparés par pays.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-800">Comptes marchands et soldes</p>
              {INPAY_COUNTRIES.map(({ code, name }) => (
                <FormField
                  key={code}
                  control={form.control}
                  name={`inpayMerchantId_${code}` as keyof SettingsForm}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{name} ({code})</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input {...field} value={String(field.value ?? "")} placeholder={`Merchant ID ${code}`} /></FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => inpayBalanceMutation.mutate(code)}
                          disabled={!field.value || inpayBalanceMutation.isPending}
                        >
                          {inpayBalanceMutation.isPending && inpayBalanceMutation.variables === code
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : "Solde"}
                        </Button>
                      </div>
                      {inpayBalances[code] !== undefined && (
                        <FormDescription className="text-xs text-blue-700">
                          Solde InPay : {inpayBalances[code]}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Configuration serveur à faire après l'intégration :</p>
              <p>• <code className="bg-blue-100 px-1 rounded">INPAY_API_BASE_URL</code> — URL de base fournie par InPay</p>
              <p>• <code className="bg-blue-100 px-1 rounded">INPAY_API_KEY_TG</code>, <code className="bg-blue-100 px-1 rounded">INPAY_API_KEY_CI</code>… — une clé API par pays activé</p>
              <p>• URL webhook InPay : <code className="bg-blue-100 px-1 rounded">/api/webhooks/inpay</code></p>
              <p className="font-semibold text-red-600">Ne saisissez jamais les clés API dans ce formulaire : elles restent dans les secrets serveur.</p>
            </div>
          </CardContent>
        </Card>

        {/* ── AshtechPay ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              AshtechPay — Mobile Money, OTP & Wave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Activer AshtechPay</p>
                <p className="text-xs text-gray-500">Affiche le paiement direct par USSD, OTP SMS et Wave</p>
              </div>
              <FormField control={form.control} name="ashtechEnabled" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel className="text-xs text-gray-500">{field.value ? "Actif" : "Désactivé"}</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="ashtechChannelName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du canal affiché</FormLabel>
                <FormControl><Input {...field} placeholder="AshtechPay" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ashtechCountries" render={({ field }) => (
              <FormItem>
                <FormLabel>Pays activés (codes séparés par virgule)</FormLabel>
                <FormControl><Input {...field} placeholder="TG,CI,BJ,SN — vide = tous les pays" /></FormControl>
                <FormDescription className="text-xs">Les codes doivent correspondre aux pays AshtechPay. Laissez vide pour tous les pays.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-xs text-green-800 space-y-1">
              <p className="font-semibold">Configuration requise :</p>
              <p>Ajoutez <code className="bg-green-100 px-1 rounded">ASHTECHPAY_API_KEY</code> dans les Secrets du serveur.</p>
              <p>La clé API n'est jamais enregistrée dans les paramètres ni affichée dans ce formulaire.</p>
              <p>URL de notification à configurer chez AshtechPay : <code className="bg-green-100 px-1 rounded">/api/webhooks/ashtechpay</code>. Le statut est confirmé par interrogation sécurisée de l'API.</p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
