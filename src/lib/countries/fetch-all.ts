import type { Country } from "@/types/country";
import { normalizeCountry, type RestCountryV5 } from "@/lib/countries/normalize";

const API_BASE = "https://api.restcountries.com/countries/v5";

/** Free plan max page size is 100; full dataset is ~250 countries. */
const PAGE_SIZE = 100;

/** Per-request timeout (ms). Upstream hangs should fail fast. */
const REQUEST_TIMEOUT_MS = 12_000;

/**
 * Only the fields we need for the widget.
 * Uses response_fields (v5) — not the old `fields` query param.
 */
const RESPONSE_FIELDS = [
  "names.common",
  "names.native",
  "codes.alpha_2",
  "capitals",
  "flag.emoji",
  "flag.url_png",
  "flag.url_svg",
  "region",
  "subregion",
  "currencies",
  "population",
  "timezones",
].join(",");

type RestListMeta = {
  total?: number;
  count?: number;
  limit?: number;
  offset?: number;
  more?: boolean;
};

type RestListResponse = {
  data?: {
    objects?: RestCountryV5[];
    meta?: RestListMeta;
    _demo?: unknown;
  };
  errors?: Array<{ message?: string }>;
};

export class RestCountriesError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RestCountriesError";
    this.status = status;
  }
}

function getApiKey(): string {
  const key = process.env.RESTCOUNTRIES_API_KEY?.trim();
  if (!key) {
    throw new RestCountriesError(
      "Missing RESTCOUNTRIES_API_KEY. Add it to your .env file.",
      500,
    );
  }
  return key;
}

function parseErrorMessage(payload: RestListResponse, fallback: string): string {
  const message = payload.errors?.[0]?.message?.trim();
  return message || fallback;
}

async function fetchPage(
  apiKey: string,
  offset: number,
): Promise<{ objects: RestCountryV5[]; more: boolean; total: number }> {
  const url = new URL(API_BASE);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("response_fields", RESPONSE_FIELDS);

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      // Cache each upstream page for 24h so quota stays low.
      next: { revalidate: 86400, tags: ["countries"] },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new RestCountriesError(
        `REST Countries request timed out after ${REQUEST_TIMEOUT_MS}ms.`,
        504,
      );
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new RestCountriesError("REST Countries request was aborted.", 504);
    }
    throw new RestCountriesError(
      error instanceof Error
        ? `Network error talking to REST Countries: ${error.message}`
        : "Network error talking to REST Countries.",
      502,
    );
  }

  let payload: RestListResponse = {};
  try {
    payload = (await response.json()) as RestListResponse;
  } catch {
    throw new RestCountriesError(
      `REST Countries returned non-JSON (HTTP ${response.status}).`,
      502,
    );
  }

  if (!response.ok) {
    const fallback = `REST Countries request failed (HTTP ${response.status}).`;
    // Map upstream auth / quota / rate-limit into clear app errors.
    if (response.status === 401) {
      throw new RestCountriesError(
        parseErrorMessage(payload, "Invalid or missing REST Countries API key."),
        401,
      );
    }
    if (response.status === 403) {
      throw new RestCountriesError(
        parseErrorMessage(
          payload,
          "REST Countries access forbidden (quota exceeded or plan restriction).",
        ),
        403,
      );
    }
    if (response.status === 429) {
      throw new RestCountriesError(
        parseErrorMessage(
          payload,
          "REST Countries rate limit hit. Retry shortly.",
        ),
        429,
      );
    }
    throw new RestCountriesError(
      parseErrorMessage(payload, fallback),
      response.status >= 400 && response.status < 600 ? response.status : 502,
    );
  }

  const objects = payload.data?.objects ?? [];
  const more = Boolean(payload.data?.meta?.more);
  const total = payload.data?.meta?.total ?? objects.length;

  return { objects, more, total };
}

/**
 * Fetches every country page (limit 100) until meta.more is false,
 * normalizes, filters unusable rows, and sorts A–Z by common name.
 *
 * Quota note (free plan): ~3 requests per cold refresh (~250 countries / 100).
 * With 24h revalidation this stays well under 500 req/month.
 */
export async function fetchAllCountriesFromRestCountries(): Promise<Country[]> {
  const apiKey = getApiKey();
  const rawCountries: RestCountryV5[] = [];

  let offset = 0;
  let more = true;
  let pages = 0;
  const maxPages = 10; // safety valve against infinite loops

  while (more) {
    pages += 1;
    if (pages > maxPages) {
      throw new RestCountriesError(
        "Stopped pagination early: unexpected number of pages from REST Countries.",
        502,
      );
    }

    const page = await fetchPage(apiKey, offset);
    rawCountries.push(...page.objects);
    more = page.more;
    offset += PAGE_SIZE;
  }

  const countries = rawCountries
    .map(normalizeCountry)
    .filter((country): country is Country => country !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  return countries;
}
