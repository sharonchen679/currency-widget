"use client";

import type { Country } from "@/types/country";

type CountrySelectProps = {
  countries: Country[];
  value: string | null;
  onChange: (code: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Temporary native select so fetch + selection work end-to-end.
 * Replace later with the custom searchable dropdown from the design.
 */
export function CountrySelect({
  countries,
  value,
  onChange,
  disabled = false,
  loading = false,
}: CountrySelectProps) {
  const selected = countries.find((country) => country.code === value);

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
        Select a country
      </p>

      <div className="relative">
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
          aria-label="Select a country"
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-left text-[15px] text-slate-800 shadow-sm outline-none transition enabled:hover:border-sky-300 enabled:focus:border-sky-400 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <option value="" disabled>
            {loading ? "Loading countries…" : "Choose a country"}
          </option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flagEmoji ? `${country.flagEmoji} ` : ""}
              {country.name}
            </option>
          ))}
        </select>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-sky-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {selected && (
        <p className="sr-only">
          Selected {selected.name}
        </p>
      )}
    </div>
  );
}
