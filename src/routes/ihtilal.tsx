import { createFileRoute, Link } from "@tanstack/react-router";
import { GameIcon } from "@/components/portal/game-icons";
import { LanguageToggle } from "@/components/portal/language-toggle";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/ihtilal")({
  ssr: false,
  head: () => ({ meta: [{ title: "İhtilâl | TarikLab" }] }),
  component: IhtilalComingSoon,
});

function IhtilalComingSoon() {
  const { lang } = useLang();
  const en = lang === "en";

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-9">
      <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <Link
          to="/"
          className="text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger"
        >
          {en ? "← Back to TarikLab" : "← TARIKLAB"}
        </Link>
        <LanguageToggle />
      </header>

      <section className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-16">
        <div>
          <div className="mb-7 flex items-center gap-4 text-danger">
            <GameIcon name="ihtilal" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em]">
              {en ? "Coming Soon" : "Yakında"}
            </span>
          </div>
          <h1 className="font-display text-6xl font-semibold tracking-tight text-fg sm:text-8xl">
            İHTİLÂL
          </h1>
          <p className="mt-6 max-w-2xl text-2xl leading-tight text-fg sm:text-3xl">
            {en ? "Elections are won. Power is not kept." : "Seçim kazanılır. İktidar tutulmaz."}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {en
              ? "1950–80. Two sides. One map. Institutions speak separately."
              : "1950–80. İki taraf. Bir harita. Kurumlar ayrı konuşur."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface/70">
            <div className="border-r border-border p-5">
              <p className="font-display text-xl font-semibold">ALTI OK</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                {en ? "Center-left" : "Merkez sol"}
              </p>
            </div>
            <div className="p-5 text-right">
              <p className="font-display text-xl font-semibold">KIRAT</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                {en ? "Center-right" : "Merkez sağ"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-subtle">
              {en
                ? "Parliament · Police · Military · University · Capital"
                : "Meclis · Polis · Ordu · Üniversite · Sermaye"}
            </p>
            <div className="mt-5 space-y-2 font-display text-lg text-fg">
              <p>
                {en
                  ? "A card falls. A token is placed. The die speaks."
                  : "Kart düşer. Pul konur. Zar konuşur."}
              </p>
              <p>{en ? "A ballot every four rounds." : "Dört turda bir sandık."}</p>
              <p>
                {en
                  ? "Sometimes the night comes before the ballot."
                  : "Bazen gece, sandıktan önce."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border pt-5 text-xs leading-relaxed text-subtle">
        {en
          ? "Inspired by İhtilâl (2015), Kene Yapım / Tunca Zeki Berkkurt."
          : "Esin: İhtilâl (2015), Kene Yapım / Tunca Zeki Berkkurt."}
      </footer>
    </main>
  );
}
