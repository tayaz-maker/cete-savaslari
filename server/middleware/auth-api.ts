/**
 * Deployed-app (Nitro) mount for Better Auth's HTTP API.
 *
 * `@/lib/auth/client` posts to same-origin `/api/auth/*` (sign-up, sign-in,
 * get-session, sign-out). Nothing in this template served that path, so every
 * auth call 404'd against the SPA's HTML fallback. Auto-registered as global h3
 * middleware because vite.config.ts sets `serverDir: "./server"`.
 *
 * The dev half lives in `vite.config.ts` (`authApiPlugin`) — Nitro only runs on
 * `vite build` / `vite preview`. Keep the two in sync.
 */
import { auth } from "../../src/lib/auth/server";

interface AuthApiEvent {
  url: URL;
  /** h3 v2 / Nitro v3 hand the handler a web-standard Request. */
  req: Request;
}

/** Better Auth owns this whole prefix. */
export const AUTH_API_PREFIX = "/api/auth/";

export default async function authApiMiddleware(
  event: AuthApiEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (!event.url.pathname.startsWith(AUTH_API_PREFIX)) return next();
  return auth.handler(event.req);
}
