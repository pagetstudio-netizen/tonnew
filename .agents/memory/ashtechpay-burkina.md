---
name: AshtechPay Burkina flow
description: AshtechPay's documented Burkina Faso operators and OTP retry contract.
---

AshtechPay documents Burkina Faso as `BF` with currency `XOF`, using the exact
operator names `Moov Money` and `Orange Money`. Orange Money Burkina uses an
OTP USSD flow and returns a provider reference when the first request responds
with `otp_required`; the retry must send that exact reference together with the
OTP.

**Why:** AshtechPay rejects or cannot complete the OTP confirmation when the
merchant generates a new reference for the retry instead of preserving the
provider-issued one.

**How to apply:** Treat `/v1/countries` as the source of truth for operator
names, and persist/reuse the reference from `otp_required` for the second
`/v1/collect` request.