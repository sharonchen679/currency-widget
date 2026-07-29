import { NextResponse } from "next/server";
import { getCountries } from "@/lib/countries/get-countries";

/**
 * Always run on demand so `next build` does not burn API quota.
 * Successful upstream responses are still cached via fetch `revalidate: 86400`.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getCountries();

  if (!result.ok) {
    return NextResponse.json(result.error, {
      status: result.error.status,
      headers: {
        "Cache-Control": "no-store",
        "X-Countries-Source": result.error.code,
      },
    });
  }

  return NextResponse.json(result.data, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=3600",
      "X-Countries-Source": result.data.source,
    },
  });
}
