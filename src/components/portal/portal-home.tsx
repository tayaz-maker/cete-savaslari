import { Link } from "@tanstack/react-router";
import { GAMES, type CatalogGame } from "@/lib/games";
import { GameIcon } from "./game-icons";

function GameCard({ game, featured = false }: { game: CatalogGame; featured?: boolean }) {
  const content = <><GameIcon name={game.icon} /><div className="min-w-0 flex-1"><h3 className="text-lg font-semibold leading-snug">{game.title}</h3><p className="mt-1 text-sm text-muted">{game.subtitle}</p></div><span className="text-xl text-subtle transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></>;
  const classes = `group flex h-full min-h-32 items-center gap-4 rounded-lg border border-border bg-surface/80 p-5 text-left transition-colors hover:border-danger/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger ${featured ? "border-danger/50 bg-elevated" : ""}`;
  if (game.status !== "live" || !game.href) return <article aria-disabled="true" className={`${classes} cursor-default opacity-60 hover:border-border`}>{content}<span className="text-[0.65rem] uppercase tracking-[0.2em] text-subtle">Yakında</span></article>;
  if (game.slug === "cete-savaslari") return <Link to="/cete-savaslari" aria-label={`${game.title} oyununu aç`} className={classes}>{content}</Link>;
  if (game.href.startsWith("/games/")) return <a href={game.href} aria-label={`${game.title} oyununu aç`} className={classes}>{content}</a>;
  return <Link to="/oyna/$slug" params={{ slug: game.slug }} aria-label={`${game.title} oyununu aç`} className={classes}>{content}</Link>;
}

export function PortalHome() {
  const active = GAMES.filter((g) => g.status === "live");
  const soon = GAMES.filter((g) => g.status !== "live");
  return <main className="mx-auto min-h-dvh w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="mb-12 border-b border-border pb-6"><p className="text-3xl font-semibold tracking-tight sm:text-5xl">TARIKLAB</p><p className="mt-2 text-[0.65rem] font-medium tracking-[0.35em] text-muted uppercase">Oyun Laboratuvarı</p></header>
    <section aria-labelledby="active-games"><div className="mb-5 flex items-end justify-between"><h1 id="active-games" className="text-sm font-medium uppercase tracking-[0.25em] text-muted">Oyunlar</h1><span className="text-xs text-subtle">{active.length} oynanabilir</span></div><div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">{active.map((game, i) => <GameCard key={game.slug} game={game} featured={i === 0} />)}</div></section>
    {soon.length > 0 && <section aria-labelledby="coming-soon" className="mt-14"><h2 id="coming-soon" className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-muted">Yakında</h2><div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">{soon.map((game) => <GameCard key={game.slug} game={game} />)}</div></section>}
    <footer className="mt-14 text-center text-xs text-subtle"><a href="/credits.html" className="hover:text-fg focus-visible:outline-2 focus-visible:outline-danger">Kaynaklar</a></footer>
  </main>;
}
