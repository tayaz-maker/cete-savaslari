import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { LanguageToggle } from "@/components/portal/language-toggle";
import { GAMES, isHtml5Slug } from "@/lib/games";
import { CATALOG_EN, useLang } from "@/lib/i18n";

const BY_SLUG = new Map(GAMES.map((g) => [g.slug, g]));

export const Route = createFileRoute("/oyna/$slug")({
  ssr: false,
  beforeLoad: ({ params }) => {
    if (!isHtml5Slug(params.slug) || !BY_SLUG.has(params.slug)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const g = BY_SLUG.get(params.slug);
    return {
      meta: [{ title: `${g?.title ?? "Oyun"} | TLab` }],
    };
  },
  component: Html5Play,
});

function Html5Play() {
  const { slug } = Route.useParams();
  const g = BY_SLUG.get(slug);
  const { lang, t } = useLang();
  const title = lang === "en" && g && CATALOG_EN[g.slug] ? CATALOG_EN[g.slug].title : (g?.title ?? "Oyun");
  return (
    <div className="flex h-dvh min-h-0 flex-col bg-bg">
      <div className="relative flex min-h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
        <Link to="/" className="relative z-10 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-danger">
          {t("portal.back", "← Oyunlar")}
        </Link>
        <p className="pointer-events-none absolute inset-0 hidden items-center justify-center px-36 text-center font-display text-sm text-fg sm:flex">
          {title}
        </p>
        <LanguageToggle />
      </div>
      <iframe
        key={slug}
        title={title}
        src={`/games/${slug}/index.html`}
        className="block min-h-0 w-full flex-1 border-0 bg-bg"
        allow="fullscreen; autoplay; gamepad"
      />
    </div>
  );
}
