import {
  fetchAllCountriesFromRestCountries,
  RestCountriesError,
} from "@/lib/countries/fetch-all";
import {
  isSafeModeEnabled,
  SAFE_MODE_MESSAGE,
} from "@/lib/countries/safe-mode";
import type { CountriesApiErrorBody, CountriesApiSuccess } from "@/types/country";

export class SafeModeError extends Error {
  status = 403;
  code = "SAFE_MODE" as const;

  constructor() {
    super(SAFE_MODE_MESSAGE);
    this.name = "SafeModeError";
  }
}

export type GetCountriesResult =
  | { ok: true; data: CountriesApiSuccess }
  | { ok: false; error: CountriesApiErrorBody };

/**
 * Server-side entry point for country data.
 * Shared by the Route Handler (and later by Server Components if needed).
 */
export async function getCountries(): Promise<GetCountriesResult> {
  if (isSafeModeEnabled()) {
    return {
      ok: false,
      error: {
        code: "SAFE_MODE",
        error: SAFE_MODE_MESSAGE,
        status: 403,
      },
    };
  }

  try {
    const countries = await fetchAllCountriesFromRestCountries();

    return {
      ok: true,
      data: {
        source: "restcountries",
        count: countries.length,
        countries,
      },
    };
  } catch (error) {
    if (error instanceof RestCountriesError) {
      return {
        ok: false,
        error: {
          code: error.code === "CONFIG" ? "CONFIG" : "UPSTREAM",
          error: error.message,
          status: error.status,
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "UNKNOWN",
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading countries.",
        status: 500,
      },
    };
  }
}
