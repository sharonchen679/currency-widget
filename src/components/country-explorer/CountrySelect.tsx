"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Country } from "@/types/country";

type CountrySelectProps = {
  countries: Country[];
  value: string | null;
  onChange: (code: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Custom country dropdown (step 1): open/close + full list selection.
 * Search filtering and keyboard navigation come in later steps.
 */
export function CountrySelect({
  countries,
  value,
  onChange,
  disabled = false,
  loading = false,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = countries.find((country) => country.code === value);
  const isOpen = open && !disabled;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  function toggleOpen() {
    if (disabled) return;
    setOpen((current) => !current);
  }

  function selectCountry(code: string) {
    onChange(code);
    setOpen(false);
  }

  return (
    <div className="space-y-2" ref={rootRef}>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
        Select a country
      </p>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={toggleOpen}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-[15px] shadow-sm outline-none transition enabled:hover:border-sky-300 enabled:focus-visible:border-sky-400 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {selected ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.flagPng}
                  alt=""
                  width={20}
                  height={14}
                  className="h-3.5 w-5 rounded-sm object-cover"
                />
                <span className="truncate text-slate-800">{selected.name}</span>
              </>
            ) : (
              <span className="text-slate-400">
                {loading ? "Loading countries…" : "Choose a country"}
              </span>
            )}
          </span>

          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 shrink-0 text-sky-400 transition ${isOpen ? "rotate-180" : ""}`}
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
        </button>

        {isOpen && (
          <div
            id={listId}
            role="listbox"
            aria-label="Countries"
            className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {countries.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">
                No countries available
              </p>
            ) : (
              countries.map((country) => {
                const isSelected = country.code === value;

                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectCountry(country.code)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50 ${
                      isSelected ? "bg-sky-50" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={country.flagPng}
                      alt=""
                      width={20}
                      height={14}
                      className="h-3.5 w-5 rounded-sm object-cover"
                    />
                    <span className="truncate">{country.name}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
