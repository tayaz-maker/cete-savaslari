import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SAVE_KEY } from "@/game/data";
import { useGame } from "@/game/store";
import {
  parseSlotEnvelope,
  readActiveSlot,
  readSlotRaw,
  type SlotIndex,
} from "@/lib/save-slots";

function slotSummary(slot: SlotIndex) {
  if (typeof window === "undefined") return { empty: true, label: "Boş" };
  const raw = readSlotRaw(window.localStorage, "cete", slot);
  const parsed = parseSlotEnvelope(raw);
  const state = (parsed?.state ?? parsed) as
    | { player?: { name?: string; neighborhood?: string; cash?: number }; savedAt?: number }
    | null;
  if (!state?.player?.name) return { empty: true, label: "Boş slot" };
  const when = typeof state.savedAt === "number" && state.savedAt
    ? new Date(state.savedAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "";
  return {
    empty: false,
    label: `${state.player.name}${when ? ` · ${when}` : ""}`,
  };
}

export function SaveSlotsPanel() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | { slot: SlotIndex; mode: "load" | "save" | "clear" }>(null);
  const activeSlot = useGame((s) => s.activeSlot) || (typeof window === "undefined" ? 1 : readActiveSlot(window.localStorage, "cete"));
  const loadSlot = useGame((s) => s.loadSlot);
  const saveToSlot = useGame((s) => s.saveToSlot);
  const clearPlaySlot = useGame((s) => s.clearPlaySlot);
  const slots = useMemo(() => ([1, 2, 3] as SlotIndex[]).map((slot) => ({ slot, ...slotSummary(slot) })), [open, activeSlot]);

  return (
    <>
      <Button variant="ghost" className="px-3 text-xs md:px-4 md:text-sm" onClick={() => setOpen(true)}>
        Kayıt {activeSlot}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Üç kayıt yeri</DialogTitle>
            <DialogDescription>
              Hesap gerekmez. Her slot bu cihazda ayrı durur. Dolu slota kayıt
              sormadan yazılmaz.
            </DialogDescription>
          </DialogHeader>
          <ul className="mt-4 space-y-2">
            {slots.map((item) => (
              <li key={item.slot} className="rounded-xl bg-elevated px-3 py-3">
                <p className="text-sm text-fg">
                  Slot {item.slot}
                  {item.slot === activeSlot ? " · açık" : ""}
                </p>
                <p className="text-xs text-muted">{item.label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!item.empty && item.slot !== activeSlot) setConfirm({ slot: item.slot, mode: "load" });
                      else {
                        loadSlot(item.slot);
                        setOpen(false);
                      }
                    }}
                  >
                    Aç
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (!item.empty && item.slot !== activeSlot) setConfirm({ slot: item.slot, mode: "save" });
                      else saveToSlot(item.slot);
                    }}
                  >
                    Kaydet
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={item.empty}
                    onClick={() => setConfirm({ slot: item.slot, mode: "clear" })}
                  >
                    Sil
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-subtle">Eski tek kayıt varsa Slot 1'e taşınır. Anahtar: {SAVE_KEY} → tariklab::cete:1</p>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(confirm)} onOpenChange={(next) => !next && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.mode === "clear" ? "Slotu sil" : confirm?.mode === "save" ? "Üzerine yaz" : "Slotu aç"}
            </DialogTitle>
            <DialogDescription>
              {confirm?.mode === "clear"
                ? `Slot ${confirm.slot} silinir. Diğer slotlar durur.`
                : confirm?.mode === "save"
                  ? `Slot ${confirm?.slot} dolu. Şu anki oyunu bunun üzerine yazmak istiyor musun?`
                  : `Slot ${confirm?.slot} açılınca ekrandaki oyun değişir. Kaydetmediysen kaybolur.`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Vazgeç</Button>
            <Button
              variant={confirm?.mode === "clear" ? "danger" : "default"}
              onClick={() => {
                if (!confirm) return;
                if (confirm.mode === "clear") clearPlaySlot(confirm.slot);
                if (confirm.mode === "save") saveToSlot(confirm.slot);
                if (confirm.mode === "load") loadSlot(confirm.slot);
                setConfirm(null);
                if (confirm.mode === "load") setOpen(false);
              }}
            >
              Onayla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
