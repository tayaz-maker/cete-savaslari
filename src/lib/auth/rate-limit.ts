const WINDOW_MS = 60_000;
const MAX = 10;
const hits = new Map<string, number[]>();

function ipOf(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

export function rateLimitAuth(req: Request): Response | null {
  const ip = ipOf(req);
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (list.length > MAX) {
    return new Response(JSON.stringify({ error: "too_many_requests" }), {
      status: 429,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return null;
}
