import type { Country, CountryCurrency } from "@/types/country";

/** Minimal typing for the REST Countries v5 payload we request via response_fields */
export type RestCountryV5 = {
  names?: {
    common?: string;
    official?: string;
    native?: Record<
      string,
      {
        common?: string;
        official?: string;
      }
    >;
  };
  codes?: {
    alpha_2?: string;
  };
  capitals?: Array<{ name?: string }>;
  flag?: {
    emoji?: string;
    url_png?: string;
    url_svg?: string;
  };
  region?: string;
  subregion?: string;
  currencies?: Array<{
    code?: string;
    name?: string;
    symbol?: string;
  }>;
  population?: number;
  timezones?: string[];
};

function pickNativeName(raw: RestCountryV5): string {
  const native = raw.names?.native;
  if (!native) return raw.names?.common ?? "";

  const english = native.eng?.common;
  if (english) return english;

  const first = Object.values(native)[0];
  return first?.common ?? raw.names?.common ?? "";
}

function normalizeCurrencies(
  currencies: RestCountryV5["currencies"],
): CountryCurrency[] {
  if (!currencies?.length) return [];

  return currencies
    .filter((c): c is { code: string; name: string; symbol?: string } =>
      Boolean(c?.code && c?.name),
    )
    .map((c) => ({
      code: c.code,
      name: c.name,
      symbol: c.symbol ?? "",
    }));
}

/**
 * Maps a v5 API object into our UI Country type.
 * Returns null when the record is not usable in the dropdown (no ISO code / name).
 */
export function normalizeCountry(raw: RestCountryV5): Country | null {
  const code = raw.codes?.alpha_2?.trim().toUpperCase();
  const name = raw.names?.common?.trim();

  if (!code || !name) return null;

  const flagCode = code.toLowerCase();

  return {
    code,
    name,
    nativeName: pickNativeName(raw),
    flagPng:
      raw.flag?.url_png || `https://flagcdn.com/w320/${flagCode}.png`,
    flagSvg: raw.flag?.url_svg || `https://flagcdn.com/${flagCode}.svg`,
    flagEmoji: raw.flag?.emoji ?? "",
    capital: raw.capitals?.[0]?.name?.trim() || "",
    region: raw.region?.trim() || "",
    subregion: raw.subregion?.trim() || "",
    currencies: normalizeCurrencies(raw.currencies),
    population: typeof raw.population === "number" ? raw.population : 0,
    timezones: Array.isArray(raw.timezones) ? raw.timezones : [],
  };
}
