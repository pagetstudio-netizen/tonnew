---
name: InPay IP whitelist
description: InPay account configuration required for API calls from Replit or Plesk.
---

InPay API calls can return `errno=5` with `Report IP Error 509` even when the URL, Merchant ID, API key, and signature are present. The public outbound IP of the runtime must be whitelisted on the corresponding InPay merchant account.

**Why:** InPay enforces server-IP allowlisting for pay-in, payout, and balance endpoints; application-side retries or signature changes cannot bypass this provider-level restriction.

**How to apply:** Check the public egress IP in each runtime separately, ask InPay to whitelist it for the matching country merchant account, and re-test the balance endpoint before testing a real payment.