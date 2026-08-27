import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

const KEY = "cete-age-ok";

export function ageOk() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(() => ageOk());
  if (ok) return <>{children}</>;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center text-fg">
      <p className="text-[0.7rem] font-medium tracking-[0.28em] text-muted uppercase">
        TLab
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold">18+ onay</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        Kurgusal yeraltı simülasyonu. Gerçek kumar, uyuşturucu veya şiddet
        teşviki değil. 18 yaşından küçüksen çık.
      </p>
      <Button
        className="mt-8 h-12"
        onClick={() => {
          window.localStorage.setItem(KEY, "1");
          track("yas_onay");
          setOk(true);
        }}
      >
        18 yaşından büyüğüm
      </Button>
    </main>
  );
}
