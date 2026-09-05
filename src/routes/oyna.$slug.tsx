import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GAMES, isHtml5Slug } from "@/lib/games";

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
  const title = g?.title ?? "Oyun";
  return (
    <div className="flex h-dvh min-h-0 flex-col bg-bg">
      <div className="relative h-9 shrink-0 border-b border-border px-3 sm:h-11 sm:px-4">
        <Link
          to="/"
          className="relative z-10 inline-flex h-9 items-center text-sm text-muted hover:text-fg sm:h-11"
        >
          ← Oyunlar
        </Link>
        <p className="pointer-events-none absolute inset-0 hidden items-center justify-center font-display text-sm text-fg sm:flex">
          {title}
        </p>
      </div>
      <iframe
        title={title}
        src={`/games/${slug}/index.html`}
        className="block min-h-0 w-full flex-1 border-0 bg-bg"
        allow="fullscreen; autoplay; gamepad"
      />
    </div>
  );
}
