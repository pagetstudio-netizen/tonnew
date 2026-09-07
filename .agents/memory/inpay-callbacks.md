---
name: InPay callback classification
description: Provider-specific rule for distinguishing InPay deposit and withdrawal callbacks safely.
---

InPay payin callbacks may include `order_number`, just like payout callbacks. The callback type must therefore be determined from the application-owned `out_trade_no` prefix (`PAYIN-` or `PAYOUT-`) before considering provider fields.

**Why:** Classifying every callback with `order_number` would route successful deposits into payout handling and prevent the user balance from being credited.

**How to apply:** Keep the merchant reference prefix stable and use it as the primary discriminator in webhook handlers; treat provider status/type fields only as secondary signals.