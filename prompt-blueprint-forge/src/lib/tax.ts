/**
 * Tax Calculation Service
 *
 * Handles sales tax estimation and calculation for transactions.
 * Supports both manual rate-based calculation and TaxJar/Avalara
 * API integration for production use.
 *
 * To go live with automated tax calculation:
 *   1. Sign up for TaxJar or Avalara
 *   2. Set TAX_API_KEY and TAX_API_URL env vars
 *   3. Uncomment the real API integration code below
 */

export interface TaxRequest {
  amount: number;
  buyerLocation: {
    country: string;
    state?: string;
    zip?: string;
    city?: string;
  };
  sellerLocation: {
    country: string;
    state?: string;
  };
  productType: "digital_goods";
}

export interface TaxResult {
  taxAmount: number;
  taxRate: number;
  taxBreakdown: {
    stateRate: number;
    countyRate: number;
    cityRate: number;
    specialRate: number;
  };
  jurisdiction: string;
}

// Base sales tax rates by US state (as of 2026)
const STATE_TAX_RATES: Record<string, { state: number; county: number; city: number }> = {
  AL: { state: 0.04, county: 0.0, city: 0.0 },
  AK: { state: 0.0, county: 0.0, city: 0.0 },
  AZ: { state: 0.056, county: 0.007, city: 0.02 },
  AR: { state: 0.065, county: 0.0, city: 0.0 },
  CA: { state: 0.0725, county: 0.0025, city: 0.01 },
  CO: { state: 0.029, county: 0.0, city: 0.0 },
  CT: { state: 0.0635, county: 0.0, city: 0.0 },
  DE: { state: 0.0, county: 0.0, city: 0.0 },
  FL: { state: 0.06, county: 0.01, city: 0.0 },
  GA: { state: 0.04, county: 0.0, city: 0.0 },
  HI: { state: 0.04, county: 0.0, city: 0.0 },
  ID: { state: 0.06, county: 0.0, city: 0.0 },
  IL: { state: 0.0625, county: 0.0, city: 0.02 },
  IN: { state: 0.07, county: 0.0, city: 0.0 },
  IA: { state: 0.06, county: 0.0, city: 0.0 },
  KS: { state: 0.065, county: 0.0, city: 0.02 },
  KY: { state: 0.06, county: 0.0, city: 0.0 },
  LA: { state: 0.0445, county: 0.0, city: 0.0 },
  ME: { state: 0.055, county: 0.0, city: 0.0 },
  MD: { state: 0.06, county: 0.0, city: 0.0 },
  MA: { state: 0.0625, county: 0.0, city: 0.0 },
  MI: { state: 0.06, county: 0.0, city: 0.0 },
  MN: { state: 0.06875, county: 0.0, city: 0.0 },
  MS: { state: 0.07, county: 0.0, city: 0.0 },
  MO: { state: 0.04225, county: 0.0, city: 0.0 },
  MT: { state: 0.0, county: 0.0, city: 0.0 },
  NE: { state: 0.055, county: 0.0, city: 0.0 },
  NV: { state: 0.0685, county: 0.0, city: 0.01 },
  NH: { state: 0.0, county: 0.0, city: 0.0 },
  NJ: { state: 0.06625, county: 0.0, city: 0.0 },
  NM: { state: 0.05125, county: 0.0, city: 0.0 },
  NY: { state: 0.04, county: 0.0, city: 0.045 },
  NC: { state: 0.0475, county: 0.0, city: 0.0 },
  ND: { state: 0.05, county: 0.0, city: 0.0 },
  OH: { state: 0.0575, county: 0.0, city: 0.02 },
  OK: { state: 0.045, county: 0.0, city: 0.0 },
  OR: { state: 0.0, county: 0.0, city: 0.0 },
  PA: { state: 0.06, county: 0.0, city: 0.0 },
  RI: { state: 0.07, county: 0.0, city: 0.0 },
  SC: { state: 0.06, county: 0.0, city: 0.0 },
  SD: { state: 0.045, county: 0.0, city: 0.0 },
  TN: { state: 0.07, county: 0.0, city: 0.025 },
  TX: { state: 0.0625, county: 0.0, city: 0.02 },
  UT: { state: 0.0485, county: 0.0, city: 0.0 },
  VT: { state: 0.06, county: 0.0, city: 0.0 },
  VA: { state: 0.053, county: 0.0, city: 0.0 },
  WA: { state: 0.065, county: 0.0, city: 0.0 },
  WV: { state: 0.06, county: 0.0, city: 0.0 },
  WI: { state: 0.05, county: 0.0, city: 0.0 },
  WY: { state: 0.04, county: 0.0, city: 0.0 },
  DC: { state: 0.06, county: 0.0, city: 0.0 },
};

const DEFAULT_TAX_RATE = 0.0; // Digital goods: 0% in most jurisdictions outside US

/**
 * Calculates estimated sales tax for a transaction.
 * Uses built-in US state rates + optional TaxJar/Avalara API.
 */
export async function calculateTax(request: TaxRequest): Promise<TaxResult> {
  // For production, replace with TaxJar/Avalara API call:
  // const taxJar = new TaxJar({ apiKey: process.env.TAX_API_KEY! });
  // const res = await taxJar.taxForOrder({
  //   from_country: request.sellerLocation.country,
  //   from_state: request.sellerLocation.state,
  //   to_country: request.buyerLocation.country,
  //   to_state: request.buyerLocation.state,
  //   to_zip: request.buyerLocation.zip,
  //   amount: request.amount,
  //   shipping: 0,
  // });
  // return { taxAmount: res.tax.amount_to_collect, ... };

  return calculateLocalTax(request);
}

/**
 * Local rate-based tax calculation fallback.
 * Only accurate for US states with known rates.
 */
function calculateLocalTax(request: TaxRequest): TaxResult {
  const { buyerLocation, amount } = request;

  if (buyerLocation.country !== "US" || !buyerLocation.state) {
    return {
      taxAmount: 0,
      taxRate: 0,
      taxBreakdown: { stateRate: 0, countyRate: 0, cityRate: 0, specialRate: 0 },
      jurisdiction: `${buyerLocation.country}-all`,
    };
  }

  const rates = STATE_TAX_RATES[buyerLocation.state.toUpperCase()];
  if (!rates) {
    return {
      taxAmount: 0,
      taxRate: 0,
      taxBreakdown: { stateRate: 0, countyRate: 0, cityRate: 0, specialRate: 0 },
      jurisdiction: `US-${buyerLocation.state}-unknown`,
    };
  }

  const totalRate = rates.state + rates.county + rates.city;
  const taxAmount = Math.round(amount * totalRate * 100) / 100;

  return {
    taxAmount,
    taxRate: totalRate,
    taxBreakdown: {
      stateRate: rates.state,
      countyRate: rates.county,
      cityRate: rates.city,
      specialRate: 0,
    },
    jurisdiction: `US-${buyerLocation.state}`,
  };
}

/**
 * Formats a tax amount for display in checkout.
 */
export function formatTaxAmount(taxAmount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(taxAmount);
}
