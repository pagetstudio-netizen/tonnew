// Countries are managed by the database and loaded from /api/countries.
// Keep these arrays empty so stale country data can never flash while the API loads.
export const COUNTRIES: Array<{
  code: string;
  name: string;
  flag: string;
  currency: string;
  paymentMethods: string[];
}> = [];

export const FALLBACK_COUNTRIES: Array<{
  code: string;
  name: string;
  currency: string;
  phonePrefix: string;
  operators: string[];
}> = [];

// Legacy compatibility - kept for places still using ELIGIBLE_COUNTRIES directly
export const ELIGIBLE_COUNTRIES = FALLBACK_COUNTRIES.map(c => ({
  code: c.code,
  name: c.name,
  flag: c.code,
  currency: c.currency,
  phonePrefix: c.phonePrefix,
  paymentMethods: c.operators,
})) as readonly { code: string; name: string; flag: string; currency: string; phonePrefix: string; paymentMethods: readonly string[] }[];

export type ApiCountry = {
  id: number;
  code: string;
  name: string;
  currency: string;
  phonePrefix: string;
  operators: string; // JSON string
  isActive: boolean;
};

export function parseOperators(operatorsJson: string): string[] {
  try {
    return JSON.parse(operatorsJson);
  } catch {
    return [];
  }
}

export function getCountryByCode(code: string, apiCountries?: ApiCountry[]) {
  if (apiCountries && apiCountries.length > 0) {
    // API data is loaded — only use it, never fall back to hardcoded data
    // This ensures disabled countries and updated operators are respected
    const c = apiCountries.find(c => c.code === code && c.isActive);
    if (!c) return undefined;
    return {
      code: c.code,
      name: c.name,
      currency: c.currency,
      phonePrefix: c.phonePrefix,
      paymentMethods: parseOperators(c.operators),
    };
  }
  // API not yet loaded — use hardcoded fallback temporarily
  const fallback = FALLBACK_COUNTRIES.find(c => c.code === code);
  if (!fallback) return undefined;
  return {
    code: fallback.code,
    name: fallback.name,
    currency: fallback.currency,
    phonePrefix: fallback.phonePrefix,
    paymentMethods: fallback.operators,
  };
}

export function getPaymentMethodsForCountry(code: string, apiCountries?: ApiCountry[]): string[] {
  const country = getCountryByCode(code, apiCountries);
  return country ? [...country.paymentMethods] : [];
}

export function formatCurrency(amount: number, countryCode: string, apiCountries?: ApiCountry[]): string {
  const country = getCountryByCode(countryCode, apiCountries);
  const currency = country?.currency || "FCFA";
  return `${amount.toLocaleString()} ${currency}`;
}
