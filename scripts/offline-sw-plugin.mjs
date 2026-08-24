/**
 * Client build'da hashed /assets/* listesini SW precache'ine yazar.
 * public/sw.js runtime cache ile de çalışır; bu plugin ilk ziyareti güçlendirir.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SW_PATH = join(ROOT, "public/sw.js");

export function offlineSwPlugin() {
  return {
    name: "cete-offline-sw",
    apply: "build",
    generateBundle(_opts, bundle) {
      const envName = this.environment?.name;
      if (envName && envName !== "client") return;
      const names = Object.keys(bundle);
      if (names.some((n) => n.includes("_ssr") || n.endsWith(".mjs"))) return;
      const assets = names
        .filter((n) => !n.endsWith(".map"))
        .filter((n) => /\.(js|css|svg|png|webmanifest)$/.test(n))
        .map((n) => `/${n.replace(/^\/+/, "")}`);
      let source;
      try {
        source = readFileSync(SW_PATH, "utf8");
      } catch {
        return;
      }
      const extra = JSON.stringify(assets);
      source = source.replace(
        'const SHELL = ["/", "/favicon.svg", "/__grok/icon-180.png", "/manifest.webmanifest"];',
        `const SHELL = ["/", "/favicon.svg", "/__grok/icon-180.png", "/manifest.webmanifest"].concat(${extra});`,
      );
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}
