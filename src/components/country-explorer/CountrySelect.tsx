"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { filterCountries } from "@/lib/countries/filter";
import type { Country } from "@/types/country";

type CountrySelectProps = {
  countries: Country[];
  value: string | null;
  onChange: (code: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Custom country dropdown with client-side search and keyboard navigation.
 */
export function CountrySelect({
  countries,
  value,
  onChange,
  disabled = false,
  loading = false,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = countries.find((country) => country.code === value);
  const isOpen = open && !disabled;

  const filteredCountries = useMemo(
    () => filterCountries(countries, query),
    [countries, query],
  );

  const activeCountry = filteredCountries[activeIndex];
  const activeOptionId = activeCountry
    ? `${listId}-option-${activeCountry.code}`
    : undefined;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const activeOption = listRef.current?.querySelector<HTMLElement>(
      `[data-active="true"]`,
    );
    activeOption?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen, filteredCountries]);

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function openMenu() {
    const selectedIndex = countries.findIndex((country) => country.code === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function toggleOpen() {
    if (disabled) return;
    if (open) {
      closeMenu();
      return;
    }
    openMenu();
  }

  function selectCountry(code: string) {
    onChange(code);
    closeMenu();
  }

  function handleSearchChange(nextQuery: string) {
    setQuery(nextQuery);
    setActiveIndex(0);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (filteredCountries.length === 0) return;
        setActiveIndex((index) =>
          Math.min(index + 1, filteredCountries.length - 1),
        );
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (filteredCountries.length === 0) return;
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (!activeCountry) return;
        selectCountry(activeCountry.code);
        break;
      }
      case "Escape": {
        event.preventDefault();
        closeMenu();
        break;
      }
      default:
        break;
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) openMenu();
    }
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
          onKeyDown={handleTriggerKeyDown}
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
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(event) => handleSearchChange(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search countries"
                aria-label="Search countries"
                aria-controls={listId}
                aria-activedescendant={activeOptionId}
                autoComplete="off"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-300"
              />
            </div>

            <div
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label="Countries"
              className="max-h-56 overflow-y-auto py-1"
            >
              {filteredCountries.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500">
                  {countries.length === 0
                    ? "No countries available"
                    : "No countries found"}
                </p>
              ) : (
                filteredCountries.map((country, index) => {
                  const isSelected = country.code === value;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={country.code}
                      id={`${listId}-option-${country.code}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-active={isActive ? "true" : undefined}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectCountry(country.code)}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-800 ${
                        isActive
                          ? "bg-slate-100"
                          : isSelected
                            ? "bg-sky-50"
                            : "hover:bg-slate-50"
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
          </div>
        )}
      </div>
    </div>
  );
}
