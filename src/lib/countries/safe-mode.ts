/**
 * Safety gate to avoid accidental REST Countries quota usage.
 *
 * When RESTCOUNTRIES_USE_MOCK is anything other than "false"/"0",
 * live upstream calls are blocked (no mock dataset is served).
 */
export const SAFE_MODE_MESSAGE =
  "Live API calls are blocked because RESTCOUNTRIES_USE_MOCK is enabled. Set RESTCOUNTRIES_USE_MOCK=false in your .env file, then restart the dev server.";

export function isSafeModeEnabled(): boolean {
  const flag = process.env.RESTCOUNTRIES_USE_MOCK?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  // Default ON when unset — protects quota until you explicitly opt in.
  return true;
}
