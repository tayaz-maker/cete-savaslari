import { Link } from "@tanstack/react-router";
import { GAMES } from "@/lib/games";
import { cn } from "@/lib/utils";

export function PortalHome() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        TARIKLAB
      </h1>
      <p className="mt-2 text-[0.7rem] font-medium tracking-[0.28em] text-muted uppercase">
        Oyunlar
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {GAMES.map((g) => {
          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-xl font-semibold">{g.title}</div>
                {g.status === "soon" ? (
                  <span className="text-[0.65rem] tracking-wide text-muted uppercase">
                    Yakında
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">{g.subtitle}</p>
            </>
          );
          const card =
            "rounded-xl bg-surface p-4 text-left shadow-[0_0_0_1px_rgba(239,232,222,0.08)]";
          if (g.status === "live" && g.href) {
            if (g.slug === "cete-savaslari") {
              return (
                <Link
                  key={g.slug}
                  to="/cete-savaslari"
                  className={cn(card, "block hover:shadow-[0_0_0_1px_var(--color-accent)]")}
                >
                  {inner}
                </Link>
              );
            }
            return (
              <Link
                key={g.slug}
                to="/oyna/$slug"
                params={{ slug: g.slug }}
                className={cn(card, "block hover:shadow-[0_0_0_1px_var(--color-accent)]")}
              >
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={g.slug}
              aria-disabled="true"
              className={cn(card, "pointer-events-none opacity-55")}
            >
              {inner}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[0.65rem] tracking-wide text-subtle">
        <a href="/credits.html" className="hover:text-fg">
          Kaynaklar
        </a>
      </p>
    </main>
  );
}
