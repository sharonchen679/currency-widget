import type { Country, CountryCurrency, CountryDetailRow } from "@/types/country";

/** Screenshot: "Americas · North America" */
export function formatRegion(region: string, subregion: string): string {
  if (region && subregion) return `${region} · ${subregion}`;
  return region || subregion || "—";
}

/** Screenshot: "Canadian dollar ($)" ; multiple joined with ", " */
export function formatCurrencies(currencies: CountryCurrency[]): string {
  if (!currencies.length) return "—";

  return currencies
    .map((currency) => {
      const symbol = currency.symbol?.trim();
      if (symbol) return `${currency.name} (${symbol})`;
      return currency.name;
    })
    .join(", ");
}

/** Screenshot: "38,005,238" */
export function formatPopulation(population: number): string {
  return population.toLocaleString("en-US");
}

/** Screenshot: "UTC-08:00, UTC-07:00, …" (label is singular "Time zone") */
export function formatTimezones(timezones: string[]): string {
  if (!timezones.length) return "—";
  return timezones.join(", ");
}

/**
 * Detail rows in exact screenshot order and labels:
 * Capital → Region → Currencies → Population → Time zone
 */
export function getCountryDetailRows(country: Country): CountryDetailRow[] {
  return [
    { label: "Capital", value: country.capital || "—" },
    {
      label: "Region",
      value: formatRegion(country.region, country.subregion),
    },
    {
      label: "Currencies",
      value: formatCurrencies(country.currencies),
    },
    {
      label: "Population",
      value: formatPopulation(country.population),
    },
    {
      label: "Time zone",
      value: formatTimezones(country.timezones),
    },
  ];
}
