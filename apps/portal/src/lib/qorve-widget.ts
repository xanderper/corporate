// See @qorve/react's QorveProviderProps doc comment: this must be the
// publishable key (qk_pub_*), never the secret qk_live_* value — this
// module's NEXT_PUBLIC_ vars ship to every visitor's browser.
export const QORVE_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_QORVE_CHECKOUT_URL ?? "http://localhost:3004";
export const QORVE_API_URL =
  process.env.NEXT_PUBLIC_QORVE_API_URL ?? "http://localhost:3001/api";
export const QORVE_MERCHANT_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_QORVE_MERCHANT_PUBLISHABLE_KEY ?? "";
