import { writeFileSync, readFileSync } from "node:fs";
import { designs as snd } from "../public/games/veto-h/designs.js";
import { designs as rcn } from "../public/games/gett-oh/designs.js";

const EN_NAME = {
  "veto-h": {
    151: "Returns Clerk",
    156: "Returns Analyst",
    158: "Scheduling Secretary",
    165: "Committee Reporter",
    166: "Session Clerk",
  },
  "gett-oh": {
    10: "Wedding Spark",
    12: "Teahouse Wild One",
    158: "Stand Clerk",
    151: "Tea Master",
  },
};

function polishTr(text, theme) {
  if (!text) return text;
  let s = text;
  s = s.replaceAll("Turda bir:", "Turda bir kez:");
  s = s.replaceAll("Yok olduğunda", "Yok olunca");
  s = s.replaceAll("Setlenmişken açılırsa", "Kapalı dururken açılırsa");
  s = s.replaceAll("Setken açılırsa", "Kapalı dururken açılırsa");
  s = s.replaceAll("Set durumundan açıldığında", "Kapalı dururken açılınca");
  s = s.replaceAll("Normal çağrıldığında", "Normal çağrıda");
  if (theme === "veto-h") {
    s = s.replaceAll("Çağırmak için 1 feda gerekir", "Sahaya sürmek için 1 adak gerekir");
    s = s.replaceAll("Çağırmak için 2 feda gerekir", "Sahaya sürmek için 2 adak gerekir");
    s = s.replaceAll("Sandık birimini", "Sandık kadrosunu");
    s = s.replaceAll("Kulis birimini", "Kulis kadrosunu");
    s = s.replaceAll("Kürsü birimini", "Kürsü kadrosunu");
    s = s.replaceAll("1 Sandık birimini", "1 Sandık kadrosunu");
    s = s.replaceAll("kademe 3 veya altı 1 Sandık birimini", "kademe 3 veya altı 1 Sandık kadrosunu");
    s = s.replaceAll("kademe 3 veya altı 1 Kulis birimini", "kademe 3 veya altı 1 Kulis kadrosunu");
    s = s.replaceAll("kademe 3 veya altı 1 Kürsü birimini", "kademe 3 veya altı 1 Kürsü kadrosunu");
  } else {
    s = s.replaceAll("Çayhane birimini", "Çayhane adamını");
    s = s.replaceAll("Taksi birimini", "Taksi adamını");
    s = s.replaceAll("Sanayi birimini", "Sanayi adamını");
  }
  return s;
}

function polishEn(text) {
  if (!text) return text;
  return text.replaceAll("Once per turn:", "Once per turn,");
}

function run(theme, designs) {
  const path = `public/games/${theme}/source-cards.json`;
  const cards = JSON.parse(readFileSync(path, "utf8"));
  for (const card of cards) {
    const n = Number(card.id.slice(4));
    const design = designs[n];
    card.text = polishTr(card.text, theme);
    if (design) {
      card.nameEn = EN_NAME[theme][n] || design.name;
      card.textEn = polishEn(design.text);
    }
  }
  writeFileSync(path, JSON.stringify(cards, null, 2) + "\n");
  return cards;
}

const veto = run("veto-h", snd);
const gett = run("gett-oh", rcn);
console.log("humanized", veto.length, gett.length);
