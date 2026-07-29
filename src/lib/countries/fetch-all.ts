import type { Country } from "@/types/country";
import { normalizeCountry, type RestCountryV5 } from "@/lib/countries/normalize";

const API_BASE = "https://api.restcountries.com/countries/v5";

/** Free plan max page size is 100; full dataset is ~250 countries. */
const PAGE_SIZE = 100;

/** Per-request timeout (ms). Upstream hangs should fail fast. */
const REQUEST_TIMEOUT_MS = 12_000;

/**
 * Only the fields required by the widget.
 * Uses v5 `response_fields` (not the legacy `fields` param).
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
  };
  errors?: Array<{ message?: string }>;
};

export class RestCountriesError extends Error {
  status: number;
  code: "UPSTREAM" | "CONFIG";

  constructor(
    message: string,
    status: number,
    code: "UPSTREAM" | "CONFIG" = "UPSTREAM",
  ) {
    super(message);
    this.name = "RestCountriesError";
    this.status = status;
    this.code = code;
  }
}

function getApiKey(): string {
  const key = process.env.RESTCOUNTRIES_API_KEY?.trim();
  if (!key) {
    throw new RestCountriesError(
      "Missing RESTCOUNTRIES_API_KEY. Add it to your .env file.",
      500,
      "CONFIG",
    );
  }
  return key;
}

function parseErrorMessage(payload: RestListResponse, fallback: string): string {
  return payload.errors?.[0]?.message?.trim() || fallback;
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

  return {
    objects,
    more: Boolean(payload.data?.meta?.more),
    total: payload.data?.meta?.total ?? objects.length,
  };
}

const MAX_PAGES = 10;

/**
 * Fetches every country page (limit 100) in parallel, then normalizes,
 * drops unusable rows, and sorts A–Z by common name.
 *
 * Free plan: ~3 requests per cold refresh (same quota as sequential),
 * but wall-clock time is roughly one round-trip instead of three.
 */
export async function fetchAllCountriesFromRestCountries(): Promise<Country[]> {
  const apiKey = getApiKey();

  // Typical dataset is ~250 countries → offsets 0/100/200 cover it in one wave.
  const initialOffsets = Array.from(
    { length: 3 },
    (_, index) => index * PAGE_SIZE,
  );

  let pages = await Promise.all(
    initialOffsets.map((offset) => fetchPage(apiKey, offset)),
  );

  const total = pages[0]?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (pageCount > MAX_PAGES) {
    throw new RestCountriesError(
      "Stopped pagination early: unexpected number of pages from REST Countries.",
      502,
    );
  }

  // If the dataset grows past 300, fetch the remaining pages together too.
  if (pageCount > initialOffsets.length) {
    const extraOffsets = Array.from(
      { length: pageCount - initialOffsets.length },
      (_, index) => (index + initialOffsets.length) * PAGE_SIZE,
    );

    const extraPages = await Promise.all(
      extraOffsets.map((offset) => fetchPage(apiKey, offset)),
    );

    pages = [...pages, ...extraPages];
  }

  // Keep only the pages we actually need (drop empty tail from the optimistic wave).
  const rawCountries = pages
    .slice(0, pageCount)
    .flatMap((page) => page.objects);

  return rawCountries
    .map(normalizeCountry)
    .filter((country): country is Country => country !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}
