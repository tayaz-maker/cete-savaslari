import type { ReactNode } from "react";

type IconName = "cete" | "hanedan" | "racon" | "bukucu" | "labirent" | "tek-tas" | "satranc" | "tc-sim" | "devlet";
export function GameIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false };
  const icons: Record<IconName, ReactNode> = {
    cete: <><path d="M10 53h44M14 53V29l12-8 12 8v24M38 53V25l12-7 4 3v32"/><path d="M31 12l2 5 5 .5-4 3 1 5-4-3-4 3 1-5-4-3 5-.5z"/></>, hanedan: <><path d="M16 25h32l-3-12-7 6-6-8-6 8-7-6zM32 25v20M32 34H20M32 34h12M20 34v10M44 34v10M12 50h40"/></>, racon: <><path d="M12 16h30v14H12zM19 30v22M35 30v22M16 22h18"/><path d="M42 35h12v12H42zM42 39l-6 4 6 1"/></>, bukucu: <><path d="M10 50h44M14 50V28l12-9 12 5 12-8v34M26 28l12-4v26M38 24l12-8"/></>, labirent: <><path d="M12 12h40v40H12zM20 20h24v24H20zM12 28h8M44 36h8M28 12v8M36 44v8"/></>, "tek-tas": <><path d="M32 10c8 0 14 6 14 14v12c0 10-6 18-14 18s-14-8-14-18V24c0-8 6-14 14-14z"/><path d="M24 27h16"/></>, satranc: <><path d="M25 11h14l-3 9 7 8H21l7-8zM26 28l-3 18h18l-3-18M18 52h28"/></>, "tc-sim": <><circle cx="22" cy="18" r="7"/><path d="M10 44c0-8 5-13 12-13s12 5 12 13M39 52V32l10-7 10 7v20M36 52h28M44 38h10M47 35v18M12 56h44"/></>, devlet: <><path d="M10 52h44M15 52V25h34v27M10 25l22-12 22 12M22 32v13M32 32v13M42 32v13"/><circle cx="20" cy="18" r="3"/><circle cx="44" cy="18" r="3"/><path d="M23 18h18"/></>,
  };
  return <svg {...common} className="h-8 w-8 shrink-0" role="img" aria-label="">{icons[name as IconName] ?? icons.labirent}</svg>;
}
