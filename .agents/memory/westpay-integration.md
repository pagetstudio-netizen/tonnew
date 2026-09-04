---
name: WestPay Integration
description: WestPay hosted-payment flow integrated alongside SendavaPay — deposit via redirect, webhook confirmation, per-country API keys for withdrawals.
---

## Architecture

**Deposit flow (redirect-based):**
1. User selects WestPay channel → "westpay" step in deposit.tsx
2. POST /api/deposits with `{ useWestpay: true }` → server creates deposit (status: "pending"), builds redirect URL
3. Frontend redirects to `https://payment.bank2.westpay.cfd/?merchant=SLUG&amount=X&country=NAME&redirect=CALLBACK`
4. WestPay redirects back to GET /api/westpay/callback?depositId=X&status=success&ref=OP-xxx
5. Server stores westpayReference = ref, redirects to /deposit?wp_status=success
6. Webhook POST /api/webhooks/westpay (X-RobotPay-Signature HMAC-SHA256) confirms → approve deposit

**Withdrawal flow (per-country API key):**
- POST https://westpay.cfd/api/merchant/transfer with X-API-KEY header
- Each country has its own Replit Secret: WESTPAY_API_KEY_TG, WESTPAY_API_KEY_CM, etc.

## Secrets required (all in Replit Secrets, never in code/DB)
- WESTPAY_MERCHANT_SLUG — merchant slug for payment URL
- WESTPAY_WEBHOOK_SECRET — single webhook secret (env takes priority over DB setting)
- WESTPAY_API_KEY_{CC} — per-country key for withdrawals (TG, CM, BJ, BF, SN, CI, ML, GN, CD, CG, GA, NE, KE, GH, NG)

## Settings keys (in platformSettings DB table)
- westpayEnabled: "true"/"false"
- westpayChannelName: display name (default "WestPay")
- westpayCountries: comma-separated codes, empty = all countries
- westpayWebhookSecret: fallback if WESTPAY_WEBHOOK_SECRET not set

## Key files
- server/westpay.ts — all WestPay logic (buildPaymentUrl, transfer, verifyWebhookSignature, formatMsisdn)
- server/routes.ts — /api/westpay/callback (GET) + /api/webhooks/westpay (POST) + deposit handler
- shared/schema.ts — deposits.westpayReference column
- server/storage.ts — getDepositByWestpayReference()
- client/src/pages/deposit.tsx — "westpay" step, wpInitiateMutation, wp_status handling
- client/src/components/admin/settings.tsx — WestPay card with toggle, countries, webhook secret

**Why:**
WestPay uses X-RobotPay-Signature (not x-westpay-signature) in webhook headers.
The webhook signature is HMAC-SHA256 of the raw JSON body (not stringified twice).
Webhook secret is single/global; API keys are per-country for withdrawals.
