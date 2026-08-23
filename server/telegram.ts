const TELEGRAM_API = "https://api.telegram.org";
import { storage } from "./storage";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function sendTelegramMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram HTTP ${response.status}: ${body.slice(0, 200)}`);
  }
}

export function formatTelegramValue(value: unknown): string {
  return escapeHtml(value);
}

async function telegramRequest(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  const response = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Telegram ${method} HTTP ${response.status}`);
  return response.json() as Promise<{ ok: boolean; result?: any }>;
}

async function handleTelegramCommand(text: string, chatId: string) {
  const command = text.trim().split(/\s+/)[0].toLowerCase().split("@")[0];
  if (command === "/help" || command === "/start") {
    return [
      "🤖 <b>Commandes Stone by ton</b>",
      "/stats — statistiques de la plateforme",
      "/solde — soldes et montants en attente",
      "/pending — dépôts et retraits en attente",
      "/help — afficher cette aide",
    ].join("\n");
  }
  if (command === "/stats") {
    const stats = await storage.getStats();
    return [
      "📊 <b>Statistiques</b>",
      `Utilisateurs : ${formatTelegramValue(stats.totalUsers)}`,
      `Nouveaux aujourd'hui : ${formatTelegramValue(stats.todayUsers)}`,
      `Utilisateurs avec produit : ${formatTelegramValue(stats.usersWithProducts)}`,
      `Dépôts approuvés : ${formatTelegramValue(stats.totalDeposits)} XOF`,
      `Retraits approuvés : ${formatTelegramValue(stats.totalWithdrawals)} XOF`,
    ].join("\n");
  }
  if (command === "/solde") {
    const stats = await storage.getStats();
    return [
      "💰 <b>État des montants</b>",
      `Dépôts en attente : ${formatTelegramValue(stats.pendingDeposits)} (${formatTelegramValue(stats.pendingDepositsCount)})`,
      `Retraits en attente : ${formatTelegramValue(stats.pendingWithdrawals)} (${formatTelegramValue(stats.pendingWithdrawalsCount)})`,
    ].join("\n");
  }
  if (command === "/pending") {
    const [deposits, withdrawals] = await Promise.all([
      storage.getDeposits("pending"),
      storage.getWithdrawals("pending"),
    ]);
    const depositLines = deposits.slice(0, 10).map((item) =>
      `• Dépôt #${item.id} — ${item.amount} XOF — ${item.user?.fullName || "Utilisateur"}`,
    );
    const withdrawalLines = withdrawals.slice(0, 10).map((item) =>
      `• Retrait #${item.id} — ${item.amount} XOF — ${item.user?.fullName || "Utilisateur"}`,
    );
    return [
      "⏳ <b>Opérations en attente</b>",
      "<b>Dépôts</b>",
      ...(depositLines.length ? depositLines : ["Aucun dépôt en attente"]),
      "<b>Retraits</b>",
      ...(withdrawalLines.length ? withdrawalLines : ["Aucun retrait en attente"]),
    ].join("\n");
  }
  return "Commande inconnue. Utilise /help.";
}

export async function sendDailyTelegramSummary(): Promise<void> {
  if (!isTelegramConfigured()) return;
  const stats = await storage.getStats();
  await sendTelegramMessage([
    "📋 <b>Résumé détaillé de la plateforme</b>",
    `Utilisateurs : ${formatTelegramValue(stats.totalUsers)}`,
    `Nouveaux utilisateurs : ${formatTelegramValue(stats.todayUsers)}`,
    `Utilisateurs avec produit : ${formatTelegramValue(stats.usersWithProducts)}`,
    `Solde total : ${formatTelegramValue(stats.totalBalance)} XOF`,
    `Revenus totaux : ${formatTelegramValue(stats.totalEarnings)} XOF`,
    `Commissions : ${formatTelegramValue(stats.totalCommissions)} XOF`,
    `Dépôts du jour : ${formatTelegramValue(stats.todayDeposits)} XOF`,
    `Dépôts cumulés : ${formatTelegramValue(stats.totalDeposits)} XOF`,
    `Retraits du jour : ${formatTelegramValue(stats.todayWithdrawals)} XOF`,
    `Retraits cumulés : ${formatTelegramValue(stats.totalWithdrawals)} XOF`,
    `Dépôts en attente : ${formatTelegramValue(stats.pendingDeposits)} XOF (${formatTelegramValue(stats.pendingDepositsCount)})`,
    `Retraits en attente : ${formatTelegramValue(stats.pendingWithdrawals)} XOF (${formatTelegramValue(stats.pendingWithdrawalsCount)})`,
  ].join("\n"));
}

export async function sendTelegramSecurityAlert(ip: string, attemptMessage: string): Promise<void> {
  await sendTelegramMessage([
    "🚨 <b>Alerte de sécurité</b>",
    "Trop de tentatives de connexion administrateur ou utilisateur.",
    `Erreur : <code>${formatTelegramValue(attemptMessage)}</code>`,
    `Adresse IP : <code>${formatTelegramValue(ip)}</code>`,
    "Accès temporairement bloqué pendant 15 minutes.",
  ].join("\n"));
}

export function startTelegramBot(): void {
  if (!isTelegramConfigured()) return;
  let updateOffset = 0;
  let polling = false;
  const poll = async () => {
    if (polling) return;
    polling = true;
    try {
      const response = await telegramRequest("getUpdates", {
        offset: updateOffset,
        timeout: 0,
        allowed_updates: ["message"],
      });
      for (const update of response?.result || []) {
        updateOffset = Math.max(updateOffset, Number(update.update_id) + 1);
        const message = update.message;
        if (!message?.text || String(message.chat?.id) !== String(process.env.TELEGRAM_CHAT_ID)) continue;
        const reply = await handleTelegramCommand(message.text, String(message.chat.id));
        await telegramRequest("sendMessage", {
          chat_id: message.chat.id,
          text: reply,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[
              { text: "Ouvrir l'administration", url: `${process.env.PUBLIC_APP_URL || ""}/admin` },
            ]],
          },
        });
      }
    } catch (error: any) {
      console.error("[telegram] command polling failed:", error.message);
    } finally {
      polling = false;
    }
  };
  void poll();
  setInterval(() => void poll(), 5000);
}