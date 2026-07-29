"use client";

import { useState } from "react";
import { getCountryDetailRows } from "@/lib/countries/format";
import type { CountriesApiResponse, Country } from "@/types/country";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: CountriesApiResponse }
  | { status: "error"; message: string };

export function CountryApiTester() {
  const [state, setState] = useState<LoadState>({ status: "idle" });
  const [selectedCode, setSelectedCode] = useState<string>("CA");

  async function loadCountries() {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/countries");
      const payload = (await response.json()) as
        | CountriesApiResponse
        | { error?: string };

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : `Request failed with HTTP ${response.status}`;
        setState({ status: "error", message });
        return;
      }

      const data = payload as CountriesApiResponse;
      setState({ status: "success", data });

      if (data.countries.length > 0) {
        const stillValid = data.countries.some((c) => c.code === selectedCode);
        if (!stillValid) setSelectedCode(data.countries[0].code);
      }
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to reach /api/countries",
      });
    }
  }

  const selected: Country | undefined =
    state.status === "success"
      ? state.data.countries.find((c) => c.code === selectedCode)
      : undefined;

  const detailRows = selected ? getCountryDetailRows(selected) : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-sky-700/70 uppercase">
          API test harness
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Countries endpoint
        </h1>
        <p className="text-sm text-slate-600">
          Calls <code className="rounded bg-slate-100 px-1">/api/countries</code>.
          Mock mode is on by default (no live REST Countries usage). Set{" "}
          <code className="rounded bg-slate-100 px-1">
            RESTCOUNTRIES_USE_MOCK=false
          </code>{" "}
          in <code className="rounded bg-slate-100 px-1">.env</code> when you want
          real data.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={loadCountries}
          disabled={state.status === "loading"}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {state.status === "loading" ? "Loading…" : "Fetch /api/countries"}
        </button>

        {state.status === "success" && (
          <span className="text-sm text-slate-600">
            source: <strong>{state.data.source}</strong> · count:{" "}
            <strong>{state.data.count}</strong>
          </span>
        )}
      </div>

      {state.status === "error" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {state.status === "success" && (
        <>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Select a country (preview formatted details)
            <select
              value={selectedCode}
              onChange={(event) => setSelectedCode(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {state.data.countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flagEmoji} {country.name}
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.flagPng}
                  alt={`${selected.name} flag`}
                  width={48}
                  height={32}
                  className="h-8 w-12 rounded object-cover shadow-sm"
                />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selected.name}
                  </p>
                  <p className="text-sm text-slate-500">{selected.nativeName}</p>
                </div>
              </div>

              <dl className="divide-y divide-slate-100">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 py-2 text-sm"
                  >
                    <dt className="text-slate-500">{row.label}</dt>
                    <dd className="max-w-[70%] text-right font-medium text-slate-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Raw JSON response
            <textarea
              readOnly
              value={JSON.stringify(state.data, null, 2)}
              className="h-80 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-800"
            />
          </label>
        </>
      )}
    </div>
  );
}
