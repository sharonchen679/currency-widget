import type { Country, CountryDetailRow } from "@/types/country";

type CountryDetailsProps = {
  country: Country;
  rows: CountryDetailRow[];
};

/**
 * Details panel skeleton matching the screenshot layout.
 * Wired when a country is selected.
 */
export function CountryDetails({ country, rows }: CountryDetailsProps) {
  return (
    <section className="mt-8 border-t border-slate-100 pt-8">
      <div className="mb-6 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={country.flagPng}
          alt=""
          width={64}
          height={48}
          className="h-12 w-16 rounded-xl object-cover shadow-md"
        />
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            {country.name}
          </h2>
          <p className="text-sm text-slate-500">{country.nativeName}</p>
        </div>
      </div>

      <dl className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-6 py-3.5"
          >
            <dt className="flex items-center gap-2 text-sm text-slate-500">
              <span
                aria-hidden="true"
                className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
              />
              {row.label}
            </dt>
            <dd className="max-w-[65%] text-right text-sm font-semibold text-[var(--color-ink)]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
