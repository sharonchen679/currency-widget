/**
 * Normalized country shape used by the widget UI.
 * Field order for details matches the design screenshots.
 */
export type CountryCurrency = {
  code: string;
  name: string;
  symbol: string;
};

export type Country = {
  /** ISO 3166-1 alpha-2 (e.g. "CA") — used as React key and for flags */
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

export type CountriesApiResponse = {
  source: "mock" | "restcountries";
  count: number;
  countries: Country[];
};

export type CountriesApiError = {
  error: string;
  status: number;
};
