import { CountryExplorer } from "@/components/country-explorer/CountryExplorer";
import { isSafeModeEnabled } from "@/lib/countries/safe-mode";

/** Read env on each request so the safe-mode banner stays accurate. */
export const dynamic = "force-dynamic";

export default function Home() {
  const safeMode = isSafeModeEnabled();

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <CountryExplorer safeMode={safeMode} />
    </main>
  );
}
