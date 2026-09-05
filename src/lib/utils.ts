import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTRY(n: number) {
  const v = Math.round(n);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatInt(n: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  );
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function unlockUi() {
  if (typeof document === "undefined") return;
  const body = document.body;
  body.style.pointerEvents = "";
  body.style.overflow = "";
  body.removeAttribute("data-scroll-locked");
  document.documentElement.style.overflow = "";
}

export function formatDuration(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
