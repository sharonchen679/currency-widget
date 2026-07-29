"use client";

import { useEffect, useMemo, useState } from "react";
import { CountryDetails } from "@/components/country-explorer/CountryDetails";
import { CountrySelect } from "@/components/country-explorer/CountrySelect";
import { getCountryDetailRows } from "@/lib/countries/format";
import type {
  CountriesApiErrorBody,
  CountriesApiSuccess,
  Country,
} from "@/types/country";

type LoadState =
  | { status: "loading" }
  | { status: "success"; countries: Country[] }
  | { status: "error"; message: string; code?: CountriesApiErrorBody["code"] };

type CountryWidgetProps = {
  /** Server-read flag — used for an early hint before the client fetch returns */
  safeMode: boolean;
};

/**
 * Main white card. Fetches `/api/countries` on the client so the request
 * appears in browser DevTools → Network.
 */
export function CountryWidget({ safeMode }: CountryWidgetProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCountries() {
      setState({ status: "loading" });

      try {
        const response = await fetch("/api/countries", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as
          | CountriesApiSuccess
          | CountriesApiErrorBody;

        if (!response.ok || !("countries" in payload)) {
          const errorBody = payload as CountriesApiErrorBody;
          setState({
            status: "error",
            message:
              errorBody.error ||
              `Failed to load countries (HTTP ${response.status}).`,
            code: errorBody.code,
          });
          return;
        }

        setState({
          status: "success",
          countries: payload.countries,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to reach /api/countries.",
        });
      }
    }

    void loadCountries();

    return () => controller.abort();
  }, []);

  const selected = useMemo(() => {
    if (state.status !== "success" || !selectedCode) return null;
    return state.countries.find((c) => c.code === selectedCode) ?? null;
  }, [state, selectedCode]);

  const detailRows = selected ? getCountryDetailRows(selected) : [];

  const showSafeModeHint =
    safeMode || (state.status === "error" && state.code === "SAFE_MODE");

  return (
    <section className="w-full max-w-[440px] rounded-[28px] bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
      {showSafeModeHint && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900"
        >
          {state.status === "error" && state.code === "SAFE_MODE"
            ? state.message
            : "Live API calls are blocked because RESTCOUNTRIES_USE_MOCK is enabled. Set RESTCOUNTRIES_USE_MOCK=false in your .env file, then restart the dev server."}
        </p>
      )}

      {state.status === "error" && state.code !== "SAFE_MODE" && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800"
        >
          {state.message}
        </p>
      )}

      {state.status === "loading" && (
        <p className="mb-4 text-sm text-slate-500">Loading countries…</p>
      )}

      <CountrySelect
        countries={state.status === "success" ? state.countries : []}
        value={selectedCode}
        onChange={setSelectedCode}
        disabled={state.status !== "success"}
        loading={state.status === "loading"}
      />

      {selected && <CountryDetails country={selected} rows={detailRows} />}
    </section>
  );
}
