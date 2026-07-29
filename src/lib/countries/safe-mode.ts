/**
 * Safety gate to avoid accidental REST Countries quota usage.
 *
 * When SAFE_MODE is anything other than "false"/"0",
 * live upstream calls are blocked (no mock dataset is served).
 */
export const SAFE_MODE_MESSAGE =
  "Live API calls are blocked because SAFE_MODE is enabled. Set SAFE_MODE=false in your .env file, then restart the dev server.";

export function isSafeModeEnabled(): boolean {
  const flag = process.env.SAFE_MODE?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  // Default ON when unset — protects quota until you explicitly opt in.
  return true;
}
