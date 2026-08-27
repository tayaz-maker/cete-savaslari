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
    <div className="min-h-dvh bg-bg">
      <div className="relative h-11 border-b border-border px-4">
        <Link
          to="/"
          className="relative z-10 inline-flex h-11 items-center text-sm text-muted hover:text-fg"
        >
          ← Oyunlar
        </Link>
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-sm text-fg">
          {title}
        </p>
      </div>
      <iframe
        title={title}
        src={`/games/${slug}/index.html`}
        className="block h-[calc(100dvh-2.75rem)] w-full border-0 bg-bg"
        allow="fullscreen; autoplay; gamepad"
      />
    </div>
  );
}
