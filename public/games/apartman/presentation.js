import { CHAINS } from "../next-wave/apartman-chains.js";

// Resolve legacy save identifiers for display; never rewrite persisted history.
const memories = new Map();
for (const chain of CHAINS) {
  for (const stage of chain.stages) {
    for (const choice of stage.choices || []) {
      for (const memory of choice.effects?.remember || []) {
        if (!memories.has(memory.type)) memories.set(memory.type, choice.label);
      }
    }
  }
}

export function memoryLabel(memory, localize, text) {
  const label = memories.get(memory?.type);
  if (label) return localize(label);
  return text("Geçmiş bir yönetim kararı", "An earlier management decision");
}

export function allianceLabel(id, text) {
  const labels = {
    eski: ["Eski sakinler", "Long-term residents"],
    yeni: ["Yeni sakinler", "New residents"],
    kiraci: ["Kiracılar", "Tenants"],
  };
  return text(...(labels[id] || ["Sakin grubu", "Resident group"]));
}

export function systemLabel(id, parts, localize, text) {
  const part = parts.find((item) => item.id === id);
  return part ? localize(part.name) : text("ortak alan", "common area");
}
