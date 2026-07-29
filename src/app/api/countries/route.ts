import { NextResponse } from "next/server";
import { MOCK_COUNTRIES } from "@/lib/countries/mock";
import {
  fetchAllCountriesFromRestCountries,
  RestCountriesError,
} from "@/lib/countries/fetch-all";
import type { CountriesApiResponse } from "@/types/country";

/**
 * Revalidate this route's cached data daily.
 * (No-op while mock mode is on — mock data is returned immediately.)
 */
export const revalidate = 86400;

/**
 * Mock mode is ON by default to protect API quota during development.
 * Set RESTCOUNTRIES_USE_MOCK=false in .env to hit the live API.
 */
function shouldUseMock(): boolean {
  const flag = process.env.RESTCOUNTRIES_USE_MOCK?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  return true;
}

export async function GET() {
  try {
    if (shouldUseMock()) {
      const body: CountriesApiResponse = {
        source: "mock",
        count: MOCK_COUNTRIES.length,
        countries: MOCK_COUNTRIES,
      };

      return NextResponse.json(body, {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Countries-Source": "mock",
        },
      });
    }

    const countries = await fetchAllCountriesFromRestCountries();
    const body: CountriesApiResponse = {
      source: "restcountries",
      count: countries.length,
      countries,
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        // Allow browsers / CDN to keep a short private cache; source of truth is server revalidate.
        "Cache-Control": "private, max-age=60, stale-while-revalidate=3600",
        "X-Countries-Source": "restcountries",
      },
    });
  } catch (error) {
    if (error instanceof RestCountriesError) {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading countries.",
        status: 500,
      },
      { status: 500 },
    );
  }
}
