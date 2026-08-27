import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function firstExisting(abs) {
  const cands = [
    abs,
    abs + ".ts",
    abs + ".tsx",
    abs + ".js",
    abs + ".mjs",
    join(abs, "index.ts"),
  ];
  for (const c of cands) {
    if (existsSync(c)) return pathToFileURL(c).href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const url = firstExisting(join(root, "src", specifier.slice(2)));
    if (url) return { url, shortCircuit: true };
  }
  if (
    context.parentURL &&
    specifier.startsWith(".") &&
    !extname(specifier)
  ) {
    const from = dirname(fileURLToPath(context.parentURL));
    const url = firstExisting(join(from, specifier));
    if (url) return { url, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
