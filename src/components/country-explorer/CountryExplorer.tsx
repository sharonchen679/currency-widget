import { CountryWidget } from "@/components/country-explorer/CountryWidget";

type CountryExplorerProps = {
  safeMode: boolean;
};

export function CountryExplorer({ safeMode }: CountryExplorerProps) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center px-4">
      <header className="mb-8 text-center">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-sky-600/70 uppercase">
          Rest Countries
        </p>
        <h1 className="font-serif text-[2.35rem] leading-none font-bold tracking-tight text-[var(--color-ink)] sm:text-[2.75rem]">
          Country Explorer
        </h1>
      </header>

      <CountryWidget safeMode={safeMode} />
    </div>
  );
}
