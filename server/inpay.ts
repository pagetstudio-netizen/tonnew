import crypto from "crypto";
import { setDefaultResultOrder } from "node:dns";

// InPay whitelists the server's public IP. Prefer the authorized IPv4 route
// when the hosting provider also exposes an IPv6 egress address.
setDefaultResultOrder("ipv4first");

export const INPAY_COUNTRY_PREFIXES: Record<string, string> = {
  SN: "221",
  ML: "223",
  CI: "225",
  BF: "226",
  TG: "228",
  BJ: "229",
  GH: "233",
  CM: "237",
  CG: "243",
  KE: "254",
  TZ: "255",
  UG: "256",
  ZA: "27",
};

const INPAY_COUNTRY_NAMES: Record<string, string> = {
  SN: "Sénégal",
  ML: "Mali",
  CI: "Côte d'Ivoire",
  BF: "Burkina Faso",
  TG: "Togo",
  BJ: "Bénin",
  GH: "Ghana",
  CM: "Cameroun",
  CG: "Congo",
  KE: "Kenya",
  TZ: "Tanzanie",
  UG: "Ouganda",
  ZA: "Afrique du Sud",
};

const API_KEY_ENV_PREFIX = "INPAY_API_KEY_";
const MERCHANT_ENV_PREFIX = "INPAY_MERCHANT_ID_";

export interface InpayAccount {
  country: string;
  countryPrefix: string;
  merchantId: string;
  apiKey: string;
}

export interface InpayApiResult<T = any> {
  code: number | string;
  message?: string;
  errno?: number;
  data?: T;
}

export interface InpayPayinResult {
  url: string;
  orderNumber: string;
}

export interface InpayPayoutResult {
  orderNumber?: string;
  status?: string;
  message?: string;
}

export function getInpayApiBase(): string {
  return (process.env.INPAY_API_BASE_URL || "").replace(/\/+$/, "");
}

function settingMerchantId(settings: Record<string, string>, country: string): string {
  return settings[`inpayMerchantId_${country}`] || process.env[`${MERCHANT_ENV_PREFIX}${country}`] || "";
}

export function getInpayAccount(
  country: string,
  settings: Record<string, string>,
): InpayAccount {
  const normalizedCountry = country.trim().toUpperCase();
  return {
    country: normalizedCountry,
    countryPrefix: INPAY_COUNTRY_PREFIXES[normalizedCountry] || "",
    merchantId: settingMerchantId(settings, normalizedCountry),
    apiKey: process.env[`${API_KEY_ENV_PREFIX}${normalizedCountry}`] || "",
  };
}

export function getInpayEnabledCountries(settings: Record<string, string>): string[] {
  return (settings.inpayCountries || "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
}

export function isInpayCountryEnabled(
  country: string,
  settings: Record<string, string>,
): boolean {
  if (settings.inpayEnabled !== "true") return false;
  const enabled = getInpayEnabledCountries(settings);
  return enabled.includes(country.trim().toUpperCase());
}

export function isInpayConfigured(
  country: string,
  settings: Record<string, string>,
): boolean {
  const account = getInpayAccount(country, settings);
  return Boolean(
    getInpayApiBase() &&
    account.countryPrefix &&
    account.merchantId &&
    account.apiKey
  );
}

function signatureInput(params: Record<string, unknown>): string {
  return Object.keys(params)
    .filter((key) => key !== "sign" && params[key] !== undefined && params[key] !== null && String(params[key]) !== "")
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
}

export function createInpaySignature(
  params: Record<string, unknown>,
  apiKey: string,
): string {
  return crypto
    .createHash("md5")
    .update(`${signatureInput(params)}&key=${apiKey}`)
    .digest("hex")
    .toLowerCase();
}

export function verifyInpaySignature(
  params: Record<string, unknown>,
  apiKey: string,
): boolean {
  const received = String(params.sign || "").trim().toLowerCase();
  if (!received || !apiKey) return false;
  const expected = createInpaySignature(params, apiKey);
  return received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

function formBody(params: Record<string, unknown>): string {
  return new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
}

async function postInpay<T>(
  path: string,
  params: Record<string, unknown>,
): Promise<InpayApiResult<T>> {
  const endpoint = `${getInpayApiBase()}${path}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody(params),
  });
  const body = await response.text();
  const contentType = response.headers.get("content-type") || "";
  let data: InpayApiResult<T>;
  try {
    data = JSON.parse(body) as InpayApiResult<T>;
  } catch {
    if (contentType.includes("text/html") || /<html[\s>]/i.test(body)) {
      const detail = body
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300);
      throw new Error(
        `L'API InPay a renvoyé une page HTML (HTTP ${response.status}) sur ${endpoint}${detail ? ` : ${detail}` : ""}`,
      );
    }
    const detail = body
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
    throw new Error(
      `Réponse InPay invalide (HTTP ${response.status})${detail ? ` : ${detail}` : ""}`,
    );
  }
  if (!response.ok) {
    throw new Error(
      data.message ||
      `Erreur InPay HTTP ${response.status}${data.errno !== undefined ? ` (errno ${data.errno})` : ""}`,
    );
  }
  return data;
}

function timestamp(): string {
  return String(Math.floor(Date.now() / 1000));
}

function orderReference(prefix: string, id: number, userId: number): string {
  return `${prefix}-${id}-${userId}-${Date.now()}`;
}

export async function createPayin(params: {
  amount: number;
  country: string;
  merchantId: string;
  apiKey: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  notificationUrl: string;
  outTradeNo: string;
}): Promise<InpayPayinResult> {
  const payload: Record<string, unknown> = {
    merchantid: params.merchantId,
    out_trade_no: params.outTradeNo,
    total_fee: Number(params.amount).toFixed(2),
    notification_url: params.notificationUrl,
    timestamp: timestamp(),
    client_name: params.customerName,
    client_mobile: params.customerMobile,
    client_email: params.customerEmail,
    country_prefix: INPAY_COUNTRY_PREFIXES[params.country.toUpperCase()] || "",
  };
  const result = await postInpay<{ url?: string; order_number?: string }>(
    "/inpays/payin/unifiedorder",
    { ...payload, sign: createInpaySignature(payload, params.apiKey) },
  );
  if (String(result.code) !== "0" || !result.data?.url || !result.data.order_number) {
    throw new Error(result.message || "InPay n'a pas créé le paiement");
  }
  return { url: result.data.url, orderNumber: result.data.order_number };
}

export function createOutTradeNo(prefix: "PAYIN" | "PAYOUT", id: number, userId: number): string {
  return orderReference(prefix, id, userId);
}

export function resolveBankCode(country: string, paymentMethod: string): string {
  const normalizedCountry = country.trim().toUpperCase();
  const method = paymentMethod.trim().toLowerCase();
  if (/^\d+$/.test(method)) return method;

  const mappings: Record<string, Record<string, string>> = {
    SN: { orange: "1", wave: "6" },
    ML: { orange: "1", moov: "3" },
    CI: { orange: "1", mtn: "2", moov: "3", wave: "6" },
    BF: { orange: "1", moov: "3", telecel: "12" },
    TG: { moov: "3", "mixx by yas": "3", tmoney: "7", "t-money": "7", togocel: "7" },
    BJ: { moov: "3", mtn: "2" },
    GH: { "m-pesa": "8", airtel: "9", mtn: "2" },
    CM: { orange: "1", mtn: "2" },
    CG: { "m-pesa": "8", airtel: "9", orange: "1" },
    KE: { airtel: "9", "m-pesa": "8" },
    TZ: { "m-pesa": "8", airtel: "9", tigo: "10", halotel: "11" },
    UG: { airtel: "9", mtn: "2" },
    ZA: {},
  };
  const countryMappings = mappings[normalizedCountry] || {};
  const match = Object.entries(countryMappings).find(([name]) => method.includes(name));
  if (match) return match[1];
  throw new Error(`Code bancaire InPay introuvable pour ${paymentMethod} (${normalizedCountry})`);
}

export async function createPayout(params: {
  amount: number;
  country: string;
  merchantId: string;
  apiKey: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  bankCode: string;
  accountNumber: string;
  notificationUrl: string;
  outTradeNo: string;
}): Promise<InpayPayoutResult> {
  const payload: Record<string, unknown> = {
    merchantid: params.merchantId,
    out_trade_no: params.outTradeNo,
    total_fee: String(Math.round(params.amount)),
    notification_url: params.notificationUrl,
    timestamp: timestamp(),
    client_name: params.customerName,
    client_mobile: params.customerMobile,
    client_email: params.customerEmail,
    country_prefix: INPAY_COUNTRY_PREFIXES[params.country.toUpperCase()] || "",
    bank_code: params.bankCode,
    account_number: params.accountNumber.replace(/\D/g, ""),
  };
  const result = await postInpay<{ result?: string; orderNumber?: string }>(
    "/inpays/payout/unifiedorder",
    { ...payload, sign: createInpaySignature(payload, params.apiKey) },
  );
  if (String(result.code) !== "0") {
    throw new Error(result.message || "InPay n'a pas créé le retrait");
  }
  return {
    orderNumber: result.data?.orderNumber,
    status: result.data?.result,
    message: result.message,
  };
}

export async function getBalance(params: {
  merchantId: string;
  apiKey: string;
}): Promise<string> {
  const payload = {
    merchantid: params.merchantId,
    timestamp: timestamp(),
  };
  const result = await postInpay<{ balance?: string | number }>(
    "/inpays/payout/balance",
    { ...payload, sign: createInpaySignature(payload, params.apiKey) },
  );
  if (String(result.code) !== "0" || result.data?.balance === undefined) {
    throw new Error(result.message || "Solde InPay indisponible");
  }
  return String(result.data.balance);
}

export function findVerifiedAccount(
  payload: Record<string, unknown>,
  settings: Record<string, string>,
): InpayAccount | undefined {
  const merchantId = String(payload.merchantid || payload.merchant || "");
  return Object.keys(INPAY_COUNTRY_PREFIXES)
    .map((country) => getInpayAccount(country, settings))
    .find((account) =>
      account.merchantId === merchantId &&
      account.apiKey &&
      verifyInpaySignature(payload, account.apiKey),
    );
}

export function mapPayinStatus(status: unknown): "pending" | "approved" | "rejected" {
  const value = String(status || "").toLowerCase();
  if (["payin_success", "payment_success", "success", "paid"].includes(value)) return "approved";
  if (["payin_fail", "payment_fail", "failed", "fail", "cancelled", "canceled"].includes(value)) return "rejected";
  return "pending";
}

export function mapPayoutStatus(status: unknown): "pending" | "approved" | "rejected" {
  const value = String(status || "").toLowerCase();
  if (["payout_success", "payment_success", "success", "paid", "paiement_réussi"].includes(value)) return "approved";
  if (["payout_fail", "payment_fail", "failed", "fail", "cancelled", "canceled", "paiement_échec"].includes(value)) return "rejected";
  return "pending";
}

export function getCountryName(code: string): string {
  return INPAY_COUNTRY_NAMES[code.trim().toUpperCase()] || code;
}