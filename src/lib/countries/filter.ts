import type { Country } from "@/types/country";

/**
 * Client-side country filter for the dropdown search box.
 * No network calls — operates on the already-loaded list.
 */
export function filterCountries(
  countries: Country[],
  query: string,
): Country[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return countries;

  return countries.filter((country) => {
    return (
      country.name.toLowerCase().includes(normalized) ||
      country.nativeName.toLowerCase().includes(normalized) ||
      country.code.toLowerCase().includes(normalized)
    );
  });
}
