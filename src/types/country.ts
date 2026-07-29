/**
 * Normalized country shape used by the widget UI.
 * Detail-row order matches the design screenshots.
 */
export type CountryCurrency = {
  code: string;
  name: string;
  symbol: string;
};

export type Country = {
  /** ISO 3166-1 alpha-2 (e.g. "CA") */
  code: string;
  name: string;
  /** Secondary name under the title (native / alternate common name) */
  nativeName: string;
  flagPng: string;
  flagSvg: string;
  flagEmoji: string;
  capital: string;
  region: string;
  subregion: string;
  currencies: CountryCurrency[];
  population: number;
  timezones: string[];
};

/** One row in the details list — label/value as shown in the design */
export type CountryDetailRow = {
  label: string;
  value: string;
};

export type CountriesApiSuccess = {
  source: "restcountries";
  count: number;
  countries: Country[];
};

export type CountriesApiErrorBody = {
  code: "SAFE_MODE" | "UPSTREAM" | "CONFIG" | "UNKNOWN";
  error: string;
  status: number;
};
