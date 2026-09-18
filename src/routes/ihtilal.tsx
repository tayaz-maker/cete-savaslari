import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ihtilal")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/oyna/$slug", params: { slug: "ihtilal" } });
  },
  head: () => ({ meta: [{ title: "İhtilâl | TarikLab" }] }),
  component: function IhtilalRedirect() {
    return <Navigate to="/oyna/$slug" params={{ slug: "ihtilal" }} replace />;
  },
});
